import React from 'react';
import Boundary from './Boundary';
import Preview from '../Previews';
import Events from "./Events";
import PageTabs from "../PageTabs";

export default function _Events() {
  return (
    <PageTabs curPageURL="/events">
      <Preview sourceKey="Boundary" content={<Boundary />} />
      <Preview sourceKey="Events" content={<Events />} />
    </PageTabs>
  );
}
