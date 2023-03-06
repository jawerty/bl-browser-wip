import { ipcRenderer } from "electron";

import React from "react";
import "../styles/result-card.scss";

function ResultCard({ result, isLinkQuery }) {
	return <div className="result-card">
		<div className="result-card__content">
			<div className="result-card__header">		
				<label>Result</label>
			</div>
			<div className="result-card__body">
				{result.text}
			</div>
			<div className="result-card__footer">
				{result.elementSelector && <span onClick={() => {
					if (isLinkQuery) {
						ipcRenderer.send('goto-result-click', {
							elementSelector: result.elementSelector,
							url: result.url
						})
					} else {
						ipcRenderer.send('reveal-result-click', {
							elementSelector: result.elementSelector
						})
					}
					
				}}>{(isLinkQuery) ? 'Go to' : 'Reveal'}</span>}
			</div>
		</div>
		
	</div>
}

export default ResultCard;