import React, { useState } from 'react';
import {
  PlayCircle,
  StopCircle,
  FileCheck,
  Fuel,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowRight,
  ClipboardCheck,
} from 'lucide-react';
import {
  TransportService,
  UnitInfo,
  DriverShift,
  ChecklistItem,
  ChecklistStatus,
  FuelEntry,
  ServiceEvidence,
  StageId,
  VehicleType,
} from '../../types';
import { UnitHeaderCard } from './UnitHeaderCard';
import { MaintenanceAlertBanner } from './MaintenanceAlertBanner';
import { ShiftOpeningModule } from './ShiftOpeningModule';
import { ShiftClosingModule } from './ShiftClosingModule';
import { FuelRefuelForm } from './FuelRefuelForm';
import { StagesTimeline } from './StagesTimeline';

interface DriverModuleProps {
  currentService: TransportService;
  allUnits: UnitInfo[];
  onSelectUnit: (unitId: string) => void;
  onUpdateShift: (shift: DriverShift) => void;
  onUpdateChecklistItem: (id: string, status: ChecklistStatus, notes?: string) => void;
  onAddFuelEntry: (entry: FuelEntry) => void;
  onCompleteStage: (stageId: StageId, data: Partial<ServiceEvidence>) => void;
  onRequestPhotoUpload: (title: string, onSuccess: (url: string, label?: string) => void) => void;
  onViewPhoto: (url: string, title: string) => void;
}

