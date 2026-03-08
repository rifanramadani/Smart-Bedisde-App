/**
 * useVitalSigns.ts — Pure WebSocket, no dummy fallback
 *
 * Status:
 *   'connecting'   → sedang mencoba konek ke Python server
 *   'connected'    → konek, data Arduino mengalir
 *   'disconnected' → server tidak ditemukan / putus
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface VitalData {
  time: string;
  bpm: number;
  spo2: number;
  sys: number;
  dia: number;
  rr: number;
  skinTemp: number;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

const WS_URL        = (import.meta as any).env?.VITE_WS_URL ?? 'ws://localhost:8765';
const HISTORY_LIMIT = 30;

const EMPTY: VitalData = {
  time: '--:--:--', bpm: 0, spo2: 0, sys: 0, dia: 0, rr: 0, skinTemp: 0,
};

export function useVitalSigns() {
  const [current, setCurrent] = useState<VitalData>(EMPTY);
  const [history, setHistory] = useState<VitalData[]>([]);
  const [status,  setStatus]  = useState<ConnectionStatus>('connecting');

  const wsRef        = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef   = useRef(true);

  const pushData = useCallback((data: VitalData) => {
    setCurrent(data);
    setHistory(prev => {
      const next = [...prev, data];
      return next.length > HISTORY_LIMIT ? next.slice(-HISTORY_LIMIT) : next;
    });
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    setStatus('connecting');

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        setStatus('connected');
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(event.data as string);
          if (msg.type !== 'data') return;
          const v = msg.vitals ?? {};
          pushData({
            time:     new Date(msg.ts * 1000).toLocaleTimeString('en-US', {
                        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            bpm:      v.bpm       ?? 0,
            spo2:     v.spo2      ?? 0,
            sys:      v.systolic  ?? 0,
            dia:      v.diastolic ?? 0,
            rr:       v.resp_rate ?? 0,
            skinTemp: v.skin_temp ?? 0,
          });
        } catch { /* skip bad frame */ }
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        setStatus('disconnected');
        setCurrent(EMPTY);
        // Auto-retry setiap 5 detik
        reconnectRef.current = setTimeout(connect, 5000);
      };

      ws.onerror = () => ws.close();

    } catch {
      setStatus('disconnected');
      reconnectRef.current = setTimeout(connect, 5000);
    }
  }, [pushData]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { current, history, status };
  //                          ^^^^^^ 'connecting' | 'connected' | 'disconnected'
}
