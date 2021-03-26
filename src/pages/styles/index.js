import React from 'react';
import Preview from '../Previews';
import DynamicStyle from './DynamicStyle';
import HoverStyle from './HoverStyle';
import Stylesheet from './Stylesheet';
import PageTabs from "../PageTabs";

export default function _Styles() {
  return (
    <PageTabs curPageURL="/styles">
      <Preview sourceKey="DynamicStyle" content={<DynamicStyle />} />
      <Preview sourceKey="HoverStyle" content={<HoverStyle />} />
      <Preview sourceKey="Stylesheet" content={<Stylesheet />} />
    </PageTabs>
  );
}
