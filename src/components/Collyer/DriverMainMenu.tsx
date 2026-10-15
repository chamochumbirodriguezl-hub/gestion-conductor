import React from 'react';
import {
  PlayCircle,
  Box,
  StopCircle,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Fuel,
  ChevronRight,
  ShieldCheck,
  Lock,
  Layers,
  MapPin,
  Calendar,
} from 'lucide-react';
import { TransportService, UnitInfo, DriverShift, VehicleType } from '../../types';

interface DriverMainMenuProps {
  currentService: TransportService;
  allServices: TransportService[];
  onSelectService: (serviceId: string) => void;
  onSelectVehicleType?: (type: VehicleType) => void;
  onOpenIngreso: () => void;
  onOpenContainers: () => void;
  onOpenSalida: () => void;
  onOpenFuel: () => void;
}

export const DriverMainMenu: React.FC<DriverMainMenuProps> = ({
  currentService,
  allServices,
  onSelectService,
  onSelectVehicleType,
  onOpenIngreso,
  onOpenContainers,
  onOpenSalida,
  onOpenFuel,
}) => {
  const shift = currentService.driver;
  const unit = currentService.unit;
  const container = currentService.container;
  const activeVehicleType = shift.selectedVehicleType || unit.vehicleType || 'Tracto';

  const isIngresoDone = shift.initialChecklistCompleted;
  const isShiftClosed = shift.phase === 'jornada_cerrada';
  const completedStagesCount = currentService.stages.filter((s) => s.isCompleted).length;
  const isServiceTerminado = currentService.executionStatus === 'terminado' || completedStagesCount === 5;
  const scheduledTime = currentService.scheduledDepartureTime || '07:00 AM';

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Driver Tactical Profile Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-4 text-white shadow-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 font-black text-lg shadow-md">
              JH
            </div>
            <div>
              <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                CONDUCTOR COLLYER
              </div>
              <div className="text-base font-extrabold text-white leading-tight">
                {shift.driverName}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {shift.driverLicense}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Odómetro</span>
            <span className="text-sm font-black font-mono text-emerald-400">
              {unit.currentMileage.toLocaleString()} km
            </span>
            <span className="text-[10px] text-amber-300 font-mono block mt-0.5">
              Salida: {scheduledTime}
            </span>
          </div>
        </div>

        {/* 1. SELECTOR VISUAL DE TIPO DE VEHÍCULO OPERADO */}
        <div className="pt-1 border-t border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase font-bold text-amber-400 tracking-wider">
              TIPO DE VEHÍCULO ASIGNADO / OPERADO:
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Tocar para cambiar
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {[
              { type: 'Tracto' as const, label: '🚛 Tracto', desc: 'Pesado' },
              { type: 'Furgón' as const, label: '📦 Furgón', desc: 'Carga Seca' },
              { type: 'Vehículo Pequeño' as const, label: '🚗 Veh. Pequeño', desc: 'Express 3.5T' },
            ].map((v) => {
              const isSelected = activeVehicleType === v.type;
              return (
                <button
                  key={v.type}
                  type="button"
                  onClick={() => onSelectVehicleType && onSelectVehicleType(v.type)}
                  className={`py-2 px-1 rounded-xl border-2 font-black transition-all text-center flex flex-col items-center justify-center active:scale-95 ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/20 text-amber-300 ring-2 ring-amber-400/40'
                      : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-black">{v.label}</span>
                  <span className="text-[9px] font-mono text-slate-400 font-normal leading-tight">
                    {v.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Assigned Truck & Trailer / Box Plates */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-0.5">
          <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-2 text-center">
            <span className="text-[9px] text-slate-400 block font-semibold">
              {activeVehicleType === 'Tracto' ? 'PLACA TRACTO' : activeVehicleType === 'Furgón' ? 'PLACA FURGÓN' : 'PLACA VEHÍCULO'}
            </span>
            <span className="text-base font-black text-amber-400">{unit.tractPlate}</span>
          </div>
          <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-2 text-center">
            <span className="text-[9px] text-slate-400 block font-semibold">
              {activeVehicleType === 'Tracto' ? 'PLACA CHASIS' : activeVehicleType === 'Furgón' ? 'PRECINTO DE SEG.' : 'MODALIDAD'}
            </span>
            <span className="text-base font-black text-sky-400 truncate block">
              {activeVehicleType === 'Tracto'
                ? unit.trailerPlate
                : activeVehicleType === 'Furgón'
                ? unit.securitySealNumber || 'COL-SEC-8910'
                : '3.5T Express'}
            </span>
          </div>
        </div>

        {/* Active Order & Itinerary Strip */}
        <div className="rounded-2xl bg-slate-950/90 border border-slate-800/80 p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-semibold">Orden Asignada:</span>
            <select
              value={currentService.id}
              onChange={(e) => onSelectService(e.target.value)}
              className="rounded bg-slate-900 border border-slate-700 px-2 py-0.5 font-mono text-xs font-bold text-amber-300 outline-none"
            >
              {allServices.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.orderNumber || srv.serviceCode} · {srv.clientName.split(' ')[0]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between text-slate-200">
            <span className="text-slate-400">
              {activeVehicleType === 'Tracto' ? 'Contenedor:' : activeVehicleType === 'Furgón' ? 'Carga Furgón:' : 'Carga Ligera:'}
            </span>
            <strong className="font-mono text-amber-400 text-xs sm:text-sm">
              {activeVehicleType === 'Tracto'
                ? container?.containerNumber || 'MSKU-948102-3'
                : activeVehicleType === 'Furgón'
                ? 'Pallets Carga Seca 48 m³'
                : 'Paquetería Urgente 3.5T'}
            </strong>
          </div>

          <div className="text-[11px] text-slate-400 truncate flex items-center gap-1 pt-0.5">
            <MapPin className="h-3 w-3 text-red-400 shrink-0" />
            <span className="truncate">{currentService.clientName} ({currentService.destination})</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* LOS 3 BOTONES PRINCIPALES GIGANTES EN EL INICIO */}
      {/* ======================================================== */}
      <div className="space-y-3 pt-1">
        {/* BOTÓN GIGANTE 1: MARCAR INGRESO Y MANTENIMIENTO DIARIO */}
        <button
          type="button"
          onClick={onOpenIngreso}
          className={`w-full text-left p-5 rounded-3xl border-2 transition-all shadow-xl active:scale-98 flex items-center justify-between gap-4 group ${
            isIngresoDone
              ? 'border-emerald-500 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 text-white'
              : 'border-amber-400 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/50 text-white'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-lg ${
                isIngresoDone
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-amber-400 text-slate-950 animate-pulse'
              }`}
            >
              <PlayCircle className="h-9 w-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-400 block">
                PASO 1 · AL COMENZAR EL DÍA
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                1. Marcar Ingreso y Mantenimiento Diario
              </h3>
              <p className="text-xs text-slate-300">
                Foto de odómetro, nivel de aceite y checklist de 30 puntos
              </p>

              {/* Status Badge */}
              <div className="pt-1">
                {isIngresoDone ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-slate-950 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    INGRESO CONFORME ({shift.clockInTime || '06:15 AM'})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950 shadow-sm animate-pulse">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    PENDIENTE DE MARCAR
                  </span>
                )}
              </div>
            </div>
          </div>

          <ChevronRight className="h-7 w-7 text-slate-400 group-hover:text-amber-400 transition-colors shrink-0" />
        </button>

        {/* BOTÓN GIGANTE 2: MI SERVICIO Y FOTOS DE CONTENEDOR */}
        <button
          type="button"
          onClick={onOpenContainers}
          className={`w-full text-left p-5 rounded-3xl border-2 transition-all shadow-xl active:scale-98 flex items-center justify-between gap-4 group ${
            isServiceTerminado
              ? 'border-emerald-500 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 text-white'
              : !isIngresoDone
              ? 'border-slate-800 bg-slate-900/60 text-slate-400'
              : 'border-sky-400 bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 text-white'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-lg ${
                isServiceTerminado
                  ? 'bg-emerald-500 text-slate-950'
                  : !isIngresoDone
                  ? 'bg-slate-800 text-slate-500'
                  : 'bg-sky-400 text-slate-950'
              }`}
            >
              {isIngresoDone ? <Box className="h-9 w-9" /> : <Lock className="h-8 w-8" />}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-sky-400 block">
                PASO 2 · EN RUTA Y CLIENTE
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                2. Mi Servicio y Fotos de Contenedor
              </h3>
              <p className="text-xs text-slate-300">
                Ciclo de 5 etapas con fotos de cámara: Recojo, Entrega, Vaciado y Retorno
              </p>

              {/* Status Badge */}
              <div className="pt-1">
                {isServiceTerminado ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-slate-950 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    SERVICIO 100% TERMINADO (5/5)
                  </span>
                ) : !isIngresoDone ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-950 border border-red-500 text-red-300 px-2.5 py-0.5 text-xs font-bold">
                    <Lock className="h-3 w-3" /> Bloqueado (Marque ingreso primero)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-400 px-3 py-1 text-xs font-black text-slate-950 shadow-sm">
                    <Clock className="h-3.5 w-3.5" />
                    ETAPA {completedStagesCount + 1} DE 5 EN CURSO
                  </span>
                )}
              </div>
            </div>
          </div>

          <ChevronRight className="h-7 w-7 text-slate-400 group-hover:text-sky-400 transition-colors shrink-0" />
        </button>

        {/* BOTÓN GIGANTE 3: MARCAR SALIDA E INCIDENCIAS */}
        <button
          type="button"
          onClick={onOpenSalida}
          className={`w-full text-left p-5 rounded-3xl border-2 transition-all shadow-xl active:scale-98 flex items-center justify-between gap-4 group ${
            isShiftClosed
              ? 'border-emerald-500 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 text-white'
              : 'border-red-500 bg-gradient-to-r from-slate-900 via-slate-900 to-red-950/40 text-white'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-lg ${
                isShiftClosed ? 'bg-emerald-500 text-slate-950' : 'bg-red-500 text-white'
              }`}
            >
              <StopCircle className="h-9 w-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-red-400 block">
                PASO 3 · AL TERMINAR EL TURNO
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white leading-tight">
                3. Marcar Salida e Incidencias
              </h3>
              <p className="text-xs text-slate-300">
                Salida laboral, foto de odómetro final y bitácora de novedades
              </p>

              {/* Status Badge */}
              <div className="pt-1">
                {isShiftClosed ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-slate-950 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    JORNADA CERRADA ({shift.clockOutTime || '17:45 PM'})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-bold text-slate-300">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    Registrar al concluir labores en base
                  </span>
                )}
              </div>
            </div>
          </div>

          <ChevronRight className="h-7 w-7 text-slate-400 group-hover:text-red-400 transition-colors shrink-0" />
        </button>
      </div>

      {/* Quick Route Shortcut: Combustible en Ruta */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onOpenFuel}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-400/50 transition-all font-bold text-xs shadow-md"
        >
          <Fuel className="h-4 w-4 text-amber-400" />
          <span>¿Cargaste combustible en ruta? Toca aquí para registrar ticket</span>
          <span className="font-mono bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded text-[10px]">
            {currentService.fuelEntries.length} vales
          </span>
        </button>
      </div>
    </div>
  );
};
