import React, { Component } from 'react';
// import logo from './logo.svg';
import bg from './bg.jpg';
import './App.css';
import Theme from './theme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import Navigator from './components/Navigator';

// const electron = window.require('electron');

class App extends Component {

  render() {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme({...lightBaseTheme, ...Theme})}>
        <div className="App" style={{
          background: `url("${bg}") no-repeat left top`,
          backgroundSize: 'cover'
        }}>
          <Navigator />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
