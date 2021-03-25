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

export default function Home() {
  return (
    <div
      style={{
        width: '1000px',
        margin: '0 auto',
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
