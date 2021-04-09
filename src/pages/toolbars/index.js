import React from 'react';
import Preview from '../Previews';
import DynamicToolbar from './DynamicToolbar';
import Toolbar from './Toolbar';
import PageTabs from '../PageTabs';

export default function _Toolbars() {
  return (
    <PageTabs curPageURL="/toolbars">
      <Preview sourceKey="DynamicToolbar" content={<DynamicToolbar />} />
      <Preview sourceKey="Toolbar" content={<Toolbar />} />
    </PageTabs>
  );
}
