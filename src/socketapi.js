import io from 'socket.io-client';
import hark from 'hark';
var socket = io('https://opendesktopvideo.com/');
let localStream;
let remoteStreams = {};
let room;
let isSpeaking = '';

var pcs = {};
// var turnReady;

var pcConfig = {
  'iceServers': [{
    'urls': ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
  }]
};

// var sdpConstraints = {
//   offerToReceiveAudio: true,
//   offerToReceiveVideo: true
// };

const video = {
  optional: [
    {minWidth: 320},
    {minWidth: 640},
    {minWidth: 1024},
    {minWidth: 1280},
    {minWidth: 1920},
    {minWidth: 2560},
  ]
}
const audio = true;

var video_constraints = {
  audio,
  video
};
var screenshare_constraints = {
  audio: false,
  video: {
    ...video,
    mandatory: {
      chromeMediaSource: 'desktop'
    }
  }
}

//// SOCKET STUFF TO SET UP ROOM

socket.on('created', function(room, id) {
  console.log('Created room ' + room);
});

socket.on('full', function(room) {
  console.log('Room ' + room + ' is full');
});

socket.on('join', function (room, id){
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  //Someones joined, lets try to start a connection with them
  maybeStart(id);
});

socket.on('joined', function(room) {
  console.log('joined: ' + room);
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});


////////////////////////////////////// ===== API =====

const getLocalStream = () => localStream;

const getRemoteStream = (id) => remoteStreams[id];



const onStreamAdded = (callback) => {
  window.addEventListener('streamAdded', callback);
}

const onStreamRemoved = (callback) => {
  window.addEventListener('streamRemoved', callback);
}
const onStreamChanged = (callback) => {
  window.addEventListener('streamChanged', callback);
}

// const onLocalStreamAdded = (callback) => {
//   window.addEventListener('localStreamAdded', callback);
// }

const onActiveChange = (callback) => {
  window.addEventListener('activeChange', callback);
}

const muteVideo = () => {
  localStream.getVideoTracks()[0].enabled = false;
}
const unmuteVideo = () => {
  localStream.getVideoTracks()[0].enabled = true;
}
const muteAudio = () => {
  localStream.getAudioTracks()[0].enabled = false;
}
const unmuteAudio = () => {
  localStream.getAudioTracks()[0].enabled = true;
}

const screenshare = (sharingScreen, source) => {
  return new Promise((resolve, reject) => {
    let constraints = screenshare_constraints;
    if(!sharingScreen){
      constraints = video_constraints;
    }else{
      constraints.video.mandatory['chromeMediaSourceId'] = source.id;
    }
    console.log("USING CONSTRAINTS", constraints);
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      console.log("got new stream", stream);
      console.log("localstream track", localStream.getVideoTracks()[0]);
      localStream.removeTrack(localStream.getVideoTracks()[0]);
      localStream.addTrack(stream.getVideoTracks()[0]);
      for (var key in pcs) {
          if (pcs.hasOwnProperty(key)) {
              updateConnection(key);
          }
      }
      console.log("localstream track", localStream.getVideoTracks()[0]);
      resolve(localStream);
    }).catch(error => {
      reject(error);
    })
  })
}
const hangup = () => {
    return new Promise((resolve, reject) => {
        for (var key in remoteStreams) {
            if (remoteStreams.hasOwnProperty(key)) {
                remoteStreams[key].getTracks().forEach(track => track.stop());
                remoteStreams[key] = undefined;
                delete remoteStreams[key];
            }
        }

        localStream.getTracks().forEach(track => track.stop());
        localStream = undefined;
        remoteStreams = undefined;
        for (var i = 0; i < pcs.length; i++) {
          pcs[i].close();
        }
        sendMessage('bye');
        resolve();
    });
}

const init = (roomToJoin) => {
  return new Promise((resolve, reject) => {
    if(roomToJoin){
      room = roomToJoin;
      //we're initialising so lets just get the regular webcam feed to start with
      let constraints = video_constraints;
      //First we create the local stream, that way, whether we're joining or creating a room, we're ready to go
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        localStream = stream;
        sendMessage('got user media');
        //ok sweet, local stream is set up, lets join a room
        socket.emit('create or join', room);

        //now lets send the stream back to the component to put it on display
        resolve(stream);
      }).catch((error) => {
        reject(error);
      });
    }else{
      reject(new Error("No room name!"));
    }
  })
}


///////////////////////////////// ====== SENDING AND RECEIVING MESSAGES THRU SOCKET ======

const sendMessage = (message, to = null) => {
  console.log('Client sending message: ', message);
  if(!to){
    socket.emit('message', message, room);
  }else{
    socket.emit('message', message, room, to);
  }
}

