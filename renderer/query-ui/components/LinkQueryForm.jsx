import React, { useState } from 'react';

import QueryForm from "./QueryForm.jsx";

function LinkQueryForm({ info, linkQueryLoading }) {
	const [failedLinkQueryLoad, setFailedLinkQueryLoad] = useState(false);

	return <QueryForm linkQueryLoading={linkQueryLoading} isLinkQuery={true} failedLinkQueryLoad={failedLinkQueryLoad} linkQueryInfo={info} />
}

export default LinkQueryForm;