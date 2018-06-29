import io from 'socket.io-client';
import hark from 'hark';
var socket = io('https://opendesktopvideo.com/');
let localStream;
let remoteStreams = {};
let room;
let isSpeaking = '';
let updating
let muted = false;

var pcs = {};
var timestampPrev = 0;
var bytesPrev = 0;
// var turnReady;

var pcConfig = {
  'iceServers': [{
    'urls': ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
  }]
};

var default_bandwidth = 'auto';

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
  let createdEvent = new CustomEvent('roomcreated', { detail: id });
  window.dispatchEvent(createdEvent);
  console.log('Created room ' + room);
  if(localStream){
    let addedEvent = new CustomEvent('streamAdded', { detail: 'local' });
    window.dispatchEvent(addedEvent);
  }
});

socket.on('full', function(room) {
  let fullEvent = new CustomEvent('roomfull', { detail: room });
  window.dispatchEvent(fullEvent);
  console.log('Room ' + room + ' is full');
});

socket.on('join', function (room, id){
  console.log('Another peer made a request to join room ' + room);
  console.log('This peer is the initiator of room ' + room + '!');
  //Someones joined, lets try to start a connection with them
  maybeStart(id);
});

socket.on('joined', function(room) {
  let joinedEvent = new CustomEvent('roomjoined', { detail: room });
  window.dispatchEvent(joinedEvent);
  console.log('joined: ' + room);
  if(localStream){
    let addedEvent = new CustomEvent('streamAdded', { detail: 'local' });
    window.dispatchEvent(addedEvent);
  }
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});


////////////////////////////////////// ===== API =====

const getLocalStream = () => localStream;

const getRemoteStream = (id) => remoteStreams[id];

const onRoomJoined = (callback) => {
  window.addEventListener('roomjoined', callback);
  window.addEventListener('roomcreated', callback);
}
const removeOnRoomJoined = (callback) => {
    window.removeEventListener("roomjoined", callback);
    window.removeEventListener("roomcreated", callback);
}

const onRoomFull = (callback) => {
  window.addEventListener('roomfull', callback);
}
const removeOnRoomFull = (callback) => {
    window.removeEventListener("roomfull", callback);
}

const onStreamAdded = (callback) => {
  window.addEventListener('streamAdded', callback);
}
const removeOnStreamAdded = (callback) => {
  window.removeEventListener('streamAdded', callback);
}

const onStreamRemoved = (callback) => {
  window.addEventListener('streamRemoved', callback);
}
const removeOnStreamRemoved = (callback) => {
  window.removeEventListener('streamRemoved', callback);
}
const onStreamChanged = (callback) => {
  window.addEventListener('streamChanged', callback);
}
const removeOnStreamChanged = (callback) => {
  window.removeEventListener('streamChanged', callback);
}

const onScreenshareToggle = (callback) => {
  window.addEventListener('screenshareToggle', callback);
}
const removeOnScreenshareToggle = (callback) => {
  window.removeEventListener('screenshareToggle', callback);
}

const onStreamMuted = (callback) => {
    window.addEventListener('streamMuted', callback);
}
const removeOnStreamMuted = (callback) => {
    window.removeEventListener('streamMuted', callback);
}

const onStreamUnmuted = (callback) => {
    window.addEventListener('streamUnmuted', callback);
}
const removeOnStreamUnmuted = (callback) => {
    window.removeEventListener('streamUnmuted', callback);
}

// const onLocalStreamAdded = (callback) => {
//   window.addEventListener('localStreamAdded', callback);
// }

const onActiveChange = (callback) => {
  window.addEventListener('activeChange', callback);
}
const removeOnActiveChange = (callback) => {
  window.removeEventListener('activeChange', callback);
}

const muteVideo = () => {
  localStream.getVideoTracks()[0].enabled = false;
}
const unmuteVideo = () => {
  localStream.getVideoTracks()[0].enabled = true;
}
const muteAudio = () => {
  for (var i = 0; i <localStream.getAudioTracks().length; i++) {
    localStream.getAudioTracks()[i].enabled = false;
    muted = true;
    sendMessage('muted');
  }
}
const unmuteAudio = () => {
  for (var i = 0; i <localStream.getAudioTracks().length; i++) {
    localStream.getAudioTracks()[i].enabled = true;
    muted = false;
    sendMessage('unmuted');
  }
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
      let screenshareEvent = new CustomEvent('screenshareToggle');
      window.dispatchEvent(screenshareEvent);
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
}else if(msg === 'muted'){
    let mutedEvent = new CustomEvent('streamMuted', { detail: fromId });
    window.dispatchEvent(mutedEvent);
}else if(msg === 'unmuted'){
    let unmutedEvent = new CustomEvent('streamUnmuted', { detail: fromId });
    window.dispatchEvent(unmutedEvent);
}
else if ( msg && msg.type ){
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
        console.log(" got offer, sending answer", msg);
        pcs[fromId].setRemoteDescription(new RTCSessionDescription(msg));
        let bw = getBandwidth(msg.sdp);
        //dont be rude, send an answer
        //this gets our local session description, adds it to this PeerConnection, then sends it to the person who sent the offer as an answer
        doAnswer(fromId, bw);
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
          try {
              pcs[fromId].setRemoteDescription(new RTCSessionDescription(msg));
          } catch (e) {
            console.log("ERROR: ", e);
          }
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
  if(muted){
      sendMessage('muted', id);
  }
}

