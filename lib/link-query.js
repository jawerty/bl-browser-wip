const puppeteer = require('puppeteer');
const { JSDOM } = require('jsdom');

const ContentScraper = require("./content-scraper");
const ContentRanker = require("./content-ranker");

class LinkQuery {
	constructor() {

	}

	contentScrapingRoutine(doc, url) {
	  const contentScraper = new ContentScraper()
	  let originUrl
	  try {
		const urlObj = new URL(url)
		originUrl = urlObj.origin
	  } catch(e) {
	  	// swallow error
	  }
	  const corpus = contentScraper.fetchCorpus(doc, url, originUrl)

	  const contentRanker = new ContentRanker(corpus)
	  
	  const rankedCorpus = contentRanker.rankCorpus(35)
	  console.log("rankedCorpus", rankedCorpus)
	  return rankedCorpus;
	}

	async deepRawSerach(url) {
		// BFS
	}

	async deepQASerach(url) {
		// BFS
	}

	async preloadCorpus(url) {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();

		await page.goto(url);

		const bodyHTML = await page.evaluate(() =>  document.documentElement.outerHTML);
		console.log("html body", bodyHTML)

		const dom = new JSDOM(bodyHTML);

		const rankedCorpus = this.contentScrapingRoutine(dom.window.document, url)

		await browser.close();

		return rankedCorpus
	}
}

module.exports = LinkQuery