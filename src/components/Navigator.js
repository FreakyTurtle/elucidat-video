import React, { Component } from 'react';
import * as Actions from '../actions/navigate';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AppWelcome from './AppWelcome';
import AppWebcam from './AppWebcam';

const { ipcRenderer } = window.require('electron');

class Navigator extends Component {

    constructor(props){
        super(props);
        this.navigate = this.navigate.bind(this);
    }

    navigate = (nav) => {
      console.log("NAV:", nav)
      switch (nav.page) {
        case 'IN_ROOM':
          return <AppWebcam
            room={nav.room}
            onHangup={() => {
                console.log('DO IT')
                ipcRenderer.send('hangup');
                // this.props.action.gotoWelcome   ---- it should be this but ugh
            }}
           />
        case 'WELCOME':
          return <AppWelcome />
        default:
          return <AppWelcome />
      }
    }

    render(){
        return this.navigate(this.props.navigation);
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

export default connect(mapStateToProps, mapDispatchToProps)(Navigator);
