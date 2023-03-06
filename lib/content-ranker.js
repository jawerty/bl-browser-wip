const natural = require("natural");

class ContentRanker {
	constructor(corpus) {
		const language = "EN"
		const defaultCategory = 'N';
		const defaultCategoryCapitalized = 'NNP';

		const lexicon = new natural.Lexicon(language, defaultCategory, defaultCategoryCapitalized);
		const ruleSet = new natural.RuleSet('EN');
		const tagger = new natural.BrillPOSTagger(lexicon, ruleSet);
		this.tagger = tagger;
		this.corpus = corpus;
	}

	rankCorpus(threshold) {
		let rankedCorpus = this.corpus.map((doc) => {
			return {
				score: this.score(doc.text),
				...doc
			}
		}).sort((a, b) => {
			return b.score - a.score
		})


		// filter from threshold
		if (threshold) {
			let cutoffIndex = null
			for (let [i, doc] of rankedCorpus.entries()) {
				if (doc.score < threshold) {
				 	cutoffIndex = i
				 	break;
				}	
			}
			if (cutoffIndex) {
				rankedCorpus = rankedCorpus.slice(0, cutoffIndex)
			}
		}

		return rankedCorpus;
	}

	score(doc) {
		const capitalCoefficient = 1;
		const nonNounCoefficient = 20;
		const nounSingularCoefficient = 1;
		const words = doc.split(' ').filter((word) => {
			return word && word.length > 0 && !['|'].includes(word)
		});
		const wordCount = words.length


		let capitalCount = 0;
		for (let word of words) {
			if (word[0] == word[0].toUpperCase()) {
				capitalCount++
			}	
		}

		let nounSingularCount = 0;
		let nonNounCount = 0;
		// console.log(this.tagger.tag(words))
		for (let taggedWord of this.tagger.tag(words).taggedWords) {
			if (!['NNP', 'NNS', 'N', 'NN'].includes(taggedWord.tag)) {
				nonNounCount++
			}
			if (taggedWord.tag === 'NN') {
				nounSingularCount++
			}
		}

		return Math.log(wordCount) * 
			(capitalCoefficient * (1 + (capitalCount/wordCount))) * 
			(nonNounCoefficient * (1 + (nonNounCount/wordCount))) *
			(nounSingularCoefficient * ( 1 - (nounSingularCount/wordCount))); // subract is an error
	}
}

module.exports = ContentRanker;