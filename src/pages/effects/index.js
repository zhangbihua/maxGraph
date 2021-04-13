import React from 'react';
import Animation from './Animation';
import Preview from '../Previews';
import Morph from './Morph';
import Overlays from './Overlays';
import PageTabs from '../PageTabs';

export default function Effects() {
  return (
    <PageTabs curPageURL="/effects">
      <Preview sourceKey="Animation" content={<Animation />} />
      <Preview sourceKey="Morph" content={<Morph />} />
      <Preview sourceKey="Overlays" content={<Overlays />} />
    </PageTabs>
  );
}
