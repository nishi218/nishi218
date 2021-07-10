'use_strict'
        
        const roomName = JSON.parse(document.getElementById('room-name').textContent);
        const username = JSON.parse(document.getElementById('username').textContent);
        var clients={};
        var senders=[];
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
        let localStream,remoteStream;
        
        // const startButton = document.getElementById('startButton');
        const callButton = document.getElementById('callButton');
        const hangupButton = document.getElementById('hangupButton');
        const recordButton = document.querySelector('#record');
        const shareButton = document.querySelector('#screen-share');

        
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

// to make video call to others in the room

function callAction() {
    shareButton.disabled = false;
    hangupButton.disabled=false;
    // dict.push(username);
    callButton.disabled = true;
    
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
    .then(gotLocalMediaStream).catch((error)=>{
        console.log("error in accessing media devices",error)
    });
    sendsignal('new-peer',{});
    
    trace('Requesting local stream.');
    
}
var dict=[];


// call end function
function hangupAction() {
    
    // sendsignal('user-left',{});
    remoteStream.getTracks().forEach(function(track) {
        track.stop();
    });
    localStream.getTracks().forEach(function(track) {
        track.stop();
      });
    localVideo.srcObject=null;
    sendsignal('user-left',{});
    hangupButton.disabled = true;
    // startButton.disabled=false;
    callButton.disabled = false;
    trace('Ending call.');
}
const offerOptions = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
    
};

function gotRemoteMediaStream(peer,remotevideo){
    remoteStream = new MediaStream();
    remotevideo.srcObject=remoteStream;
    peer.addEventListener('track', async (event)=>{
        remoteStream.addTrack(event.track,remoteStream);
    });
}
var fucked=false;
function fuck(){
    fucked=true;
}
function createOfferer(user,channel_name){
    var peer=new RTCPeerConnection(canf);
    addtracks(peer);
    console.log(user);
    console.log("offerer's peer",peer);
    // callButton.disabled=true;
    
    var dc=peer.createDataChannel('channel');
    dc.addEventListener('open',()=>{
        console.log("connection open");
    });
    dc.addEventListener('message',dconmessage);
    var remotevideo=createVideo(user);
    gotRemoteMediaStream(peer,remotevideo);
    clients[user]=[peer,dc];

    peer.addEventListener('iceconnectionstatechange',()=>{
        var ice=peer.iceConnectionState;
        if(ice==='failed'||ice==='closed'||ice==='disconnected'){
            console.log("ice",user);
            delete clients[user];
            if(ice !='closed')
                peer.close();
            removevideo(remotevideo);
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
    console.log("answer=",user);
    // console.log("answerer's peer",peer);
    var remotevideo=createVideo(user);
    gotRemoteMediaStream(peer,remotevideo);
    
    peer.addEventListener('datachannel',e=>{
        peer.dc=e.channel;
        peer.dc.addEventListener('open',()=>{
            console.log("connection open");
        });
        peer.dc.addEventListener('message',dconmessage);
        clients[user]=[peer,peer.dc];
    
    });
    // console.log(clients[username][0]);


    peer.addEventListener('iceconnectionstatechange',()=>{
        var ice=peer.iceConnectionState;
        if(ice==='failed'||ice==='closed'||ice==='disconnected'){
            console.log("ice",user);
            delete clients[user];
            if(ice !='closed')
                peer.close();
            removevideo(remotevideo);
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

function createVideo(user){
    var videoe=document.querySelector("#video-container");
    var videoappend=document.createElement('div');
    var remotevideo = document.createElement("video");
    remotevideo.id=user + "-video";
    remotevideo.autoplay=true;
    remotevideo.playsInline=true;

    videoe.appendChild(videoappend);
    videoappend.appendChild(remotevideo);
    return remotevideo;
    
}

function shareAction(){
    navigator.mediaDevices.getDisplayMedia({cursor:true})
    .then(stream=>{
        const streamtrack =stream.getTracks()[0];
        senders.find(senders=>senders.track.kind==='video').replaceTrack(streamtrack);
        localVideo.srcObject=stream;
        // shareButton.innerHTML="Stop Share";
        streamtrack.onended = function (){
            senders.find(senders=>senders.track.kind==='video').replaceTrack(localStream.getTracks()[1]);
            localVideo.srcObject=localStream;
        }
    })
}


function addtracks(peer){
    localStream.getTracks().forEach(track=>{
        senders.push(peer.addTrack(track,localStream));
    });
    return;
}
var btnaudio=document.querySelector("#audio");
var btnvideo=document.querySelector("#video");


callButton.addEventListener('click', callAction);
hangupButton.addEventListener('click', hangupAction);
shareButton.addEventListener('click', shareAction);

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
        document.querySelector('#chat-log').value += (" "+user+ ":" + data['message'] + '\n');
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
        console.log('peer',peer);
        peer.setRemoteDescription(answer);
        return; 
    }
    if(action=='user-left'){
        remoteStream.getTracks().forEach(function(track) {
            track.stop();
        });
        console.log(user);
        var peer=clients[user][0];
        // // // console.log(peer);
        
        // peer.iceConnectionState="disconnected";
        var ice=peer.iceConnectionState;
        console.log(ice);
        // peer.close();
        // peer=null;
        // delete clients[user];
        return;
    }
}