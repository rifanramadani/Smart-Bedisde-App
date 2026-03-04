import { useState, useEffect } from 'react';

export interface VitalData {
  time: string;
  bpm: number;
  spo2: number;
  sys: number;
  dia: number;
  rr: number;
  skinTemp: number;
}

export function useVitalSigns() {
  const [history, setHistory] = useState<VitalData[]>([]);
  const [current, setCurrent] = useState<VitalData>({
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    bpm: 75,
    spo2: 98,
    sys: 120,
    dia: 80,
    rr: 16,
    skinTemp: 36.5,
  });

  useEffect(() => {
    // Generate initial history (last 30 seconds)
    const initialHistory: VitalData[] = [];
    let lastBpm = 75;
    let lastSpo2 = 98;
    let lastSys = 120;
    let lastDia = 80;
    let lastRr = 16;
    let lastSkinTemp = 36.5;

    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 1000);
      initialHistory.push({
        time: time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        bpm: lastBpm,
        spo2: lastSpo2,
        sys: lastSys,
        dia: lastDia,
        rr: lastRr,
        skinTemp: lastSkinTemp,
      });
      // Slight random walk for historical data
      lastBpm = Math.max(60, Math.min(100, lastBpm + Math.floor(Math.random() * 5) - 2));
      lastSpo2 = Math.max(95, Math.min(100, lastSpo2 + Math.floor(Math.random() * 3) - 1));
      lastSys = Math.max(110, Math.min(130, lastSys + Math.floor(Math.random() * 7) - 3));
      lastDia = Math.max(70, Math.min(85, lastDia + Math.floor(Math.random() * 5) - 2));
      lastRr = Math.max(12, Math.min(20, lastRr + Math.floor(Math.random() * 3) - 1));
      lastSkinTemp = Math.max(36.0, Math.min(37.5, lastSkinTemp + (Math.random() * 0.2 - 0.1)));
    }
    
    setHistory(initialHistory);
    setCurrent(initialHistory[initialHistory.length - 1]);

    // Update every second
    const interval = setInterval(() => {
      setCurrent((prev) => {
        const newBpm = Math.max(60, Math.min(100, prev.bpm + Math.floor(Math.random() * 5) - 2));
        const newSpo2 = Math.max(95, Math.min(100, prev.spo2 + Math.floor(Math.random() * 3) - 1));
        const newSys = Math.max(110, Math.min(130, prev.sys + Math.floor(Math.random() * 7) - 3));
        const newDia = Math.max(70, Math.min(85, prev.dia + Math.floor(Math.random() * 5) - 2));
        const newRr = Math.max(12, Math.min(20, prev.rr + Math.floor(Math.random() * 3) - 1));
        const newSkinTemp = Math.max(36.0, Math.min(37.5, prev.skinTemp + (Math.random() * 0.2 - 0.1)));
        
        const newData = {
          time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          bpm: newBpm,
          spo2: newSpo2,
          sys: newSys,
          dia: newDia,
          rr: newRr,
          skinTemp: Number(newSkinTemp.toFixed(1)),
        };

        setHistory((prevHistory) => {
          const newHistory = [...prevHistory, newData];
          if (newHistory.length > 30) {
            newHistory.shift(); // Keep only last 30 seconds
          }
          return newHistory;
        });

        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return { current, history };
}
