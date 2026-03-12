'use client';

import { cn } from '../lib/utils';

interface ListItemProps {
  label: string;
  isSelected?: boolean;
  onClick: () => void;
}

export function ListItem({ label, isSelected, onClick }: ListItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 text-white text-base border-b border-gray-600",
        "hover:bg-gray-600/50 transition-colors",
        "last:border-b-0",
        isSelected && "bg-blue-600/30 text-blue-300"
      )}
    >
      {label}
    </button>
  );
}
