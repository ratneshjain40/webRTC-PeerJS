var Peer = require("simple-peer");
//var ws = new WebSocket("ws://webrtc-proj.herokuapp.com/signal");
var ws = new WebSocket("ws://localhost:8080/webRTC/signal");

var stream = navigator.mediaDevices.getUserMedia({ video: true, audio: false });

var room_id;
var our_username;
var users = [];

// ------------------- JSON TEMPLATES -------------------
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
// this is the response shape where there are no technical fields like -> left room

// var user = {
//     "user_name": "random name",
//     "initiate": "true",
//     "send_signal" : "flase",
//     "sdp_data" : "peer_signal_data",
//     "peer_obj" : ""
// }
// here sdp_data -> sdp data we get is of the other user
// here initiate -> decides if we need to create a inititor peer or client peer.
// here peer_obj -> ref to the peer object created to communicated with that user

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
    console.log(obj);
    ws.send(JSON.stringify(obj));
}

function init_event_binders() {
    document.getElementById("create").addEventListener('click', function () {
        create_room();
    });

    document.getElementById("join").addEventListener('click', function () {
        join_room();
    });

    document.getElementById("send").addEventListener('click', function () {
        var text = document.getElementById("send_messages").textContent;
        send_text(text);
    });

    document.getElementById("leave").addEventListener('click', function () {
        send_to_server("Leave Room",room_id);
        close_connections();
    });
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

function close_connections(username = '') {
    users.forEach((user) => {
        if (username == '' || user.user_name == username) {
            console.log("Leaving " + username);
            console.log("Leaving " + user.user_name);
            user.peer_obj.removeAllListeners();
            user.peer_obj.destroy();
            remove_video_element(user.user_name);
            remove_from_users(user);
        }
    });
    console.log(users);
}

function remove_from_users(user) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].user_name == user.user_name) {
            var spliced = users.splice(i, 1);
            console.log("Removed element: " + spliced);
        }
    }
}

function get_room_id() {
    return document.getElementById("RoomID").value;
}

function get_username() {
    return document.getElementById("our_username").value;
}

function send_text(text_message) {
    users.forEach((user) => {
        user.peer_obj.send(text_message);
    });
}

function show_text(text_message) {
    document.getElementById("messages").textContent += text_message + '\n';
}

//---------------------- websocket event listeners ----------------------

ws.onopen = () => {
    console.log("On Open ");
    init_event_binders();
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
                var user = {
                    "user_name": username,
                    "initiate": true,
                    "send_signal": false,
                    "sdp_data": " ",
                    "peer_obj": " "
                }
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
            var user = {
                "user_name": username,
                "initiate": false,
                "send_signal": true,
                "sdp_data": res_data.sdp_data,
                "peer_obj": " "
            }
            create_peer(user);
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

    }

    if (res.response == "left room") {
        close_connections(res.data);
    }
}

ws.onclose = (msg) => {
    close_connections();
    console.log("On Close = " + msg);
};

function init_self_stream() {
    stream.then(function (stream) {
        show_video(stream,our_username);
    });
}

function create_peer(user) {

    users.push(user);

    stream.then(function (stream) {

        var peer = new Peer({
            initiator: user.initiate,
            trickle: false,
            stream: stream
        })

        peer.on('signal', function (data) {
            if (user.initiate) {
                send_to_server(action = "Send Data", room_id = room_id, to_user = user.user_name, data_type = "offer", data_username = our_username, sdp_data = JSON.stringify(data));
            } else {
                send_to_server(action = "Send Data", room_id = room_id, to_user = user.user_name, data_type = "answer", data_username = our_username, sdp_data = JSON.stringify(data));
            }
        });

        if (user.send_signal) {
            peer.signal(user.sdp_data);
            user.send_signal = false;
        }

        peer.on("stream", function (stream) {
            show_video(stream, user.user_name);
        });

        peer.on('data', (data) => {
            show_text(data);
          })

        user.peer_obj = peer;
    })

}

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

function show_video(stream, streamer) {
    create_video_element(streamer);
    const video = document.getElementById(streamer);;
    video.srcObject = stream;
    video.play();
};