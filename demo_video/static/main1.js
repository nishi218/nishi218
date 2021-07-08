        'use_strict'
        
        const roomName = JSON.parse(document.getElementById('room-name').textContent);
        const username = JSON.parse(document.getElementById('username').textContent);
        var clients={};
        
        const chatSocket = new WebSocket(
            'ws://'
            + window.location.host
            + '/ws/'
            + roomName
            + '/'+username+'/'
        );
        //trickes whenever a mew message is arrives at the server
        
        
        chatSocket.onopen =function(e){
            console.log("connection open");
            
        }
        chatSocket.onmessage = function(event){
            websocketrecievemessage(event);
            
        }
        chatSocket.onclose = function(event){
            console.log("connection closed");
        }
        chatSocket.onerror = function(e) {
            console.log('error occured');
        };
        
        document.querySelector('#chat-message-input').focus();
        document.querySelector('#chat-message-input').onkeyup = function(e) {
            if (e.keyCode === 13) {  // enter, return
                document.querySelector('#chat-message-submit').click();
            }
        };

        document.querySelector('#chat-message-submit').onclick = function(e) {
            const messageInputDom = document.querySelector('#chat-message-input');
            const message = messageInputDom.value;
            sendsignal('new-message',message);
            // chatSocket.send(JSON.stringify({'message': message}));
            messageInputDom.value = '';
        };

        

        //to send signal
        function sendsignal(action,message){
            var jsonstr=JSON.stringify({
                'action':action,
                'message':message,
                'user':username,
            });
            
            chatSocket.send(jsonstr);
        }
        // let remoteVideo;
        const localVideo = document.getElementById('localVideo');
        var remoteVideo = document.getElementById('remoteVideo');
        let localStream;
        let remoteStream;
        
        const startButton = document.getElementById('startButton');
        const callButton = document.getElementById('callButton');
        const hangupButton = document.getElementById('hangupButton');
        const recordButton = document.querySelector('#record');
        const shareButton = document.querySelector('#screen-share');

        callButton.disabled = true;
        hangupButton.disabled = true;

        //media access
        const mediaStreamConstraints = {
            video: true,
            audio : true,
        };

        //stun servers for other devices to connect
        var canf = {
            'iceServers': [{
                'urls': ['stun:stun.l.google.com:19302',
      'stun:stun1.l.google.com:19302',
      'stun:stun2.l.google.com:19302']
    }]
  };

function gotLocalMediaStream(mediaStream) {
    localVideo.srcObject = mediaStream;
    localStream = mediaStream;
    trace('Received local stream.');
    callButton.disabled = false;  // Enable call button.


    const videoTracks = localStream.getVideoTracks();
    const audioTracks = localStream.getAudioTracks();
    audioTracks[0].enabled=true;
    videoTracks[0].enabled=true;
    btnaudio.addEventListener('click',()=>{
        audioTracks[0].enabled=!audioTracks[0].enabled;
        if(audioTracks[0].enabled)
            btnaudio.innerHTML='Audio Mute';
        else
            btnaudio.innerHTML='Audio UnMute';

    });
    btnvideo.addEventListener('click',()=>{
        videoTracks[0].enabled=!videoTracks[0].enabled;
        if(videoTracks[0].enabled)
            btnvideo.innerHTML='video Mute';
        else
            btnvideo.innerHTML='video UnMute';

    });

}
//handles remote stream by adding it to remote video
function gotRemoteMediaStream(event) {
    const mediaStream = event.stream;
    remoteVideo.srcObject = mediaStream;
    remoteStream = mediaStream;
    trace('Remote peer connection received remote stream.');
}
//to access media devices for local video
function startAction() {
    startButton.disabled = true;
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
    .then(gotLocalMediaStream).catch((error)=>{
        console.log("error in accessing media devices",error)
    });
    
    trace('Requesting local stream.');
    
}

