import React from 'react';
import Preview from '../Previews';
import LabelPosition from './LabelPosition';
import Perimeter from './Perimeter';
import SecondLabel from './SecondLabel';
import Wrapping from './Wrapping';
import Labels from './Labels';
import PageTabs from "../PageTabs";

export default function _Labels() {
  return (
    <PageTabs curPageURL="/labels">
      <Preview sourceKey="LabelPosition" content={<LabelPosition />} />
      <Preview sourceKey="Labels" content={<Labels />} />
      <Preview sourceKey="Perimeter" content={<Perimeter />} />
      <Preview sourceKey="SecondLabel" content={<SecondLabel />} />
      <Preview sourceKey="Wrapping" content={<Wrapping />} />
    </PageTabs>
  );
}