export const DriverModule: React.FC<DriverModuleProps> = ({
  currentService,
  allUnits,
  onSelectUnit,
  onUpdateShift,
  onUpdateChecklistItem,
  onAddFuelEntry,
  onCompleteStage,
  onRequestPhotoUpload,
  onViewPhoto,
}) => {
  const shift = currentService.driver;
  const isOpeningPending = shift.phase === 'apertura_pendiente';
  const isClosingPending = shift.phase === 'cierre_pendiente' || (shift.phase === 'en_ruta' && currentService.stages.find(s => s.stageId === 5)?.isCompleted);
  const isShiftClosed = shift.phase === 'jornada_cerrada';

  // Sub tab selection
  const [activeSubTab, setActiveSubTab] = useState<'inicio' | 'stages' | 'fuel' | 'fin'>(
    isOpeningPending ? 'inicio' : isClosingPending ? 'fin' : 'stages'
  );

  const completedStagesCount = currentService.stages.filter((s) => s.isCompleted).length;
  const completedChecklistCount = currentService.checklistItems.filter((i) => i.status !== null).length;

  const handleTabClick = (tab: 'inicio' | 'stages' | 'fuel' | 'fin') => {
    setActiveSubTab(tab);
  };

  const currentVehicleType = shift.selectedVehicleType || currentService.unit.vehicleType || 'Tracto';

  const handleVehicleTypeChange = (newType: VehicleType) => {
    onUpdateShift({
      ...shift,
      selectedVehicleType: newType,
    });
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* 1. Permanent Unit Identification Header */}
      <UnitHeaderCard
        unit={currentService.unit}
        allUnits={allUnits}
        selectedVehicleType={currentVehicleType}
        onSelectVehicleType={handleVehicleTypeChange}
        onSelectUnit={onSelectUnit}
      />

      {/* 2. Preventive Maintenance Alert Banner */}
      <MaintenanceAlertBanner unit={currentService.unit} />

      {/* 3. Mandatory Daily Shift Stepper & Restriction Status Banner */}
      <div className={`rounded-xl border p-4 shadow-xs transition-all ${
        isOpeningPending
          ? 'border-red-300 bg-red-50 text-red-950'
          : isClosingPending && !isShiftClosed
          ? 'border-amber-300 bg-amber-50 text-amber-950'
          : isShiftClosed
          ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
          : 'border-slate-200 bg-white text-slate-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold ${
              isOpeningPending
                ? 'bg-red-600 text-white'
                : isClosingPending && !isShiftClosed
                ? 'bg-amber-600 text-white'
                : isShiftClosed
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-amber-400'
            }`}>
              {isOpeningPending ? (
                <Lock className="h-5 w-5" />
              ) : isClosingPending && !isShiftClosed ? (
                <AlertTriangle className="h-5 w-5" />
              ) : isShiftClosed ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <ShieldCheck className="h-5 w-5" />
              )}
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <span>CONTROL OBLIGATORIO DE JORNADA (INICIO Y FIN)</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-black/10">
                  {shift.phase.toUpperCase().replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs mt-0.5 font-medium">
                {isOpeningPending ? (
                  <>
                    <strong className="underline text-red-700">BLOQUEO OPERATIVO ACTIVO:</strong> Debe
                    completar la <strong>Apertura de Turno (Checklist 30 pts y Odómetro Inicial)</strong> para
                    desbloquear el acceso al servicio en ruta.
                  </>
                ) : isClosingPending && !isShiftClosed ? (
                  <>
                    <strong className="text-amber-800">ACCIÓN OBLIGATORIA DE FIN DE TURNO:</strong> Las entregas
                    están listas. Debe registrar el <strong>Odómetro Final con foto</strong> y la inspección
                    visual de cierre para liberar el servicio y reportar a Torre de Control.
                  </>
                ) : isShiftClosed ? (
                  <>
                    <strong className="text-emerald-800">JORNADA CERRADA CONFORME:</strong> Ambos controles
                    (Inicio y Fin) han sido certificados y enviados a Torre de Control y Finanzas.
                  </>
                ) : (
                  <>
                    <strong className="text-slate-900">EN RUTA ACTIVA:</strong> Apertura de turno certificada a
                    las {shift.shiftStartTime}. Al culminar las entregas, realice el Cierre obligatorio.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Quick jump action */}
          <div>
            {isOpeningPending && activeSubTab !== 'inicio' && (
              <button
                type="button"
                onClick={() => setActiveSubTab('inicio')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-sm"
              >
                <span>Ir a Apertura de Turno</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}

            {isClosingPending && !isShiftClosed && activeSubTab !== 'fin' && (
              <button
                type="button"
                onClick={() => setActiveSubTab('fin')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 shadow-sm"
              >
                <span>Completar Cierre de Turno</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Service Context Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
            {currentService.serviceCode}
          </span>
          <span className="font-semibold text-slate-800">{currentService.clientName}</span>
          <span className="text-slate-400">·</span>
          <span className="text-slate-600 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {currentService.origin} ➔ {currentService.destination}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500">Conductor:</span>
          <span className="font-bold text-slate-800">{shift.driverName}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 font-mono">Brevete: {shift.driverLicense}</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs with Strict Navigation Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-200/80 rounded-xl">
        {/* Tab 1: Inicio de Jornada (Apertura) */}
        <button
          type="button"
          onClick={() => handleTabClick('inicio')}
          className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'inicio'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <PlayCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span className="truncate">1. Inicio de Jornada</span>
          </div>
          {shift.initialChecklistCompleted ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : (
            <span className="rounded-full bg-red-100 text-red-800 text-[10px] px-1.5 py-0.2 shrink-0">
              Requerido
            </span>
          )}
        </button>

        {/* Tab 2: Evidencias de Ruta (Etapas 1 a 5) */}
        <button
          type="button"
          onClick={() => handleTabClick('stages')}
          className={`relative flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'stages'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
          } ${isOpeningPending ? 'opacity-70' : ''}`}
        >
          <div className="flex items-center gap-2 truncate">
            {isOpeningPending ? (
              <Lock className="h-4 w-4 text-red-500 shrink-0" />
            ) : (
              <FileCheck className="h-4 w-4 text-blue-600 shrink-0" />
            )}
            <span className="truncate">2. Evidencias en Ruta</span>
          </div>
          <span className="rounded-full bg-slate-100 text-slate-700 px-1.5 py-0.2 font-mono text-[10px] shrink-0">
            {completedStagesCount}/5
          </span>
        </button>

        {/* Tab 3: Combustible en Ruta */}
        <button
          type="button"
          onClick={() => handleTabClick('fuel')}
          className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'fuel'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
          } ${isOpeningPending ? 'opacity-70' : ''}`}
        >
          <div className="flex items-center gap-2 truncate">
            {isOpeningPending ? (
              <Lock className="h-4 w-4 text-red-500 shrink-0" />
            ) : (
              <Fuel className="h-4 w-4 text-amber-600 shrink-0" />
            )}
            <span className="truncate">3. Combustible</span>
          </div>
          <span className="rounded-full bg-slate-100 text-slate-700 px-1.5 py-0.2 font-mono text-[10px] shrink-0">
            {currentService.fuelEntries.length}
          </span>
        </button>

        {/* Tab 4: Fin de Jornada (Cierre) */}
        <button
          type="button"
          onClick={() => handleTabClick('fin')}
          className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'fin'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <StopCircle className="h-4 w-4 text-red-600 shrink-0" />
            <span className="truncate">4. Fin de Jornada</span>
          </div>
          {isShiftClosed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          ) : isClosingPending ? (
            <span className="rounded-full bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.2 shrink-0 animate-pulse">
              Pendiente
            </span>
          ) : (
            <span className="text-[10px] text-slate-400 font-mono shrink-0">Post-Ruta</span>
          )}
        </button>
      </div>

      {/* Navigation Restriction Warning if driver tries to open stages or fuel before shift opening */}
      {isOpeningPending && (activeSubTab === 'stages' || activeSubTab === 'fuel') && (
        <div className="rounded-xl border-2 border-red-400 bg-red-50 p-6 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Lock className="h-7 w-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-red-950">
              ACCESO A RUTA BLOQUEADO POR PROTOCOLO DE SEGURIDAD
            </h3>
            <p className="text-xs text-red-800 max-w-xl mx-auto">
              Está prohibido iniciar la carga o el tránsito sin haber realizado la{' '}
              <strong>Apertura de Turno (Momento 1)</strong>: Verificación de unidad, odómetro inicial con foto
              del tablero, control de cambio de aceite y checklist preventivo de 30 puntos.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveSubTab('inicio')}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-red-700 shadow-md transition-colors"
          >
            <PlayCircle className="h-4 w-4" />
            Completar Apertura de Turno Ahora
          </button>
        </div>
      )}

      {/* Tab Panels */}
      {activeSubTab === 'inicio' && (
        <ShiftOpeningModule
          currentService={currentService}
          onUpdateShift={onUpdateShift}
          onUpdateChecklistItem={onUpdateChecklistItem}
          onRequestPhotoUpload={onRequestPhotoUpload}
          onViewPhoto={onViewPhoto}
        />
      )}

      {!isOpeningPending && activeSubTab === 'stages' && (
        <StagesTimeline
          stages={currentService.stages}
          vehicleType={currentVehicleType}
          onCompleteStage={onCompleteStage}
          onRequestPhotoUpload={onRequestPhotoUpload}
          onViewPhoto={onViewPhoto}
        />
      )}

      {!isOpeningPending && activeSubTab === 'fuel' && (
        <FuelRefuelForm
          entries={currentService.fuelEntries}
          currentUnitMileage={currentService.unit.currentMileage}
          onAddFuelEntry={onAddFuelEntry}
          onRequestPhotoUpload={onRequestPhotoUpload}
          onViewPhoto={onViewPhoto}
        />
      )}

      {activeSubTab === 'fin' && (
        <ShiftClosingModule
          currentService={currentService}
          onUpdateShift={onUpdateShift}
          onRequestPhotoUpload={onRequestPhotoUpload}
          onViewPhoto={onViewPhoto}
        />
      )}
    </div>
  );
};
