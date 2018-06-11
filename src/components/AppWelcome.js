import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import AutoComplete from 'material-ui/AutoComplete';
import CircularProgress from 'material-ui/CircularProgress';
import LinearProgress from 'material-ui/LinearProgress';
import {CardText} from 'material-ui/Card';
import theme from '../theme';
import isElectron from 'is-electron';

import * as Actions from '../actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import logo from '../logo.png';


const { ipcRenderer } = window.require('electron');

const style = {
    fill: {
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontFamily: theme.fontFamily
    },
    container : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    top : {
        textAlign: 'center',
        margin: '30px'
    },
    middle : {
        width: '100%',
        height: '30%',
        textAlign: 'center'
    },
    info: {
      position: 'absolute',
      padding: 3,
      fontSize: '0.7em',
      bottom: 0,
      right: 0
    },
    hint: {
      textAlign: 'center'
    }
}


class AppWelcome extends React.Component {

  constructor(props) {
    super(props);
    this.onChangeInput = this.onChangeInput.bind(this);
    this.checkUpdates = this.checkUpdates.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.rooms = JSON.parse(localStorage.getItem("rooms"));
    this.state = {
      room: '',
      disabled: true,
      gettingUpdates: false,
      checkedUpdates: false,
      updatePerc: 0,
      dataSource: [],
    }

  }

    componentDidMount() {
        if (isElectron()) {
            ipcRenderer.send('ping');
            ipcRenderer.on('message', this.updateStatus);
            ipcRenderer.on('pong', this.updateStatus);
        }
    }

    updateStatus = (event, text) => {
        console.log("received msg: ", text);

        if(text.indexOf('download-progress') > -1){
            let perc = parseInt(text.split(':')[1], 10)
            this.setState({
                updatePerc: perc,
                checkedUpdates: true,
                gettingUpdates: true
            });
            return;
        }

        switch (text) {
            case 'error':
            case 'update-not-available':
                this.setState({
                    checkedUpdates: true,
                    gettingUpdates: false
                });
                break;
            case 'update-downloaded':
                this.setState({
                    checkedUpdates: true,
                    updatePerc: 100
                });
                break;
            case 'update-available':
                this.setState({
                    checkedUpdates: true,
                    gettingUpdates: true
                });
                break;
            default:
                return;

        }
    }

  onChangeInput = (newValue) => {
    let disabled = true;
    let dataSource = [];
    if(newValue){
      disabled = false;
      if(this.rooms){
        for (var i = 0; i < this.rooms.length; i++) {
          if(this.rooms[i].indexOf(newValue) > -1){
            dataSource.push(this.rooms[i]);
          }
        }
      }
    }
    this.setState({
      room: newValue,
      disabled,
      dataSource
    });
  }

  checkUpdates = (cu, gu) => {
      if(!cu){
          return (
              <div style={style.container}>
                <CircularProgress size={60} thickness={7} />
                <CardText>Checking available updates...</CardText>
              </div>
          )
      }else if(gu){
          return (
            <div>
                <LinearProgress style={{width:250}} mode="determinate" value={this.state.updatePerc} />
                <CardText style={{textAlign:'center'}}>Downloading updates...</CardText>
            </div>
          )
      }else{
          return (
              <div style={style.container}>
              <AutoComplete
                floatingLabelText="Join or Create Room"
                hintStyle={style.hint}
                onUpdateInput={this.onChangeInput}
                onNewRequest={this.handleSubmit}
                dataSource={this.state.dataSource}
              />
              <RaisedButton label="Let's Go!" disabled={this.state.disabled} primary={true} onClick={(event) => this.handleSubmit(this.state.room, 0)} />
            </div>
          )
      }
  }

  handleSubmit = (room = this.state.room, index) => {
    if(!this.state.disabled){
      if(!this.rooms){
        let newRooms = [room];
        console.log("SETTING NEW ROOMS", newRooms);
        localStorage.setItem("rooms", JSON.stringify(newRooms));
      }else if(this.rooms.indexOf(room) === -1){
        let newRooms = [...this.rooms, room];
        if(newRooms.length > 50){
          newRooms.shift();
        }
        localStorage.setItem("rooms", JSON.stringify(newRooms));
      }else{
        let newRooms = [...this.rooms];
        newRooms.push(newRooms.splice(newRooms.indexOf(room), 1)[0]);
        localStorage.setItem("rooms", JSON.stringify(newRooms));
      }
      this.props.action.gotoRoom(room);
    }
    return false;
  }

  render() {
    return (
      <form style={style.fill} onSubmit={(event) => this.handleSubmit(this.state.room, 0)}>
        <div>
          <img alt="logo" src={logo}/>
        </div>
        <div style={style.info}>{"version " + window.require('electron').remote.app.getVersion()}</div>
        <hr />
        {this.checkUpdates(this.state.checkedUpdates, this.state.gettingUpdates)}
      </form>
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

export default connect(mapStateToProps, mapDispatchToProps)(AppWelcome);