// to make video call to others in the room
function callAction()
{
    sendsignal('new-peer',{});
    hangupButton.disabled = false;
    callButton.disabled = true;
    // recordButton.disabled=false;
    // shareButton.disabled=false;
    // dict.forEach((k, v) => console.log(`Key is ${k} and value is ${v}`));
}
async function recordAction(){
    let mediaRecorder;
    let recordedBlobs;
    let stream;
    const constraints = {
        video: {
            displaySurface :"application"
        },
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
        }
        
            
    };
    const downloadButton = document.querySelector('#download');
    

    if (recordButton.textContent === 'Start Recording') {
        startRecording();
    } else {
        stopRecording();
        recordButton.textContent = 'Start Recording';
        downloadButton.disabled = false;
    }
    downloadButton.addEventListener('click', () => {
        const blob = new Blob(recordedBlobs, {type: 'video/webm'});
        const url =URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'test.webm';
        document.body.appendChild(a);
        a.click();
        
    });


    async function handleDataAvailable(event) {
        console.log('handleDataAvailable', event);
        if (event.data && event.data.size > 0) {
            recordedBlobs.push(event.data);
        }
        return;
    }


    async function startRecording() {
        stream = await navigator.mediaDevices.getDisplayMedia(constraints)
        .then(()=>{
            handleSuccess();
        }).catch((error)=>{
            console.error('navigator.getUserMedia error:', error);
        })
        window.stream=stream;
        recordedBlobs = [];
        try {
            mediaRecorder = new MediaRecorder();
        }catch (e) {
            console.error('Exception while creating MediaRecorder:', e);
            
        }

        recordButton.textContent = 'Stop Recording';
        downloadButton.disabled = true;
        mediaRecorder.onstop = (event) => {
            console.log('Recorder stopped: ', event);
            console.log('Recorded Blobs: ', recordedBlobs);
        };
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start();
        console.log('MediaRecorder started', mediaRecorder);
    }

    async function stopRecording() {
        mediaRecorder.stop();
    }

    async function handleSuccess() {
        recordButton.disabled = false;
        console.log('getUserMedia() got stream:', stream);
        return;
    }
}
// call end function
function hangupAction() {
    
    remoteStream.getTracks().forEach(function(track) {
        track.stop();
    });
    localStream.getTracks().forEach(function(track) {
        track.stop();
    });
    startButton.disabled = true;
    
    hangupButton.disabled = true;
    callButton.disabled = false;
    trace('Ending call.');
}
const offerOptions = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
    
};

function createOfferer(user,channel_name){
    var peer=new RTCPeerConnection(canf);
    addtracks(peer);
    var dc=peer.createDataChannel('channel');
    dc.addEventListener('open',()=>{
        console.log("connection open");
    });
    dc.addEventListener('message',dconmessage);
    createVideo();
    peer.addEventListener('addstream', gotRemoteMediaStream);
    clients[user]=[peer,dc];

    peer.addEventListener('iceconnectionstatechange',()=>{
        var ice=peer.iceConnectionState;
        if(ice==='failed'||ice==='closed'||ice==='disconnected'){
            delete clients[user];
            if(ice !='closed')
                peer.close();
            removevideo(remoteVideo);
        }        
    });
    peer.addEventListener('icecandidate',(event)=>{
        if(event.candidate){
            console.log("new ice candidate");
            return;
        }
        sendsignal('new-offer',{
            'sdp':peer.localDescription,
            'receiver_channel_name':channel_name
        });
    });

    peer.createOffer(offerOptions)
    .then(o=>{
        peer.setLocalDescription(o)
        .then(() => {
            console.log("set local description successs");
        }).catch((error)=>{
            console.log("error in setting local description",error);
        });
    }).catch((error)=>{
        console.log("error in creating offer",error);
    });

}

function dconmessage(event){
    var message=event.data;
}

