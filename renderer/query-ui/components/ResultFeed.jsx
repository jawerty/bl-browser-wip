import React, { useState, useEffect } from "react";

import ResultCard from "./ResultCard.jsx";
import QueryCard from "./QueryCard.jsx";

import "../styles/result-feed.scss";

function ResultFeed({ results, isLinkQuery }) {
	return <div className="result-feed">
		{results.length === 0 && <p className="hint">Results will show here</p>}
		{results.length > 0 && results.map((result, i) => {
			return (result.type === 'query') ? 
				<QueryCard key={i} result={result} /> : <ResultCard isLinkQuery={isLinkQuery} key={i} result={result} />
		})}	
	</div>
}

export default ResultFeed;