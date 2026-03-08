// src/components/Scanner.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/browser';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────

/** Payload JSON yang ada di dalam QR code dari Python server */
interface QRPayload {
  device_id: string;   // e.g. "VG-84920"
  token:     string;   // pairing token (16 hex chars)
  ws:        string;   // e.g. "wss://xxxx.ngrok.io"
  api:       string;   // e.g. "https://xxxx.ngrok.io" (API endpoint)
}

type PairingStatus = 'idle' | 'scanning' | 'verifying' | 'success' | 'failed';

type Props = {
  onResult?:    (text: string) => void;
  onError?:     (err: Error) => void;
  /** Dipanggil setelah pairing berhasil — kirim QRPayload ke parent (App.tsx) */
  onPaired?:    (payload: QRPayload) => void;
  autoStart?:   boolean;
  placeholder?: string;
};

// ── Helpers ───────────────────────────────────────────────────

/** Coba parse QR text sebagai JSON QRPayload, return null kalau bukan format kita */
function parseQRPayload(text: string): QRPayload | null {
  try {
    const obj = JSON.parse(text);
    if (obj.device_id && obj.token && obj.ws && obj.api) return obj as QRPayload;
    return null;
  } catch {
    return null;
  }
}

/** POST token ke Python API /pair untuk verifikasi */
async function verifyToken(apiUrl: string, token: string): Promise<{ success: boolean; reason: string; device_id?: string }> {
  const res = await fetch(`${apiUrl}/pair`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ token }),
  });
  return res.json();
}

// ── Component ─────────────────────────────────────────────────

