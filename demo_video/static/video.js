'use strict';
// const username = JSON.parse(document.getElementById('username').textContent);

const offerOptions = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
    
};
let startTime = null;

let localPeerConnection;
let remotePeerConnection;


function createdOffer(description) {
    trace(`Offer from localPeerConnection:\n${description.sdp}`);

    trace('localPeerConnection setLocalDescription start.');
    localPeerConnection.setLocalDescription(description)
      .then(() => {
        setLocalDescriptionSuccess(localPeerConnection);
      }).catch(setSessionDescriptionError);
  }

  // Logs answer to offer creation and sets peer connection session descriptions.
  function createdAnswer(description) {
    trace(`Answer from remotePeerConnection:\n${description.sdp}.`);

    trace('remotePeerConnection setLocalDescription start.');
    remotePeerConnection.setLocalDescription(description)
      .then(() => {
        setLocalDescriptionSuccess(remotePeerConnection);
      }).catch(setSessionDescriptionError);
}
  function setSessionDescriptionError(error) {
    trace(`Failed to create session description: ${error.toString()}.`);
  }
function gotRemoteMediaStream(event) {
    const mediaStream = event.stream;
    remoteVideo.srcObject = mediaStream;
    remoteStream = mediaStream;
    trace('Remote peer connection received remote stream.');
}
  // Logs success when setting session description.
  function setDescriptionSuccess(peerConnection, functionName) {
    const peerName = getPeerName(peerConnection);
    trace(`${peerName} ${functionName} complete.`);
  }

  // Logs success when localDescription is set.
  function setLocalDescriptionSuccess(peerConnection) {
    setDescriptionSuccess(peerConnection, 'setLocalDescription');
  }
// Logs changes to the connection state.
function handleConnectionChange(event) {
    const peerConnection = event.target;
    console.log('ICE state change event: ', event);
    trace(`${getPeerName(peerConnection)} ICE state: ` +
          `${peerConnection.iceConnectionState}.`);
}
  // Logs success when remoteDescription is set.
  function setRemoteDescriptionSuccess(peerConnection) {
    setDescriptionSuccess(peerConnection, 'setRemoteDescription');
}
function logVideoLoaded(event) {
    const video = event.target;
    trace(`${video.id} videoWidth: ${video.videoWidth}px, ` +
          `videoHeight: ${video.videoHeight}px.`);
  }

  // Logs a message with the id and size of a video element.
  // This event is fired when video begins streaming.
  function logResizedVideo(event) {
    logVideoLoaded(event);

    if (startTime) {
      const elapsedTime = window.performance.now() - startTime;
      startTime = null;
      trace(`Setup time: ${elapsedTime.toFixed(3)}ms.`);
    }
  }

  localVideo.addEventListener('loadedmetadata', logVideoLoaded);
  remoteVideo.addEventListener('loadedmetadata', logVideoLoaded);
  remoteVideo.addEventListener('onresize', logResizedVideo);




function callAction(){
    
    // if(clients.length!=0){
    //     for (let i = 0; i < clients.length ; i++){
    //         // console.log(clients[i]);
    //         if(clients[i]!=username)
    //         {
    //         console.log(clients[i]);
    //         callButton.disabled = true;
    //         hangupButton.disabled = false;

    //         trace('Starting call.');
    //         startTime = window.performance.now();
    //         localPeerConnection = new RTCPeerConnection(canf);
    //         remotePeerConnection = new RTCPeerConnection(canf);
            
    //         // Get local media stream tracks.
    //         const videoTracks = localStream.getVideoTracks();
    //         const audioTracks = localStream.getAudioTracks();
    //         if (videoTracks.length > 0) {
    //             trace(`Using video device: ${videoTracks[0].label}.`);
    //         }
    //         if (audioTracks.length > 0) {
    //             trace(`Using audio device: ${audioTracks[0].label}.`);
    //         }
    //         localPeerConnection.addStream(localStream);
    //         trace('Added local stream to localPeerConnection.');

    //         trace('localPeerConnection createOffer start.');
    //         localPeerConnection.createOffer(offerOptions)
    //             .then(createdOffer((description)=>{
    //                 trace(`Offer from localPeerConnection:\n`);
    //                 trace('localPeerConnection setLocalDescription start.');
    //                 localPeerConnection.setLocalDescription(description)
    //                 .then(() => {
    //                     setLocalDescriptionSuccess(localPeerConnection);
    //                     chatSocket.send(JSON.stringify({
    //                         'action':'offer',
    //                         'from_user':clients[i],
    //                         'to_user':username,
    //                         'sdp':description.sdp,
    //                     }))
    //                 }).catch(setSessionDescriptionError);
    //             })).catch(setSessionDescriptionError);
            
    //         //add stream to remote peer 
    //         remotePeerConnection.addEventListener('addstream', gotRemoteMediaStream);
    //         remotePeerConnection.addEventListener(
    //             'iceconnectionstatechange', handleConnectionChange);
    //         localPeerConnection.onicecandidate = function(event) {
    //             const iceCandidate = event.candidate;
    //             if(iceCandidate)
    //             {
    //                 const newIceCandidate = new RTCIceCandidate(iceCandidate);
    //                 chatSocket.send(JSON.stringify({
    //                     'action':'candidate',
    //                     'from_user':clients[i],
    //                     'to_user':username,
    //                     'sdp':newIceCandidate,
    //                 }))
    //             } 
    //         }
    //         trace('remotePeerConnection createAnswer start.');
    //         remotePeerConnection.createAnswer()
    //         .then(createdAnswer((description)=>{
    //             trace(`Answer from remotePeerConnection:\n`);
    //             trace('remotePeerConnection setLocalDescription start.');
    //             remotePeerConnection.setLocalDescription(description)
    //             .then(() => {
    //                 setLocalDescriptionSuccess(remotePeerConnection);
    //                 chatSocket.send(JSON.stringify({
    //                     'action':'answer',
    //                     'from_user':username,
    //                     'to_user':clients[i],
    //                     'sdp':description.sdp,
    //                 }));
    //             }).catch(setSessionDescriptionError);
    //         }))
    //         .catch(setSessionDescriptionError);
            

    //         // trace('localPeerConnection setRemoteDescription start.');
    //         // localPeerConnection.setRemoteDescription(description)
    //         remotePeerConnection.onicecandidate = function(event) {
    //             const iceCandidate = event.candidate;
    //             const newIceCandidate = new RTCIceCandidate(iceCandidate);
    //             // send candidate to remote via signalling channel
    //             chatSocket.send(JSON.stringify({
    //                 'action':'candidate',
    //                 'from_user':username,
    //                 'to_user':clients[i],
    //                 'sdp':newIceCandidate,
    //             }))
    //         }
    //         }
            
    //     }
    // }
    console.log(username);
    clients.push(username);
    for(let i=0;i<clients.length;i++){
        console.log(clients[i]);
    }
    console.log(clients.length);
}

// Gets the "other" peer connection.
function getOtherPeer(peerConnection) {
    return (peerConnection === localPeerConnection) ?
        localPeerConnection : remotePeerConnection;
  }

  // Gets the name of a certain peer connection.
  function getPeerName(peerConnection) {
    return (peerConnection === localPeerConnection) ?
        'localPeerConnection' : 'remotePeerConnection';
  }