import React from 'react';
import HelloWorld from './HelloWorld';
import Preview from '../Previews';
import PageTabs from '../PageTabs';

export default function _Basic() {
  {
    /* <Preview sourceKey="Template" content={<Template />} /> */
  }
  return (
    <PageTabs curPageURL="/basic">
      <Preview sourceKey="HelloWorld" content={<HelloWorld />} />
    </PageTabs>
  );
}
