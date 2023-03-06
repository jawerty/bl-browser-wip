import React from 'react';
import cx from "classnames";
import "../styles/header.scss";

function Header({ currentTab, setCurrentTab }) {
	return <div className="header">
		<div className="tabs">
			<div className={cx({
				tab: true,
				active: currentTab === 'current-page'
			})} onClick={(e) => setCurrentTab('current-page')} >
				Page Query
			</div>
			<div className={cx({
				tab: true,
				active: currentTab === 'link-query-form'
			})} onClick={(e) => setCurrentTab('link-query-form')}>
				Link Query
			</div>
		</div>
	</div>
}

export default Header;