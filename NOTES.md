Show HN: HyperGPT, I made a self hosted ChatGPT-like bot for websites you browse 

Steps:
- Build model
	- Retriever 
		- Based on DPR (research more)
			- bi-encoder architecture
		- Look for pre-trained retriever models
		- Document encoder
		- Query encoder
		- Maximum Inner Product Search
			- Join on document U query vectors
	- Generator
		- Any encoder-decoder model can be used for this
		- BART-large was used in RAG
- Fine-tune with any data
- Get it working ok
- Content Scraper
- Browser History Cacher
- Website Collections

- add dimensionality to content
- Index content by various dimensions (detect content)
- Query Examples
	- What's the funniest comment on this thread?
	- What does x mean?
	- Is this an article
	- What is this news article about
	- Who makes money from this webpage
	- How does this website make money

Show HN: HyperGPT, I made a web browser with it's own ChatGPT-like bot

Todo
- Define the "Dimensions of a website"
	- Content types
	- Sentiment of content
	- Network analysis
	- Ads
	- How to embed content "graph" of a website
	- Structure/layout
	- Purpose
	- the url

- Define content representation of a website
	- Content graph
		- How to create embeddings to represent the full content of a website
		- What's the vocabulary
			- series of content presented to user?
			- text content
		- define embedding layers
			- text content
			- content type
			- sentiment
			- content structure
		- Content analysis (langchain tooling to call desired pipeline)
			- Text content analysis
			- Content type Analysis (content detecting)
			- Sentiment Analysis
			- Network analysis
			- Content time series analysis
				- analyize browser history and finds from hyperlinks
		- QA models for text/content types/network?
			- Content type model
				- Define content types
					- Profiles (big deal)
					- descriptive text
		- Use langchain to determine which pipeline to run predictions on
		- 

	- Amalgamation of the various dimensions
	- Which dimensions
- How to train a content detector model and detect each piece of content
- Use lang chain to augment generation with contentdetector prediction
- Sentimet is a separate layer
HyperGPT - web browser
- Hyperlink traversal
	- Ask questions about where urls lead
		- Ask where links lead
		- Talk to hyperlink trails
		- And talk to your history
		- talk to your history and talk to where links lead
		- Information retrieval for future links
		- Read hyperlinks as their link radiuses 
		- You set the degree of separation
		- You can do a raw text search or ask is questions like GPT
		- right click on links or see all the hyperlinks in the right hand side
			- Each link can open up a search form
		- Special case sites
			- Reddit
			- facebook
			- youtube
			- any popular social media
			- can add your own 

- More features
	- Search the past
	- Network Analysis
		- See features for each page
		- Define these features
			- Bring the real world into the webpage
			- Is this worth doing?
			- Put this off until you discover the usage for it
	- Go to webpage where content was found
	- Content Type Detection
		- How does this fit in now
			- Augment the questions
			- Filter all data in the search by content types
				- E.g. only show my comments
	- In side panel link viewer jump to where link is on the page
	- Read pdfs
	- semantics
		- emotions
		- topic analysis
			- real world events/ideas
		- Filter off of relevance to an idea
		- meaning of phrase 
		- meaning 


Show HN: I made a web browser where you can surf the web with a ChatGPT-like AI

Names:
HyperGPT
Lion
ntext
HyperBrowser
bigsurf
bluelion - The ai augmented web browser
	- Intention -> Automation -> Content
	- Surf the web with AI

