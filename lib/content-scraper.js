class ContentScraper {
	constructor() {
	}

	getUniqueSelector(el) {
	  // https://stackoverflow.com/questions/8588301/how-to-generate-unique-css-selector-for-dom-element
	  let path = [], parent;
	  while (parent = el.parentNode) {
	    let tag = el.tagName, siblings;
	    path.unshift(
	      el.id ? `[id="${el.id}"]` : (
	        siblings = parent.children,
	        [].filter.call(siblings, sibling => sibling.tagName === tag).length === 1 ? tag :
	        `${tag}:nth-child(${1+[].indexOf.call(siblings, el)})`
	      )
	    );
	    el = parent;
	  };
	  return `${path.join(' > ')}`.toLowerCase();
	}

	makeRandId(length) {
	    let result = '';
	    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	    const charactersLength = characters.length;
	    let counter = 0;
	    while (counter < length) {
	      result += characters.charAt(Math.floor(Math.random() * charactersLength));
	      counter += 1;
	    }
	    return result;
	}

	cleanText(text) {
		if (text) {
			return text.trim()
		} else {
			return null
		} 
	}

	ignoreElement(element) {
		return ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(element.tagName)
	}

	fetchCorpus(_doc, link, originLink) {
		const isJSDOM = !!_doc;
		const doc = _doc || document;
		const self = this;
		
		function getChildContentLinks(element) {
			function urlizeHref(href) {
				if (originLink && href.indexOf('https://') === -1 && href.indexOf('http://') === -1) {
					const slash = href.indexOf('/') === 0 ? '' : '/';
					return `${originLink}${slash}${href}`
				} else {
					return href
				}
			}

			let elementHref = null;
			if (element.tagName === 'A'){ 
				elementHref = element.getAttribute('href')
			} else if (element.parentNode.tagName === 'A') {
				elementHref = element.parentNode.getAttribute('href')
			} 

			if (elementHref && elementHref.length > 0 ) {
				return [urlizeHref(elementHref)]
			} else {
				const aTags = element.querySelectorAll('a')
				const hrefs = [];

				for (let el of Array.from(aTags)) { 
					if (el.offsetParent !== null) {
						const text = isJSDOM ? el.textContent : el.innerText;
						const hasText = text && text.length > 0;
						const href = el.getAttribute('href');
						const hasHref = href && href.length > 0;
						if (hasText && hasHref) {
							hrefs.push(urlizeHref(href))
						}
					}
				}

				return hrefs
			} 
			
		}

		function parseBodyForText(bodyElement) {
			const bodyText = []
			const bodyChildren = []
			for (let child of bodyElement.childNodes) {
				if (self.ignoreElement(child)) {
					continue;
				}

				if (child.nodeType === Node.TEXT_NODE) {
					const text = self.cleanText(isJSDOM ? child.textContent : child.innerText)
					if (text) {
						const childContentLinks = getChildContentLinks(child)
						const elementSelector = self.getUniqueSelector(child);
						bodyText.push({text, elementSelector, links: childContentLinks, url: (isJSDOM) ? link : null })
					}
				} else {
					bodyChildren.push(child)
				}
			}
			return [bodyText, bodyChildren];
		}

		function parseTextNode(element, corpus) {
			const children = element.childNodes;
			if (!children) {
				return;
			}

			let hasDirectText = false;

			const nonTextChildren = []
			for (let child of children) {
				if (self.ignoreElement(child)) {
					continue;
				}
				if ((child.nodeType === Node.TEXT_NODE) 
					&& (child.textContent && child.textContent.trim().length > 0)) {
					hasDirectText = true
				} else {
					nonTextChildren.push(child)
				}
			}

			if (hasDirectText) {
				const text = self.cleanText(isJSDOM ? element.textContent : element.innerText)
				if (text) {
					const childContentLinks = getChildContentLinks(element);
					const elementSelector = self.getUniqueSelector(element);
					corpus.push({text, elementSelector, links: childContentLinks, url: (isJSDOM) ? link : null })
				}
			} else {
				for (let child of nonTextChildren) {
					parseTextNode(child, corpus)
				}
			}

			
		}

		// get all nodes that contain text 
		const rootNode = doc.querySelector('body');
		console.log("rootNode", rootNode)
		const [bodyText, bodyChildren] = parseBodyForText(rootNode)
		const corpus = bodyText;
		for (let child of bodyChildren) {
			parseTextNode(child, corpus)
		}
		console.log("unranked corpus", corpus)

		return corpus
	}
}

module.exports = ContentScraper