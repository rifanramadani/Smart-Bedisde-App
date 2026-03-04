import { useState, useEffect } from 'react';

export interface WaveformData {
  time: number;
  ecg: number;
  rr: number;
  pcg: number;
}

export function useWaveforms() {
  const [data, setData] = useState<WaveformData[]>([]);

  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick += 1;
      
      // 1. ECG Simulation (P-QRS-T wave)
      const ecgBase = Math.sin(tick * 0.1) * 0.05;
      let ecgSpike = 0;
      const cycle = tick % 100;
      if (cycle > 85 && cycle < 88) ecgSpike = -0.2; // Q
      else if (cycle >= 88 && cycle < 92) ecgSpike = 1.8; // R
      else if (cycle >= 92 && cycle < 96) ecgSpike = -0.4; // S
      else if (cycle > 20 && cycle < 40) ecgSpike = Math.sin((cycle - 20) * Math.PI / 20) * 0.25; // T wave
      else if (cycle > 60 && cycle < 75) ecgSpike = Math.sin((cycle - 60) * Math.PI / 15) * 0.15; // P wave
      const ecg = ecgBase + ecgSpike + (Math.random() * 0.03);

      // 2. RR Signal (Respiration - sinus wave)
      const rr = Math.sin(tick * 0.05) * 0.8 + (Math.random() * 0.05);

      // 3. PCG Signal (Spike-like, sync with ECG R wave)
      let pcg = (Math.random() - 0.5) * 0.1; // baseline noise
      if (cycle >= 88 && cycle < 94) {
        pcg += (Math.random() - 0.5) * 2.5; // S1 sound (systole)
      } else if (cycle >= 30 && cycle < 38) {
        pcg += (Math.random() - 0.5) * 1.5; // S2 sound (diastole)
      }

      setData(prev => {
        const newData = [...prev, { time: tick, ecg, rr, pcg }];
        if (newData.length > 150) newData.shift(); // Keep last 150 points for smooth scrolling
        return newData;
      });
    }, 40); // ~25fps

    return () => clearInterval(interval);
  }, []);

  return data;
}
