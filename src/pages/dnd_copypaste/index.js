import React from 'react';
import Preview from '../Previews';
import Clipboard from './Clipboard';
import DragSource from './DragSource';
import Drop from './Drop';
import PageTabs from "../PageTabs";

export default function _DnDCopyPaste() {
  return (
    <PageTabs curPageURL="/dnd_copypaste">
      <Preview sourceKey="Clipboard" content={<Clipboard />} />
      <Preview sourceKey="DragSource" content={<DragSource />} />
      <Preview sourceKey="Drop" content={<Drop />} />
    </PageTabs>
  );
}
