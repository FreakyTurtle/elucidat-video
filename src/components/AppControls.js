import React from 'react';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import Theme from '../theme.js';
import {red500} from 'material-ui/styles/colors';

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
      this.state = {
        visible: true
      }
    }

    returnBtn = (text, classes, tooltipPosition, style = styles.icon, onclick = () => false) => {
        return (
            <IconButton tooltipPosition={tooltipPosition} iconStyle={style} onClick={onclick} style={styles.button} tooltip={text} >
              <FontIcon className={classes}  />
            </IconButton>
        );
    }

    cameraBtn = (streamingVideo, onclick) => {
        let text = "Hide"
        let classes = "fas fa-eye"
        let style = styles.icon;
        if(!streamingVideo){
            text = "Unhide";
            classes = "fas fa-eye-slash";
            style = styles.icoff;
        }

        return this.returnBtn(text, classes, "bottom-center", style, onclick);
    }

    micBtn = (streamingAudio, onclick) => {
        let text = "Mute Microphone";
        let classes = "fas fa-microphone-alt";
        let style = styles.icon;
        if(!streamingAudio){
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

    render() {
        return(
          <div
            style={this.props.style}
          >
            <div style={{...styles.icon, ...styles.button, "padding": 12, "fontFamily": Theme.fontFamily, minHeight: 48, boxSizing: 'border-box'}}>{this.props.room}</div>
            {this.hangupBtn(this.props.onHangup)}
            {this.cameraBtn(this.props.streamingVideo, this.props.onCameraClick)}
            {this.micBtn(this.props.streamingAudio, this.props.onMicClick)}
            {this.muteBtn(this.props.everyoneMuted, this.props.toggleMuteEveryone)}
            {this.zoomBtn(this.props.zoom, this.props.onToggleZoom)}
            {this.screenBtn(this.props.isScreenSharing, this.props.onScreenShareClick)}
          </div>
        )
    }
}
