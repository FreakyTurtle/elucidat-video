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
        if(this.props.checkedUpdates){
            return;
        }
        if(text.indexOf('download-progress') > -1){
            let perc = parseInt(text.split(':')[1], 10)
            this.setState({
                updatePerc: perc
            });
            return;
        }

        switch (text) {
            case 'error':
            case 'update-not-available':
                this.props.action.checkedUpdates();
                this.setState({
                    gettingUpdates: false
                });
                break;
            case 'update-downloaded':
                this.setState({
                    updatePerc: 100
                });
                break;
            case 'update-available':
                this.setState({
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
                <CardText>Checking for updates...</CardText>
              </div>
          )
      }else if(gu){
          return (
              <div style={style.container}>
                <LinearProgress mode="determinate" value={this.state.updatePerc} />
              </div>
          )
      }else{
          return (
              <div style={style.container}>
              <AutoComplete
                floatingLabelText="Join or Create Room"
                hintStyle={style.hint}
                onUpdateInput={this.onChangeInput}
                dataSource={this.state.dataSource}
              />
              <RaisedButton label="Let's Go!" disabled={this.state.disabled} primary={true} onClick={this.handleSubmit} />
            </div>
          )
      }
  }

  handleSubmit = () => {
    if(!this.state.disabled){
      if(!this.rooms){
        let newRooms = [this.state.room];
        console.log("SETTING NEW ROOMS", newRooms);
        localStorage.setItem("rooms", JSON.stringify(newRooms));
      }else if(this.rooms.indexOf(this.state.room) === -1){
        let newRooms = [...this.rooms, this.state.room];
        if(newRooms.length > 50){
          newRooms.shift();
        }
        localStorage.setItem("rooms", JSON.stringify(newRooms));
      }else{
        let newRooms = [...this.rooms];
        newRooms.push(newRooms.splice(newRooms.indexOf(this.state.room), 1)[0]);
        localStorage.setItem("rooms", JSON.stringify(newRooms));
      }
      this.props.action.gotoRoom(this.state.room);
    }
    return false;
  }
  // handleChange = (event, index, value) => this.setState({value});

  render() {
    return (
      <form style={style.fill} onSubmit={this.handleSubmit}>
        <div>
          <img alt="logo" src={logo}/>
        </div>
        <div style={style.info}>{"version " + window.require('electron').remote.app.getVersion()}</div>
        <hr />
        {this.checkUpdates(this.props.checkedUpdates, this.state.gettingUpdates)}
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
