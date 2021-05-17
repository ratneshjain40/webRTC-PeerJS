// ------------------- JSON TEMPLATES and Obj structure -------------------

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