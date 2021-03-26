import Link from 'next/link';

const PageTabs = ({ curPageURL, children }) => {
  const allPages = [
    ['/basic', 'Basic'],
    ['/backgrounds', 'Backgrounds'],
    ['/connections', 'Connections'],
    ['/dnd_copypaste', 'Drag-and-drop/copy-paste'],
    ['/editing', 'Editing'],
    ['/effects', 'Effects'],
    ['/events', 'Events'],
    ['/icons_images', 'Icons/Images'],
    ['/labels', 'Labels'],
    ['/layout', 'Layout'],
    ['/misc', 'Miscellaneous'],
    ['/printing', 'Printing'],
    ['/shapes_stencils', 'Shapes/stencils'],
    ['/styles', 'Styles'],
    ['/toolbars', 'Toolbars'],
    ['/windows', 'Windows'],
    ['/xml_json', 'XML/JSON'],
    ['/zoom_offpage', 'Zoom/offpage'],
  ];

  const tabs = [];
  for (const [pageURL, pageName] of allPages) {
    tabs.push(
      <li className={curPageURL === pageURL ? 'active' : ''}>
        <Link href={pageURL}>
          <a>{pageName}</a>
        </Link>
      </li>
    );
  }

  return (
    <div
      style={{
        width: '900px',
        margin: '0 auto',
      }}
    >
      <h1>mxGraph Reloaded Examples</h1>
      <ul className="pagetabs">{tabs}</ul>
      {children}
    </div>
  );
};

export default PageTabs;
