var Peer = require("simple-peer");
//var ws = new WebSocket("ws://webrtc-proj.herokuapp.com/signal");
var ws = new WebSocket("ws://localhost:8080/webRTC/signal");

var stream = navigator.mediaDevices.getUserMedia({ video: true, audio: true });

var room_id = " ";
var our_username;
var users = [];
var stream_properties = {
    is_muted: false,
    video_paused: false
}
var video_div_info = {
    "vid_one": {
        "name": "none",
        "src": "none"
    },
    "vid_two": {
        "name": "none",
        "src": "none"
    },
    "vid_three": {
        "name": "none",
        "src": "none"
    },
    "vid_four": {
        "name": "none",
        "src": "none"
    },
};

function reset_properties() {
    reset_button_state();
    room_id = " ";
    our_username;
    users = [];
    stream_properties = {
        is_muted: false,
        video_paused:false
    };
    video_div_info = {
        "vid_one": {
            "name": "none",
            "src": "none"
        },
        "vid_two": {
            "name": "none",
            "src": "none"
        },
        "vid_three": {
            "name": "none",
            "src": "none"
        },
        "vid_four": {
            "name": "none",
            "src": "none"
        },
    };
}

// ----------- DOM Manipulation -----------

function init_event_binders() {
    document.getElementById("create_btn_inner").addEventListener('click', function () {
        our_username = document.getElementById("create_username").value;
        room_id = document.getElementById("create_room_id").value;
        let valid = validate_input(our_username, room_id);
        if (valid.username && valid.meeting_id) {
            create_room(room_id, our_username);
        } else {
            if (!valid.username) {
                notify_user("Username should be more than 4 characters", NOTIFICATION_TYPES.WARNING);
            }
            if (!valid.meeting_id) {
                notify_user("Meeting ID should be more than 4 characters", NOTIFICATION_TYPES.WARNING);
            }
        }
    });

    document.getElementById("join_btn_inner").addEventListener('click', function () {
        our_username = document.getElementById("join_username").value;
        room_id = document.getElementById("join_room_id").value;
        let valid = validate_input(our_username, room_id);
        if (valid.username && valid.meeting_id) {
            join_room(room_id, our_username);
        } else {
            if (!valid.username) {
                notify_user("Username should be more than 4 characters", NOTIFICATION_TYPES.WARNING);
            }
            if (!valid.meeting_id) {
                notify_user("Meeting ID should be more than 4 characters", NOTIFICATION_TYPES.WARNING);
            }
        }
    });

    document.getElementById("leave").addEventListener('click', function () {
        send_to_server("Leave Room", room_id);
        close_connections();
        remove_video_element(our_username);
        notify_user("Left Room ID : " + room_id);
        reset_properties();
        toggle_pages('Page1', 'Page2');
    });

    document.getElementById("mic").addEventListener('click', function () {
        toggle_mute();
    });

    document.getElementById("video").addEventListener('click', function () {
        toggle_video();
    });

    document.getElementById("send").addEventListener('click', function () {
        let text = document.getElementById('send-text').value;
        display_text_message(our_username, text);
        send_text(text);
    });

    document.getElementById("send-text").addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            let text = document.getElementById('send-text').value;
            display_text_message(our_username, text);
            send_text(text);
        }
    });

}

function validate_input(username, meeting_id) {
    let valid = {
        "username": true,
        "meeting_id": true
    };
    if (username.length < 4) {
        valid.username = false;
    }
    if (meeting_id.length < 4) {
        valid.meeting_id = false;
    }
    return valid;
}

// --------- Manage users ---------

function create_room(meeting_id, username) {
    console.log("button create is clicked ");
    send_to_server(action = "Create Room", room_id = meeting_id, data_username = username);
}

function join_room(meeting_id, username) {
    console.log("button join is clicked ");
    send_to_server(action = "Join Room", room_id = meeting_id, data_username = username);
}

function ping_server() {
    setInterval(function () {
        send_to_server("Active", room_id);
    }, 25000);
}

