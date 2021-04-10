import React, { useState } from 'react';

import SourceCodeDisplay from './SourceCodeDisplay';
import examplesListing from './examplesListing.json';

function Preview({ sourceKey, content }) {
  const [sourceShown, setSourceShown] = useState(false);

  return (
    <>
      {content}

      {sourceShown ? (
        <div>
          <span
            onClick={() => setSourceShown(false)}
            style={{ float: 'right', color: 'blue', cursor: 'pointer' }}
          >
            hide source
          </span>
          <div
            style={{
              clear: 'both',
              resize: 'both',
              maxHeight: '50vh',
              overflow: 'auto',
            }}
          >
            <SourceCodeDisplay
              language="jsx"
              code={examplesListing[sourceKey] || "(Example code isn't in examplesListing.json - run 'python3 copy_examples_to_json.py' to update" }
            />
          </div>
        </div>
      ) : (
        <div>
          <span
            onClick={() => setSourceShown(true)}
            style={{ float: 'right', color: 'blue', cursor: 'pointer' }}
          >
            show source
          </span>
        </div>
      )}
    </>
  );
}

export default Preview;
