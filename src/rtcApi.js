let remoteStreams = {};
let localStream;

let defaultVideoConstraints = {
  optional: [
    {minWidth: 320},
    {minWidth: 640},
    {minWidth: 1024},
    {minWidth: 1280}
    // {minWidth: 1920},
    // {minWidth: 2560},
  ]
};
let defaultAudioConstraints = true;

var defaultServers = {
  'iceServers': [{
    'urls': ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
  }]
};

let defaultAudioConstraints = true;

export const getMedia = (video = defaultVideoConstraints, audio = defaultAudioConstraints) => {
  let constraints = {
    video,
    audio
};
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia(constraints).then((stream)=> {
      resolve(stream);
    });
  }
}

export class Bond {
    constructor(localMedia, id, sendMsgFunction, callbacks = {}, servers = defaultServers){
        this.localStream = localMedia;
        this.remoteStream;
        this.id = id;
        this.callbacks = callbacks;
        this.sendMessage = sendMsgFunction;
        this.pc = new RTCPeerConnection(servers);
        this.pc.onicecandidate = this.handleIceCandidate;
        this.pc.onaddstream = handleRemoteStreamAdded;
        this.pc.onremovestream = handleRemoteStreamRemoved;
        this.pc.addStream(this.localStream);
        this.createAndSendOffer(sendMsgFunction, offerOptions);
    }

    set localStream(ls){
        this.localStream = ls;
    }

    get localMedia(){
        return this.localStream;
    }

    createAndSendOffer(offerOptions){
        this.pc.createOffer(offerOptions)
        .then((createdOffer) => {
            this.pc.setLocalDescription(createdOffer);
            this.sendMessage(createdOffer, this.id);
        }).catch((error) => {
            trace('Failed to create session description: ' + error.toString());
        });
    }

    receivedOffer(msg){
        this.pc.setRemoteDescription(new RTCSessionDescription(msg));
        this.createAndSendAnswer();
    }

    createAndSendAnswer(){
        this.pc.createAnswer()
        .then((createdAnswer) => {
            this.pc.setLocalDescription(createdAnswer);
            this.sendMessage(createdOffer, this.id);
        }).catch((error) => {
            trace('Failed to create session description: ' + error.toString());
        });
    }

    receivedAnswer(msg){
        this.pc.setRemoteDescription(new RTCSessionDescription(msg));
    }

    handleIceCandidate(event){
        //so a network candidate became available
        const peerConnection = event.target;
        const iceCandidate = event.candidate;
        if(iceCandidate){
            console.log('icecandidate event: ', event);
            if (event.candidate) {
              this.sendMessage({
                type: 'candidate',
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            }, this.id);
            } else {
              console.log('End of candidates.');
            }
        }
    }

    get getRemoteStream(){
        return this.remoteStream;
    }

    handleRemoteStreamAdded(event){
        this.remoteStream = event;
        if(this.callbacks.remoteStreamAdded)
        this.callbacks.remoteStreamAdded(this.remoteStream, this.id);
    }
    handleRemoteStreamRemoved(event){
        this.remoteStream = null;
    }
    hangup(){
        this.pc.close();
        this.pc = null;
        this.sendMessage('bye', this.id);
    }
    handleRemoteHangup(){
        this.pc.close();
        this.pc = null;
    }

}
