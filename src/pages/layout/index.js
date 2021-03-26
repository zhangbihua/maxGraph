import React from 'react';
import Preview from '../Previews';
import AutoLayout from './AutoLayout';
import Collapse from './Collapse';
import Constituent from './Constituent';
import Folding from './Folding';
import Groups from './Groups';
import Handles from './Handles';
import Layers from './Layers';
import OrgChart from './OrgChart';
import RadialTreeLayout from './RadialTreeLayout';
import SwimLanes from './SwimLanes';
import Tree from './Tree';
import PageTabs from "../PageTabs";

export default function _Layout() {
  return (
    <PageTabs curPageURL="/layout">
      <Preview sourceKey="AutoLayout" content={<AutoLayout />} />
      <Preview sourceKey="Collapse" content={<Collapse />} />
      <Preview sourceKey="Constituent" content={<Constituent />} />
      <Preview sourceKey="Folding" content={<Folding />} />
      <Preview sourceKey="Groups" content={<Groups />} />
      <Preview sourceKey="Handles" content={<Handles />} />
      {/* <Preview sourceKey="HierarchicalLayout" content={<HierarchicalLayout />} /> */}
      <Preview sourceKey="Layers" content={<Layers />} />
      <Preview sourceKey="OrgChart" content={<OrgChart />} />
      <Preview sourceKey="RadialTreeLayout" content={<RadialTreeLayout />} />
      <Preview sourceKey="SwimLanes" content={<SwimLanes />} />
      <Preview sourceKey="Tree" content={<Tree />} />
    </PageTabs>
  );
}
