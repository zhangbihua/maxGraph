import React from 'react';
import Grid from './Grid';
import Preview from '../Previews';
import ExtendCanvas from './ExtendCanvas';
import PageTabs from '../PageTabs';

export default function _Backgrounds() {
  return (
    <PageTabs curPageURL="/backgrounds">
      <Preview sourceKey="ExtendCanvas" content={<ExtendCanvas />} />
      <Preview sourceKey="Grid" content={<Grid />} />
    </PageTabs>
  );
}
