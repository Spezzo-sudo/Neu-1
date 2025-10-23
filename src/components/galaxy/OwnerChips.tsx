import React from 'react';

export interface OwnerChipEntry {
  id: string;
  label: string;
  color: string;
}

interface OwnerChipsProps {
  owners: OwnerChipEntry[];
  extraCount: number;
}

/**
 * Displays a compact list of owner color chips with an optional overflow indicator.
 */
const OwnerChips: React.FC<OwnerChipsProps> = ({ owners, extraCount }) => (
  <div className="flex items-center gap-1" aria-label="Systembesitzer">
    {owners.map((owner) => (
      <span
        key={owner.id}
        className="inline-flex items-center gap-1 rounded-full border border-yellow-800/40 bg-black/40 px-2 py-0.5 text-xs text-yellow-100"
        style={{ boxShadow: `0 0 6px ${owner.color}55` }}
      >
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: owner.color }}
          aria-hidden
        />
        {owner.label}
      </span>
    ))}
    {extraCount > 0 && (
      <span className="inline-flex items-center rounded-full bg-yellow-800/30 px-1.5 py-0.5 text-[0.65rem] text-yellow-100">
        +{extraCount}
      </span>
    )}
  </div>
);

export default React.memo(OwnerChips);
