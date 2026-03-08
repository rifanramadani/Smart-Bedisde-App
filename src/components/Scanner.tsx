// src/components/Scanner.tsx
import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/browser';

type Props = {
  onResult?: (text: string) => void;
  onError?: (err: Error) => void;
  /**
   * Jika ingin auto-start saat mount (opsional)
   */
  autoStart?: boolean;
  /**
   * Placeholder teks ketika belum ada kamera / permission ditolak
   */
  placeholder?: string;
};

export const Scanner: React.FC<Props> = ({ onResult, onError, autoStart = false, placeholder }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [running, setRunning] = useState<boolean>(autoStart);
  const [status, setStatus] = useState<string>('');
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  // Enumerate devices (labels may be empty until permission granted)
  useEffect(() => {
    let mounted = true;
    const enumerate = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setStatus('Browser tidak mendukung navigator.mediaDevices.enumerateDevices');
        return;
      }
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        if (!mounted) return;
        const cams = list.filter(d => d.kind === 'videoinput');
        setDevices(cams);
        if (cams.length > 0) {
          // pilih kamera belakang bila ada label yang cocok, fallback ke device pertama
          const preferred = cams.find(d => /back|rear|environment/i.test(d.label)) || cams[0];
          setSelectedDeviceId(preferred.deviceId);
        } else {
          setStatus('Tidak menemukan kamera pada perangkat ini.');
        }
      } catch (err: any) {
        console.error('enumerateDevices error', err);
        setStatus('Gagal mengambil daftar perangkat: ' + (err?.message ?? String(err)));
      }
    };

    enumerate();
    return () => { mounted = false; };
  }, []);

  // Start / stop side-effects
  useEffect(() => {
    if (running) {
      startScanner().catch(err => {
        console.error('startScanner failed', err);
        onError?.(err instanceof Error ? err : new Error(String(err)));
        setRunning(false);
      });
    } else {
      stopScanner();
    }

    // cleanup on unmount
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, selectedDeviceId]);

  // Start scanner implementation
  const startScanner = async () => {
    setStatus('Mengaktifkan kamera...');
    setPermissionDenied(false);

    // Create reader
    const codeReader = new BrowserMultiFormatReader();
    readerRef.current = codeReader;

    try {
      // If no device selected, pass undefined to let library pick default
      await codeReader.decodeFromVideoDevice(
        selectedDeviceId ?? undefined,
        videoRef.current!,
        (result: Result | undefined, err: any) => {
          if (result) {
            // result found
            try {
              onResult?.(result.getText());
            } catch (cbErr) {
              console.error('onResult callback error', cbErr);
            }
          }
          // err is frequently populated with NotFoundException while scanning; ignore noisy ones
          if (err && err.name && err.name !== 'NotFoundException') {
            // serious error -> bubble up
            console.error('Scanner runtime error', err);
            onError?.(err instanceof Error ? err : new Error(String(err)));
          }
        }
      );

      // Wait a tick to see if permission was denied (browser may throw)
      setStatus('Mencari QR... arahkan kamera ke QR code');
    } catch (err: any) {
      console.error('decodeFromVideoDevice error', err);
      // If user denied permission, browsers may throw a DOMException with name 'NotAllowedError'
      if (err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        setPermissionDenied(true);
        setStatus('Izin kamera ditolak. Izinkan akses kamera di pengaturan browser.');
      } else {
        setStatus('Gagal mengaktifkan kamera: ' + (err?.message ?? String(err)));
      }
      onError?.(err instanceof Error ? err : new Error(String(err)));
      // ensure we cleanup
      try { codeReader.reset(); } catch (e) { /* ignore */ }
      readerRef.current = null;
      throw err;
    }
  };

  // Stop scanner & media tracks
  const stopScanner = () => {
    setStatus('Kamera berhenti');
    try {
      if (readerRef.current) {
        try { readerRef.current.reset(); } catch (e) { /* ignore */ }
        readerRef.current = null;
      }
      // stop any tracks attached to the video element
      const videoEl = videoRef.current;
      if (videoEl && videoEl.srcObject) {
        const s = videoEl.srcObject as MediaStream;
        s.getTracks().forEach(t => {
          try { t.stop(); } catch (e) { /* ignore */ }
        });
        videoEl.srcObject = null;
      }
    } catch (e) {
      console.warn('stopScanner cleanup failed', e);
    }
  };

  // Helper: manual toggle
  const toggleRunning = () => {
    setRunning(r => !r);
  };

  // UI for device select: if labels empty, show truncated id
  const deviceLabel = (d: MediaDeviceInfo) => {
    if (d.label && d.label.trim().length > 0) return d.label;
    // fallback: short deviceId
    return `Camera (${d.deviceId.slice(0, 6)})`;
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleRunning}
            className={`px-4 py-2 rounded-xl font-medium transition ${running ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}
          >
            {running ? 'Stop Camera' : 'Open Camera'}
          </button>
          {devices.length > 1 && (
            <select
              value={selectedDeviceId ?? ''}
              onChange={(e) => setSelectedDeviceId(e.target.value || null)}
              className="bg-slate-800 text-white px-3 py-2 rounded-lg"
            >
              {devices.map(d => (
                <option key={d.deviceId} value={d.deviceId}>
                  {deviceLabel(d)}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mt-2 sm:mt-0 text-sm text-slate-400">
          {permissionDenied ? (
            <span>
              Izin kamera ditolak — <strong>aktifkan izin camera</strong> di pengaturan browser dan muat ulang halaman.
            </span>
          ) : (
            <span>{status || placeholder || (running ? 'Mencari QR...' : 'Klik "Open Camera" untuk memulai')}</span>
          )}
        </div>
      </div>

      <div className="w-full max-w-3xl bg-black rounded overflow-hidden relative">
        {/* video preview */}
        <video
          ref={videoRef}
          style={{ width: '100%', height: '100%', display: 'block' }}
          muted
          playsInline
          autoPlay
        />

        {/* scanning frame */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            height: '36%',
            border: '2px solid rgba(255,255,255,0.45)',
            borderRadius: 8,
            pointerEvents: 'none'
          }}
        />
      </div>

      {/* fallback manual input */}
      <div className="mt-3 text-sm text-slate-400">
        <div>
          Jika kamera tidak tersedia atau izin ditolak, gunakan input manual atau hubungkan perangkat lain.
        </div>
      </div>
    </div>
  );
};

export default Scanner;
