const { ipcMain } = require('electron')
class EventHub {
	constructor(browserView, queryUIView) {
		// in memory store for cross view comms (change this)
		this.browserView = browserView
		this.queryUIView = queryUIView
		this.revealQueue = []
	}

	init() {
		
		ipcMain.on('initiate-search', (e, info) => {
			const { queryType, searchText, linkURL, deepSearch } = info;
			console.log("Got search", queryType, searchText, linkURL, deepSearch)
			if (queryType === 'raw') {
				this.browserView.currentView.webContents.send('raw-search', { searchText, linkURL, deepSearch });
					
				// get data to build ranked card (auto scroll to area and highlight HTML)
			} else if (queryType === 'qa') {
				this.browserView.currentView.webContents.send('qa-search', { searchText, linkURL, deepSearch });
			}
		});
		ipcMain.on('finished-raw-search', (e, info) => {
			this.queryUIView.webContents.send('got-raw-result', info);
		})
		ipcMain.on('finished-qa-search', (e, info) => {
			this.queryUIView.webContents.send('got-qa-result', info);
		})
		ipcMain.on('reveal-result-click', (e, info) => {
			this.browserView.currentView.webContents.send('reveal-result', info);
		})
		ipcMain.on('goto-result-click', (e, info) => {
			this.browserView.newTab(info.url, null);
			this.revealQueue.push(info)
		})
		ipcMain.on('reveal-queue-check', (e, info) => {
			const revealInfo = this.revealQueue.pop()
			if (revealInfo) {
				console.log('reveal sent')
				this.browserView.currentView.webContents.send('reveal-result', revealInfo);
			}
		})
		// ***** link query events *****
		ipcMain.on('initiate-link-query', (e, info) => {
			this.browserView.currentView.webContents.send('initiate-link-query', e);
			this.queryUIView.webContents.send('start-link-query-load', e);
		});
		ipcMain.on('finished-initiate-link-query', (e, info) => {
			this.queryUIView.webContents.send('finish-link-query-load', info);
		});

		ipcMain.on('finished-link-query-search', (e, info) => {
			// send results to query view
			this.queryUIView.webContents.send('initiate-link-query', info);
		});
	}
}

module.exports = EventHub