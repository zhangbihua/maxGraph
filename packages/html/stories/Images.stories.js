import mxgraph from '@mxgraph/core';

import { globalTypes } from '../.storybook/preview';

export default {
  title: 'Icon_Images/Images',
  argTypes: {
    ...globalTypes
  }
};

const Template = ({ label, ...args }) => {
  const {
    mxGraph, 
    mxCloneUtils, 
    mxImage,
    mxRectangle,
    mxConstants,
    mxPerimeter
  } = mxgraph;

  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.width = `${args.width}px`;
  container.style.height = `${args.height}px`;
  container.style.background = 'url(/images/grid.gif)';
  container.style.cursor = 'default';

  // Creates the graph inside the given container
  const graph = new mxGraph(container);

  // Sets a background image and restricts child movement to its bounds
  graph.setBackgroundImage(
    new mxImage('images/gradient_background.jpg', 360, 200)
  );
  graph.maximumGraphBounds = new mxRectangle(0, 0, 360, 200);

  // Resizes the container but never make it bigger than the background
  graph.minimumContainerSize = new mxRectangle(0, 0, 360, 200);
  graph.setResizeContainer(true);

  // Disables basic selection and cell handling
  // graph.setEnabled(false);
  configureStylesheet(graph);

  // Gets the default parent for inserting new cells. This
  // is normally the first child of the root (ie. layer 0).
  const parent = graph.getDefaultParent();

  // Adds cells to the model in a single step
  graph.getModel().beginUpdate();
  try {
    var v1 = graph.insertVertex(
      parent,
      null,
      'First Line\nSecond Line',
      20,
      10,
      80,
      100,
      'bottom'
    );
    var v1 = graph.insertVertex(
      parent,
      null,
      'First Line\nSecond Line',
      130,
      10,
      80,
      100,
      'top'
    );
    var v1 = graph.insertVertex(parent, null, '', 230, 10, 100, 100, 'image');
    var v2 = graph.insertVertex(
      parent,
      null,
      'First Line\nSecond Line',
      20,
      130,
      140,
      60,
      'right'
    );
    var v2 = graph.insertVertex(
      parent,
      null,
      'First Line\nSecond Line',
      180,
      130,
      140,
      60,
      'left'
    );
  } finally {
    // Updates the display
    graph.getModel().endUpdate();
  }

  function configureStylesheet(graph) {
    let style = {};
    style.shape = mxConstants.SHAPE_IMAGE;
    style.perimiter = mxPerimeter.RectanglePerimeter;
    style.image = 'images/icons48/keys.png';
    style.strokeColor = '#FFFFFF';
    graph.getStylesheet().putCellStyle('image', style);

    style = mxCloneUtils.clone(style);
    style.shape = mxConstants.SHAPE_LABEL;
    style.strokeColor = '#000000';
    style.align = mxConstants.ALIGN_CENTER;
    style.verticalAlign = mxConstants.ALIGN_TOP;
    style.imageAlign = mxConstants.ALIGN_CENTER;
    style.imageVerticalAlign = mxConstants.ALIGN_TOP;
    style.image = 'images/icons48/gear.png';
    style.imageWidth = '48';
    style.imageHeight = '48';
    style.spacingTop = '56';
    style.spacing = '8';
    graph.getStylesheet().putCellStyle('bottom', style);

    style = mxCloneUtils.clone(style);
    style.imageVerticalAlign = mxConstants.ALIGN_BOTTOM;
    style.image = 'images/icons48/server.png';
    delete style.spacingTop;
    graph.getStylesheet().putCellStyle('top', style);

    style = mxCloneUtils.clone(style);
    style.align = mxConstants.ALIGN_LEFT;
    style.imageAlign = mxConstants.ALIGN_LEFT;
    style.verticalAlign = mxConstants.ALIGN_MIDDLE;
    style.imageVerticalAlign = mxConstants.ALIGN_MIDDLE;
    style.image = 'images/icons48/earth.png';
    style.spacingLeft = '55';
    style.spacing = '4';
    graph.getStylesheet().putCellStyle('right', style);

    style = mxCloneUtils.clone(style);
    style.align = mxConstants.ALIGN_RIGHT;
    style.imageAlign = mxConstants.ALIGN_RIGHT;
    delete style.spacingLeft;
    style.spacingRight = '55';
    graph.getStylesheet().putCellStyle('left', style);
  }

  return container;
}

export const Default = Template.bind({});