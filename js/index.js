var Peer = require("simple-peer");
var ws = new WebSocket("ws://localhost:8080/webRTC-Signal/signal");
var stream = navigator.mediaDevices.getUserMedia({ video: true, audio: false });


var our_username;
var users = [];

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
// here if we get type -> participant, we need to create an initiator peer for it and send it back.

// var user = {
//     "user_name": "random name",
//     "initiate": "true",
//     "send_signal" : "flase",
//     "sdp_data" : "peer_signal_data",
//     "peer_obj" : ""
// }
// here sdp data we get is of the other user
// here initiate -> decides if we need to create a inititor peer or client peer.

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

// TODO : create peer_users list(contains only usernames). put peers in media_loop in an async way -> peer_users.foreach maybe??

ws.onopen = () => {
    console.log("On Open ");
    document.getElementById("create").addEventListener('click', function () {
        console.log("button create is clicked ");
        room_id = document.getElementById("RoomID").value;
        our_username = document.getElementById("our_username").value;

        send_to_server("Create Room", room_id);
    });

    document.getElementById("join").addEventListener('click', function () {
        console.log("button join is clicked ");
        room_id = document.getElementById("RoomID").value;
        our_username = document.getElementById("our_username").value;

        send_to_server("Join Room", room_id);
    });
}

ws.onmessage = function (msg) {
    var res = JSON.parse(msg.data);
    console.log("On msg = " + res.response);

    if (res.response == "room created") {
        init_self();
    }

    if (res.response == "room joined") {
        init_self();
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
                    "peer_obj" : " "
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
                "peer_obj" : " "
            }
            create_peer(user);
        }
        if (res_data.type == "answer") {
            var username = res_data.username;
            // dont use foreach
            users.forEach((user) => {
                if (user.user_name == username) {
                    console.log("username matched in users list");
                    user.peer_obj.signal(res_data.sdp_data);
                }
            })
        }

    }
}

ws.onclose = (msg) => {
    console.log("On Close = " + msg);
};

function init_self() {
    stream.then(function (stream) {
        showVideo(stream);
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
            console.log("signal called ");
            if (user.initiate) {
                console.log("initiated offer");
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
            showVideo(stream, "othervid");
        });

        user.peer_obj = peer;
    })

}

function showVideo(stream, streamer = 'yourvid') {
    const video = document.getElementById(streamer);;
    video.srcObject = stream;
    video.play();
};