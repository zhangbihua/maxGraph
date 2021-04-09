import React from 'react';
import Preview from '../Previews';
import JsonData from './JsonData';
import Resources from './Resources';
import UserObject from './UserObject';
import PageTabs from '../PageTabs';

export default function _XMLJSON() {
  return (
    <PageTabs curPageURL="/xml_json">
      <Preview sourceKey="JsonData" content={<JsonData />} />
      <Preview sourceKey="Resources" content={<Resources />} />
      <Preview sourceKey="UserObject" content={<UserObject />} />
    </PageTabs>
  );
}
