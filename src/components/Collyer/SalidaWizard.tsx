import React, { useState } from 'react';
import {
  StopCircle,
  Camera,
  CheckCircle2,
  Clock,
  Gauge,
  AlertTriangle,
  Check,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  PlusCircle,
  Trash2,
  AlertCircle,
  ClipboardList,
} from 'lucide-react';
import { TransportService, DriverShift, DailyIncident, ClosingReport } from '../../types';

interface SalidaWizardProps {
  currentService: TransportService;
  onUpdateShift: (shift: DriverShift) => void;
  onRequestPhotoUpload: (title: string, onSuccess: (url: string) => void) => void;
  onViewPhoto: (url: string, title: string) => void;
  onBackToHome: () => void;
}

export const SalidaWizard: React.FC<SalidaWizardProps> = ({
  currentService,
  onUpdateShift,
  onRequestPhotoUpload,
  onViewPhoto,
  onBackToHome,
}) => {
  const shift = currentService.driver;
  const initialOdo = shift.initialOdometer;

  const [clockOutTime, setClockOutTime] = useState<string>(
    shift.clockOutTime || ''
  );
  const [finalOdoInput, setFinalOdoInput] = useState<string>(
    shift.finalOdometer ? shift.finalOdometer.toString() : (initialOdo + 320).toString()
  );
  const [finalOdoPhoto, setFinalOdoPhoto] = useState<string>(
    shift.finalOdometerPhoto || ''
  );

  const [incidents, setIncidents] = useState<DailyIncident[]>(shift.dailyIncidents || []);
  const [incidentMode, setIncidentMode] = useState<'conforme' | 'novedad'>('conforme');
  const [incidentType, setIncidentType] = useState<DailyIncident['type']>('demora_rampa');
  const [incidentDescription, setIncidentDescription] = useState<string>('');
  const [incidentPhoto, setIncidentPhoto] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const numFinalOdo = Number(finalOdoInput);
  const kmDriven = numFinalOdo && numFinalOdo >= initialOdo ? numFinalOdo - initialOdo : 0;

  const handleMarkClockOut = () => {
    const now = new Date();
    const formatted = now.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setClockOutTime(formatted);
    setErrorMessage(null);
  };

  const handleTakeFinalOdometerPhoto = () => {
    onRequestPhotoUpload('Foto Tablero: Odómetro Final al Cierre', (url) => {
      setFinalOdoPhoto(url);
      setErrorMessage(null);
    });
  };

  const handleTakeIncidentPhoto = () => {
    onRequestPhotoUpload('Foto de Novedad o Percance en Ruta', (url) => {
      setIncidentPhoto(url);
    });
  };

  const handleAddIncident = () => {
    if (!incidentDescription.trim()) {
      setErrorMessage('Por favor ingrese una breve explicación de la novedad ocurrida.');
      return;
    }

    const typeLabels: Record<DailyIncident['type'], string> = {
      demora_rampa: 'Demora en Terminal Portuario / Balanza',
      falla_mecanica: 'Falla Mecánica en Tracto o Chasis',
      trafico_peajes: 'Tráfico Severo / Retención en Peaje',
      mercancia_dano: 'Observación en Contenedor o Precinto',
      clima_ruta: 'Percance Climático en Ruta',
      ninguna: 'Jornada 100% Conforme',
    };

    const newInc: DailyIncident = {
      id: `inc-collyer-${Date.now()}`,
      type: incidentType,
      categoryLabel: typeLabels[incidentType] || 'Novedad de Ruta',
      description: incidentDescription.trim(),
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      severity: 'media',
      photoUrl: incidentPhoto || undefined,
    };

    setIncidents([...incidents, newInc]);
    setIncidentDescription('');
    setIncidentPhoto('');
    setErrorMessage(null);
  };

  const handleAddConformeIncident = () => {
    const conformeInc: DailyIncident = {
      id: `inc-conforme-${Date.now()}`,
      type: 'ninguna',
      categoryLabel: 'Jornada 100% Conforme',
      description: 'Jornada y ruta portuaria concluidas sin fallas mecánicas ni percances en contenedores.',
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      severity: 'baja',
    };
    setIncidents([conformeInc]);
    setIncidentMode('conforme');
    setErrorMessage(null);
  };

  const handleConfirmCierre = () => {
    let effectiveClockOut = clockOutTime;
    if (!effectiveClockOut) {
      const now = new Date();
      effectiveClockOut = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
      setClockOutTime(effectiveClockOut);
    }

    if (!numFinalOdo || numFinalOdo <= initialOdo) {
      setErrorMessage(
        `El odómetro final (${numFinalOdo} km) debe ser mayor al inicial (${initialOdo.toLocaleString()} km).`
      );
      return;
    }

    if (!finalOdoPhoto) {
      setErrorMessage('La foto del odómetro final del tablero es obligatoria para cerrar su jornada.');
      return;
    }

    // If no incidents logged, auto-add a conforme incident
    let finalIncidentsList = incidents;
    if (finalIncidentsList.length === 0) {
      finalIncidentsList = [
        {
          id: `inc-auto-${Date.now()}`,
          type: 'ninguna',
          categoryLabel: 'Jornada 100% Conforme',
          description: 'Jornada completada conforme y unidad entregada en base Callao.',
          timestamp: effectiveClockOut,
          severity: 'baja',
        },
      ];
    }

    const now = new Date();
    const formattedDate = now.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const closureReport: ClosingReport = {
      closedAt: formattedDate,
      clockOutTime: effectiveClockOut,
      finalOdometer: numFinalOdo,
      finalOdometerPhoto: finalOdoPhoto,
      totalKmDriven: kmDriven,
      totalHoursDriven: 10.5,
      unitFinalCondition: 'conforme',
      summaryNotes: 'Jornada cerrada por el conductor Collyer. Chasis entregado en base.',
      incidents: finalIncidentsList,
      sentToControlTower: true,
      sentToFinance: true,
      closureId: `CIERRE-COLLYER-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    onUpdateShift({
      ...shift,
      isActive: false,
      phase: 'jornada_cerrada',
      clockOutTime: effectiveClockOut,
      shiftEndTime: formattedDate,
      finalOdometer: numFinalOdo,
      finalOdometerPhoto: finalOdoPhoto,
      dailyIncidents: finalIncidentsList,
      closingReport: closureReport,
    });

    onBackToHome();
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
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white font-black">
            <StopCircle className="h-7 w-7" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400">
              PASO 3 DE LA JORNADA
            </span>
            <h2 className="text-lg font-black text-white leading-tight">
              Salida e Incidencias del Día
            </h2>
          </div>
        </div>

        {/* Tactical Plate Strip */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-3 border-t border-slate-800/80">
          <div className="rounded-xl bg-slate-950 p-2 text-center">
            <span className="text-[9px] text-slate-400 block font-semibold">
              {currentService.unit.vehicleType === 'Tracto'
                ? 'PLACA TRACTO'
                : currentService.unit.vehicleType === 'Furgón'
                ? 'PLACA FURGÓN'
                : 'PLACA VEHÍCULO'}
            </span>
            <span className="text-sm font-black text-amber-400">{currentService.unit.tractPlate}</span>
          </div>
          <div className="rounded-xl bg-slate-950 p-2 text-center">
            <span className="text-[9px] text-slate-400 block font-semibold">
              {currentService.unit.vehicleType === 'Tracto'
                ? 'PLACA CHASIS'
                : currentService.unit.vehicleType === 'Furgón'
                ? 'PRECINTO DE SEG.'
                : 'MODALIDAD'}
            </span>
            <span className="text-sm font-black text-sky-400 truncate block">
              {currentService.unit.vehicleType === 'Tracto'
                ? currentService.unit.trailerPlate
                : currentService.unit.vehicleType === 'Furgón'
                ? currentService.unit.securitySealNumber || 'COL-SEC-8910'
                : 'Express 3.5T'}
            </span>
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

      {/* CARD 1: Marcación de Salida Laboral */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-white space-y-3 shadow-lg">
        <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider block">
          A. SALIDA LABORAL (FIN DE TURNO)
        </span>

        {!clockOutTime ? (
          <button
            type="button"
            onClick={handleMarkClockOut}
            className="w-full min-h-[64px] rounded-2xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Clock className="h-6 w-6" />
            <span>⏱️ TOCAR PARA MARCAR HORA DE SALIDA</span>
          </button>
        ) : (
          <div className="rounded-2xl bg-slate-950 border-2 border-red-500 p-4 text-center space-y-1">
            <span className="text-xs text-red-400 font-bold block">✓ SALIDA REGISTRADA</span>
            <div className="text-3xl font-black font-mono text-white tracking-wider">
              {clockOutTime}
            </div>
            <span className="text-[11px] text-slate-400 block font-mono">Conforme en Garita de Retorno</span>
          </div>
        )}
      </div>

      {/* CARD 2: Odómetro Final y Foto del Tablero */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-white space-y-3.5 shadow-lg">
        <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
          B. ODÓMETRO DEL TABLERO AL TERMINAR
        </span>

        <div>
          <label className="block text-xs text-slate-300 font-bold mb-1">
            Kilometraje Final del Tablero (KM):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={finalOdoInput}
              onChange={(e) => setFinalOdoInput(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-2xl font-black font-mono text-amber-400 outline-none focus:border-amber-400"
            />
            <span className="font-bold text-slate-400 text-sm">KM</span>
          </div>
          <div className="text-xs text-slate-400 font-mono mt-1.5 flex items-center justify-between">
            <span>Inicial: {initialOdo.toLocaleString()} km</span>
            <strong className="text-emerald-400">Recorrido: {kmDriven} km</strong>
          </div>
        </div>

        {/* Photo Button or Photo Preview */}
        {!finalOdoPhoto ? (
          <button
            type="button"
            onClick={handleTakeFinalOdometerPhoto}
            className="w-full min-h-[64px] rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Camera className="h-6 w-6" />
            <span>📸 TOMAR FOTO AL TABLERO (FINAL)</span>
          </button>
        ) : (
          <div className="space-y-2">
            <div
              onClick={() => onViewPhoto(finalOdoPhoto, 'Odómetro Final de Tablero')}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-emerald-500 bg-black aspect-video shadow-md"
            >
              <img
                src={finalOdoPhoto}
                alt="Odómetro de tablero final"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Foto Final Registrada
                </span>
                <span className="text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-bold">
                  Ver
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleTakeFinalOdometerPhoto}
                className="text-xs text-amber-400 font-bold underline"
              >
                Volver a tomar foto
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CARD 3: Registro Obligatorio de Incidencias del Día */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-white space-y-4 shadow-lg">
        <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
          C. REGISTRO DE INCIDENCIAS DEL DÍA
        </span>

        {/* 2 Big Choice Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setIncidentMode('conforme');
              handleAddConformeIncident();
            }}
            className={`p-3.5 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-2 transition-all ${
              incidentMode === 'conforme'
                ? 'border-emerald-500 bg-emerald-950 text-emerald-300'
                : 'border-slate-800 bg-slate-950 text-slate-400'
            }`}
          >
            <Check className="h-5 w-5 text-emerald-400" />
            <span>✅ Sin Novedades (Todo Conforme)</span>
          </button>

          <button
            type="button"
            onClick={() => setIncidentMode('novedad')}
            className={`p-3.5 rounded-2xl border-2 font-black text-xs flex items-center justify-center gap-2 transition-all ${
              incidentMode === 'novedad'
                ? 'border-amber-400 bg-amber-950 text-amber-300'
                : 'border-slate-800 bg-slate-950 text-slate-400'
            }`}
          >
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <span>⚠️ Tuve un Percance o Demora</span>
          </button>
        </div>

        {/* If Mode === Novedad, show simple input */}
        {incidentMode === 'novedad' && (
          <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                ¿Qué tipo de problema ocurrió?
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as DailyIncident['type'])}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs font-bold text-white outline-none"
              >
                <option value="demora_rampa">⏳ Demora en Terminal Portuario / Balanza</option>
                <option value="falla_mecanica">⚙️ Falla Mecánica en Tracto o Chasis</option>
                <option value="trafico_peajes">🚗 Tráfico Severo o Retención en Peaje</option>
                <option value="mercancia_dano">📦 Observación en Contenedor o Precinto</option>
                <option value="clima_ruta">🌧️ Percance Climático en Ruta</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Explica brevemente lo ocurrido:
              </label>
              <textarea
                rows={2}
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                placeholder="Ej. Demora de 45 min en APM Terminals por cola en balanza de salida..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={handleTakeIncidentPhoto}
                className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Camera className="h-4 w-4 text-slate-400" />
                <span>{incidentPhoto ? 'Foto Adjunta' : 'Foto de respaldo'}</span>
              </button>

              <button
                type="button"
                onClick={handleAddIncident}
                className="py-2.5 px-4 rounded-xl bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 hover:bg-amber-300"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Guardar en Bitácora</span>
              </button>
            </div>
          </div>
        )}

        {/* Incidents preview */}
        {incidents.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-mono text-slate-400 font-bold block">
              Novedades registradas ({incidents.length}):
            </span>
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-300 flex items-center justify-between gap-2"
              >
                <div>
                  <strong className="text-amber-400">{inc.categoryLabel}:</strong>{' '}
                  <span>{inc.description}</span>
                </div>
                {inc.photoUrl && (
                  <button
                    type="button"
                    onClick={() => onViewPhoto(inc.photoUrl!, inc.categoryLabel)}
                    className="text-[10px] text-sky-400 font-bold underline shrink-0"
                  >
                    Foto
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GIANT FINAL ACTION BUTTON */}
      <button
        type="button"
        onClick={handleConfirmCierre}
        className="w-full min-h-[76px] rounded-3xl bg-red-600 hover:bg-red-500 active:scale-98 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-2xl transition-all"
      >
        <span>✓ TRANSMITIR REPORTE Y CERRAR TURNO</span>
        <ArrowRight className="h-7 w-7" />
      </button>
    </div>
  );
};
