import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { WaveformData } from '../hooks/useWaveforms';

interface SignalChartProps {
  data: WaveformData[];
  dataKey: keyof WaveformData;
  color: string;
  label1: string;
  label2: string;
}

export function SignalChart({ data, dataKey, color, label1, label2 }: SignalChartProps) {
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden px-2 py-1 sm:px-4 sm:py-2 min-h-[60px]">
      <div className="flex items-center justify-between mb-1 relative z-10">
        <h4 className="text-[10px] sm:text-xs md:text-sm font-bold tracking-widest truncate mr-2" style={{ color }}>{label1}</h4>
        <h4 className="text-[10px] sm:text-xs md:text-sm font-bold tracking-widest shrink-0" style={{ color }}>{label2}</h4>
      </div>
      
      <div className="flex-1 w-full relative z-10 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <YAxis domain={['auto', 'auto']} hide />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2} 
              dot={false} 
              isAnimationActive={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
