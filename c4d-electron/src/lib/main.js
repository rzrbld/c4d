const { app, BrowserWindow, Menu, MenuItem, dialog  } = require('electron')
const windowStateKeeper = require('electron-window-state');
var ipcMain = require('electron').ipcMain;
const path = require('path');
const menu = new Menu();


function createWindow () {

  const mainWindowStateKeeper = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 600
  });

  const win = new BrowserWindow({
    title: 'Example editor',
    icon: path.join(__dirname, "../icons/c4d.png"),
    x: mainWindowStateKeeper.x,
    y: mainWindowStateKeeper.y,
    width: mainWindowStateKeeper.width,
    height: mainWindowStateKeeper.height,
    backgroundColor: '#1e1e1e',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })
  mainWindowStateKeeper.manage(win);

  win.loadFile('index.html')

  // dev only
  // win.webContents.openDevTools()

  win.webContents.on('did-finish-load', function() {
    win.show();
    win.webContents.send('key', {'cmd': 'ready'});
  });

  // Emitted when the window is closed.
  // win.on('closed', () => {
  //   // Dereference the window object, usually you would store windows
  //   // in an array if your app supports multi windows, this is the time
  //   // when you should delete the corresponding element.
  //   win = null;
  // });
  createMenu(win);
  initShortcuts(win);
  eventListners(win);
}


function eventListners(win){
  ipcMain.on('open-folder-dialog', (event, arg) => {
      openFolderDialog(win);
  });

  ipcMain.on('open-save-as-dialog', (event, arg) => {
      openSaveAsDialog(win);
  });
}

function openFolderDialog(win){
  var dir = dialog.showOpenDialog(win, {
      properties: ['openDirectory']
  }).then((dir) => {
    console.log("OPEN DIR>>>",dir);
    if(dir.canceled == false){
      win.webContents.send('key', {'cmd': 'dir-open','dir': dir});
    }
  })
}

function openSaveAsDialog(win){
  var dir = dialog.showSaveDialog(win).then((dir) => {
    console.log("save DIR>>>",dir);
    if(dir.canceled == false){
      win.webContents.send('key', {'cmd': 'file-save-as','dir': dir});
    }
  })
}

function createMenu(win){
  menu.append(new MenuItem({
    label: 'C4D',
    submenu: [
      {
        role: 'about',
      },
      {
        role: 'quit'
      }]
  }))

  menu.append(new MenuItem({
    label: 'File',
    submenu: [
      {
        role: 'close',
      },
      {
        role: 'help',
        label: "Clear",
        accelerator: process.platform === 'darwin' ? 'Cmd+N' : 'Ctrl+N',
        click: () => {
          win.webContents.send('key', {'cmd': 'clear'});
        }
      },
      {
        role: 'help',
        label: "Open Project Directory",
        accelerator: process.platform === 'darwin' ? 'Cmd+O' : 'Ctrl+O',
        click: () => {
          openFolderDialog(win);
        }
      },
      {
        role: 'help',
        label: "Save File",
        accelerator: process.platform === 'darwin' ? 'Cmd+S' : 'Ctrl+S',
        click: () => {
          win.webContents.send('key', {'cmd': 'file-save'});
        }
      },
      {
        role: 'help',
        label: "Save File As",
        accelerator: process.platform === 'darwin' ? 'Cmd+Shift+S' : 'Ctrl+Shift+S',
        click: () => {
          openSaveAsDialog(win)
        }
      },
      {
        role: 'help',
        label: "Set Working Directory",
        accelerator: process.platform === 'darwin' ? 'Cmd+,' : 'Alt+,',
        click: () => {
          var dir = dialog.showOpenDialog(win, {

              properties: ['openDirectory']
      
          }).then((dir) => {
            console.log("OPEN DIR>>>",dir);
            if(dir.canceled == false){
              win.webContents.send('key', {'cmd': 'select-working-dir','dir': dir});
            }
          })
        }
      }
      ]
  }))

  menu.append(new MenuItem({
    label: 'Options',
    submenu: [
      {
        role: 'help',
        label: "Edit Preferences",
        accelerator: process.platform === 'darwin' ? 'Shift+Cmd+P' : 'Shift+Alt+P',
        click: () => {
          win.webContents.send('key', {'cmd': 'edit-prefs'});
        }
      }
      ]
  }))

  Menu.setApplicationMenu(menu);
}

function initShortcuts(win){
  win.webContents.on('before-input-event', (event, input) => {
    if ( input.key == 'Escape') {
      win.webContents.send('key', {'cmd': 'hide-input'})
      event.preventDefault()
    }
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('will-quit', () => {
  console.log("Bye!");
})

app.whenReady().then(createWindow)