socket.on('message', (fromId, msg) => {
  //The client has received a msg from the signalling Server
  console.log('Client received message:', msg, fromId);
  // if(msg === 'got user media'){
  //   //this is sent by clients when their local video is set, so we might need to start a call
  //   maybeStart(fromId);
  // }else
  if (msg === 'bye') {
    // a remote peer is hanging up, bye felicia
    handleRemoteHangup(fromId);
  }else if ( msg && msg.type ){
    switch (msg.type) {
      case 'offer':
        let changingStreams = false;
        if(pcs[fromId] && pcs[fromId].iceConnectionState && ['new', 'failed', 'checking', 'disconnected', 'closed'].indexOf(pcs[fromId].iceConnectionState) === -1){
            //Ooo this is from someone we're already connected with they must be changing streams
            changingStreams = true;
        }
        // someone else is sending you an offer
        //set the remote description from the offer
        if(!pcs[fromId]){
          createPeerConnection(localStream, fromId);
          pcs[fromId].addStream(localStream);
        }
        console.log(" got offer, sending answer");
        pcs[fromId].setRemoteDescription(new RTCSessionDescription(msg));
        //dont be rude, send an answer
        //this gets our local session description, adds it to this PeerConnection, then sends it to the person who sent the offer as an answer
        doAnswer(fromId);
        if(changingStreams){
            let changedEvent = new CustomEvent('streamChanged', { detail: fromId });
            window.dispatchEvent(changedEvent);
        }
        break;
      case 'answer':
        console.log(" got answer");
        //we've sent someone an offer and they're responding
        if(pcs[fromId]){
          // lets set the remote to their response
          console.log(" setting remote description");
          pcs[fromId].setRemoteDescription(new RTCSessionDescription(msg));
        }
        break;
      case 'candidate':
        //setting some info about how to reach them
        if(pcs[fromId]){
          var candidate = new RTCIceCandidate({
            sdpMLineIndex: msg.label,
            candidate: msg.candidate
          });
          pcs[fromId].addIceCandidate(candidate);
        }
        break;
      default:
        return;

    }
  }
})

//////// UTILITY FUNCTIONS

const maybeStart = (fromId) => {
  console.log('>>>>>>> maybeStart() ', localStream);
  if (localStream !== 'undefined') {
    //its not started, we've got a stream and we're ready, create a peer connection
    console.log('>>>>>> creating peer connection');
    //this function sets up the peer connection
    createPeerConnection(localStream, fromId);
    pcs[fromId].addStream(localStream);
    // Then we get our local session description, add it to the PeerConnection, then send it to the recipient as an offer
    doCall(fromId);
  }
}

const createPeerConnection = (localStream, id) => {
  try {
    let pc = new RTCPeerConnection(pcConfig);
    pc.onicecandidate = handleIceCandidate;
    pc.onaddstream = (event) => { return handleRemoteStreamAdded(event, id); };
    pc.onremovestream = (event) => { return handleRemoteStreamRemoved(event, id)} ;
    pc.onnegotiationneeded = (event) => {
      console.log("ONNEG FIRED", event);
      console.log("pc status", pc.iceConnectionState);
      if(pc.iceConnectionState !== "new"){
          updateConnection(id);
      }

    }
    console.log('Created RTCPeerConnnection');
    //once its set up, add the local stream (our video)
    pcs[id] = pc;
  } catch (e) {
    console.log('Failed to create PeerConnection, exception: ' + e.message);
    alert('Cannot create RTCPeerConnection object.');
    return;
  }
}

const updateConnection = (id) => {
    pcs[id].createOffer().then(
      (sd) => {return setLocalAndSendMessage(sd, id)}
    ).catch(handleCreateOfferError);
}

const handleIceCandidate = (event) => {
  console.log('icecandidate event: ', event);
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    });
  } else {
    console.log('End of candidates.');
  }
}

const handleRemoteStreamAdded = (event, id) => {
  console.log('Remote stream added.', event.stream);
  window.newstream = event.stream
  remoteStreams[id] = event.stream;
  let speech = hark(remoteStreams[id], {});

  speech.on('speaking', () => {
    //when someone starts speaking, if no one else is already speaking, set them to active
    if(isSpeaking === ''){
      isSpeaking = id;
      let ev = new CustomEvent('activeChange', { detail: id });
      window.dispatchEvent(ev);
    }
  })
  speech.on('stopped_speaking', () => {
    isSpeaking = "";
  })
  let addedEvent = new CustomEvent('streamAdded', { detail: id });
  window.dispatchEvent(addedEvent);
}

const handleRemoteStreamRemoved= (event, id) => {
  console.log('Remote stream removed. Event: ', event);
  delete remoteStreams[id];
  let removedEvent = new CustomEvent('streamRemoved', { detail: id });
  window.dispatchEvent(removedEvent);
}

const doCall = (id) => {
  console.log('Sending offer to peer');
  pcs[id].createOffer().then(
    (sd) => {return setLocalAndSendMessage(sd, id)},
    handleCreateOfferError);
}

const setLocalAndSendMessage = (sessionDescription, id) => {
  pcs[id].setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sendMessage(sessionDescription, id);
}

const handleCreateOfferError = (event) => {
  console.log('createOffer() error: ', event);
}

const doAnswer = (id) => {
  console.log('Sending answer to peer.');
  pcs[id].createAnswer()
  .then(
    (sd) => {
      setLocalAndSendMessage(sd, id);
    }
  ).catch(onCreateSessionDescriptionError);
}

const onCreateSessionDescriptionError = (error) => {
  console.log('Failed to create session description: ' + error.toString());
}

const handleRemoteHangup = (id) => {
  console.log('Session terminated.');
  stop(id);
}

const stop = (id) => {
  try {
    pcs[id].close();
    pcs[id] = undefined;
    delete pcs[id];
    remoteStreams[id] = undefined;
    delete remoteStreams[id];
  } catch (e) {
    console.log(e);
  } finally {
    let removedEvent = new CustomEvent('streamRemoved', { detail: id });
    window.dispatchEvent(removedEvent);
  }
}


//in case someone just closes the windwo, tell the others youve left
window.onbeforeunload = function() {
  sendMessage('bye');
};

const socketapi = {
  init,
  getLocalStream,
  onStreamAdded,
  onStreamRemoved,
  onStreamChanged,
  onActiveChange,
  getRemoteStream,
  muteVideo,
  unmuteVideo,
  muteAudio,
  unmuteAudio,
  screenshare,
  hangup
}

export {socketapi};
