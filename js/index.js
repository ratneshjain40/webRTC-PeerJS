var getusermedia = require('getusermedia');

var Peer = require("simple-peer");

getusermedia(
    {
        video: true,
        audio: false
    },
    function (err, stream) {
        if (err) console.log(err);

        showVideo(stream);

        var peer = new Peer({
            initiator: location.hash === "#init",
            trickle: false,
            stream: stream
        })

        peer.on('signal', function (data) {
            console.log(data);
            document.getElementById("yourID").value = JSON.stringify(data);

        });

        document.getElementById("connect").addEventListener('click', function () {
            console.log("button connect is clicked ");
            var otherid = JSON.parse(document.getElementById("otherID").value);
            peer.signal(otherid);
        });

        document.getElementById("send").addEventListener('click', function () {
            console.log("button send is clicked ");

            var yourMessage = document.getElementById("yourMessage").value;
            peer.send(yourMessage);
        });

        peer.on('data', function (data) {
            console.log(data);
            document.getElementById("messages").textContent += data + "\n";
        });

        //it is auto-called when you pass a stream object to the peer which we are doing
        //the peer object used below is the targets stream
        peer.on("stream", function (stream) {
            showVideo(stream,"othervid");
        });
    }
)

function showVideo(stream,streamer='yourvid') {
    const video = document.getElementById(streamer);;
    video.srcObject = stream;
    video.play();
}