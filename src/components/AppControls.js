import React from 'react';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import Theme from '../theme.js';
import {red500} from 'material-ui/styles/colors';
import SourcesDialog from './SourcesDialog';
import AppMessages from './AppMessages';
import notification from '../notification.mp3';

import * as Actions from '../actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

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
    },
    underline: {
      display: 'none'
    }
};

class AppControls extends React.Component {
    constructor(props) {
      super(props);
      this.cameraBtn = this.cameraBtn.bind(this);
      this.returnBtn = this.returnBtn.bind(this);
      this.micBtn = this.micBtn.bind(this);
      this.screenBtn = this.screenBtn.bind(this);
      this.newMessage =this.newMessage.bind(this);
      this.onDataReceivedCallback = this.onDataReceivedCallback.bind(this);
      socketapi = window.socketapi;
      this.notification = new Audio(notification);
      this.notification.volume = 1;
      this.state = {
        visible: true,
        dialogopen: false,
        sources: {},
        value: '2500',
        msgsOpen: false,
        unreadMsgs: false
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

    handleBandwidth = (event, index, value) => {
      socketapi.updateBandwidth(value);
      this.setState({value});
    };

    componentDidMount() {
      //initiate the local feed and try to join the room
      socketapi.onDataReceived(this.onDataReceivedCallback);
    }

    componentWillUnmount() {
        socketapi.removeOnDataReceived(this.onDataReceivedCallback);
    }

    onDataReceivedCallback = (event) => {
        console.log("====ON DATA RECEIVED CALLBACK====", event);
        if(!event.detail.data){
            return false;
        }

        let newMsg = JSON.parse(event.detail.data);
        if(newMsg.type === 'text'){
            this.notification.play();
            this.props.action.addMessage(newMsg);
        }
        if(!this.state.msgsOpen){
            this.setState({
                unreadMsgs: true
            });
        };
    }

    bandwidth = () => {
      return (
        <SelectField
          value={this.state.value}
          hintText="Bandwidth"
          onChange={this.handleBandwidth}
          style={{...styles.button, width: 120}}
          underlineStyle={styles.underline}
        >
          <MenuItem value={"100"} primaryText="100kbps" />
          <MenuItem value={"125"} primaryText="125kbps" />
          <MenuItem value={"250"} primaryText="250kbps" />
          <MenuItem value={"500"} primaryText="500kbps" />
          <MenuItem value={"1000"} primaryText="1000kbps" />
          <MenuItem value={"2500"} primaryText="2500kbps" />
          <MenuItem value={"auto"} primaryText="5000kbps" />
        </SelectField>
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


    msgBtn = (onclick) => {
        return this.returnBtn("Messages", "fas fa-comments", "bottom-center", this.state.unreadMsgs ? styles.icoff : styles.icon, onclick);
    }


    ///////// HANDLE THE CLICKS /////////

    toggleMessages = () => {
        let newM = !this.state.msgsOpen;
        this.setState({
            msgsOpen: newM,
            unreadMsgs: false
        });
    }

    newMessage = (msg) => {
        console.log("NEW MSG", msg);
        let m = {
            type: "text",
            timestamp: Date.now(),
            message: msg,
            from_id: socketapi.getLocalClientId()
        }
        socketapi.sendData(JSON.stringify(m));
        let ml = {
            ...m,
            from_id: 'local'
        }
        this.props.action.addMessage(ml);
    }


    //Hang up the call and leave the room
    onHangup = () => {
        console.log("===HANGING UP=====");
        // socketapi.hangup().then(() => {
            // console.log("hung up socket");
            // ipcRenderer.send('hangup');
            this.props.action.removeAllStreams();
            this.props.action.gotoWelcome();
            ipcRenderer.send('hangup');
        // });
    }

    //change redux state to signal the local video stream should be muted
    handleVideoMuting = () => {
        if(this.props.muteVideo){
            socketapi.unmuteVideo();
        }else{
            socketapi.muteVideo();
        }
        this.props.action.toggleMuteVideo();
    }

    onMicClick = () => {
        if(this.props.muteMic){
            socketapi.unmuteAudio();
        }else{
            socketapi.muteAudio();
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
            // We're already screensharing so let's stop now
            socketapi.screenshare(false, null)
                .then((stream) => {
                    this.props.action.toggleScreenshare();
                }).catch(error => {
                    console.log(error.message);
                })
        }else{
          //not currently screensharing, get available sources and show the dialog to select one
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
        console.log("SELECTED SOURCE", source);
        // source for screensharing has been selected so lets use that to start screensharing
        if(!this.props.screensharing){
            socketapi.screenshare(true, source);
            this.handleClose();
            this.props.action.toggleScreenshare();
        }
    }

    render() {
        return(
          <div
            style={this.props.style}
          >
            <div style={{...styles.icon, ...styles.button, "padding": 12, "fontFamily": Theme.fontFamily, minHeight: 48, boxSizing: 'border-box'}}>{this.props.room}</div>
            {this.hangupBtn(this.onHangup)}
            {this.bandwidth()}
            {this.cameraBtn(this.props.muteVideo, this.handleVideoMuting)}
            {this.micBtn(this.props.muteMic, this.onMicClick)}
            {this.muteBtn(this.props.muteAll, this.toggleMuteAll)}
            {this.zoomBtn(this.props.zoom, this.toggleZoom)}
            {this.msgBtn(this.toggleMessages)}
            {this.screenBtn(this.props.screensharing, this.onScreenShareClick)}

            {this.inputPicker}
            <SourcesDialog
                open={this.state.dialogopen}
                sources={this.state.sources}
                onSelection={this.selectedSource}
                onRequestClose={this.handleClose}
              />
              <AppMessages
                open={this.state.msgsOpen}
                msgs={this.props.messages}
                msgSubmit={this.newMessage}
                />
          </div>
        )
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

export default connect(mapStateToProps, mapDispatchToProps)(AppControls);