export const Scanner: React.FC<Props> = ({
  onResult,
  onError,
  onPaired,
  autoStart   = false,
  placeholder,
}) => {
  const videoRef    = useRef<HTMLVideoElement | null>(null);
  const readerRef   = useRef<BrowserMultiFormatReader | null>(null);
  const processedRef = useRef(false);   // cegah scan ganda

  const [devices,          setDevices]          = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [running,          setRunning]          = useState<boolean>(autoStart);
  const [status,           setStatus]           = useState<string>('');
  const [permissionDenied, setPermissionDenied] = useState<boolean>(false);

  // State pairing
  const [pairingStatus,  setPairingStatus]  = useState<PairingStatus>('idle');
  const [pairingMsg,     setPairingMsg]     = useState<string>('');
  const [pairedPayload,  setPairedPayload]  = useState<QRPayload | null>(null);

  // ── Enumerate camera devices ────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const enumerate = async () => {
      if (!navigator.mediaDevices?.enumerateDevices) {
        setStatus('Browser tidak mendukung navigator.mediaDevices.enumerateDevices');
        return;
      }
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        if (!mounted) return;
        const cams = list.filter(d => d.kind === 'videoinput');
        setDevices(cams);
        if (cams.length > 0) {
          const preferred = cams.find(d => /back|rear|environment/i.test(d.label)) || cams[0];
          setSelectedDeviceId(preferred.deviceId);
        } else {
          setStatus('Tidak menemukan kamera pada perangkat ini.');
        }
      } catch (err: any) {
        setStatus('Gagal mengambil daftar perangkat: ' + (err?.message ?? String(err)));
      }
    };
    enumerate();
    return () => { mounted = false; };
  }, []);

  // ── Start / stop scanner ────────────────────────────────────
  useEffect(() => {
    if (running) {
      processedRef.current = false;   // reset tiap kali scanner dibuka
      startScanner().catch(err => {
        onError?.(err instanceof Error ? err : new Error(String(err)));
        setRunning(false);
      });
    } else {
      stopScanner();
    }
    return () => { stopScanner(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, selectedDeviceId]);

  // ── Handle QR result ─────────────────────────────────────────
  const handleQRResult = useCallback(async (text: string) => {
    // Cegah proses ganda
    if (processedRef.current) return;
    processedRef.current = true;

    // Hentikan kamera segera setelah QR terbaca
    setRunning(false);
    onResult?.(text);

    // Coba parse sebagai QR pairing kita
    const payload = parseQRPayload(text);

    if (!payload) {
      // QR bukan format pairing — tampilkan raw result saja
      setPairingStatus('failed');
      setPairingMsg(`QR terbaca, tapi bukan format pairing Smart Bedside.\nIsi: ${text}`);
      return;
    }

    // ── Verifikasi token ke Python API ────────────────────────
    setPairingStatus('verifying');
    setPairingMsg(`Memverifikasi token ke ${payload.api} ...`);

    try {
      const result = await verifyToken(payload.api, payload.token);

      if (result.success) {
        setPairingStatus('success');
        setPairedPayload(payload);
        setPairingMsg(`Device ${payload.device_id} berhasil dipasangkan!`);
        onPaired?.(payload);   // kirim ke App.tsx → update WS URL & device list
      } else {
        setPairingStatus('failed');
        setPairingMsg(`Verifikasi gagal: ${result.reason}`);
      }
    } catch (err: any) {
      setPairingStatus('failed');
      setPairingMsg(`Tidak dapat terhubung ke server: ${err?.message ?? String(err)}`);
    }
  }, [onResult, onPaired]);

  // ── Scanner implementation ───────────────────────────────────
  const startScanner = async () => {
    setStatus('Mengaktifkan kamera...');
    setPermissionDenied(false);
    setPairingStatus('scanning');
    setPairingMsg('');

    const codeReader = new BrowserMultiFormatReader();
    readerRef.current = codeReader;

    try {
      await codeReader.decodeFromVideoDevice(
        selectedDeviceId ?? undefined,
        videoRef.current!,
        (result: Result | undefined, err: any) => {
          if (result) {
            handleQRResult(result.getText());
          }
          if (err && err.name && err.name !== 'NotFoundException') {
            onError?.(err instanceof Error ? err : new Error(String(err)));
          }
        }
      );
      setStatus('Mencari QR... arahkan kamera ke QR code');
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setPermissionDenied(true);
        setStatus('Izin kamera ditolak.');
      } else {
        setStatus('Gagal mengaktifkan kamera: ' + (err?.message ?? String(err)));
      }
      onError?.(err instanceof Error ? err : new Error(String(err)));
      try { codeReader.reset(); } catch { /* ignore */ }
      readerRef.current = null;
      throw err;
    }
  };

  const stopScanner = () => {
    try {
      readerRef.current?.reset();
      readerRef.current = null;
      const el = videoRef.current;
      if (el?.srcObject) {
        (el.srcObject as MediaStream).getTracks().forEach(t => t.stop());
        el.srcObject = null;
      }
    } catch { /* ignore */ }
  };

  const resetScanner = () => {
    setPairingStatus('idle');
    setPairingMsg('');
    setPairedPayload(null);
    processedRef.current = false;
  };

  const deviceLabel = (d: MediaDeviceInfo) =>
    d.label?.trim() || `Camera (${d.deviceId.slice(0, 6)})`;

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="p-4 space-y-4">

      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          onClick={() => {
            resetScanner();
            setRunning(r => !r);
          }}
          disabled={pairingStatus === 'verifying'}
          className={`px-4 py-2 rounded-xl font-medium transition disabled:opacity-50
            ${running ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}
        >
          {running ? 'Stop Camera' : pairingStatus === 'success' ? 'Scan Ulang' : 'Open Camera'}
        </button>

        {devices.length > 1 && (
          <select
            value={selectedDeviceId ?? ''}
            onChange={e => setSelectedDeviceId(e.target.value || null)}
            className="bg-slate-800 text-white px-3 py-2 rounded-lg text-sm"
          >
            {devices.map(d => (
              <option key={d.deviceId} value={d.deviceId}>{deviceLabel(d)}</option>
            ))}
          </select>
        )}

        <span className="text-sm text-slate-400">
          {permissionDenied
            ? 'Izin kamera ditolak — aktifkan di pengaturan browser.'
            : status || placeholder || (running ? 'Mencari QR...' : 'Klik "Open Camera" untuk memulai')}
        </span>
      </div>

      {/* ── Video preview ── */}
      {(running || pairingStatus === 'scanning') && (
        <div className="w-full max-w-3xl bg-black rounded-xl overflow-hidden relative">
          <video
            ref={videoRef}
            style={{ width: '100%', display: 'block' }}
            muted playsInline autoPlay
          />
          {/* scan frame overlay */}
          <div
            aria-hidden
            style={{
              position: 'absolute', left: '50%', top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60%', height: '36%',
              border: '2px solid rgba(16,185,129,0.7)',
              borderRadius: 8, pointerEvents: 'none',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
            }}
          />
          <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-emerald-400 font-medium">
            Arahkan QR code ke dalam kotak hijau
          </p>
        </div>
      )}

      {/* ── Pairing status feedback ── */}
      {pairingStatus === 'verifying' && (
        <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
          <Loader className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
          <p className="text-sm text-slate-300">{pairingMsg}</p>
        </div>
      )}

      {pairingStatus === 'success' && pairedPayload && (
        <div className="bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-emerald-300 font-semibold">Pairing Berhasil!</p>
          </div>
          <div className="text-sm text-slate-300 space-y-1 pl-7">
            <p><span className="text-slate-500">Device ID :</span> <span className="font-mono text-white">{pairedPayload.device_id}</span></p>
            <p><span className="text-slate-500">WebSocket :</span> <span className="font-mono text-emerald-400">{pairedPayload.ws}</span></p>
            <p><span className="text-slate-500">API       :</span> <span className="font-mono text-slate-400">{pairedPayload.api}</span></p>
          </div>
          <p className="text-xs text-slate-500 pl-7">
            App sekarang terhubung ke device ini. Buka tab Live Monitor untuk melihat data.
          </p>
        </div>
      )}

      {pairingStatus === 'failed' && (
        <div className="bg-rose-950 border border-rose-700 rounded-xl px-4 py-4 space-y-2">
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="text-rose-300 font-semibold">Pairing Gagal</p>
          </div>
          <p className="text-sm text-slate-400 pl-7 whitespace-pre-wrap">{pairingMsg}</p>
          <button
            onClick={() => { resetScanner(); setRunning(true); }}
            className="ml-7 mt-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition"
          >
            Coba Scan Ulang
          </button>
        </div>
      )}

    </div>
  );
};

export default Scanner;
