import mxgraph from '@mxgraph/core';

export default {
  title: 'Basic/HelloWorld'
};

const Template = ({ label, ...args }) => {
  const {mxGraph, mxEvent, mxRubberband} = mxgraph;

  const container = document.createElement('div');
  container.style.position = 'relative';
  container.style.overflow = 'hidden';
  container.style.height = '241px';
  container.style.cursor = 'default';

  mxEvent.disableContextMenu(container);

  const graph = new mxGraph(container);

  new mxRubberband(graph);

  const parent = graph.getDefaultParent();

  graph.batchUpdate(() => {
    // Add cells to the model in a single step
    const vertex1 = graph.insertVertex({
      parent,
      value: 'Hello',
      position: [20, 20],
      size: [80, 30],
      relative: false,
    });
    const vertex2 = graph.insertVertex({
      parent,
      value: 'World!',
      position: [200, 150],
      size: [80, 30],
      relative: false,
    });
    const edge = graph.insertEdge({
      parent,
      // value: 'to the',
      source: vertex1,
      target: vertex2,
    });
  });

  return container;
}

export const Default = Template.bind({});