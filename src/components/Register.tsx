import React, { useState } from 'react';
import { Activity, User, FileText, Building2, Stethoscope, ChevronLeft, CheckCircle2 } from 'lucide-react';

interface RegisterProps {
  onNavigateLogin: () => void;
}

export function Register({ onNavigateLogin }: RegisterProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Registrasi Berhasil</h2>
          <p className="text-slate-400 mb-8">
            Data Anda telah diterima dan sedang dalam proses verifikasi oleh tim admin (1x24 jam). Silakan cek email Anda secara berkala.
          </p>
          <button
            onClick={onNavigateLogin}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl py-3.5 transition-all"
          >
            Kembali ke Halaman Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-4 font-sans relative overflow-hidden py-12">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-10 relative z-10">
        <button 
          onClick={onNavigateLogin}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke Login
        </button>

        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800">
          <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 shrink-0">
            <Activity className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Registrasi Tenaga Kesehatan</h1>
            <p className="text-slate-400 text-sm mt-1">Lengkapi data di bawah ini untuk mendapatkan akses sistem.</p>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Nama Lengkap (beserta gelar)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                  placeholder="dr. John Doe, Sp.JP"
                  required
                />
              </div>
            </div>

            {/* NIK */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Nomor Induk Kependudukan (NIK)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  pattern="[0-9]{16}"
                  maxLength={16}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                  placeholder="16 Digit NIK"
                  required
                />
              </div>
            </div>

            {/* Nomor STR */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Nomor STR Aktif</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                  placeholder="Nomor Surat Tanda Registrasi"
                  required
                />
              </div>
            </div>

            {/* Profesi */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Profesi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Stethoscope className="h-5 w-5 text-slate-500" />
                </div>
                <select
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all appearance-none"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>Pilih Profesi</option>
                  <option value="dokter_umum">Dokter Umum</option>
                  <option value="dokter_spesialis">Dokter Spesialis</option>
                  <option value="perawat">Perawat</option>
                  <option value="bidan">Bidan</option>
                  <option value="lainnya">Tenaga Kesehatan Lainnya</option>
                </select>
              </div>
            </div>

            {/* Faskes */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Fasilitas Kesehatan (Tempat Praktik)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="text"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
                  placeholder="Nama RS / Klinik / Puskesmas"
                  required
                />
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl py-3.5 transition-all shadow-lg shadow-rose-500/20"
            >
              Ajukan Registrasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
