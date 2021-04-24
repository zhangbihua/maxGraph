import mxgraph from '@mxgraph/core';

import { globalTypes } from '../.storybook/preview';

export default {
  title: 'Layouts/Collapse',
  argTypes: {
    ...globalTypes
  }
};

const Template = ({ label, ...args }) => {
  const {
    mxGraph,
    mxGraphModel,
    mxRectangle
  } = mxgraph;

  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.width = `${args.width}px`;
  container.style.height = `${args.height}px`;
  container.style.background = 'url(/images/grid.gif)';
  container.style.cursor = 'default';

  class MyCustomModel extends mxGraphModel {
    getStyle(cell) {
      // Extends mxGraphModel.getStyle to show an image when collapsed
      if (cell != null) {
        let style = super.getStyle(cell);
        if (this.isCollapsed(cell)) {
          style =
            `${style};shape=image;image=http://www.jgraph.com/images/mxgraph.gif;` +
            `noLabel=1;imageBackground=#C3D9FF;imageBorder=#6482B9`;
        }
        return style;
      }
      return null;
    }
  }

  const graph = new mxGraph(container, new MyCustomModel());
  const parent = graph.getDefaultParent();

  graph.batchUpdate(() => {
    const v1 = graph.insertVertex({
      parent,
      value: 'Container',
      position: [20, 20],
      size: [200, 200],
      style: 'shape=swimlane;startSize=20;',
    });
    v1.geometry.alternateBounds = new mxRectangle(0, 0, 110, 70);

    const v11 = graph.insertVertex({
      parent: v1,
      value: 'Hello,',
      position: [10, 40],
      size: [120, 80],
    });
  });

  return container;
}

export const Default = Template.bind({});