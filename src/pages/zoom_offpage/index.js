import React from 'react';
import Preview from '../Previews';
import LOD from './LOD';
import OffPage from './OffPage';
import PageTabs from "../PageTabs";

export default function _ZoomOffpage() {
  return (
    <PageTabs curPageURL="/zoom_offpage">
      <Preview sourceKey="LOD" content={<LOD />} />
      <Preview sourceKey="OffPage" content={<OffPage />} />
    </PageTabs>
  );
}
