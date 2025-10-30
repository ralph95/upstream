import React from 'react';
import type { ServicesManager } from '@ohif/core';

function WorkflowPanel({ servicesManager }: { servicesManager: ServicesManager }) {
  const ProgressDropdownWithService =
    servicesManager.services.customizationService.getCustomization(
      'progressDropdownWithServiceComponent'
    );

  return (
    <div
      data-cy={'workflow-panel'}
      className="mb-1 bg-[rgb(var(--secondary-dark))] px-3 py-4"
    >
      <div className="mb-1">Workflow</div>
      <div>
        <ProgressDropdownWithService servicesManager={servicesManager} />
      </div>
    </div>
  );
}

export default WorkflowPanel;
