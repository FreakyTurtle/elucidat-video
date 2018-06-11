import React, { Component } from 'react';
import * as Actions from '../actions/navigate';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AppWelcome from './AppWelcome';
import AppRoom from './AppRoom';

const { ipcRenderer } = window.require('electron');

class Navigator extends Component {

    constructor(props){
        super(props);
        this.navigate = this.navigate.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState){
      if(nextProps.navigation.room === this.props.navigation.room){
        return false;
      }
      return true;
    }

    navigate = (nav) => {
      console.log("NAV:", nav)
      switch (nav.page) {
        case 'IN_ROOM':
          return (<AppRoom
            room={nav.room}
           />)
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
        navigation: state.navigation
    };
}

function mapDispatchToProps(dispatch){
    return {
        action: bindActionCreators(Actions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Navigator);
