import React from 'react';
import Theme from '../theme.js';
import AppVideo from './AppVideo';
import {red500} from 'material-ui/styles/colors';

import * as Actions from '../actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';

let socketapi;

let styles = {
  borderSize: '0px'
};

let iconStyles = {
    position: 'absolute',
    top: 0,
    left: 0,
    color: red500,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '3px',
    fontSize: '18px'
}

class AppVideoContainer extends React.Component {
    constructor(props) {
        super(props);
        this.returnVideo = this.returnVideo.bind(this);
        this.select = this.select.bind(this);
        this.onStreamMutedCallback = this.onStreamMutedCallback.bind(this);
        this.onStreamUnmutedCallback = this.onStreamUnmutedCallback.bind(this);
        socketapi = window.socketapi;
        this.state = {
            muted: false
        }
    }
    
    componentDidMount(){
        socketapi.onStreamMuted(this.onStreamMutedCallback);
        socketapi.onStreamUnmuted(this.onStreamUnmutedCallback);
    }
    
    componentWillUnmount(){
        socketapi.removeOnStreamMuted(this.onStreamMutedCallback);
        socketapi.removeOnStreamUnmuted(this.onStreamUnmutedCallback);
        this.setState({
            muted: false
        });
    }
    
    onStreamMutedCallback = (event) => {
        if(event.detail === this.props.thisKey){
            this.setState({
                muted: true
            });
        }
    }
    onStreamUnmutedCallback = (event) => {
        if(event.detail === this.props.thisKey){
            this.setState({
                muted: false
            });
        }
    }
    

    shouldComponentUpdate = (nextProps, nextState) => {
        return true;
    }

    select = () => {
      if(!this.props.selectedStream || this.props.selectedStream !== this.props.thisKey){
        this.props.action.changeSelected(this.props.thisKey);
      }else if(this.props.selectedStream && this.props.selectedStream === this.props.thisKey){
        this.props.action.unSelected();
      }
    }
    
    returnIcon = () => {
        if(this.state.muted){
            return (
                <FontIcon
                  className="fas fa-microphone-alt-slash"
                  style={iconStyles}
                />
            )
        }
    }

    returnVideo = () => {
      if(this.props.thisKey === ''){
        return null;
      }
      let classes = "videoContainer";
      console.log("ACTIVE: " + this.props.activeStream);
      console.log("THIS: " + this.props.thisKey);

      ///replace these with styles
      if(this.props.selectedStream && this.props.thisKey === this.props.selectedStream){
        styles = {
          borderSize: '2px',
          borderStyle: 'solid',
          borderColor: Theme.palette.primary1Color
        };
      }else{
        styles = {
          border: 'none'
        }
      }
      ///
      if(this.props.thisKey){
        if(
          (!this.props.selectedStream && this.props.activeStream === this.props.thisKey) ||
          (this.props.selectedStream === this.props.thisKey)
        ){
          classes += ' focus';
        }
      }

      if(this.props.zoom === 'contain'){
        classes += ' contain';
      }


      return (
        <div style={styles} className={classes} onClick={this.select}>
          <AppVideo
            style={{}}
            id={"VIDEO:"+this.props.thisKey}
            thisKey={this.props.thisKey}
           />
           {this.returnIcon()}
        </div>
      )
    }

    render() {
        return this.returnVideo();
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

export default connect(mapStateToProps, mapDispatchToProps)(AppVideoContainer);
