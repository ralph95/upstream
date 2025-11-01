import React from 'react';
import { useTranslation } from 'react-i18next';
import { PanelSection, Icons } from '../../index';
import { createContext } from '../../lib/createContext';
import { useRunCommand } from '@ohif/core/src';

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
        </PanelSection.Content>
      </PanelSection>
    </MeasurementTableProvider>
  );
};

const dentalButtons = [
  { type: 'PA length', value: 'periapicalLength' },
  { type: 'Canal angle', value: 'canalAngle' },
  { type: 'Crown width', value: 'crownWidth' },
  { type: 'Root length', value: 'rootLength' },
];

const Body = () => {
  const { data, onAction } = useMeasurementTableContext('MeasurementTable.Body');
  const [lastSelected, setLastSelected] = React.useState<string | null>(null);
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'label',
    direction: 'asc',
  });
  const [filterType, setFilterType] = React.useState<string>('All');

  const runCommand = useRunCommand();

  /** Add measurement **/
  const addMeasurement = (type: string, value: string) => {
    setLastSelected(type);
    const toolName = type === 'Canal angle' ? 'Angle' : 'Length';
    runCommand('setToolActive', { toolName, toolGroupId: 'default' });
    onAction?.(null, 'addMeasurement', value, type);
  };

  /** Handle sorting toggle **/
  const handleSort = (key: string) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  /** Sorted and filtered data **/
  const filteredData = React.useMemo(() => {
    let tempData = data ?? [];
    if (filterType !== 'All') {
      tempData = tempData.filter(item => {
        if (item.toolName === 'Angle' && filterType === 'Canal angle') return true;
        if (item.toolName === 'Length' && filterType === 'PA length') return true;
        return item.label === filterType;
      });
    }

    const sorted = [...tempData];
    sorted.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortConfig.key) {
        case 'index':
          aVal = tempData.indexOf(a);
          bVal = tempData.indexOf(b);
          break;
        case 'label':
          aVal = a.label?.toLowerCase() ?? '';
          bVal = b.label?.toLowerCase() ?? '';
          break;
        case 'value': {
          const valA = a.value ?? a.displayText?.primary?.[0] ?? '';
          const valB = b.value ?? b.displayText?.primary?.[0] ?? '';

          const numA = parseFloat(valA);
          const numB = parseFloat(valB);

          if (!isNaN(numA) && !isNaN(numB)) {
            aVal = numA;
            bVal = numB;
          } else {
            aVal = valA.toLowerCase();
            bVal = valB.toLowerCase();
          }
          break;
        }
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortConfig, filterType]);

  /** Export the currently sorted & filtered data **/
  const exportTableData = () => {
    if (!filteredData || filteredData.length === 0) return;

    const exportData = filteredData.map((item, index) => {
      const measuredValue = item.value ?? item.displayText?.primary?.[0] ?? '(empty)';
      return {
        index: index + 1,
        label:
          item.toolName === 'Angle'
            ? 'Canal angle'
            : item.toolName === 'Length'
              ? 'PA length'
              : (item.label ?? '(empty)'),
        value: measuredValue,
      };
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'measurements_sorted.json';
    link.click();
  };

  /** Sort arrow indicator **/
  const SortArrow = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return null;
    return (
      <span className="ml-1 select-none text-xs">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
    );
  };

  /** Extract all types for dropdown options **/
  const typeOptions = React.useMemo(() => {
    const types = new Set<string>();
    data?.forEach(item => {
      if (item.toolName === 'Angle') types.add('Canal angle');
      else if (item.toolName === 'Length') types.add('PA length');
      else if (item.label) types.add(item.label);
    });
    return ['All', ...Array.from(types)];
  }, [data]);

  return (
    <div className="measurement-table-body flex h-[700px] flex-col space-y-2 overflow-y-auto">
      {/* Measurement Tool Buttons */}
      <div className="mb-2 flex flex-col gap-2">
        {dentalButtons.map(btn => {
          const isSelected = lastSelected === btn.type;
          return (
            <button
              key={btn.type}
              onClick={() => addMeasurement(btn.type, btn.value)}
              className={`w-full rounded px-3 py-1 text-left transition ${
                isSelected ? 'bg-[rgb(var(--primary-dark))]' : 'hover:bg-[rgb(var(--secondary))]'
              }`}
              style={{ color: 'rgb(var(--text))' }}
            >
              {btn.type}
            </button>
          );
        })}
      </div>

      {/* Dropdown Filter */}
      <div className="mb-2">
        <label className="mr-2 font-medium">Filter by Type:</label>
        <select
          className="rounded border border-gray-600 bg-[rgb(var(--background))] px-3 py-1 text-[rgb(var(--text))] transition-colors hover:bg-[rgb(var(--secondary-dark))]"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          {typeOptions.map(type => (
            <option
              key={type}
              value={type}
            >
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Measurement Table */}
      {filteredData.length > 0 ? (
        <>
          <table className="min-w-full rounded border border-gray-600 text-sm">
            <thead className="text--[rgb(var(--text)) sticky top-0 z-10 select-none bg-[rgb(var(--primary-dark))]">
              <tr>
                <th
                  className="cursor-pointer px-3 py-2 text-left hover:bg-[rgb(var(--secondary))]"
                  onClick={() => handleSort('index')}
                >
                  # <SortArrow column="index" />
                </th>
                <th
                  className="cursor-pointer px-3 py-2 text-left hover:bg-[rgb(var(--secondary))]"
                  onClick={() => handleSort('label')}
                >
                  Type <SortArrow column="label" />
                </th>
                <th
                  className="cursor-pointer px-3 py-2 text-left hover:bg-[rgb(var(--secondary))]"
                  onClick={() => handleSort('value')}
                >
                  Value <SortArrow column="value" />
                </th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <Row
                  key={item.uid}
                  item={item}
                  index={index}
                />
              ))}
            </tbody>
          </table>

          {/* Export Button */}
          <div className="mt-3">
            <button
              className="text--[rgb(var(--text)) flex w-full items-center justify-center gap-1 rounded bg-[rgb(var(--primary-dark))] px-3 py-1 transition hover:bg-[rgb(var(--primary))]"
              onClick={exportTableData}
            >
              <Icons.Export className="h-4 w-4" />
              Export JSON (Sorted & Filtered)
            </button>
          </div>
        </>
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
  const primaryValue = item.value ?? item.displayText?.primary?.[0] ?? '(empty)';

  return (
    <tr
      className={`border-b border-gray-700 ${
        item.isSelected ? 'bg-[rgb(var(--primary-dark))]' : 'hover:bg-[rgb(var(--secondary))]'
      }`}
    >
      <td className="px-3 py-2">{index + 1}</td>
      {(() => {
        if (item.toolName === 'Angle') return 'Canal angle';
        if (item.toolName === 'Length') return 'PA length';
        return item.label || '(Unknown)';
      })()}
      <td className="px-3 py-2">{primaryValue}</td>
      <td className="flex gap-2 px-3 py-2">
        {!disableEditing && (
          <button
            className="text-red-400 hover:text-red-200"
            onClick={e => onAction?.(e, 'removeMeasurement', item.uid)}
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const Footer = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

MeasurementTable.Header = Header;
MeasurementTable.Body = Body;
MeasurementTable.Footer = Footer;
MeasurementTable.Row = Row;

export default MeasurementTable;
