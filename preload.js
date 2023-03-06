const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');
const ContentScraper = require('./lib/content-scraper.js');
const ContentRanker = require('./lib/content-ranker.js');
const LinkQuery = require('./lib/link-query.js');
const QAEngineInterface = require('./lib/qa-engine-interface.js');

let rankedCorpusSaved = false;
let rankedCorpus = null;
let corpusNodeIdIndex = null;
const linkQueryCorpusMap = {}

const saveRankedLinkQueryCorpus = async (rankedLinkQueryCorpus, depth) => {
  console.log("saving link query corpus to", path.join(__dirname, `/qa-engine/data/link_query_context_corpus_${depth}.json`))
  fs.writeFileSync(path.join(__dirname, `/qa-engine/data/link_query_context_corpus_${depth}.json`), 
    JSON.stringify({ documents: rankedLinkQueryCorpus })
  ,'utf-8');
}

const saveRankedCorpus = async () => {
  console.log("saving corpus to", path.join(__dirname, '/qa-engine/data/context_corpus.json'))
  fs.writeFileSync(path.join(__dirname, '/qa-engine/data/context_corpus.json'), 
    JSON.stringify({ documents: rankedCorpus })
  ,'utf-8');
}

const contentScrapingRoutine = async () => {
  const contentScraper = new ContentScraper()
  const corpus = contentScraper.fetchCorpus(null, window.location.href, window.location.origin)

  const contentRanker = new ContentRanker(corpus)
  
  rankedCorpus = contentRanker.rankCorpus(35)
  console.log("rankedCorpus", rankedCorpus)
}

const linkQueryPreloadRoutine = async (linkURL, depth) => {
  const qa = new QAEngineInterface();
  await qa.initQAModel() // clear embeddings for each new link click

  const linkQuery = new LinkQuery()
  // load corpus for link page before link search
  const rankedLinkQueryCorpus = await linkQuery.preloadCorpus(linkURL)
  if (rankedLinkQueryCorpus) {
    saveRankedLinkQueryCorpus(rankedLinkQueryCorpus, depth)
    linkQueryCorpusMap[linkURL] = {
      rankedCorpus: rankedLinkQueryCorpus
    }
    return true;
  } else {
    return false;
  }
}


const linkQuerySearchRoutine = (searchText) => {
  let foundResults = []
  // do stuff here
  return foundResults
}

const rawSearchRoutine = async (searchText, linkURL, deepSearch, depth, pass, cachedResults) => {
  let foundResults = cachedResults;

  if (!linkURL && !rankedCorpusSaved) {
    await saveRankedCorpus()
    rankedCorpusSaved = true
  }

  const qa = new QAEngineInterface();

  if (deepSearch) {
    console.log("running deep search for", searchText)
    newFoundResults = await qa.basicQuery(searchText, linkURL, depth);
    foundResults = foundResults.concat(newFoundResults);
    if (!pass) {
      if (foundResults.length < 10) { // not enough results
        let deepResults = []
        let allResultLinks = []
        console.log('foundResults', foundResults)
        if (foundResults.length === 1) {
          allResultLinks = foundResults[0].links
        } else {
          for (let result of foundResults) {
            allResultLinks = allResultLinks.concat(result.links)
          }
        }
        
        console.log("loading result links", allResultLinks)
        for (let link of allResultLinks) {
          console.log('preloading link', link)
          try {
            await linkQueryPreloadRoutine(link, depth+1)
          } catch(e) {
            alert('deep search broke!')
          }
          

          console.log('raw search for', link)
          const results = await rawSearchRoutine(searchText, link, deepSearch, depth+1, true, []) // cached results doesnt matter here
          deepResults = deepResults.concat(results)
        }

        foundResults = foundResults.concat(deepResults);

        console.log("initial depth check", foundResults.length, '/', 10)
        if (foundResults.length < 10) {
            for (let result of deepResults) {
              const results = await rawSearchRoutine(searchText, result.link, deepSearch, depth+1, false, foundResults)
              foundResults = foundResults.concat(results)
            }
        }
      }
    }
  } else {
    foundResults = await qa.basicQuery(searchText, linkURL, depth);
  }

  return foundResults
}

