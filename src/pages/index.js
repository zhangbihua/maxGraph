import Head from 'next/head';
import styles from '../styles/Home.module.css';

import HelloWorld from './HelloWorld';
import Anchors from './Anchors';
import AutoLayout from './AutoLayout';
import Animation from './Animation';
import Boundary from './Boundary';
import Clipboard from './Clipboard';
import DragSource from './DragSource';
import Control from './Control';
import ContextIcons from './ContextIcons';
import Collapse from './Collapse';
import Constituent from './Constituent';
import DynamicLoading from './DynamicLoading';
import Drop from './Drop';
import DynamicStyle from './DynamicStyle';
import DynamicToolbar from './DynamicToolbar';
import EdgeTolerance from './EdgeTolerance';
import Editing from './Editing';
import Tree from './Tree';
import Validation from './Validation';
import SwimLanes from './SwimLanes';
import Wrapping from './Wrapping';
// import Windows from "./Windows";
import Visibility from './Visibility';
import UserObject from './UserObject';
import Toolbar from './Toolbar';
import Thread from './Thread';
// import Template from "./Template";
import Stylesheet from './Stylesheet';
import Stencils from './Stencils';
import SecondLabel from './SecondLabel';
import Shape from './Shape';
import Resources from './Resources';
import RadialTreeLayout from './RadialTreeLayout';
import PortRefs from './PortRefs';
import Permissions from './Permissions';
import Perimeter from './Perimeter';
import PageBreaks from './PageBreaks';
import Overlays from './Overlays';
import Orthogonal from './Orthogonal';
import OrgChart from './OrgChart';
import OffPage from './OffPage';
import Morph from './Morph';
import Monitor from './Monitor';
import Merge from './Merge';
import Markers from './Markers';
import LOD from './LOD';
import Layers from './Layers';
import Labels from './Labels';
import LabelPosition from './LabelPosition';
import JsonData from './JsonData';
import Indicators from './Indicators';
import Images from './Images';
import HoverIcons from './HoverIcons';
import HoverStyle from './HoverStyle';
import HierarchicalLayout from './HierarchicalLayout';
import HelloPort from './HelloPort';
import Handles from './Handles';
import Guides from './Guides';
import Groups from './Groups';
import Grid from './Grid';
import Folding from './Folding';
import FixedPoints from './FixedPoints';
import FixedIcon from './FixedIcon';
import Preview from './Previews';

export default function Home() {
  return (
    <div
      style={{
        width: '900px',
        margin: '0 auto',
      }}
    >
      <Preview sourceKey="HelloWorld" content={<HelloWorld />} />
      <Preview sourceKey="Anchors" content={<Anchors />} />
      <Preview sourceKey="AutoLayout" content={<AutoLayout />} />
      <Preview sourceKey="Animation" content={<Animation />} />
      <Preview sourceKey="Boundary" content={<Boundary />} />
      <Preview sourceKey="Clipboard" content={<Clipboard />} />
      <Preview sourceKey="ContextIcons" content={<ContextIcons />} />
      <Preview sourceKey="Collapse" content={<Collapse />} />
      <Preview sourceKey="Constituent" content={<Constituent />} />
      <Preview sourceKey="ContextIcons" content={<ContextIcons />} />
      <Preview sourceKey="Control" content={<Control />} />
      <Preview sourceKey="DragSource" content={<DragSource />} />
      <Preview sourceKey="Drop" content={<Drop />} />
      {/* <Preview sourceKey="DynamicLoading" content={<DynamicLoading />} /> */}
      <Preview sourceKey="DynamicStyle" content={<DynamicStyle />} />
      <Preview sourceKey="DynamicToolbar" content={<DynamicToolbar />} />
      <Preview sourceKey="EdgeTolerance" content={<EdgeTolerance />} />
      <Preview sourceKey="Editing" content={<Editing />} />
      <Preview sourceKey="FixedIcon" content={<FixedIcon />} />
      <Preview sourceKey="FixedPoints" content={<FixedPoints />} />
      <Preview sourceKey="Folding" content={<Folding />} />
      <Preview sourceKey="Grid" content={<Grid />} />
      <Preview sourceKey="Groups" content={<Groups />} />
      <Preview sourceKey="Guides" content={<Guides />} />
      <Preview sourceKey="Handles" content={<Handles />} />
      <Preview sourceKey="HelloPort" content={<HelloPort />} />
      {/* <Preview sourceKey="HierarchicalLayout" content={<HierarchicalLayout />} /> */}
      <Preview sourceKey="HoverStyle" content={<HoverStyle />} />
      <Preview sourceKey="HoverIcons" content={<HoverIcons />} />
      <Preview sourceKey="Images" content={<Images />} />
      <Preview sourceKey="Indicators" content={<Indicators />} />
      <Preview sourceKey="JsonData" content={<JsonData />} />
      <Preview sourceKey="LabelPosition" content={<LabelPosition />} />
      <Preview sourceKey="Labels" content={<Labels />} />
      <Preview sourceKey="Layers" content={<Layers />} />
      <Preview sourceKey="LOD" content={<LOD />} />
      <Preview sourceKey="Markers" content={<Markers />} />
      <Preview sourceKey="Merge" content={<Merge />} />
      <Preview sourceKey="Monitor" content={<Monitor />} />
      <Preview sourceKey="Morph" content={<Morph />} />
      <Preview sourceKey="OffPage" content={<OffPage />} />
      <Preview sourceKey="OrgChart" content={<OrgChart />} />
      <Preview sourceKey="Orthogonal" content={<Orthogonal />} />
      <Preview sourceKey="Overlays" content={<Overlays />} />
      {/* <Preview sourceKey="PageBreaks" content={<PageBreaks />} /> */}
      <Preview sourceKey="Perimeter" content={<Perimeter />} />
      <Preview sourceKey="Permissions" content={<Permissions />} />
      <Preview sourceKey="PortRefs" content={<PortRefs />} />
      <Preview sourceKey="RadialTreeLayout" content={<RadialTreeLayout />} />
      <Preview sourceKey="Resources" content={<Resources />} />
      <Preview sourceKey="SecondLabel" content={<SecondLabel />} />
      <Preview sourceKey="Shape" content={<Shape />} />
      {/* <Preview sourceKey="Stencils" content={<Stencils />} /> */}
      <Preview sourceKey="Stylesheet" content={<Stylesheet />} />
      <Preview sourceKey="SwimLanes" content={<SwimLanes />} />
      {/* <Preview sourceKey="Template" content={<Template />} /> */}
      <Preview sourceKey="Thread" content={<Thread />} />
      <Preview sourceKey="Toolbar" content={<Toolbar />} />
      <Preview sourceKey="Tree" content={<Tree />} />

      <Preview sourceKey="UserObject" content={<UserObject />} />
      <Preview sourceKey="Validation" content={<Validation />} />
      <Preview sourceKey="Visibility" content={<Visibility />} />
      {/* <Preview sourceKey="Windows" content={<Windows />} /> */}
      <Preview sourceKey="Wrapping" content={<Wrapping />} />
    </div>
  );
}