function create_user(username, initiate = true, send_offer = true, sdp_data = " ") {
    var user = {
        "user_name": username,
        "initiate": initiate,
        "send_offer": send_offer,
        "sdp_data": sdp_data,
        "peer_obj": " ",
        "stream_properties": {
            "change_stream": false,
            "stream_muted": false,
            "video_paused": false
        }
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

function notify_user(text, type = null, time = 5000) {
    let do_not_notify = ["connection data", "left room"];
    if (!do_not_notify.includes(text)) {
        if (type == null) {
            quickNotification(text);
        } else {
            quickNotification(text, type);
        }
    }
}

function toggle_mute() {
    if (!stream_properties.is_muted) {
        users.forEach((user) => {
            send_to_server(action = "Send Data", room_id = room_id, to_user = user.user_name, data_type = "Mute", data_username = our_username, sdp_data = '');
        })
        stream_properties.is_muted = !stream_properties.is_muted;
    } else {
        users.forEach((user) => {
            send_to_server(action = "Send Data", room_id = room_id, to_user = user.user_name, data_type = "Unmute", data_username = our_username, sdp_data = '');
        })
        stream_properties.is_muted = !stream_properties.is_muted;
    };
}

function toggle_video() {
    if (!stream_properties.video_paused) {
        users.forEach((user) => {
            send_to_server(action = "Send Data", room_id = room_id, to_user = user.user_name, data_type = "Pause", data_username = our_username, sdp_data = '');
        })
        pause_video(our_username);
        stream_properties.video_paused = !stream_properties.video_paused;
    } else {
        users.forEach((user) => {
            send_to_server(action = "Send Data", room_id = room_id, to_user = user.user_name, data_type = "Resume", data_username = our_username, sdp_data = '');
        })
        resume_video(our_username);
        stream_properties.video_paused = !stream_properties.video_paused;
    };
}

function modify_stream(username) {
    if (stream_properties.is_muted) {
        users.forEach((user) => {
            if (user.user_name == username && user.stream_properties.stream_muted == false) {
                send_to_server(action = "Send Data", room_id = room_id, to_user = user.user_name, data_type = "Mute", data_username = our_username, sdp_data = '');
            }
        })
    }
    if (stream_properties.video_paused) {
        users.forEach((user) => {
            if (user.user_name == username && user.stream_properties.stream_muted == false) {
                send_to_server(action = "Send Data", room_id = room_id, to_user = user.user_name, data_type = "Pause", data_username = our_username, sdp_data = '');
            }
        })
    }
}

//---------------------- WebSocket event listeners ----------------------

ws.onopen = () => {
    console.log("On Open ");
    init_event_binders();
    ping_server();
}

ws.onmessage = function (msg) {
    var res_obj = JSON.parse(msg.data);
    console.log("On msg = " + res_obj.response);
    notify_user(res_obj.response);

    if (res_obj.response == "room created") {
        toggle_pages('Page2', 'Page1');
        init_self_stream();
    }

    if (res_obj.response == "room joined") {
        toggle_pages('Page2', 'Page1');
        init_self_stream();

        var res_data = JSON.parse(res_obj.data);
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
    if (res_obj.response == "connection data") {
        var res_data = JSON.parse(res_obj.data);
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
                    // send connection successful after answer only -> any changes in the stream will be sent after they get success message
                    send_to_server(action = "Send Data", room_id = room_id, to_user = user.user_name, data_type = "connection successful", data_username = our_username, sdp_data = ' ');
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

        if (res_data.type == "connection successful") {
            var username = res_data.username;
            modify_stream(username);
        }

        if (res_data.type == "Mute") {
            var username = res_data.username;
            mute_video(username);
        }

        if (res_data.type == "Unmute") {
            var username = res_data.username;
            unmute_video(username);
        }

        if (res_data.type == "Pause") {
            var username = res_data.username;
            pause_video(username);
        }

        if (res_data.type == "Resume") {
            var username = res_data.username;
            resume_video(username);
        }
    }

    if (res_obj.response == "left room") {
        close_connections(res_obj.data);
        notify_user("User : " + res_obj.data + " left the meeting")
    }
}

ws.onclose = (msg) => {
    close_connections();
    reset_properties();
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
    console.log(obj);
    ws.send(JSON.stringify(obj));
}

async function create_peer(user) {

    users.push(user);

    return stream.then(function (stream) {

        var peer = new Peer({
            initiator: user.initiate,
            trickle: false,
            stream: stream
        });

        user.peer_obj = peer;

        peer.on('signal', function (data) {
            if (user.send_offer) {
                send_to_server(action = "Send Data", room_id = room_id, to_user = user.user_name, data_type = "offer", data_username = our_username, sdp_data = JSON.stringify(data));
                user.send_offer = false;
            } else if (user.stream_properties.change_stream) {
                send_to_server(action = "Send Data", room_id = room_id, to_user = user.user_name, data_type = "change_stream", data_username = our_username, sdp_data = JSON.stringify(data));
                user.stream_properties.change_stream = false;
            } else {
                send_to_server(action = "Send Data", room_id = room_id, to_user = user.user_name, data_type = "answer", data_username = our_username, sdp_data = JSON.stringify(data));
            }
        });

        peer.on("data", function (data) {
            recive_data(data);
        })

        peer.on("stream", function (stream) {
            show_video(stream, user.user_name);
        });
        return user.peer_obj;
    });
}

function create_data_obj(from, type, data) {
    let data_obj = {
        "from": from,
        "type": type,
        "data": data
    };
    return data_obj;
}

function send_text(text_msg, to_user = 'all') {
    let data = create_data_obj(our_username, "text", text_msg);
    users.forEach((user) => {
        if (to_user == "all" || to_user == user.user_name) {
            user.peer_obj.send(JSON.stringify(data));
        }
    });
}

function recive_data(data) {
    if (data.toString().includes("type")) {
        let parsed = JSON.parse(data);
        if (parsed.type == "text") {
            display_text_message(parsed.from, parsed.data);
        }
    }
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

function get_empty_video_div(name) {
    for (vid in video_div_info) {
        if (name == our_username) {
            return "vid_one"
        }
        else if (vid != "vid_one" && video_div_info[vid]["name"] == 'none') {
            return vid
        }
    }
    return 'none'
}

function get_video_div(name) {
    for (vid in video_div_info) {
        if (video_div_info[vid]["name"] == name) {
            return vid
        }
    }
    return 'none'
}

function init_self_stream() {
    stream.then(function (stream) {
        show_video(stream, our_username);
        mute_video(our_username);
    });
}

function show_video(stream, streamer) {
    create_video_element(streamer);
    const video = document.getElementById(streamer);;
    video.srcObject = stream;
    video_div_info[get_video_div(streamer)]["src"] = stream;

    video.play();
};

function create_video_element(name) {
    var free_vid_div_id = get_empty_video_div(name);

    if (free_vid_div_id == 'none') {
        console.log("No video div left");
    } else {
        video_div_info[free_vid_div_id]["name"] = name;

        var vid_div = document.getElementById(free_vid_div_id);
        var vid = document.createElement("video");
        vid.setAttribute("id", name);
        vid.setAttribute("autoplay", "true");
        vid.setAttribute("poster", "../assets/video-placeholder.png");
        set_video_username(name,vid_div);
        vid_div.appendChild(vid);
    }
}

function remove_video_element(name) {
    var vid_div_id = get_video_div(name);

    if (vid_div_id == 'none') {
        console.log("No video div to remove");
    } else {
        console.log(vid_div_id);
        video_div_info[vid_div_id]["name"] = "none";
        video_div_info[vid_div_id]["src"] = "none";

        var vid_div = document.getElementById(vid_div_id);
        var vid = document.getElementById(name);
        remove_video_username(vid_div_id,vid_div);
        vid_div.removeChild(vid);
    }
    console.log(video_div_info);
}

function set_video_username(name,element) {
    element.getElementsByTagName("h4")[0].innerHTML = name;
}

function remove_video_username(div_number,element) {
    var index = Object.keys(video_div_info).indexOf(div_number);
    element.getElementsByTagName("h4")[0].innerHTML = "User " + (index + 1);
}

function pause_video(name) {
    var vid_div_id = get_video_div(name);

    if (vid_div_id == 'none') {
        console.log("No video div to pause");
    } else {
        var vid = document.getElementById(name);
        new_st = video_div_info[vid_div_id]["src"].clone();
        new_st.removeTrack(new_st.getVideoTracks()[0])
        vid.srcObject = new_st;
    }
}

function resume_video(name) {
    var vid_div_id = get_video_div(name);

    if (vid_div_id == 'none') {
        console.log("No video div to pause");
    } else {
        var vid = document.getElementById(name);
        vid.srcObject = video_div_info[vid_div_id]["src"];
    }
}

function mute_video(name) {
    const video = document.getElementById(name);
    video.muted = "muted";
}

function unmute_video(name) {
    const video = document.getElementById(name);
    video.muted = "";
}