const { BrowserView, ipcMain, ipcRenderer } = require('electron');

class QueryUIView {
	constructor() {
		this.isOpen = false
		this.browser = null
		this.browserView = null
		this.view = null
		this.browserWindow = null
		this.queryUIWidth = 400
	}

	setup(browser, browserWindow, cb) {
		this.browser = browser
		browser.on('control-ready', (newBrowser) => {
			this.browserView = newBrowser
			this.browserWindow = browserWindow
			this.view = new BrowserView({
		      webPreferences: {
		        nodeIntegration: true,
		        contextIsolation: false,
		        // Allow loadURL with file path in dev environment
		        webSecurity: false
		      }
		    });
		    
			ipcMain.on('toggle-query-ui', (e, id) => {
			    this.toggle(id)
			})

			this.browser.addUrlChangeCallback(() => {
				console.log("url change callback")
				this.refreshView()
			})

			cb(this.view)
		});
		
	}

	setQueryUIBounds(resize) {
		let x;
		if (resize) {
			x = this.browserWindow.getBounds().width - this.queryUIWidth
		} else {
			x = this.browserView.getBounds().width -  this.queryUIWidth
		}
		this.view.setBounds({
	      x,
	      y: this.browserView.getBounds().y,
	      width: this.queryUIWidth,
	      height: this.browserView.getBounds().height
	    });
	}

	viewSetup(newBrowser) {
		if (newBrowser) {
			this.browserView = newBrowser;
		}
		this.setQueryUIBounds(false)
	    this.view.webContents.loadURL(`file://${__dirname}/query-ui.html`);
  		this.view.webContents.openDevTools({ mode: 'detach' });
	}

	createQueryUI(id) {
		this.browserWindow.addBrowserView(this.view)
		this.viewSetup()

		this.browser.setContentBounds(this.isOpen, this.queryUIWidth)
		this.isOpen = true
	}

	destroyQueryUI(id) {
		this.browser.setContentBounds(this.isOpen, this.queryUIWidth)
		this.browserWindow.removeBrowserView(this.view)
		this.isOpen = false
	}

	refreshView() {
		if (this.isOpen) {
			this.destroyQueryUI()
			this.createQueryUI()
		} else {
			this.createQueryUI()
			this.destroyQueryUI()
		}
		
	}

	toggle(id) {
		if (this.isOpen) {
	    	this.destroyQueryUI(id)
	    } else {
	    	this.createQueryUI(id)
	    }
	}
}

module.exports = QueryUIView;