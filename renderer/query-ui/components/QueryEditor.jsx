import { ipcRenderer } from 'electron';
import React, { useState } from "react"
import cx from "classnames";

import "../styles/query-editor.scss";

function QueryEditor({ loading, setLoading, setNewQuery, linkQueryInfo }) {
	const [queryType, setQueryType] = useState('qa');
	const [deepSearch, setDeepSearch] = useState(false);
	const [searchText, setSearchText] = useState();
	const onEnterPress = (e) => {
		if (loading || 
			!searchText || 
			(searchText && searchText.length === 0)) {
			return;	
		}
		if(e.keyCode == 13 && e.shiftKey == false) {
		    e.preventDefault();
		    setLoading(true);
		    setNewQuery(searchText)
		    ipcRenderer.send("initiate-search", {
		    	searchText, queryType, linkURL: linkQueryInfo?.linkURL,
		    	deepSearch
		    });
		}	
	}
	
	return <div className="query-editor">
		{loading && <div className="query-editor__loading">
			<svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"  width="100px" height="100px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
				<g transform="translate(20 50)">
				<circle cx="0" cy="0" r="6" fill="#788caa">
				  <animateTransform attributeName="transform" type="scale" begin="-0.375s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>
				</circle>
				</g><g transform="translate(40 50)">
				<circle cx="0" cy="0" r="6" fill="#8ca0be">
				  <animateTransform attributeName="transform" type="scale" begin="-0.25s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>
				</circle>
				</g><g transform="translate(60 50)">
				<circle cx="0" cy="0" r="6" fill="#a0b4d2">
				  <animateTransform attributeName="transform" type="scale" begin="-0.125s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>
				</circle>
				</g><g transform="translate(80 50)">
				<circle cx="0" cy="0" r="6" fill="#b4c8e6">
				  <animateTransform attributeName="transform" type="scale" begin="0s" calcMode="spline" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" values="0;1;0" keyTimes="0;0.5;1" dur="1s" repeatCount="indefinite"></animateTransform>
				</circle>
				</g>
			</svg>
		</div>}
		<textarea 
			value={searchText}
			onChange={(e) => setSearchText(e.target.value)}
			onKeyDown={onEnterPress}
			className="query-form__text" 
			placeholder={(queryType === 'raw') ? "Enter your search..." : "Ask a question..."}>
			
		</textarea>
		<div className="query-type-toggler">
			<div className="query-type-toggler__content">
				<span className={cx({
					'query-type-toggler__option': true,
					active: queryType === 'qa'
				})} onClick={(e) => setQueryType('qa')}>QA</span>
				<span className={cx({
					'query-type-toggler__option': true,
					active: queryType === 'raw'
				})} onClick={(e) => setQueryType('raw')}>Basic</span>
			</div>
			{linkQueryInfo && <span className={cx({
				'deep-search-toggler__option': true,
				active: deepSearch
			})} onClick={(e) => setDeepSearch(!deepSearch)}>Deep</span>}
		</div>
		
	</div>
}

export default QueryEditor;