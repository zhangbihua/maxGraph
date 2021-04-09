import React from 'react';
import Preview from '../Previews';
import Editing from './Editing';
import PageTabs from '../PageTabs';

export default function _Editing() {
  return (
    <PageTabs curPageURL="/editing">
      <Preview sourceKey="Editing" content={<Editing />} />
    </PageTabs>
  );
}
