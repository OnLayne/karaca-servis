'use client';

import { useEffect } from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: string;
}

export function Popup({ isOpen, onClose, title, children, height = '50%' }: PopupProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Popup Content */}
      <div 
        className={cn(
          "relative w-full bg-[#1F2937] rounded-t-[2rem] popup-animate overflow-hidden",
          "flex flex-col"
        )}
        style={{ height }}
      >
        {/* Checkmark icon at top */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Title */}
        {title && (
          <div className="px-4 pb-3 border-b border-gray-600">
            <h3 className="text-white text-center text-lg font-medium">{title}</h3>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Close button at bottom */}
        <div className="p-4 border-t border-gray-600 bg-[#1F2937]">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-xl font-medium transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
