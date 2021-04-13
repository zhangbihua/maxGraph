# mxGraph Examples

This directory contains modified examples for mxGraph.
The original examples can be found at
https://jgraph.github.io/mxgraph/javascript/index.html.

The main ways in which it differs from the original 
samples are that the examples have been refactored and 
converted to React with templates+logic code separated.  

The JavaScript prototypes of mxGraph classes have also been 
replaced with subclasses to not make configuration
global for other mxGraph configurations on the same page.

## How to View/Run Examples

The examples are grouped by category tabs in the React 
application, which you can view live at 
https://mxgraph-mcyph.vercel.app/ or run locally by 
typing the following:

    cd src
    npm install
    npm run dev

From this project's root directory on the command line.
Note that this next application has a different `package.json`
and dependencies to the core mxGraph library, whose 
`package.json` is located in the root directory of this 
project.

## Development Status+Plans

Some of the examples are yet to be converted: these can
be found in the `/docs/stashed` folder.

To add new tabs, go to `PageTabs.js` and add the route 
and text of the tab to the list. Note that the examples
are served by next.js and the routes correspond to the
subdirectories, e.g. "/effects" will include 
`/src/pages/effects/index.js`.

To update the source code previews displayed in `Previews.js` 
after modifying the examples, run `python3 copy_examples_to_json.py`.

There are plans to remove the react+next example 
dependencies: see also https://github.com/jsGraph/mxgraph/issues/8 
for the full discussion. 

