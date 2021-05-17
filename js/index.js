var Peer = require("simple-peer");
var ws = new WebSocket("ws://webrtc-proj.herokuapp.com/signal");
//var ws = new WebSocket("ws://localhost:8080/webRTC/signal");

var stream = navigator.mediaDevices.getUserMedia({ video: true, audio: true });

var room_id;
var our_username;
var users = [];
var is_muted = false;
var curr_file = {
    name = "none",
    size = "none",
    type = 'none'
};

// ------------------- JSON TEMPLATES and Obj structure-------------------
//
// var obj_to_server = {
//     "action": "action",
//     "room_id": "room_id",
//     "to_user": "to user",
//     "data": {
//         "type": "offer/answer",
//         "username": "ratnesh",
//         "sdp_data": "simple_peer_signal_data",
//         "info": "extra field"
//     }
// };

// var response_obj = {
//     "response" : "response",
//     "data": {
//         "type": "offer/answer/participants",
//         "username": "ratnesh",
//         "sdp_data": "simple_peer_signal_data",
//         "info": "extra field"
//     }
// }
//
// var response_obj = {
//     "response" : "response",
//     "data": "useranme"
// }
// this is the response shape where there are no technical fields like -> left room obj from server

// var user = {
//     "user_name": "random name",
//     "initiate": "true",
//     "add_signal" : "flase",
//     "sdp_data" : "peer_signal_data",
//     "peer_obj" : "",
//     "change_stream" : ""
// }
// here sdp_data -> sdp data we get is of the other user
// here initiate -> decides if we need to create a inititor peer or client peer.
// here peer_obj -> ref to the peer object created to communicated with that user

function init_event_binders() {
    document.getElementById("create").addEventListener('click', function () {
        create_room();
    });

    document.getElementById("join").addEventListener('click', function () {
        join_room();
    });

    document.getElementById("send").addEventListener('click', function () {
        var text = document.getElementById("send_messages").value;
        document.getElementById("send_messages").value = " ";
        send_data(text);
    });

    document.getElementById("leave").addEventListener('click', function () {
        send_to_server("Leave Room", room_id);
        close_connections();
    });

    document.getElementById("replace").addEventListener('click', function () {
        toggle_mute_self();
    });

    var input = document.getElementById("file");
    input.onchange = e => {
        set_file(e.target.files[0]);
    }
}

// --------- Manage users ---------

function get_room_id() {
    return document.getElementById("RoomID").value;
}

function get_username() {
    return document.getElementById("our_username").value;
}

function create_room() {
    console.log("button create is clicked ");
    room_id = get_room_id();
    our_username = get_username();
    send_to_server("Create Room", room_id);
}

function join_room() {
    console.log("button join is clicked ");
    room_id = get_room_id();
    our_username = get_username();
    send_to_server("Join Room", room_id);
}

function ping_server() {
    setInterval(function () {
        send_to_server("Active", room_id);
    }, 25000);
}

function create_user(username, initiate = true, send_offer = true, sdp_data = " ", peer_obj = " ", change_stream = " ") {
    var user = {
        "user_name": username,
        "initiate": initiate,
        "send_offer": send_offer,
        "sdp_data": sdp_data,
        "peer_obj": peer_obj,
        "change_stream": change_stream,
    };

    return user;
}

function remove_user(user) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].user_name == user.user_name) {
            users.splice(i, 1);
        }
    }
}

function toggle_mute_self() {
    stream.then((stream) => {
        if (!is_muted) {
            users.forEach((user) => {
                user.change_stream = true;
                user.peer_obj.removeTrack(stream.getAudioTracks()[0], stream);
            })
            is_muted = !is_muted;
        } else {
            users.forEach((user) => {
                user.change_stream = true;
                let temp_stream = stream.clone();
                user.peer_obj.addTrack(temp_stream.getAudioTracks()[0], stream);
            })
            is_muted = !is_muted;
        }
    });
}

//---------------------- WebSocket event listeners ----------------------

ws.onopen = () => {
    console.log("On Open ");
    init_event_binders();
    ping_server();
}

