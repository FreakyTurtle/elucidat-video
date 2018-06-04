import React from 'react';
import Theme from '../theme.js'

let styles = {};

export default class AppVideo extends React.Component {
    constructor(props) {
        super(props);
        this.refVideo = this.refVideo.bind(this);
        this.video;
        this.socketapi = window.socketapi
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        console.log("SCU")
        let ret = false;
        //possible props are: muted, thisKey, srcObject, volume, onclick and style, only style/onclick/thisKey should trigger re-render
        this.video.muted = nextProps.muted;
        this.video.srcObject = nextProps.srcObject;
        this.video.volume = nextProps.volume;
        nextProps.style !== this.props.style;
        if(nextProps.onclick !== this.props.onclick || nextProps.thisKey !== this.props.thisKey){
            ret = true;
        }
        return ret;
    }
    
    refVideo = (vid) => {
        if(!vid) return;
        
        vid.muted = this.props.muted;
        vid.volume = this.props.volume;
        vid.srcObject = this.props.srcObject;
        this.video = vid;
    }

    render() {
        return(
          <video
            autoPlay
            onClick={this.props.onclick}
            style={this.props.style}
            id={this.props.thisKey}
            key={this.props.thisKey}
            ref={this.refVideo}
           />
        )
    }
}
