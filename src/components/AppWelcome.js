import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
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
    this.state = {
      room: '',
      disabled: true,
      gettingUpdates: false,
      updatePerc: 0
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

  onChangeInput = (event, newValue) => {
    let disabled = true;
    if(newValue){
      disabled = false;
    }
    this.setState({
      room: newValue,
      disabled
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
              <TextField
                floatingLabelText="Join or Create Room"
                hintStyle={style.hint}
                onChange={this.onChangeInput}
              />
              <RaisedButton label="Let's Go!" disabled={this.state.disabled} primary={true} onClick={() => this.props.action.gotoRoom(this.state.room)} />
            </div>
          )
      }
  }
  // handleChange = (event, index, value) => this.setState({value});

  render() {
    return (
      <form style={style.fill}>
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
