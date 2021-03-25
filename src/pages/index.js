import Head from 'next/head';
import styles from '../styles/Home.module.css';

import HelloWorld from './HelloWorld';
import Anchors from "./Anchors";
import AutoLayout from "./AutoLayout";
import Animation from "./Animation";
import Boundary from "./Boundary";
import Clipboard from "./Clipboard";
import DragSource from "./DragSource";
import Control from "./Control";
import ContextIcons from "./ContextIcons";
import Collapse from "./Collapse";
import Constituent from "./Constituent";
import DynamicLoading from "./DynamicLoading";
import Drop from "./Drop";
import DynamicStyle from "./DynamicStyle";
import DynamicToolbar from "./DynamicToolbar";
import EdgeTolerance from "./EdgeTolerance";
import Editing from "./Editing";
import Tree from "./Tree";
import Validation from "./Validation";
import SwimLanes from "./SwimLanes";
import Wrapping from "./Wrapping";
//import Windows from "./Windows";
import Visibility from "./Visibility";
import UserObject from "./UserObject";
import Toolbar from "./Toolbar";
import Thread from "./Thread";
//import Template from "./Template";
import Stylesheet from "./Stylesheet";
import Stencils from "./Stencils";
import SecondLabel from "./SecondLabel";
import Shape from "./Shape";
import Resources from "./Resources";
import RadialTreeLayout from "./RadialTreeLayout";
import PortRefs from "./PortRefs";
import Permissions from "./Permissions";
import Perimeter from "./Perimeter";
import PageBreaks from "./PageBreaks";
import Overlays from "./Overlays";
import Orthogonal from "./Orthogonal";
import OrgChart from "./OrgChart";
import OffPage from "./OffPage";
import Morph from "./Morph";
import Monitor from "./Monitor";
import Merge from "./Merge";
import Markers from "./Markers";
import LOD from "./LOD";
import Layers from "./Layers";
import Labels from "./Labels";
import LabelPosition from "./LabelPosition";
import JsonData from "./JsonData";
import Indicators from "./Indicators";
import Images from "./Images";
import HoverIcons from "./HoverIcons";
import HoverStyle from "./HoverStyle";
import HierarchicalLayout from "./HierarchicalLayout";
import HelloPort from "./HelloPort";
import Handles from "./Handles";
import Guides from "./Guides";
import Groups from "./Groups";
import Grid from "./Grid";
import Folding from "./Folding";
import FixedPoints from "./FixedPoints";
import FixedIcon from "./FixedIcon";

export default function Home() {
  return (
    <div
      style={{
        width: '1000px',
        margin: '0 auto'
      }}
    >
      <HelloWorld />
      <Anchors />
      <AutoLayout />
      <Animation />
      <Boundary />
      <Clipboard />
      <ContextIcons />
      <Collapse />
      <Constituent />
      <ContextIcons />
      <Control />
      <DragSource />
      <Drop />
      {/*<DynamicLoading />*/}
      <DynamicStyle />
      <DynamicToolbar />
      <EdgeTolerance />
      <Editing />
      <FixedIcon />
      <FixedPoints />
      <Folding />
      <Grid />
      <Groups />
      <Guides />
      <Handles />
      <HelloPort />
      {/*<HierarchicalLayout />*/}
      <HoverStyle />
      <HoverIcons />
      <Images />
      <Indicators />
      <JsonData />
      <LabelPosition />
      <Labels />
      <Layers />
      <LOD />
      <Markers />
      <Merge />
      <Monitor />
      <Morph />
      <OffPage />
      <OrgChart />
      <Orthogonal />
      <Overlays />
      <PageBreaks />
      <Perimeter />
      <Permissions />
      <PortRefs />
      <RadialTreeLayout />
      <Resources />
      <SecondLabel />
      <Shape />
      {/*<Stencils />*/}
      <Stylesheet />
      <SwimLanes />
      {/*<Template />*/}
      <Thread />
      <Toolbar />
      <Tree />

      <UserObject />
      <Validation />
      <Visibility />
      {/*<Windows />*/}
      <Wrapping />
    </div>
  );
}
