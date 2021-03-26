import React from 'react';
import ContextIcons from './ContextIcons';
import Preview from '../Previews';
import Control from './Control';
import FixedIcon from './FixedIcon';
import HoverIcons from './HoverIcons';
import Images from './Images';
import Indicators from './Indicators';
import Markers from './Markers';
import PageTabs from "../PageTabs";

export default function _Backgrounds() {
  return (
    <PageTabs curPageURL="/icons_images">
      <Preview sourceKey="ContextIcons" content={<ContextIcons />} />
      <Preview sourceKey="Control" content={<Control />} />
      <Preview sourceKey="FixedIcon" content={<FixedIcon />} />
      <Preview sourceKey="HoverIcons" content={<HoverIcons />} />
      <Preview sourceKey="Images" content={<Images />} />
      <Preview sourceKey="Indicators" content={<Indicators />} />
      <Preview sourceKey="Markers" content={<Markers />} />
    </PageTabs>
  );
}
