const videoElem = document.getElementById("video");
const logElem = document.getElementById("log");
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");

// Options for getDisplayMedia()
let recorder,mediaRecorder;
let recordedBlobs =[];
var displayMediaOptions = {
  video: {
    cursor: "always"
  },
  audio: true
};

// Set event listeners for the start and stop buttons
startElem.addEventListener("click", function(evt) {
  startCapture();
}, false);

stopElem.addEventListener("click", function(evt) {
  stopCapture();
}, false);


async function startCapture() {
  logElem.innerHTML = "";
  recorder=new MediaStream();
  recordedBlobs = [];
  try {
    const stream= await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    // recorder.addTrack(stream.captureStream().getVideoTracks()[0]);
    // recorder.addTrack(stream.captureStream().getAudioTracks()[0]);
    window.stream=stream;
    videoElem.srcObject=window.stream;
    const videoTrack = videoElem.srcObject.getVideoTracks()[0];
  } catch(err) {
    console.error("Error: " + err);
  }
  var options = {mimeType: 'video/webm;codecs=vp9'};
  recordedBlobs = [];
  mediaRecorder = new MediaRecorder(window.stream, options);
  // console.log(MediaRecorder.state());
  mediaRecorder.ondataavailable = handleDataAvailable;
  // mediaRecorder.start();
  
  // mediaRecorder.onstop = handleStop;
  mediaRecorder.start(100); // collect 100ms of data
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
    console.log(recordedBlobs);
  }
}

function stopCapture(evt) {
  let tracks = videoElem.srcObject.getTracks();

  tracks.forEach(track => track.stop());
  videoElem.srcObject = null;
  mediaRecorder.stop();
}

function handleStop(){
  mediaRecorder.stop();
}

const downloadButton = document.querySelector('#download');
downloadButton.addEventListener('click', () => {
  const blob = new Blob(recordedBlobs, {type: 'video/webm'});
  console.log(blob);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  a.style.display = 'none';
  a.src = url;
  console.log(a.src);
  a.download = 'test.webm';
  document.body.appendChild(a);
  console.log(document);
  a.click();
    window.URL.revokeObjectURL(url);
  recordedBlobs=[];
});
