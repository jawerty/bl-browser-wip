const { app } = require('electron');
const path = require('path')
// const fileUrl = require('file-url');
const BrowserLikeWindow = require('./vendor/electron-as-browser');
const QueryUIView = require('./renderer/query-ui/query-ui-view');

const EventHub = require('./lib/event-hub');
let browser;
let queryUIView = new QueryUIView(); 

function createWindow() {
  return new Promise((resolve) => {
    browser = new BrowserLikeWindow({
      controlHeight: 99,
      controlPanel: `file://${__dirname}/renderer/control/control.html`,
      startPage: 'https://news.ycombinator.com',
      blankTitle: 'New tab',
      debug: true, // will open controlPanel's devtools,
      controlReferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
        
      },
      viewReferences: {
        preload: path.join(__dirname, 'preload.js'),
        sandbox: false
      }
    });

    browser.on('closed', () => {
      browser = null;
    });
    resolve()
  })  
}



app.on('ready', async () => {
  await createWindow();

  // Handle window resizing (fix)
  let refreshQueryUIOnResize;
  
  browser.win.on('resize', function () {
    clearInterval(refreshQueryUIOnResize)
    refreshQueryUIOnResize = setInterval(() => {
      queryUIView.refreshView()
      clearInterval(refreshQueryUIOnResize)
    }, 100)

    queryUIView.setQueryUIBounds(true)
  });

  queryUIView.setup(browser, browser.win, (view) => {
    const eventHub = new EventHub(browser, view)
    eventHub.init()    
  })


  
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (browser === null) {
    createWindow();
  }
});