import React from "react";

import "../styles/query-card.scss";

function QueryCard({ result }) {
	return <div className="query-card">
		<span className="query-card__content">{result.query}</span>
	</div>
}

export default QueryCard;