import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
// import registerServiceWorker from './registerServiceWorker';
import { Provider } from 'react-redux';
import Store from './store.js';

const store = Store();

const { ipcRenderer } = window.require('electron');
ipcRenderer.on('message', (event, text) => {console.log("====== "+ text)})
ipcRenderer.on('pong', (event, text) => {console.log("======PONG:  "+ text)})

ReactDOM.render(
  <Provider store={store}><App /></Provider>,
  document.getElementById('root')
);
// registerServiceWorker();
