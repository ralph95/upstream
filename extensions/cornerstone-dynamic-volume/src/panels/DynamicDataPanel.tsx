import React from 'react';
import PanelGenerateImage from './PanelGenerateImage';

function DynamicDataPanel({ servicesManager, commandsManager, tab }: withAppTypes) {
  return (
    <>
      <div
        className="flex flex-col text-[rgb(var(--text))]"
        data-cy={'dynamic-volume-panel'}
      >
        <PanelGenerateImage
          commandsManager={commandsManager}
          servicesManager={servicesManager}
        ></PanelGenerateImage>
      </div>
    </>
  );
}

export default DynamicDataPanel;
