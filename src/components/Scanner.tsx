// FILE: src/components/Scanner.tsx
import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/browser';

type Props = {
  onResult?: (text: string) => void;
  onError?: (err: Error) => void;
};

export const Scanner: React.FC<Props> = ({ onResult, onError }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [running, setRunning] = useState(false);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  // enumerate cameras (labels might be empty until permission is granted)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        if (!mounted) return;
        const cams = list.filter(d => d.kind === 'videoinput');
        setDevices(cams);
        if (cams.length > 0) {
          // prefer back camera (label may include 'back' or 'rear')
          const preferred = cams.find(d => /back|rear|environment/i.test(d.label)) || cams[0];
          setSelectedDeviceId(preferred.deviceId);
        }
      } catch (err) {
        console.error('enumerateDevices error', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!running) return;
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    const start = async () => {
      try {
        // decodeFromVideoDevice accepts undefined to let it pick a default device
        await codeReader.decodeFromVideoDevice(
          selectedDeviceId ?? undefined,
          videoRef.current!,
          (result: Result | undefined, err: any) => {
            if (result) {
              onResult?.(result.getText());
            }
            // `err` will be set frequently while scanning (NotFoundException) — ignore noisy errors
            if (err && typeof err !== 'undefined' && err.name && err.name !== 'NotFoundException') {
              // bubble up serious errors
              onError?.(err);
            }
          }
        );
      } catch (err: any) {
        console.error('start scanner error', err);
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    };

    start();

    return () => {
      try { codeReader.reset(); } catch (e) { /* ignore */ }
    };
  }, [running, selectedDeviceId, onResult, onError]);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (codeReaderRef.current) {
        try { codeReaderRef.current.reset(); } catch (e) { /* ignore */ }
      }
    };
  }, []);

  return (
    <div className="p-4">
      <div className="flex gap-2 items-center mb-3">
        <button
          onClick={() => setRunning(r => !r)}
          className={`px-4 py-2 rounded-xl font-medium transition ${running ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}
        >
          {running ? 'Stop Camera' : 'Open Camera'}
        </button>

        {devices.length > 1 && (
          <select
            value={selectedDeviceId ?? ''}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="bg-slate-800 text-white px-3 py-2 rounded-lg"
          >
            {devices.map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || d.deviceId}</option>
            ))}
          </select>
        )}

        <div className="text-sm text-slate-400">{running ? 'Camera aktif — arahkan ke QR code' : 'Klik "Open Camera" untuk mengaktifkan'}</div>
      </div>

      <div className="w-full max-w-xl bg-black rounded overflow-hidden relative">
        <video ref={videoRef} style={{ width: '100%', height: '100%' }} muted playsInline />
        {/* simple scanning frame */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '60%', height: '36%', border: '2px solid rgba(255,255,255,0.45)', borderRadius: 8, pointerEvents: 'none' }} />
      </div>
    </div>
  );
};

export default Scanner;
