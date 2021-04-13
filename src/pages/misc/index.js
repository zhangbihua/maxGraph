import React from 'react';
import Preview from '../Previews';
import Guides from './Guides';
import Merge from './Merge';
import Monitor from './Monitor';
import Permissions from './Permissions';
import Thread from './Thread';
import Validation from './Validation';
import Visibility from './Visibility';
import PageTabs from '../PageTabs';

export default function _Misc() {
  return (
    <PageTabs curPageURL="/misc">
      {/* <Preview sourceKey="DynamicLoading" content={<DynamicLoading />} /> */}
      <Preview sourceKey="Guides" content={<Guides />} />
      <Preview sourceKey="Merge" content={<Merge />} />
      <Preview sourceKey="Monitor" content={<Monitor />} />
      <Preview sourceKey="Permissions" content={<Permissions />} />
      <Preview sourceKey="Thread" content={<Thread />} />
      <Preview sourceKey="Validation" content={<Validation />} />
      <Preview sourceKey="Visibility" content={<Visibility />} />
    </PageTabs>
  );
}
