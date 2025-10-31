import React from 'react';
import { useTranslation } from 'react-i18next';
import { PanelSection, Icons } from '../../index';
import DataRow from '../DataRow/DataRow';
import { createContext } from '../../lib/createContext';

interface MeasurementTableContext {
  data?: MeasurementItem[];
  onAction?: (e: any, command: string, value?: string, label?: string, uid?: string) => void;
  disableEditing?: boolean;
  isExpanded: boolean;
}

interface MeasurementItem {
  uid: string;
  label: string;
  value?: string;
  colorHex: string;
  isSelected: boolean;
  displayText: { primary: string[]; secondary: string[] };
  isVisible: boolean;
  isLocked: boolean;
  toolName: string;
  isExpanded: boolean;
  isUnmapped?: boolean;
  statusTooltip?: string;
}

const [MeasurementTableProvider, useMeasurementTableContext] =
  createContext<MeasurementTableContext>('MeasurementTable', { data: [], isExpanded: true });

interface MeasurementDataProps extends MeasurementTableContext {
  title: string;
}

const MeasurementTable = ({
  data = [],
  onAction,
  isExpanded = true,
  title,
  disableEditing = false,
}: MeasurementDataProps) => {
  const { t } = useTranslation('MeasurementTable');
  const amount = data.length;

  const exportTableData = () => {
    if (!data || data.length === 0) return;

    const exportData = data.map(item => {
      const measuredValue = item.value ?? item.displayText?.primary?.[0] ?? '(empty)';
      const label = item.label ?? '(empty)';

      return { label, value: measuredValue };
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'measurements.json';
    link.click();
  };

  return (
    <MeasurementTableProvider
      data={data}
      onAction={onAction}
      isExpanded={isExpanded}
      disableEditing={disableEditing}
    >
      <PanelSection defaultOpen={true}>
        <PanelSection.Header className="bg-[rgb(var(--secondary-dark))]">
          <span>{`${t(title)} (${amount})`}</span>
        </PanelSection.Header>
        <PanelSection.Content>
          <Body />
          <div className="mt-2">
            <button
              className="flex w-full items-center justify-center gap-1 rounded bg-[rgb(var(--primary-dark))] px-3 py-1 text-left text-white transition hover:bg-[rgb(var(--primary))]"
              onClick={exportTableData}
            >
              <Icons.Export className="h-4 w-4" />
              Export JSON
            </button>
          </div>
        </PanelSection.Content>
      </PanelSection>
    </MeasurementTableProvider>
  );
};

// Dental measurement buttons
const dentalButtons = [
  { type: 'PA length', value: 'periapicalLength' },
  { type: 'Canal angle', value: 'canalAngle' },
  { type: 'Crown width', value: 'crownWidth' },
  { type: 'Root length', value: 'rootLength' },
];

const Body = () => {
  const { data, onAction } = useMeasurementTableContext('MeasurementTable.Body');
  const [lastSelected, setLastSelected] = React.useState<string | null>(null);

  const addMeasurement = (type: string, value: string) => {
    setLastSelected(type);

    // Call onAction with a custom handler that adds the label from the button
    onAction?.(null, 'addMeasurement', value, type);
  };

  return (
    <div className="measurement-table-body flex h-[700px] flex-col space-y-2 overflow-y-auto">
      {/* Dental measurement buttons */}
      <div className="mb-2 flex flex-col gap-2">
        {dentalButtons.map(btn => {
          const isSelected = lastSelected === btn.type;
          return (
            <button
              key={btn.type}
              onClick={() => addMeasurement(btn.type, btn.value)}
              className="w-full rounded px-3 py-1 text-left transition"
              style={{
                backgroundColor: isSelected ? `rgb(var(--primary-dark))` : 'transparent',
                color: 'rgb(var(--text))',
              }}
            >
              {btn.type}
            </button>
          );
        })}
      </div>

      {/* Measurement rows */}
      {data && data.length > 0 ? (
        data.map((item, index) => (
          <Row
            key={item.uid}
            item={item}
            index={index}
          />
        ))
      ) : (
        <div className="text-primary-light flex-1 px-2 py-2 text-base">
          {lastSelected ? `Click detected: ${lastSelected}` : 'No tracked measurements'}
        </div>
      )}
    </div>
  );
};

const Row = ({ item, index }: { item: MeasurementItem; index: number }) => {
  const { onAction, disableEditing } = useMeasurementTableContext('MeasurementTable.Row');
  const { uid } = item;

  return (
    <DataRow
      key={uid}
      description={item.label}
      number={index + 1}
      title={item.label}
      colorHex={item.colorHex}
      isSelected={item.isSelected}
      details={item.displayText}
      onDelete={e => onAction?.(e, 'removeMeasurement', uid)}
      onSelect={e => onAction?.(e, 'jumpToMeasurement', uid)}
      onRename={e => onAction?.(e, 'renameMeasurement', uid)}
      onToggleVisibility={e => onAction?.(e, 'toggleVisibilityMeasurement', uid)}
      onToggleLocked={e => onAction?.(e, 'toggleLockMeasurement', uid)}
      onColor={e => onAction?.(e, 'changeMeasurementColor', uid)}
      disableEditing={disableEditing}
      isVisible={item.isVisible}
      isLocked={item.isLocked}
    >
      {item.isUnmapped && <DataRow.Status.Warning tooltip={item.statusTooltip} />}
    </DataRow>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const Footer = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

MeasurementTable.Header = Header;
MeasurementTable.Body = Body;
MeasurementTable.Footer = Footer;
MeasurementTable.Row = Row;

export default MeasurementTable;
