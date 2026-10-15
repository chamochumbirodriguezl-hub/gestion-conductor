import React, { useState } from 'react';
import {
  PlayCircle,
  Camera,
  CheckCircle2,
  Clock,
  Gauge,
  Wrench,
  Check,
  ClipboardCheck,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ZoomIn,
  Truck,
  Box,
  Car,
} from 'lucide-react';
import { TransportService, DriverShift, ChecklistStatus, VehicleType } from '../../types';
import { Checklist30Points } from '../DriverView/Checklist30Points';
import { VehicleTypeSelector } from './VehicleTypeSelector';

interface IngresoWizardProps {
  currentService: TransportService;
  onUpdateShift: (shift: DriverShift) => void;
  onUpdateChecklistItem: (id: string, status: ChecklistStatus, notes?: string) => void;
  onSelectVehicleType?: (type: VehicleType) => void;
  onRequestPhotoUpload: (title: string, onSuccess: (url: string) => void) => void;
  onViewPhoto: (url: string, title: string) => void;
  onBackToHome: () => void;
  onProceedToContainers: () => void;
}

export const IngresoWizard: React.FC<IngresoWizardProps> = ({
  currentService,
  onUpdateShift,
  onUpdateChecklistItem,
  onSelectVehicleType,
  onRequestPhotoUpload,
  onViewPhoto,
  onBackToHome,
  onProceedToContainers,
}) => {
  const shift = currentService.driver;
  const unit = currentService.unit;
  const currentVehicleType = shift.selectedVehicleType || unit.vehicleType || 'Tracto';

  const [clockInTime, setClockInTime] = useState<string>(
    shift.clockInTime || ''
  );
  const [initialOdoInput, setInitialOdoInput] = useState<string>(
    shift.initialOdometer ? shift.initialOdometer.toString() : '254410'
  );
  const [initialOdoPhoto, setInitialOdoPhoto] = useState<string>(
    shift.initialOdometerPhoto || ''
  );
  const [oilCheckAcknowledged, setOilCheckAcknowledged] = useState<boolean>(
    shift.initialOilCheckAcknowledged !== undefined ? shift.initialOilCheckAcknowledged : true
  );
  const [showFullChecklist, setShowFullChecklist] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const kmToNextOilChange = (unit.lastOilChangeMileage + unit.oilChangeInterval) - unit.currentMileage;
  const isOilOverdue = kmToNextOilChange <= 0;

  const handleMarkClockIn = () => {
    const now = new Date();
    const formatted = now.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setClockInTime(formatted);
    setErrorMessage(null);
  };

  const handleTakeOdometerPhoto = () => {
    onRequestPhotoUpload('Foto Tablero: Odómetro Inicial', (url) => {
      setInitialOdoPhoto(url);
      setErrorMessage(null);
    });
  };

  const handleMarkChecklistAllGood = () => {
    currentService.checklistItems.forEach((it) => {
      onUpdateChecklistItem(it.id, 'B');
    });
  };

  const handleConfirmIngreso = () => {
    if (!clockInTime) {
      // Auto-set if omitted
      const now = new Date();
      const autoClock = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
      setClockInTime(autoClock);
    }

    const odoNum = Number(initialOdoInput);
    if (!odoNum || odoNum <= 0) {
      setErrorMessage('Por favor ingrese los números del odómetro del tablero.');
      return;
    }

    if (!initialOdoPhoto) {
      setErrorMessage('La foto del tablero con el odómetro es obligatoria para iniciar labores.');
      return;
    }

    // Mark any null checklist items as B
    currentService.checklistItems.forEach((it) => {
      if (it.status === null) {
        onUpdateChecklistItem(it.id, 'B');
      }
    });

    const now = new Date();
    const formattedTimestamp = now.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    onUpdateShift({
      ...shift,
      selectedVehicleType: currentVehicleType,
      clockInTime: clockInTime || '06:15 AM',
      attendanceMarked: true,
      isActive: true,
      phase: 'en_ruta',
      shiftStartTime: shift.shiftStartTime || formattedTimestamp,
      initialOdometer: odoNum,
      initialOdometerPhoto: initialOdoPhoto,
      initialChecklistCompleted: true,
      initialOilCheckAcknowledged: true,
    });

    onProceedToContainers();
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Back Button */}
      <button
        type="button"
        onClick={onBackToHome}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-sm transition-colors shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>← Volver al Menú Principal</span>
      </button>

      {/* Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black">
            <PlayCircle className="h-7 w-7" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
              PASO 1 DE LA JORNADA
            </span>
            <h2 className="text-lg font-black text-white leading-tight">
              Ingreso y Mantenimiento Diario
            </h2>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-xs text-red-950 font-bold flex items-center gap-2 shadow-md">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* CARD 0: SELECTOR VISUAL DE TIPO DE VEHÍCULO OPERADO */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-white space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
            0. TIPO DE VEHÍCULO OPERADO HOY
          </span>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
            Obligatorio
          </span>
        </div>

        <p className="text-xs text-slate-300">
          Selecciona o verifica la modalidad de unidad asignada para adaptar placas y protocolo:
        </p>

        <VehicleTypeSelector
          selectedType={currentVehicleType}
          onSelectType={(type) => {
            if (onSelectVehicleType) {
              onSelectVehicleType(type);
            }
          }}
        />
      </div>

      {/* CARD 1: Marcación de Asistencia Laboral */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-white space-y-3 shadow-lg">
        <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
          A. ASISTENCIA LABORAL
        </span>

        {!clockInTime ? (
          <button
            type="button"
            onClick={handleMarkClockIn}
            className="w-full min-h-[64px] rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Clock className="h-6 w-6" />
            <span>⏱️ TOCAR PARA MARCAR HORA DE ENTRADA</span>
          </button>
        ) : (
          <div className="rounded-2xl bg-emerald-950/80 border-2 border-emerald-500 p-4 text-center space-y-1">
            <span className="text-xs text-emerald-300 font-bold block">✓ ENTRADA REGISTRADA</span>
            <div className="text-3xl font-black font-mono text-emerald-400 tracking-wider">
              {clockInTime}
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">Conforme en Garita Base</span>
          </div>
        )}
      </div>

      {/* CARD 2: Odómetro Inicial con Foto del Tablero */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-white space-y-3.5 shadow-lg">
        <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
          B. ODÓMETRO DEL TABLERO AL SALIR
        </span>

        <div>
          <label className="block text-xs text-slate-300 font-bold mb-1">
            Kilometraje Actual del Tablero (KM):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={initialOdoInput}
              onChange={(e) => setInitialOdoInput(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-2xl font-black font-mono text-amber-400 outline-none focus:border-amber-400"
            />
            <span className="font-bold text-slate-400 text-sm">KM</span>
          </div>
        </div>

        {/* Photo Button or Photo Preview */}
        {!initialOdoPhoto ? (
          <button
            type="button"
            onClick={handleTakeOdometerPhoto}
            className="w-full min-h-[64px] rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Camera className="h-6 w-6" />
            <span>📸 TOMAR FOTO AL TABLERO</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div
              onClick={() => onViewPhoto(initialOdoPhoto, 'Odómetro Inicial de Tablero')}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-emerald-500 bg-black aspect-video shadow-md"
            >
              <img
                src={initialOdoPhoto}
                alt="Odómetro de tablero"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Foto de Tablero Lista
                </span>
                <span className="text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-bold">
                  Ver
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleTakeOdometerPhoto}
                className="text-xs text-amber-400 font-bold underline"
              >
                Volver a tomar foto
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CARD 3: Verificación de Aceite y Mantenimiento */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-white space-y-3 shadow-lg">
        <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
          C. CONTROL PREVENTIVO DE ACEITE
        </span>

        <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Último Cambio Realizado:</span>
            <strong className="text-slate-200 font-mono">{unit.lastOilChangeMileage.toLocaleString()} km</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Taller / Mecánico:</span>
            <strong className="text-slate-200 truncate">{unit.lastOilChangeMechanic.split('-')[0]}</strong>
          </div>

          <div className="flex items-center justify-between border-t border-slate-800 pt-2">
            <span className="text-slate-400 font-bold">Margen Restante:</span>
            <strong className={`font-mono text-sm ${isOilOverdue ? 'text-red-400' : 'text-emerald-400'}`}>
              {kmToNextOilChange > 0 ? `${kmToNextOilChange.toLocaleString()} km` : 'Vencido'}
            </strong>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOilCheckAcknowledged(!oilCheckAcknowledged)}
          className={`w-full py-3.5 px-4 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            oilCheckAcknowledged
              ? 'border-emerald-500 bg-emerald-950 text-emerald-300'
              : 'border-slate-700 bg-slate-950 text-slate-400'
          }`}
        >
          <Check className="h-5 w-5 text-emerald-400" />
          <span>Nivel de Aceite Verificado y Conforme</span>
        </button>
      </div>

      {/* CARD 4: Checklist Preventivo Rápido */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-white space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            D. CHECKLIST PREVENTIVO
          </span>
          <button
            type="button"
            onClick={() => setShowFullChecklist(!showFullChecklist)}
            className="text-xs text-sky-400 underline font-semibold"
          >
            {showFullChecklist ? 'Ocultar Puntos' : 'Ver 30 Puntos'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleMarkChecklistAllGood}
          className="w-full min-h-[56px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all"
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>✓ MARCAR TODO EL VEHÍCULO CONFORME (B)</span>
        </button>

        {showFullChecklist && (
          <div className="pt-2">
            <Checklist30Points
              items={currentService.checklistItems}
              onUpdateItemStatus={onUpdateChecklistItem}
              onRequestPhotoUpload={onRequestPhotoUpload}
              onViewPhoto={onViewPhoto}
            />
          </div>
        )}
      </div>

      {/* GIANT CONFIRMATION & ADVANCE BUTTON */}
      <button
        type="button"
        onClick={handleConfirmIngreso}
        className="w-full min-h-[76px] rounded-3xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-2xl transition-all"
      >
        <span>✓ CONFIRMAR INGRESO Y COMENZAR RUTA</span>
        <ArrowRight className="h-7 w-7" />
      </button>
    </div>
  );
};
