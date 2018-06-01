import React from 'react';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';

let styles = {
    button: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    color: "#ffffff"
};

export default class SourcesDialog extends React.Component {
    constructor(props) {
      super(props);
      this.cameraBtn = this.cameraBtn.bind(this);
      this.returnBtn = this.returnBtn.bind(this);
      this.micBtn = this.micBtn.bind(this);
      this.screenBtn = this.screenBtn.bind(this);
    }

    returnBtn = (text, classes, tooltipPosition, onclick = () => false) => {
        return (
            <IconButton tooltipPosition={tooltipPosition} onClick={onclick} style={styles.button} tooltip={text} >
              <FontIcon color={styles.color} className={classes} />
            </IconButton>
        );
    }

    cameraBtn = (streamingVideo, onclick) => {
        let text = "Hide"
        let classes = "fas fa-eye"
        if(!streamingVideo){
            text = "Unhide";
            classes = "fas fa-eye-slash";
        }

        return this.returnBtn(text, classes, "bottom-center", onclick);
    }

    micBtn = (streamingAudio, onclick) => {
        let text = "Mute Microphone";
        let classes = "fas fa-microphone-alt";
        if(!streamingAudio){
            text = "Unmute Microphone";
            classes = "fas fa-microphone-alt-slash";
        }

        return this.returnBtn(text, classes, "bottom-center", onclick);
    }

    screenBtn = (streamingScreen, onclick) => {
        let text = "Share Screen";
        let classes = "fas fa-desktop";
        if(streamingScreen){
            text = "Switch to Camera";
            classes = "fas fa-video";
        }

        return this.returnBtn(text, classes, "bottom-left", onclick);
    }

    zoomBtn = (zoom, onclick) => {
      switch (zoom) {
        case 'contain':
          return this.returnBtn("Expand To Fill Screen", "fas fa-expand", "bottom-center", onclick);
        case 'cover':
          return this.returnBtn("Compress (Prevents Cropping)", "fas fa-compress", "bottom-center", onclick);
        default:

      }
    }
    muteBtn = (everyoneMuted, onclick) => {
      return everyoneMuted ? this.returnBtn("Unmute Everyone", "fas fa-volume-off", "bottom-center", onclick) : this.returnBtn("Mute Everyone", "fas fa-volume-up", "bottom-center", onclick)

    }
    hangupBtn = (onclick) => {
      return this.returnBtn("Hangup", "fas fa-phone-slash", "bottom-center", onclick)
    }

    render() {
        return(
          <div
            style={this.props.style}
          >
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