const qaSearchRoutine = async (searchText, linkURL, deepSearch) => {
  if (!linkURL && !rankedCorpusSaved) {
    await saveRankedCorpus()
    rankedCorpusSaved = true
  }
  console.log('running search routine')
  const qa = new QAEngineInterface();
  // await qa.initQAModel()
  const answer = await qa.askQuestion(searchText, linkURL);


  const corpusToUse = (linkURL) ? linkQueryCorpusMap[linkURL].rankedCorpus : rankedCorpus;

  let foundResults
  if (answer && answer.length > 0) {
    // make this better
    // find node id
    let foundNodeId = null
    for (let doc of corpusToUse) {
      if (doc.text.indexOf(answer) > -1) {
        foundNodeId = doc.nodeId
        break;
      }
    }
    foundResults = [{ 
      doc: {
        text: answer,
      },
      nodeId: foundNodeId,
      searchText
    }]
  } else {
    foundResults = []
  }
  return foundResults;
}

const localEventHub = () => {
  ipcRenderer.on('reveal-result', async (e, info) => {
      const foundResult = document.querySelector(info.elementSelector)
      if (foundResult) {
        const lastBGColor = window.getComputedStyle(foundResult)['background-color'] 
        foundResult.scrollIntoView()
        foundResult.style.backgroundColor = "rgb(240,255,50)"
        setTimeout(() => {
        foundResult.style.transition = "background-color 2s ease-out"
          if (lastBGColor) {
            foundResult.style.backgroundColor = lastBGColor
          } else {
            foundResult.style.backgroundColor = "transparent"
          }

          setTimeout(() => {
              foundResult.style.transition = "unset"
          }, 3000)

        }, 500)
      } else {
        alert('Reveal failed')
      }
  });

  ipcRenderer.on('raw-search', async (e, info) => {
    const { searchText, linkURL, deepSearch } = info
    console.log('got raw search', searchText, deepSearch)

    if (!linkURL) {
      if (!rankedCorpus) {
        await contentScrapingRoutine()
      }
    }

    const foundResults = await rawSearchRoutine(searchText, linkURL, deepSearch, 0, false, [])
    console.log("foundResults", foundResults)
    ipcRenderer.send('finished-raw-search', { foundResults })
    if (foundResults.length === 0) {
      alert("Search not found", searchText)      
    }
  });

  ipcRenderer.on('qa-search', async (e, info) => {
    console.log('got raw search')
    const { searchText, linkURL, deepSearch } = info

    if (!linkURL) {
      if (!rankedCorpus) {
        await contentScrapingRoutine()
      }
    }
    const foundResults = await qaSearchRoutine(searchText, linkURL, deepSearch);
    // ipcRenderer.send('finished-qa-search', { foundResults })

    ipcRenderer.send('finished-qa-search', { foundResults })
    if (foundResults.length === 0) {
      alert("Search not found", searchText)      
    }
  });



  // ***** link query events *****
  ipcRenderer.on('initiate-link-query', async (e, info) => {
    const { linkURL } = info
    console.log('initiate link query search')
    // if (!linkQueryCorpusMap[linkURL]) {
    //   await linkContentScrapingRoutine()
    // }
    let success = false
    try {
      await linkQueryPreloadRoutine(linkURL, 0)
      success = true
    } catch(e) {
      console.log(e)
    }
    ipcRenderer.send('finished-initiate-link-query', { success })
  });

  ipcRenderer.on('link-query-search', async (e, info) => {
    const { linkURL, searchText } = info
    console.log('initiate link query search')
    // if (!linkQueryCorpusMap[linkURL]) {
    //   await linkContentScrapingRoutine()
    // }
    const foundResults = linkQuerySearchRoutine(searchText)

    ipcRenderer.send('finished-link-query-search', { foundResults })
  });


  ipcRenderer.send('reveal-queue-check', {});
}

window.addEventListener('DOMContentLoaded', async () => {
  console.log("loaded preload script")
  const qa = new QAEngineInterface();
  await qa.initQAModel()

  localEventHub();

})
