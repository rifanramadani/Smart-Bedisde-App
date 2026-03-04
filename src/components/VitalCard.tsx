import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface VitalCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  status?: 'normal' | 'warning' | 'critical';
  description?: string;
}

export function VitalCard({ title, value, unit, icon: Icon, colorClass, bgClass, status = 'normal', description }: VitalCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-sm transition-all hover:border-slate-700">
      {/* Background Glow */}
      <div className={cn("absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20", bgClass)} />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl bg-slate-950 border border-slate-800", colorClass)}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</h3>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {status === 'normal' && (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </>
            )}
            {status === 'warning' && (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </>
            )}
            {status === 'critical' && (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mt-2">
        <span className={cn("text-5xl font-bold tracking-tight", colorClass)}>{value}</span>
        <span className="text-lg font-medium text-slate-500">{unit}</span>
      </div>
      
      {description && (
        <p className="mt-4 text-xs text-slate-500 font-medium">
          {description}
        </p>
      )}
    </div>
  );
}
