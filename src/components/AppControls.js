import React from 'react';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import Theme from '../theme.js';
import {red500} from 'material-ui/styles/colors';

const { desktopCapturer, ipcRenderer } = window.require('electron');
let socketapi;

let styles = {
    button: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    icon: {
      fontSize: 18,
      color: "#ffffff"
    },
    icoff: {
      fontSize: 18,
      color: red500
    }
};

export default class AppControls extends React.Component {
    constructor(props) {
      super(props);
      this.cameraBtn = this.cameraBtn.bind(this);
      this.returnBtn = this.returnBtn.bind(this);
      this.micBtn = this.micBtn.bind(this);
      this.screenBtn = this.screenBtn.bind(this);
      socketapi = window.socketapi;
      this.state = {
        visible: true,
        dialogopen: false,
        sources: {}
      }
    }

    ///////// RENDER THE BUTTONS /////////////////

    returnBtn = (text, classes, tooltipPosition, style = styles.icon, onclick = () => false) => {
        return (
            <IconButton tooltipPosition={tooltipPosition} iconStyle={style} onClick={onclick} style={styles.button} tooltip={text} >
              <FontIcon className={classes}  />
            </IconButton>
        );
    }

    cameraBtn = (mutedVideo, onclick) => {
        let text = "Hide"
        let classes = "fas fa-eye"
        let style = styles.icon;
        if(mutedVideo){
            text = "Unhide";
            classes = "fas fa-eye-slash";
            style = styles.icoff;
        }

        return this.returnBtn(text, classes, "bottom-center", style, onclick);
    }

    micBtn = (mutedAudio, onclick) => {
        let text = "Mute Microphone";
        let classes = "fas fa-microphone-alt";
        let style = styles.icon;
        if(mutedAudio){
            text = "Unmute Microphone";
            classes = "fas fa-microphone-alt-slash";
            style = styles.icoff;
        }

        return this.returnBtn(text, classes, "bottom-center", style, onclick);
    }

    screenBtn = (streamingScreen, onclick) => {
        let text = "Share Screen";
        let classes = "fas fa-desktop";
        let style = styles.icon;
        if(streamingScreen){
            text = "Switch to Camera";
            classes = "fas fa-video";
            style = styles.icoff;
        }

        return this.returnBtn(text, classes, "bottom-left", style, onclick);
    }

    zoomBtn = (zoom, onclick) => {
      switch (zoom) {
        case 'contain':
          return this.returnBtn("Expand To Fill Screen", "fas fa-expand", "bottom-center", styles.icon, onclick);
        case 'cover':
          return this.returnBtn("Compress (Prevents Cropping)", "fas fa-compress", "bottom-center", styles.icon, onclick);
        default:

      }
    }
    muteBtn = (everyoneMuted, onclick) => {
      return everyoneMuted ? this.returnBtn("Unmute Everyone", "fas fa-volume-off", "bottom-center", styles.icoff, onclick) : this.returnBtn("Mute Everyone", "fas fa-volume-up", "bottom-center", styles.icon, onclick)

    }
    hangupBtn = (onclick) => {
      return this.returnBtn("Hangup", "fas fa-phone-slash", "bottom-center", styles.icoff, onclick)
    }
    
    
    ///////// HANDLE THE CLICKS /////////
    
    
    //Hang up the call and leave the room
    onHangup = () => {
        socketapi.hangup().then(() => {
            console.log("hung up socket");
            ipcRenderer.send('hangup');
        });
    }
    
    //change redux state to signal the local video stream should be muted
    handleVideoMuting = () => {
        if(this.props.mutedVideo){
            socketapi.unmuteVideo();
        }else{
            socketapi.muteVideo();
        }
        this.props.action.toggleMuteVideo();
    }
    
    onMicClick = () => {
        if(this.props.mutedMic){
            socketapi.unmuteMic();
        }else{
            socketapi.muteMic();
        }
        this.props.action.toggleMuteMic();
    }
    
    toggleMuteAll = () => {
        this.props.action.toggleMuteAll();
    }
    
    toggleZoom = () => {
        this.props.action.toggleZoom();
    }
    
    onScreenShareClick = () => { 
        if(this.props.screensharing){
            socketapi.screenshare(false, null)
                .then((stream) => {
                    this.props.action.toggleScreenshare();
                }).catch(error => {
                    console.log(error.message);
                })
        }else{
            desktopCapturer.getSources({
                types: ['window', 'screen'],
                thumbnailSize:{width:180, height:180}
            }, (error, sources) => {
                this.setState({
                   sources,
                   dialogopen: true
                });
            })
        }
    }
    
    handleOpen = () => {
      this.setState({dialogopen: true});
    };

    handleClose = () => {
      this.setState({dialogopen: false});
    };
    
    selectedSource = (source) => {
        // set the source - redux?
        if(this.props.screensharing){
            socketapi.screenshare(true, source)
        }
        socketapi.screenshare(true, source)
    }

    render() {
        return(
          <div
            style={this.props.style}
          >
            <div style={{...styles.icon, ...styles.button, "padding": 12, "fontFamily": Theme.fontFamily, minHeight: 48, boxSizing: 'border-box'}}>{this.props.room}</div>
            {this.hangupBtn(this.onHangup)}
            {this.cameraBtn(this.props.mutedVideo, this.handleVideoMuting)}
            {this.micBtn(this.props.mutedMic, this.onMicClick)}
            {this.muteBtn(this.props.mutedAll, this.toggleMuteAll)}
            {this.zoomBtn(this.props.zoom, this.onToggleZoom)}
            {this.screenBtn(this.props.screensharing, this.onScreenShareClick)}
            
            {this.inputPicker}
            <SourcesDialog
                open={this.state.dialogopen}
                sources={this.state.sources}
                onSelection={this.selectedSource}
                onRequestClose={this.handleClose}
              />
          </div>
        )
    }
}
