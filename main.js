var app = require('app');
var BrowserWindow = require('browser-window');

var mainWindow = null;

console.log('Starting app with io.js %s and Electron %s', process.version, process.versions.electron);

// enable Harmony ES6 features:
// app.commandLine.appendSwitch('js-flags', '--es_staging');

app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  mainWindow = new BrowserWindow({width: 800, height: 600});

  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  // mainWindow.openDevTools();

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
