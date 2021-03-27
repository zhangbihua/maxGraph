import React from 'react';
import Preview from '../Previews';
import Anchors from './Anchors';
import EdgeTolerance from './EdgeTolerance';
import FixedPoints from './FixedPoints';
import HelloPort from './HelloPort';
import Orthogonal from './Orthogonal';
import PortRefs from './PortRefs';
import PageTabs from "../PageTabs";

export default function _Connections() {
  return (
    <PageTabs curPageURL="/connections">
      <Preview sourceKey="Anchors" content={<Anchors />} />
      <Preview sourceKey="EdgeTolerance" content={<EdgeTolerance />} />
      <Preview sourceKey="FixedPoints" content={<FixedPoints />} />
      <Preview sourceKey="HelloPort" content={<HelloPort />} />
      <Preview sourceKey="Orthogonal" content={<Orthogonal />} />
      <Preview sourceKey="PortRefs" content={<PortRefs />} />
    </PageTabs>
  );
}