function createAnswerer(offer,user,channel_name){
    var peer=new RTCPeerConnection(canf);
    addtracks(peer);
    
    createVideo(user);
    peer.addEventListener('addstream', gotRemoteMediaStream);
    
    peer.addEventListener('datachannel',e=>{
        peer.dc=e.channel;
        peer.dc.addEventListener('open',()=>{
            console.log("connection open");
        });
        peer.dc.addEventListener('message',dconmessage);
        clients[user]=[peer,peer.dc];
    
    });
    


    peer.addEventListener('iceconnectionstatechange',()=>{
        var ice=peer.iceConnectionState;
        if(ice==='failed'||ice==='closed'||ice==='disconnected'){
            delete clients[user];
            if(ice !='closed')
                peer.close();
            removevideo(remoteVideo);
        }        
    });
    peer.addEventListener('icecandidate',(event)=>{
        if(event.candidate){
            console.log("new ice candidate");
            return;
        }
        sendsignal('new-answer',{
            'sdp':peer.localDescription,
            'receiver_channel_name':channel_name
        });
    });
    trace('remotePeerConnection remote descriuption  start.');
    peer.setRemoteDescription(offer)
    .then(() => {
      console.log("remote description set success");
    }).catch((error)=>{
        console.log("error in setting remote description:",error);
    });
    
    trace('remotePeerConnection createAnswer start.');
    peer.createAnswer()
    .then(o=>{
        peer.setLocalDescription(o)
      .then(() => {
        console.log("local desc for remote is set successful");
      }).catch((error)=>{
        console.log("error in setting remote description:",error);
    });
    }).catch((error)=>{
        console.log("error in creating answer:",error);
    });


    
}

// Set up to exchange only video.

function removevideo(remote_video){
    var viv=remote_video.parentNode;
    viv.parentNode.removeChild(viv);
}

function createVideo(){
    var videoe=document.querySelector("#video-container");
    var videoappend=document.createElement('div');
    videoe.appendChild(videoappend);
    videoappend.appendChild(remoteVideo);
    
}

// async function shareAction(){
//     shareButton.disabled=true;
//     const stream=await navigator.mediaDevices.getDisplayMedia({video:true});
//     localVideo.srcObject=stream;
//     localStream=stream;
//     var peer=clients[username];
//     addtracks(peer);
//     localStream.getVideoTracks()[0].addEventListener('ended', () => {
//         console.log('The user has ended sharing the screen');
//         startAction();
//         shareButton.disabled = false;
//     });
// }


function addtracks(peer){
    localStream.getTracks().forEach(track=>{
        peer.addTrack(track,localStream);
    });
    return;
}
var btnaudio=document.querySelector("#audio");
var btnvideo=document.querySelector("#video");
// Add click event handlers for buttons.
startButton.addEventListener('click', startAction);
callButton.addEventListener('click', callAction);
hangupButton.addEventListener('click', hangupAction);
// recordButton.addEventListener('click', recordAction);
// shareButton.addEventListener('click', shareAction);

// trace function
function trace(text) {
    text = text.trim();
    const now = (window.performance.now() / 1000).toFixed(3);

    console.log(now, text);
}

function websocketrecievemessage(event){
    let data=JSON.parse(event.data);
    // dict=JSON.parse(o.data);
    // var m=data['message'];
    var user=data['user'];
    var action=data['action'];
    if(action=="new-message"){
        document.querySelector('#chat-log').value += (user+ ":" + data['message'] + '\n');
        return;
    }
    if(user==username)
        return;
    var receiver_channel=data['message']['receiver_channel_name'];
    
    if(action=="new-peer")
    {
        // remotepeer=receiver_channel;
        createOfferer(user,receiver_channel);
        return;
    }
    if(action=='new-offer'){
        console.log("got new offer from",user);
        var offer= data['message']['sdp'];
        createAnswerer(offer,user,receiver_channel);
        return;
    }
    if(action=='new-answer'){
        // console.log('clients:');
        // for(key in clients){
        //     console.log(key, ': ', clients[key]);
        // }
        console.log("answer from",user);
        var answer=data['message']['sdp'];
        var peer=clients[user][0];
        peer.setRemoteDescription(answer);
        return; 
    }
}