ws.onmessage = function (msg) {
    var res = JSON.parse(msg.data);
    console.log("On msg = " + res.response);

    if (res.response == "room created") {
        init_self_stream();
    }

    if (res.response == "room joined") {
        init_self_stream();

        var res_data = JSON.parse(res.data);
        console.log(res_data);
        if (res_data.type == "participants") {
            var usernames = res_data.username;
            usernames.forEach((username) => {
                var user = create_user(username);
                create_peer(user);
            })
        }
    }
    // if you send and offer then you will recive an answer that you need to put in peer.signal(), so peer.signal will run for both initiator and reciver
    if (res.response == "connection data") {
        var res_data = JSON.parse(res.data);
        console.log(res_data);
        if (res_data.type == "offer") {
            var username = res_data.username;
            var user = create_user(username, false, false, res_data.sdp_data);
            create_peer(user).then((peer) => {
                peer.signal(res_data.sdp_data);
            })
        }
        if (res_data.type == "answer") {
            var username = res_data.username;
            // dont use foreach
            users.forEach((user) => {
                if (user.user_name == username) {
                    user.peer_obj.signal(res_data.sdp_data);
                }
            })
        }
        if (res_data.type == "change_stream") {
            var username = res_data.username;
            // dont use foreach
            users.forEach((user) => {
                if (user.user_name == username) {
                    user.peer_obj.signal(res_data.sdp_data);
                }
            })
        }


        if (res_data.type == "Mute") {
            var username = res_data.username;
            mute_video(username);
        }

        if (res_data.type == "Unmute") {
            var username = res_data.username;
            unmute_video(username);
        }
    }

    if (res.response == "left room") {
        close_connections(res.data);
    }
}

ws.onclose = (msg) => {
    close_connections();
    console.log("On Close = " + msg);
};

// ----------- Peer conncections -----------

function send_to_server(action, room_id, to_user = " ", data_type = " ", data_username = our_username, sdp_data = " ") {
    var obj = {
        "action": action,
        "room_id": room_id,
        "to_user": to_user,
        "data": {
            "type": data_type,
            "username": data_username,
            "sdp_data": sdp_data,
        }
    };
    //remove later
    if (obj.action != "Active") {
        console.log(obj);
    }
    ws.send(JSON.stringify(obj));
}

async function create_peer(user) {

    users.push(user);

    return stream.then(function (stream) {

        var peer = new Peer({
            initiator: user.initiate,
            trickle: false,
            stream: stream
        })

        user.peer_obj = peer;

        peer.on('signal', function (data) {
            if (user.send_offer) {
                send_to_server(action = "Send Data", room_id = room_id, to_user = user.user_name, data_type = "offer", data_username = our_username, sdp_data = JSON.stringify(data));
                user.send_offer = false;
            } else if (user.change_stream) {
                send_to_server(action = "Send Data", room_id = room_id, to_user = user.user_name, data_type = "change_stream", data_username = our_username, sdp_data = JSON.stringify(data));
            } else {
                send_to_server(action = "Send Data", room_id = room_id, to_user = user.user_name, data_type = "answer", data_username = our_username, sdp_data = JSON.stringify(data));
            }
        });

        peer.on("stream", function (stream) {
            show_video(stream, user.user_name);
        });

        peer.on('data', (data) => {
            show_data(data);
        })
        return user.peer_obj;
    });
}

function send_data(data, to_user = 'all') {
    users.forEach((user) => {
        if (to_user == "all" || to_user == user.user_name) {
            user.peer_obj.send(data);
        }
    });
}

function show_data(text_message) {
    document.getElementById("messages").textContent += text_message + '\n';
}

function close_connections(username = '') {
    users.forEach((user) => {
        if (username == '' || user.user_name == username) {
            user.peer_obj.removeAllListeners();
            user.peer_obj.destroy();
            remove_video_element(user.user_name);
            remove_user(user);
        }
    });
}

// ----------- Manage video -----------

function init_self_stream() {
    stream.then(function (stream) {
        show_video(stream, our_username, true);
    });
}

function show_video(stream, streamer, muted = false) {
    create_video_element(streamer);
    const video = document.getElementById(streamer);;
    video.srcObject = stream;
    if (muted) {
        video.muted = "muted";
    }
    video.play();
};

function create_video_element(name) {
    var vid_div = document.getElementById("vid_div");
    var vid = document.createElement("video");
    vid.setAttribute("id", name);
    vid.setAttribute("autoplay", "true");
    vid_div.appendChild(vid);
}

function remove_video_element(name) {
    var vid_div = document.getElementById("vid_div");
    var vid = document.getElementById(name);
    vid_div.removeChild(vid);
}

// Manage File
function set_file(file) {
    curr_file = file;
}