const handleRemoteStreamRemoved= (event, id) => {
  console.log('Remote stream removed. Event: ', event);
  delete remoteStreams[id];
  let removedEvent = new CustomEvent('streamRemoved', { detail: id });
  window.dispatchEvent(removedEvent);
}


const updateBandwidth = (bandwidth = 'auto') => {
    default_bandwidth = bandwidth;
  for (var id in pcs) {
    if (pcs.hasOwnProperty(id)) {
     updateConnection(id)
      // pcs[id].createOffer()
      // // .then((offer) => {
      // //   console.log("<<< bw:", default_bandwidth);
      // //   console.log("<<< offer:", offer);
      // //    // return setLocalAndSendMessage(offer, id);
      // //    updateConnection(id)
      // // }).catch((error) => {
      // //   console.log(error.message);
      // // })

    }
  }
}

const setMediaBitrates = (sdp, bw) => {
  if(!bw){
    return setMediaBitrate(sdp);
  }
  return setMediaBitrate(sdp, bw);
}

const getBandwidth = (sdp) => {
  var lines = sdp.split("\n");
  var ret = [];
  for (var i = 0; i < lines.length; i++) {
    if(lines[i].indexOf("b=AS:") > -1){
      ret.push(parseInt(lines[i].split(":")[1]));
    }
  }
  return ret;
}

const setMediaBitrate = (sdp, bandwidth) => {
  console.log("BANDWIDTH: " + bandwidth);
  var modifier = 'AS';
  var count = 0;
  var lines = sdp.split("\n");
  var add_audio = 0;
  var add_video = 0;
  for (var i = 0; i < lines.length; i++) {
    let line = lines[i];
    if(line.indexOf("m=audio") > -1){
      if(lines[i+2].indexOf("b=AS") > -1){
        lines[i+2] = "b=AS:"+bandwidth[0];
      }else{
        add_audio = i+2;
      }
    }
    if(line.indexOf("m=video") > -1){
      if(lines[i+2].indexOf("b=AS") > -1){
        lines[i+2] = "b=AS:"+bandwidth[1];
      }else{
        add_video = i+2;
      }
    }
  }
  if(add_audio > 0){
    lines.splice(add_audio, 0, "b=AS:"+bandwidth[0]);
  }
  if(add_video){
    lines.splice((add_audio > 0) ? (add_video + 1) : add_video, 0, "b=AS:"+bandwidth[1]);
  }

  return lines.join("\n");
}

const doCall = (id) => {
  console.log('Sending offer to peer', default_bandwidth);
  pcs[id].createOffer().then(
    (sd) => {return setLocalAndSendMessage(sd, id)},
    handleCreateOfferError);
}

const setLocalAndSendMessage = (sessionDescription, id, bw = (default_bandwidth === 'auto') ? [500, 4500] : [((default_bandwidth * 0.1) > 50) ? (default_bandwidth * 0.1) : 50, (default_bandwidth * 0.9)]) => {
  pcs[id].setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  sessionDescription.sdp = setMediaBitrates(sessionDescription.sdp, bw);
  sendMessage(sessionDescription, id);
}

const handleCreateOfferError = (event) => {
  console.log('createOffer() error: ', event);
}

const doAnswer = (id, bw) => {
  pcs[id].createAnswer()
  .then(
    (sd) => {
        console.log('Sending answer to peer.', bw);
      setLocalAndSendMessage(sd, id, bw);
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
    console.log("======================="+id+"============================")
    console.log(pcs[id]);
    console.log(pcs);
    console.log("===================================================")
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
  removeOnStreamAdded,
  onStreamRemoved,
  removeOnStreamRemoved,
  onStreamChanged,
  removeOnStreamChanged,
  onActiveChange,
  removeOnActiveChange,
  onScreenshareToggle,
  removeOnScreenshareToggle,
  onRoomJoined,
  removeOnRoomJoined,
  onRoomFull,
  removeOnRoomFull,
  onStreamMuted,
  removeOnStreamMuted,
  onStreamUnmuted,
  removeOnStreamUnmuted,
  getRemoteStream,
  muteVideo,
  unmuteVideo,
  muteAudio,
  unmuteAudio,
  screenshare,
  updateBandwidth,
  hangup
}

export {socketapi};
