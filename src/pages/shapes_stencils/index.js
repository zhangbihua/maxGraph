import React from 'react';
import Preview from '../Previews';
import Shape from './Shape';
import Stencils from "./Stencils";
import PageTabs from "../PageTabs";

export default function _ShapesStencils() {
  return (
    <PageTabs curPageURL="/shapes_stencils">
      <Preview sourceKey="Shape" content={<Shape />} />
      {/*<Preview sourceKey="Stencils" content={<Stencils />} />*/}
    </PageTabs>
  );
}
