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
    window.socketapi = socketapi;


    this.state = {
      roomState: 'joining',
    };

  }
  
  componentWillUnmount() {
      window.socketapi = undefined;
  }

  componentDidMount() {
    //initiate the local feed and try to join the room
    socketapi.init(this.props.room);

    socketapi.onRoomJoined((event) => {
      this.setState({
        roomState: 'joined'
    });
    })

    socketapi.onRoomFull((event) => {
      this.setState({
        roomState: 'full'
      })
    })

    socketapi.onStreamAdded((event) => {
      console.log("=====Client stream added: ", event.detail);
      let id = event.detail;
      this.props.action.addStream(id);
    });

    socketapi.onStreamRemoved((event) => {
      console.log("=====Client stream removed: ", event.detail);
      let id = event.detail;
      if(id === this.props.selectedStream){
        this.props.action.unSelected();
      }
      if(id === this.props.activeStream){
        this.props.action.changeActive("local");
      }
      this.props.action.removeStream(id);
    });

    socketapi.onActiveChange((event) => {
      console.log("======Active Stream change: ", event.detail);
      this.props.action.changeActive(event.detail);
    })

      // desktopCapturer.getSources({types: ['window', 'screen'], thumbnailSize:{width:180, height:180}}, (error, sources) => {
      //     console.log("sources", sources);
      //   this.setState({
      //       sources
      //   });
      // });
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
