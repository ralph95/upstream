import React, { useState } from 'react';

const FDI_NUMBERS = [
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '31',
  '32',
  '33',
  '34',
  '35',
  '36',
  '37',
  '38',
  '41',
  '42',
  '43',
  '44',
  '45',
  '46',
  '47',
  '48',
];

const UNIVERSAL_NUMBERS = Array.from({ length: 32 }, (_, i) => String(i + 1));

export default function ToothSelector() {
  const [system, setSystem] = useState<'FDI' | 'UNI'>('FDI');
  const [selectedTooth, setSelectedTooth] = useState<string>('');

  const toothOptions = system === 'FDI' ? FDI_NUMBERS : UNIVERSAL_NUMBERS;

  return (
    <div className="flex items-center gap-2">
      {/* First dropdown — System */}
      <select
        value={system}
        onChange={e => {
          const newSystem = e.target.value as 'FDI' | 'UNI';
          setSystem(newSystem);
          setSelectedTooth('');
        }}
        className="rounded-md border border-[rgb(var(--text)/0.3)] bg-[rgb(var(--background))] px-2 py-1 text-sm text-[rgb(var(--text))] transition-colors hover:border-[rgb(var(--text)/0.6)] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--text)/0.5)]"
      >
        <option value="FDI">FDI</option>
        <option value="Universal">UNI</option>
      </select>

      {/* Second dropdown — Tooth Numbers */}
      <select
        value={selectedTooth}
        onChange={e => setSelectedTooth(e.target.value)}
        className="rounded-md border border-[rgb(var(--text)/0.3)] bg-[rgb(var(--background))] px-2 py-1 text-sm text-[rgb(var(--text))] transition-colors hover:border-[rgb(var(--text)/0.6)] focus:outline-none focus:ring-1 focus:ring-[rgb(var(--text)/0.5)]"
      >
        <option value=""></option>
        {toothOptions.map(tooth => (
          <option
            key={tooth}
            value={tooth}
            className="bg-[rgb(var(--background))] text-[rgb(var(--text))]"
          >
            {tooth}
          </option>
        ))}
      </select>
    </div>
  );
}
