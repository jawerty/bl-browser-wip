import { ipcRenderer } from "electron";
import React, { useState, useEffect } from 'react';
import ResultFeed from "./ResultFeed.jsx";
import QueryEditor from "./QueryEditor.jsx";

import "../styles/query-form.scss";

function QueryForm({ linkQueryLoading, failedLinkQueryLoad, linkQueryInfo, isLinkQuery = false }) {
	const [loading, setLoading] = useState(false)
	const [results, setResults] = useState([])
	const [newQuery, setNewQuery] = useState();

	useEffect(() => {
		const onResult = (e, info) => {
			if (info.foundResults && info.foundResults.length > 0) {
				console.log('got results: current', results)
				let resultsCopy = [...results];
				resultsCopy = resultsCopy.concat(info.foundResults)
				setResults(resultsCopy)
			}
			setLoading(false)	
		}
		ipcRenderer.on('got-raw-result', onResult)
		ipcRenderer.on('got-qa-result', onResult)

		return () => {
			ipcRenderer.removeListener('got-raw-result', onResult)
			ipcRenderer.removeListener('got-qa-result', onResult)
		}
	}, [results])

	useEffect(() => {
		if (newQuery && newQuery.length > 0) {
			console.log('newQuery', newQuery)
			const resultsCopy = [...results];
			resultsCopy.push({type: 'query', query: newQuery })
			console.log(resultsCopy)
			setResults(resultsCopy)
		}
		
	}, [newQuery]);

	return <div className="query-form">
		{linkQueryLoading && !failedLinkQueryLoad && isLinkQuery && <div className="query-form__loading-overlay">
			<div className="query-form__loading-overlay__message">
				Loading...
			</div>
		</div>}
		{failedLinkQueryLoad && isLinkQuery && <div className="query-form__failure-overlay">
			<div className="query-form__failure-overlay__message">
				Cannot query this link.
			</div>
		</div>}
		{!failedLinkQueryLoad && !linkQueryInfo && isLinkQuery && <div className="query-form__failure-overlay">
			<div className="query-form__failure-overlay__message">
				No link selected to query
			</div>
		</div>}
		{linkQueryInfo && <div className="query-form__link-query-info">
			Querying link: "{linkQueryInfo.linkText}" ({linkQueryInfo.linkURL.slice(0,20)}...)

		</div>}
		<ResultFeed isLinkQuery={!!linkQueryInfo} results={results} />
		<QueryEditor linkQueryInfo={linkQueryInfo} setNewQuery={setNewQuery} loading={loading} setLoading={setLoading}  />
	</div>
}

export default QueryForm;