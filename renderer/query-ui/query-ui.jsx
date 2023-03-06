import { ipcMain, ipcRenderer } from "electron";
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import Header from "./components/Header.jsx";
import QueryForm from "./components/QueryForm.jsx";
import LinkQueryForm from "./components/LinkQueryForm.jsx";

import "./styles/main.scss";


function QueryUI() {
  const [failedLinkQueryLoad, setFailedLinkQueryLoad] = useState(false);
  const [linkQueryLoading, setLinkQueryLoading] = useState(false);
  const [linkQueryInfo, setLinkQueryInfo] = useState();
  const [currentTab, setCurrentTab] = useState('current-page')

  useEffect(() => {
    const onLinkQueryStartLoad = (e, info) => {
      setFailedLinkQueryLoad(false);
      setLinkQueryLoading(true)
      setLinkQueryInfo(info);
      setCurrentTab('link-query-form');
    }

    const onLinkQueryFinishLoaded = (e, info) => {
      if (!info.success) {
        setFailedLinkQueryLoad(true)
      }
      setLinkQueryLoading(false);
      setCurrentTab('link-query-form');
    }

    ipcRenderer.on('start-link-query-load', onLinkQueryStartLoad)
    ipcRenderer.on('finish-link-query-load', onLinkQueryFinishLoaded)

    return () => {
      ipcRenderer.removeListener('start-link-query-load', onLinkQueryStartLoad)
      ipcRenderer.removeListener('finish-link-query-load', onLinkQueryFinishLoaded)
    }
  }, [])
  return (
    <div className="query-ui">
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <div className="content">
        {currentTab === 'current-page' && <QueryForm />}
        {currentTab === 'link-query-form' && <LinkQueryForm 
          info={linkQueryInfo} 
          failedLinkQueryLoad={failedLinkQueryLoad} 
          linkQueryLoading={linkQueryLoading} 
        />}
      </div>
    </div>
  );
}

// eslint-disable-next-line no-undef
const root = createRoot(document.getElementById('app')); // createRoot(container!) if you use TypeScript
root.render(<QueryUI />);
