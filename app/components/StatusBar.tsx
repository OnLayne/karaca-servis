'use client';

import { Edit3, X } from 'lucide-react';

interface StatusBarProps {
  title: string;
  showEditIcon?: boolean;
  showCloseIcon?: boolean;
  onClose?: () => void;
  onEdit?: () => void;
  time?: string;
}

export function StatusBar({ 
  title, 
  showEditIcon = true, 
  showCloseIcon = true, 
  onClose,
  onEdit,
  time 
}: StatusBarProps) {
  const currentTime = time || new Date().toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="bg-[#1E40AF] text-white px-3 py-2">
      {/* Status bar - Time and signal */}
      <div className="flex justify-between items-center text-xs mb-2">
        <span className="font-semibold">{currentTime}</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            <div className="w-1 h-3 bg-white rounded-sm"></div>
            <div className="w-1 h-3 bg-white rounded-sm"></div>
            <div className="w-1 h-3 bg-white rounded-sm"></div>
            <div className="w-1 h-3 bg-white/50 rounded-sm"></div>
          </div>
          <span className="ml-1 font-semibold">94</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showEditIcon && (
            <button 
              onClick={onEdit}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        {showCloseIcon && (
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
