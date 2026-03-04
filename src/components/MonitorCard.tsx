import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MonitorCardProps {
  title: string;
  titleColor: string;
  value: string | number;
  valueColor: string;
  unit: string;
  unitColor: string;
  icon: LucideIcon;
  iconColor: string;
  extraLabel?: string;
  extraLabelColor?: string;
  boxColor?: string;
}

export function MonitorCard({
  title, titleColor, value, valueColor, unit, unitColor, icon: Icon, iconColor, extraLabel, extraLabelColor, boxColor
}: MonitorCardProps) {
  return (
    <div className={`border ${boxColor || 'border-slate-800'} bg-black p-2 sm:p-3 flex flex-col justify-between h-full w-full overflow-hidden`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col min-w-0 flex-1">
          <span className={`text-[10px] sm:text-xs md:text-sm font-bold truncate ${titleColor}`}>{title}</span>
          {extraLabel && <span className={`text-[9px] sm:text-[10px] md:text-xs font-bold truncate ${extraLabelColor}`}>{extraLabel}</span>}
        </div>
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 shrink-0 ${iconColor}`} />
      </div>
      <div className="flex items-baseline justify-end gap-1 sm:gap-2 mt-1 sm:mt-2">
        <span className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-none tracking-tight ${valueColor}`}>{value}</span>
        <span className={`text-xs sm:text-sm md:text-base lg:text-lg font-bold ${unitColor}`}>{unit}</span>
      </div>
    </div>
  );
}
