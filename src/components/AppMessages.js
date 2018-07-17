import React from 'react';
import Theme from '../theme.js';
import Drawer from 'material-ui/Drawer';
import TextField from 'material-ui/TextField';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem';
import Avatar from 'material-ui/Avatar';

let style = {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: "#ffffff"
}


export default class SourcesDialog extends React.Component {
    constructor(props) {
      super(props);
      this.returnMsg = this.returnMsg.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.state = {
          msg: ''
      }
    }

    returnMsg = (obj, i) => {
        let username = window.socketapi.usernameLookup(obj.from_id);
        let s = {
            maxWidth: "100%"
        }
        if(obj.from_id === 'local'){
            return (
                <ListItem
                    key={i}
                    style={s}
                  disabled={true}
                  leftAvatar={
                      <Avatar
                        size={30}
                      >
                      {username.charAt(0).toUpperCase()}
                      </Avatar>}
                >
                    <div style={{whiteSpace:"pre-wrap", wordWrap: "break-word"}}>{obj.message}</div>
                </ListItem>
            )
        }
        return (
            <ListItem
                key={i}
                style={s}
              disabled={true}
              rightAvatar={
                  <Avatar
                    size={30}
                  >
                  {username.charAt(0).toUpperCase()}
                  </Avatar>}
            >
                <div style={{whiteSpace:"pre-wrap", wordWrap: "break-word"}}>{obj.message}</div>
            </ListItem>
        )
    }

    handleSubmit = (e) =>{
        // this.props.msgSubmit(this.state.msg);
        this.props.msgSubmit(this.state.msg);
        this.setState({
            msg: ''
        });
        if(e){
            e.preventDefault();
        }
        return false;
    }

    render() {
        return(
            <Drawer containerStyle={{
                ...style
            }} open={this.props.open}>
            <form
                style={{
                    position: "absolute",
                    bottom: 0
                }}
             onSubmit={this.handleSubmit}>
            <TextField
                style={style}
              onChange={(event, newValue) => {
                  this.setState({
                      msg: newValue
                  });
              }}
              value={this.state.msg}
              onKeyUp={(e)=> {
                  if(e.keyCode === 13 && !e.shiftKey){
                      e.preventDefault();
                      //Enter key press but not shift
                      this.handleSubmit();
                      return false;
                  }

              }}
              multiLine={true}
              hintText="Type your message here"
              hintStyle={{color:'rgba(255, 255, 255, 0.5)'}}
            />
            </form>


              <List style={{
                  ...style,
                  display: "flex",
                  overflow: "scroll",
                  flexDirection: "column-reverse",
                  position: "absolute",
                  top: 0,
                  bottom: 48,
                  left: 0,
                  right: 0
              }}>
              {this.props.msgs.map(this.returnMsg)}
              </List>


            </Drawer>
        )
    }
}
