import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { VitalData } from '../hooks/useVitalSigns';

interface VitalsChartProps {
  data: VitalData[];
}

export function VitalsChart({ data }: VitalsChartProps) {
  return (
    <div className="h-full w-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#64748b" 
            fontSize={12} 
            tickMargin={10}
            tick={{ fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis 
            yAxisId="left" 
            stroke="#64748b" 
            fontSize={12} 
            domain={[40, 140]} 
            tick={{ fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickCount={6}
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#64748b" 
            fontSize={12} 
            domain={[90, 100]} 
            tick={{ fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            tickCount={6}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '0.5rem',
              color: '#f8fafc',
            }}
            itemStyle={{ color: '#f8fafc' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '0.25rem' }}
          />
          {/* Normal ranges reference lines */}
          <ReferenceLine y={60} yAxisId="left" stroke="#334155" strokeDasharray="3 3" />
          <ReferenceLine y={100} yAxisId="left" stroke="#334155" strokeDasharray="3 3" />
          
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="bpm"
            name="Heart Rate (BPM)"
            stroke="#f43f5e" // rose-500
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#f43f5e', stroke: '#0f172a', strokeWidth: 2 }}
            isAnimationActive={false}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="spo2"
            name="SpO2 (%)"
            stroke="#22d3ee" // cyan-400
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#22d3ee', stroke: '#0f172a', strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
