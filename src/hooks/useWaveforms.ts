/**
 * useWaveforms.ts — Pure WebSocket, no dummy fallback
 *
 * Saat tidak konek ke Python server → return array kosong []
 * Saat konek → stream waveform ECG / RR / Pleth dari Arduino
 */

import { useState, useEffect, useRef } from 'react';

export interface WaveformData {
  time: number;
  ecg:  number;
  rr:   number;
  pcg:  number;  // pleth dari Arduino (irRaw ternormalisasi)
}

const WS_URL     = (import.meta as any).env?.VITE_WS_URL ?? 'ws://localhost:8765';
const MAX_POINTS = 150;

export function useWaveforms(): WaveformData[] {
  const [data, setData] = useState<WaveformData[]>([]);

  const tickRef      = useRef(0);
  const wsRef        = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef   = useRef(true);

  const appendPoints = (points: WaveformData[]) => {
    setData(prev => {
      const next = [...prev, ...points];
      return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
    });
  };

  const connect = () => {
    if (!mountedRef.current) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setData([]); // bersihkan buffer lama saat reconnect
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(event.data as string);
          if (msg.type !== 'data') return;

          const wf       = msg.waveforms ?? {};
          const ecgArr:   number[] = wf.ecg   ?? [];
          const rrArr:    number[] = wf.rr    ?? [];
          const plethArr: number[] = wf.pleth ?? [];

          const len = Math.max(ecgArr.length, rrArr.length, plethArr.length);
          if (len === 0) return;

          const points: WaveformData[] = [];
          for (let i = 0; i < len; i++) {
            tickRef.current += 1;
            points.push({
              time: tickRef.current,
              ecg:  ecgArr[i]   ?? 0,
              rr:   rrArr[i]    ?? 0,
              pcg:  plethArr[i] ?? 0,
            });
          }
          appendPoints(points);

        } catch { /* skip bad frame */ }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setData([]); // kosongkan chart saat putus
        reconnectRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => ws.close();

    } catch {
      reconnectRef.current = setTimeout(connect, 5000);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return data;
}
