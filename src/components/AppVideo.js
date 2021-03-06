import React from 'react';
import Theme from '../theme.js';
import * as Actions from '../actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

let socketapi;

class AppVideo extends React.Component {
    constructor(props) {
        super(props);
        this.refVideo = this.refVideo.bind(this);
        this.returnVideo = this.returnVideo.bind(this);
        this.onScreenshareToggleCallback = this.onScreenshareToggleCallback.bind(this);
        this.onStreamChangedCallback = this.onStreamChangedCallback.bind(this);
        this.video;
        socketapi = window.socketapi;
    }
    //// Callbacks /////
    
    onScreenshareToggleCallback = (event) => {
        if(this.props.thisKey === 'local'){
          this.video.srcObject = socketapi.getLocalStream();
          if(this.video.classList.contains("screensharing")){
              this.video.classList.remove("screensharing");
          }else{
              this.video.classList.add("screensharing");
          }
        }
    }
    onStreamChangedCallback = (event) => {
        if (this.props.thisKey !== 'local' && this.props.thisKey !== "" && this.props.thisKey === event.detail){
          this.video.srcObject = socketapi.getRemoteStream(this.props.thisKey);
        }
    }
    
    //////
    
    componentWillUnmount = () => {
        socketapi.removeOnScreenshareToggle(this.onScreenshareToggleCallback);
        socketapi.removeOnStreamChanged(this.onStreamChangedCallback);
    }

    componentDidMount = () => {
      socketapi.onScreenshareToggle(this.onScreenshareToggleCallback);
      socketapi.onStreamChanged(this.onStreamChangedCallback);
    }

    shouldComponentUpdate(nextProps, nextState) {

        if(nextProps.thisKey !== this.props.thisKey){
          return true;
        }
        if(nextProps.muteAll !== this.props.muteAll){
          this.video.muted = nextProps.muteAll;
        }

        return false;
    }

    refVideo = (vid) => {
        if(!vid) return;
        let stream;

        if(this.props.thisKey === ""){
          return;
        }else if(this.props.thisKey === "local"){
          stream = socketapi.getLocalStream();
          vid.muted = true;
          vid.volume = 0;
          vid.srcObject = stream;
        }else{
          stream = socketapi.getRemoteStream(this.props.thisKey);
          vid.muted = this.props.muteAll;
          vid.volume = 1; //maybe replace this to boost the active speaker, maybe dont bother?
          vid.srcObject = stream;
        }
        this.video = vid;
    }

    returnVideo = () => {
      if(this.props.thisKey === ''){
        return null;
      }
      let classes = "";
      if(this.props.thisKey === 'local'){
          classes = "local";
      }
      if(this.props.screensharing){
          classes = classes + " screensharing";
      }
      return (
        <video
          autoPlay
          className={classes}
          onClick={this.props.onclick}
          id={this.props.thisKey}
          key={this.props.thisKey}
          ref={this.refVideo}
         />
      )
    }

    render() {
        return this.returnVideo();
    }
}

function mapStateToProps(state, prop){
    return {
        ...state
    };
}

function mapDispatchToProps(dispatch){
    return {
        action: bindActionCreators(Actions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AppVideo);
