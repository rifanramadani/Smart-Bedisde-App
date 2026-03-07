import React, { useState } from 'react';
import { Activity, HeartPulse, Wind, Droplets, QrCode, Settings, User, Bell, Thermometer, ChevronLeft, Monitor, Wifi, BatteryFull, LogOut } from 'lucide-react';
import { useVitalSigns } from './hooks/useVitalSigns';
import { useWaveforms } from './hooks/useWaveforms';
import { SignalChart } from './components/SignalChart';
import { MonitorCard } from './components/MonitorCard';
import { Login } from './components/Login';
import { Register } from './components/Register';

// Mock Devices Data
const DEVICES = [
  { id: 'VG-84920', patient: 'John Doe', room: '12', status: 'Online', battery: '100%' },
  { id: 'VG-84921', patient: 'Jane Smith', room: '14', status: 'Online', battery: '92%' },
  { id: 'VG-84922', patient: 'Unassigned', room: 'ER-1', status: 'Standby', battery: '100%' },
];

export default function App() {
  const [authView, setAuthView] = useState<'login' | 'register' | 'app'>('login');
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'live' | 'records' | 'scanner'>('live');
  const [selectedDevice, setSelectedDevice] = useState<typeof DEVICES[0] | null>(null);

  const { current } = useVitalSigns();
  const waveforms = useWaveforms();

  // Authentication Routing
  if (authView === 'login') {
    return (
      <Login 
        onLoginSuccess={() => setAuthView('app')} 
        onNavigateRegister={() => setAuthView('register')} 
      />
    );
  }

  if (authView === 'register') {
    return (
      <Register 
        onNavigateLogin={() => setAuthView('login')} 
      />
    );
  }

  // Main App View
  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 text-slate-50 font-sans overflow-hidden">
      {/* Top Header - Only visible when NO device is selected */}
      {!selectedDevice && (
        <header className="h-16 border-b border-slate-800 bg-slate-900 flex items-center px-6 justify-between shrink-0 relative z-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <Activity className="w-6 h-6 text-rose-500" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white hidden sm:block">SMART BEDSIDE MONITOR</h1>
            </div>
            
            {/* Settings Dropdown Menu */}
            <div className="relative">
              <button 
                onClick={() => setMenuOpen(!menuOpen)} 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>
                  <div className="absolute top-full left-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                    <button 
                      onClick={() => { setActiveTab('live'); setMenuOpen(false); }} 
                      className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      <Monitor className="w-4 h-4 text-rose-400" /> Live Monitor
                    </button>
                    <button 
                      onClick={() => { setActiveTab('records'); setMenuOpen(false); }} 
                      className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      <User className="w-4 h-4 text-blue-400" /> Patient Records
                    </button>
                    <button 
                      onClick={() => { setActiveTab('scanner'); setMenuOpen(false); }} 
                      className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      <QrCode className="w-4 h-4 text-emerald-400" /> Scanner
                    </button>
                    <div className="h-px bg-slate-700 my-1"></div>
                    <button 
                      onClick={() => { setAuthView('login'); setMenuOpen(false); }} 
                      className="w-full text-left px-4 py-3 flex items-center gap-3 text-sm text-rose-400 hover:bg-slate-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto ${selectedDevice ? 'p-0 bg-black overflow-hidden' : 'p-4 md:p-8'}`}>
        <div className={`mx-auto ${selectedDevice ? 'max-w-none h-full w-full' : 'max-w-7xl'}`}>
          
          {/* TAB: LIVE MONITOR */}
          {activeTab === 'live' && (
            <>
              {/* Device List View */}
              {!selectedDevice && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div>
                    <h2 className="text-2xl font-semibold text-white tracking-tight">Connected Devices</h2>
                    <p className="text-sm text-slate-400 font-medium mt-1">Select a device to view live telemetry.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DEVICES.map((device) => (
                      <button 
                        key={device.id}
                        onClick={() => setSelectedDevice(device)}
                        className="text-left bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm hover:border-rose-500/50 hover:bg-slate-800/50 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-4">
                          <Wifi className={`w-5 h-5 ${device.status === 'Online' ? 'text-emerald-500' : 'text-slate-500'}`} />
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 group-hover:border-rose-500/30">
                            <Monitor className="w-6 h-6 text-slate-300 group-hover:text-rose-400 transition-colors" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg">{device.id}</h3>
                            <p className="text-xs text-slate-400 uppercase tracking-wider">Room {device.room}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Patient</span>
                            <span className="font-medium text-slate-200">{device.patient}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Status</span>
                            <span className={`font-medium ${device.status === 'Online' ? 'text-emerald-400' : 'text-amber-400'}`}>{device.status}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Battery</span>
                            <span className="font-medium text-slate-200">{device.battery}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Monitoring View (Digital Medical Patient Monitor) */}
              {selectedDevice && (
                <div className="h-full w-full bg-black flex flex-col relative overflow-hidden font-mono">
                  {/* Global Grid Pattern */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                      backgroundImage: `
                        linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px'
                    }}
                  />

                  {/* Top White Bar */}
                  <div className="bg-white text-black px-2 sm:px-4 py-1 flex items-center justify-between z-10 font-bold text-[10px] sm:text-xs md:text-sm shrink-0">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <button 
                        onClick={() => setSelectedDevice(null)}
                        className="hover:bg-gray-200 p-1 rounded"
                        title="Back to devices"
                      >
                        <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <span className="truncate max-w-[120px] sm:max-w-none">Patient: {selectedDevice.patient} (Bed {selectedDevice.room})</span>
                    </div>
                    <span className="hidden sm:block">{current.time}</span>
                    <div className="bg-green-500 text-white px-2 sm:px-3 py-0.5 rounded-sm whitespace-nowrap">
                      Alarm: AUTO
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <span className="hidden md:block">VitaGuard Connected</span>
                      <BatteryFull className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                  </div>

                  {/* Main Content Split - Responsive Flex Direction */}
                  <div className="flex-1 flex flex-col lg:flex-row z-10 p-1 gap-1 overflow-hidden">
                    
                    {/* Left Section: Waveforms (Takes up remaining space) */}
                    <div className="flex-1 flex flex-col gap-1 min-h-0">
                      <SignalChart 
                        label1={`ECG (${current.bpm} bpm)`}
                        label2="II"
                        data={waveforms} 
                        dataKey="ecg" 
                        color="#22c55e" // green-500
                      />
                      <SignalChart 
                        label1={`RR (${current.rr} rpm)`}
                        label2="S"
                        data={waveforms} 
                        dataKey="rr" 
                        color="#eab308" // yellow-500
                      />
                      <SignalChart 
                        label1="PCG (Sync)"
                        label2=""
                        data={waveforms} 
                        dataKey="pcg" 
                        color="#a855f7" // purple-500
                      />
                    </div>

                    {/* Right Section: Digital Data Boxes (Grid on portrait, Column on landscape) */}
                    <div className="shrink-0 lg:w-64 xl:w-80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 lg:flex lg:flex-col gap-1 overflow-y-auto lg:overflow-visible min-h-0 lg:h-full">
                      <div className="lg:flex-1 min-h-[80px] lg:min-h-0">
                        <MonitorCard
                          title="HR"
                          titleColor="text-white"
                          value={current.bpm}
                          valueColor="text-green-500"
                          unit="bpm"
                          unitColor="text-white"
                          icon={HeartPulse}
                          iconColor="text-green-500"
                          boxColor="border-green-500"
                        />
                      </div>
                      <div className="lg:flex-1 min-h-[80px] lg:min-h-0">
                        <MonitorCard
                          title="SpO2 (Saturasi Oksigen)"
                          titleColor="text-blue-500"
                          extraLabel="Pleth"
                          extraLabelColor="text-white"
                          value={current.spo2}
                          valueColor="text-blue-500"
                          unit="%"
                          unitColor="text-blue-500"
                          icon={Wind}
                          iconColor="text-blue-500"
                        />
                      </div>
                      <div className="lg:flex-1 min-h-[80px] lg:min-h-0">
                        <MonitorCard
                          title="NIBP (Tekanan Darah)"
                          titleColor="text-white"
                          value={`${current.sys}/${current.dia}`}
                          valueColor="text-white"
                          unit="mmHg"
                          unitColor="text-white"
                          icon={Activity}
                          iconColor="text-white"
                        />
                      </div>
                      <div className="lg:flex-1 min-h-[80px] lg:min-h-0">
                        <MonitorCard
                          title="RR (Respiratory Rate)"
                          titleColor="text-yellow-500"
                          value={current.rr}
                          valueColor="text-yellow-500"
                          unit="rpm"
                          unitColor="text-yellow-500"
                          icon={Droplets}
                          iconColor="text-yellow-500"
                        />
                      </div>
                      <div className="lg:flex-1 min-h-[80px] lg:min-h-0 col-span-2 sm:col-span-1 lg:col-span-1">
                        <MonitorCard
                          title="TEMP (Suhu)"
                          titleColor="text-white"
                          value={current.skinTemp}
                          valueColor="text-white"
                          unit="°C"
                          unitColor="text-white"
                          icon={Thermometer}
                          iconColor="text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom-left solid yellow area */}
                  <div className="absolute bottom-0 left-0 w-4 h-4 sm:w-8 sm:h-8 bg-yellow-500 z-20"></div>
                </div>
              )}
            </>
          )}

          {/* TAB: PATIENT RECORDS */}
          {activeTab === 'records' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <User className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Patient Records</h2>
              <p className="text-slate-400 max-w-md">Database connection required. Connect to the hospital EMR system to view historical patient data.</p>
            </div>
          )}

          {/* TAB: SCANNER */}
          {activeTab === 'scanner' && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                <QrCode className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">QR Scanner</h2>
              <p className="text-slate-400 max-w-md mb-8">Use device camera to scan patient wristbands or new VitaGuard IoT devices.</p>
              <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-emerald-500/20">
                Open Camera
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

