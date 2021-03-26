import Head from 'next/head';
import styles from '../styles/Home.module.css';

import HelloWorld from './basic/HelloWorld';
import Anchors from './connections/Anchors';
import AutoLayout from './layout/AutoLayout';
import Animation from './effects/Animation';
import Boundary from './events/Boundary';
import Clipboard from './dnd_copypaste/Clipboard';
import DragSource from './dnd_copypaste/DragSource';
import Control from './icons_images/Control';
import ContextIcons from './icons_images/ContextIcons';
import Collapse from './layout/Collapse';
import Constituent from './layout/Constituent';
import DynamicLoading from './misc/DynamicLoading';
import Drop from './dnd_copypaste/Drop';
import DynamicStyle from './styles/DynamicStyle';
import DynamicToolbar from './toolbars/DynamicToolbar';
import EdgeTolerance from './connections/EdgeTolerance';
import Editing from './editing/Editing';
import Tree from './layout/Tree';
import Validation from './misc/Validation';
import SwimLanes from './layout/SwimLanes';
import Wrapping from './labels/Wrapping';
// import Windows from "./Windows";
import Visibility from './misc/Visibility';
import UserObject from './xml_json/UserObject';
import Toolbar from './toolbars/Toolbar';
import Thread from './misc/Thread';
// import Template from "./Template";
import Stylesheet from './styles/Stylesheet';
import Stencils from './shapes_stencils/Stencils';
import SecondLabel from './labels/SecondLabel';
import Shape from './shapes_stencils/Shape';
import Resources from './xml_json/Resources';
import RadialTreeLayout from './layout/RadialTreeLayout';
import PortRefs from './connections/PortRefs';
import Permissions from './misc/Permissions';
import Perimeter from './labels/Perimeter';
import PageBreaks from './printing/PageBreaks';
import Overlays from './effects/Overlays';
import Orthogonal from './connections/Orthogonal';
import OrgChart from './layout/OrgChart';
import OffPage from './zoom_offpage/OffPage';
import Morph from './effects/Morph';
import Monitor from './misc/Monitor';
import Merge from './misc/Merge';
import Markers from './icons_images/Markers';
import LOD from './zoom_offpage/LOD';
import Layers from './layout/Layers';
import Labels from './labels/Labels';
import LabelPosition from './labels/LabelPosition';
import JsonData from './xml_json/JsonData';
import Indicators from './icons_images/Indicators';
import Images from './icons_images/Images';
import HoverIcons from './icons_images/HoverIcons';
import HoverStyle from './styles/HoverStyle';
import HierarchicalLayout from './layout/HierarchicalLayout';
import HelloPort from './connections/HelloPort';
import Handles from './layout/Handles';
import Guides from './misc/Guides';
import Groups from './layout/Groups';
import Grid from './backgrounds/Grid';
import Folding from './layout/Folding';
import FixedPoints from './connections/FixedPoints';
import FixedIcon from './icons_images/FixedIcon';
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
