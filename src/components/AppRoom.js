import React from 'react';
import {socketapi} from '../socketapi';
import Dialog from 'material-ui/Dialog';
import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import {CardText} from 'material-ui/Card';
import AppControls from './AppControls';
import * as Actions from '../actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AppVideoContainer from './AppVideoContainer';
import {red500} from 'material-ui/styles/colors';
import bell from '../bell.mp3';
const { desktopCapturer, ipcRenderer } = window.require('electron');

const styles = {
  panel: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems:'center',
    flexWrap: 'wrap-reverse',
    position: 'fixed',
    bottom: 0
  },
  input: {
    position: 'relative',
    left: 500
  },
  mainvideo: {
    position:'fixed',
    top:0,
    left:0,
    right:0,
    bottom:0,
    width:'100%',
    height: '100%',
    backgroundColor: 'black'
  },
  smallvideo: {
    maxWidth: '20%',
    objectFit: 'cover',
    zIndex: 2,
    overflow: 'hidden',
    minWidth: '12.5%'
  },
  controls: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems:'center',
    flexWrap: 'wrap',
    position: 'fixed',
    width:'100%',
    top: 0
},
dialog: {
    width: 400,
    textAlign: 'center',
    left: 'auto',
    right: 'auto'
}
};


///Container for all webcam view
// This should initiate the socketapi with the room passed down to it,  room state should be handled here but
// the video stream listeners should be on the video componenet level, (not the vidoe container)

class AppRoom extends React.Component {

  constructor(props) {
    super(props);
    this.returnVideo = this.returnVideo.bind(this);
    this.onRoomJoinedCallback = this.onRoomJoinedCallback.bind(this);
    this.onRoomFullCallback = this.onRoomFullCallback.bind(this);
    this.onStreamAddedCallback = this.onStreamAddedCallback.bind(this);
    this.onStreamRemovedCallback = this.onStreamRemovedCallback.bind(this);
    this.onActiveChangeCallback = this.onActiveChangeCallback.bind(this);
    this.onNewArrivalCallback = this.onNewArrivalCallback.bind(this);
    this.bell = new Audio(bell);
    this.bell.volume = 1;
    window.socketapi = socketapi;


    this.state = {
      roomState: 'joining',
    };

  }

  componentWillUnmount() {
      window.socketapi = undefined;
      this.props.action.removeAllStreams();
      socketapi.removeOnRoomJoined(this.onRoomJoinedCallback);
      socketapi.removeOnRoomFull(this.onRoomFullCallback);
      socketapi.removeOnStreamAdded(this.onStreamAddedCallback);
      socketapi.removeOnStreamRemoved(this.onStreamRemovedCallback);
      socketapi.removeOnActiveChange(this.onActiveChangeCallback);
      socketapi.removeOnNewArrival(this.onNewArrivalCallback);
  }

  /////////////////// SOCKETAPI CALLBACKS //////////////////////
  onRoomJoinedCallback = (event) => {
    this.setState({
          roomState: 'joined'
      });
  }
  onRoomFullCallback = (event) => {
      this.setState({
        roomState: 'full'
    });
  }
  onStreamAddedCallback = (event) => {
      console.log("=====Client stream added: ", event.detail);
      let id = event.detail;
      this.props.action.addStream(id);
  }
  onStreamRemovedCallback = (event) => {
      console.log("=====Client stream removed: ", event.detail);
      let id = event.detail;
      if(id === this.props.selectedStream){
        this.props.action.unSelected();
      }
      if(id === this.props.activeStream){
        this.props.action.changeActive("local");
      }
      this.props.action.removeStream(id);
  }

  onActiveChangeCallback = (event) => {
      console.log("======Active Stream change: ", event.detail);
      this.props.action.changeActive(event.detail);
  }

  onNewArrivalCallback = (event) => {
      this.bell.play();
  }

  ////////////////////////////

  componentDidMount() {
    //initiate the local feed and try to join the room
    socketapi.init(this.props.room, this.props.username);
    socketapi.onRoomJoined(this.onRoomJoinedCallback);
    socketapi.onRoomFull(this.onRoomFullCallback);
    socketapi.onStreamAdded(this.onStreamAddedCallback);
    socketapi.onStreamRemoved(this.onStreamRemovedCallback);
    socketapi.onActiveChange(this.onActiveChangeCallback);
    socketapi.onNewArrival(this.onNewArrivalCallback);
  }

  returnVideo = (streamId, index) => {
      return (
          <AppVideoContainer
              key={index}
              thisKey={this.props.streamIds[streamId]}
              />
      )
  }

  returnDialog = () => {
      const actions = [
      <FlatButton
        label="Go Back"
        primary={true}
        onClick={() => {
            socketapi.hangup().then(() => {
                console.log("hung up socket");
                ipcRenderer.send('hangup');
            });
        }}
      />
    ];
      if(this.state.roomState === 'joining'){
          return (
              <Dialog
                  title="Let's Get You Connected!"
                  modal={false}
                  open={true}
                  contentStyle={styles.dialog}
                >
                <CircularProgress size={60} thickness={7} />
                <CardText>Joining Room...</CardText>
                </Dialog>
          )
      }else if(this.state.roomState === 'full'){
          return (<Dialog
              title="Oh Dear!"
              modal={false}
              actions={actions}
              open={true}
              contentStyle ={styles.dialog}
            >
            <CardText>Sorry! That room is full at the moment!</CardText>

            </Dialog>)
      }else{
          return null;
      }
  }

  shouldComponentUpdate = (nextProps) => {
    if(nextProps.streamIds !== this.props.streamIds){
      return true;
    }
    return false;
  }

  render() {
    return (
      <div>
        <div style={styles.panel}>
          {Object.keys(this.props.streamIds).map(this.returnVideo)}
        </div>
        <AppControls
            style={styles.controls}
            room={this.props.room}
         />

         {this.returnDialog()}

      </div>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(AppRoom);
