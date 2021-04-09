import React from 'react';
import Windows from './Windows';
import Preview from '../Previews';
import PageTabs from '../PageTabs';

export default function _Windows() {
  return (
    <PageTabs curPageURL="/windows">
      <Preview sourceKey="Windows" content={<Windows />} />
    </PageTabs>
  );
}
