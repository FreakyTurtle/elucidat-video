import React from 'react';
import Theme from '../theme.js';
import AppVideo from './AppVideo';

import * as Actions from '../actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

let styles = {
  borderSize: '0px'
};
let socketapi;

class AppVideoContainer extends React.Component {
    constructor(props) {
        super(props);
        this.returnVideo = this.returnVideo.bind(this);
        this.select = this.select.bind(this);
    }

    componentDidMount = () => {
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
