const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
// const globalShortcut = electron.globalShortcut;

console.log('Starting electron app');
console.log(`  node=${process.versions.node}`);
console.log(`  chrome=${process.versions.chrome}`);
console.log(`  electron=${process.versions.electron}`);

let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', () => {
  createWindow();

  // const selectElement_accelerator = process.platform === 'darwin' ? 'Cmd+Alt+C' : 'Ctrl+Shift+C';
  // globalShortcut.register(selectElement_accelerator, () => {
  //   console.log('selectElement triggered');
  // });
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // re-create a window in the app when the dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
