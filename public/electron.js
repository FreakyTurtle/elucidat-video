const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;
const autoUpdater = require("electron-updater").autoUpdater;
const {ipcMain} = electron;

const path = require('path')
const url = require('url')
const fs = require('fs');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

let updateStatus = 'checking-for-update';

let browser_options = {
    width: 800,
    height: 450,
    'minHeight': 450,
    'minWidth': 800,
    webPreferences: {
      devTools: true
    }
}

const template = [
    {
        label: 'Tools',
        submenu: [
            {
                label: 'DevTools',
                click(item, focusedWindow){
                    focusedWindow.webContents.openDevTools()
                }
            }
        ]
    }
]

if(process.env.ELECTRON_START_URL){
    browser_options['webPreferences']['devTools'] = true;
}

const sendStatusToWindow = (txt) => {
    console.log("sending msg", txt)
    if(mainWindow){
        mainWindow.webContents.send('message', txt);
    }
}
ipcMain.on('ping', (event, arg) => {
    console.log("RECEiVED PING : ", updateStatus);
    event.sender.send('pong', updateStatus);
  })
ipcMain.on('hangup', (event, arg) => {
    if(mainWindow){
        mainWindow.reload();
    }
  })

function createWindow () {
  console.log('READY')
  // Create the browser window.
  mainWindow = new BrowserWindow(browser_options);

  const START_URL = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  })
  // and load the index.html of the app.
  mainWindow.loadURL(START_URL);
  // mainWindow.openDevTools()
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('ping', updateStatus);
        if(!process.env.ELECTRON_START_URL){
            autoUpdater.checkForUpdates();
        }
    })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
app.on('ready', () => {console.log('READY')})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})


///UPDATES
if(process.env.ELECTRON_START_URL){
    console.log("IN DEV");
    updateStatus = 'error';
    sendStatusToWindow('error');
}

autoUpdater.on('checking-for-update', () => {
    updateStatus = 'checking-for-update';
    console.log('checking-for-update')
    sendStatusToWindow('checking-for-update');
});
autoUpdater.on('update-available', () => {
    updateStatus = 'update-available';
    sendStatusToWindow('update-available');
});
autoUpdater.on('update-not-available', () => {
    updateStatus = 'update-not-available';
    sendStatusToWindow('update-not-available');
});
autoUpdater.on('error', (e) => {
    updateStatus ='error';
    sendStatusToWindow('error: ' + e.toString());
});
autoUpdater.on('download-progress', (progresObj) => {
    updateStatus ='update-available';
    sendStatusToWindow('download-progress:'+progresObj.percent);
});
autoUpdater.on('update-downloaded', () => {
    updateStatus = 'update-downloaded';
    sendStatusToWindow('update-downloaded');
    autoUpdater.quitAndInstall();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
