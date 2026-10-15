import React from 'react';
import {
  Truck,
  ShieldCheck,
  Clock,
  MapPin,
  Box,
  ChevronDown,
  User,
  Gauge,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { TransportService, UnitInfo, DriverShift } from '../../types';

interface CollyerAppHeaderProps {
  currentService: TransportService;
  allServices: TransportService[];
  onSelectService: (serviceId: string) => void;
  activeTab: 'shift' | 'containers' | 'fuel';
  onChangeTab: (tab: 'shift' | 'containers' | 'fuel') => void;
}

export const CollyerAppHeader: React.FC<CollyerAppHeaderProps> = ({
  currentService,
  allServices,
  onSelectService,
  activeTab,
  onChangeTab,
}) => {
  const shift = currentService.driver;
  const unit = currentService.unit;
  const container = currentService.container;

  const isShiftClosed = shift.phase === 'jornada_cerrada';
  const isOpeningPending = shift.phase === 'apertura_pendiente';
  const isEnRuta = shift.phase === 'en_ruta' || shift.phase === 'cierre_pendiente';

  const completedStagesCount = currentService.stages.filter((s) => s.isCompleted).length;
  const isServiceTerminado = currentService.executionStatus === 'terminado' || completedStagesCount === 5;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950 text-white shadow-xl">
      {/* Top Corporate Strip */}
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand & App Name */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black shadow-md ring-2 ring-amber-400/30">
            <Truck className="h-6 w-6" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase font-mono">
                COLLYER OPERACIONES
              </span>
              <span className="text-slate-600">·</span>
              <span className="rounded bg-slate-800 text-[10px] px-1.5 py-0.5 text-slate-300 font-mono">
                APP CONDUCTOR
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none mt-0.5">
              Gestión del Conductor Collyer
            </h1>
          </div>
        </div>

        {/* Operational Status Pill */}
        <div className="flex items-center gap-2">
          {isShiftClosed ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 text-xs font-bold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Jornada Cerrada
            </span>
          ) : isOpeningPending ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-950/80 border border-red-500/50 px-3 py-1 text-xs font-bold text-red-300">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              Ingreso Pendiente
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-950/80 border border-amber-500/50 px-3 py-1 text-xs font-bold text-amber-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              En Ruta / Activo
            </span>
          )}
        </div>
      </div>

      {/* Driver & Unit Tactical Bar */}
      <div className="bg-slate-900 border-t border-slate-800/80 px-4 py-2.5">
        <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Driver & Truck Identifiers */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-slate-300">
              <User className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-bold text-white">{shift.driverName}</span>
              <span className="text-slate-500 font-mono text-[11px]">({shift.driverLicense.split(' ')[0]})</span>
            </div>

            <span className="text-slate-700 hidden sm:inline">|</span>

            {/* Permanent Plates Identification */}
            <div className="flex items-center gap-2 font-mono">
              <div className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-amber-400 font-bold">
                TRACTO: {unit.tractPlate}
              </div>
              <div className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-sky-400 font-bold">
                CHASIS: {unit.trailerPlate}
              </div>
            </div>
          </div>

          {/* Assigned Order Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium text-[11px] hidden md:inline">Orden Asignada:</span>
            <select
              value={currentService.id}
              onChange={(e) => onSelectService(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-bold font-mono text-amber-300 outline-none focus:border-amber-400 cursor-pointer shadow-inner"
            >
              {allServices.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.orderNumber || srv.serviceCode} · {srv.container?.containerNumber || 'Contenedor'} ({srv.executionStatus === 'terminado' ? 'TERMINADO' : 'EN CURSO'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mobile-First Primary Navigation: The 2 Core Operational Blocks */}
      <div className="bg-slate-950 px-4 pt-1">
        <nav className="mx-auto max-w-5xl grid grid-cols-2 sm:grid-cols-3 gap-1">
          {/* Block 1 Tab */}
          <button
            type="button"
            onClick={() => onChangeTab('shift')}
            className={`relative flex items-center justify-center gap-2 py-3 px-2 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'shift'
                ? 'border-amber-400 text-amber-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/30'
            }`}
          >
            <Clock className="h-4 w-4 shrink-0" />
            <div className="text-left leading-tight truncate">
              <div className="font-bold truncate">1. Asistencia & Mantenimiento</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">Inicio y Fin de Jornada</div>
            </div>
            {shift.initialChecklistCompleted && (
              <span className="h-2 w-2 rounded-full bg-emerald-400 ml-1 shrink-0" />
            )}
          </button>

          {/* Block 2 Tab */}
          <button
            type="button"
            onClick={() => onChangeTab('containers')}
            className={`relative flex items-center justify-center gap-2 py-3 px-2 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'containers'
                ? 'border-amber-400 text-amber-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/30'
            }`}
          >
            <Box className="h-4 w-4 shrink-0 text-sky-400" />
            <div className="text-left leading-tight truncate">
              <div className="font-bold truncate">2. Ciclo de Contenedores</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">5 Etapas de Evidencia</div>
            </div>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${
              isServiceTerminado
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {completedStagesCount}/5
            </span>
          </button>

          {/* Quick Fuel Log Shortcut Tab (Full width on sm, accessible) */}
          <button
            type="button"
            onClick={() => onChangeTab('fuel')}
            className={`hidden sm:flex items-center justify-center gap-2 py-3 px-2 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'fuel'
                ? 'border-amber-400 text-amber-400 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/30'
            }`}
          >
            <Gauge className="h-4 w-4 shrink-0 text-amber-400" />
            <div className="text-left leading-tight truncate">
              <div className="font-bold truncate">Combustible en Ruta</div>
              <div className="text-[10px] text-slate-400 font-normal truncate">Comprobantes de Grifo</div>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono shrink-0">
              {currentService.fuelEntries.length}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};
