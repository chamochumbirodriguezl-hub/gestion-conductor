import React, { useState } from 'react';
import {
  StopCircle,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Gauge,
  ShieldCheck,
  Send,
  FileText,
  Truck,
  Check,
  AlertCircle,
  PlusCircle,
  Trash2,
  MessageSquare,
  ShieldAlert,
  ClipboardList,
  Sparkles,
} from 'lucide-react';
import {
  TransportService,
  DriverShift,
  ClosingChecklistItem,
  ClosingReport,
  ChecklistStatus,
  DailyIncident,
} from '../../types';
import { CLOSING_CHECKLIST_ITEMS } from '../../data/mockData';

interface ShiftClosingModuleProps {
  currentService: TransportService;
  onUpdateShift: (shift: DriverShift) => void;
  onRequestPhotoUpload: (title: string, onSuccess: (url: string) => void) => void;
  onViewPhoto: (url: string, title: string) => void;
}

export const ShiftClosingModule: React.FC<ShiftClosingModuleProps> = ({
  currentService,
  onUpdateShift,
  onRequestPhotoUpload,
  onViewPhoto,
}) => {
  const shift = currentService.driver;
  const initialOdo = shift.initialOdometer;

  // 1. Registro de Salida Laboral (Clock Out)
  const [clockOutTime, setClockOutTime] = useState<string>(
    shift.clockOutTime || ''
  );

  // 2. Kilometraje Final del Odómetro y Foto Obligatoria
  const [finalOdoInput, setFinalOdoInput] = useState<string>(
    shift.finalOdometer ? shift.finalOdometer.toString() : (initialOdo + 350).toString()
  );
  const [finalOdoPhoto, setFinalOdoPhoto] = useState<string>(shift.finalOdometerPhoto || '');

  // 3. Módulo Obligatorio de Registro de Incidencias del Día (Bitácora Diaria)
  const [incidents, setIncidents] = useState<DailyIncident[]>(
    shift.dailyIncidents && shift.dailyIncidents.length > 0
      ? shift.dailyIncidents
      : []
  );

  // Incident form draft
  const [incidentType, setIncidentType] = useState<DailyIncident['type']>('ninguna');
  const [incidentSeverity, setIncidentSeverity] = useState<DailyIncident['severity']>('baja');
  const [incidentDescription, setIncidentDescription] = useState<string>('');
  const [incidentPhoto, setIncidentPhoto] = useState<string>('');
  const [incidentSuccessMsg, setIncidentSuccessMsg] = useState<string | null>(null);

  // 4. Inspección Visual de Cierre
  const [items, setItems] = useState<ClosingChecklistItem[]>(
    shift.closingChecklist && shift.closingChecklist.length > 0
      ? shift.closingChecklist
      : CLOSING_CHECKLIST_ITEMS
  );

  // 5. Dictamen y Resumen Final
  const [unitCondition, setUnitCondition] = useState<
    'conforme' | 'con_observaciones' | 'requiere_taller_urgente'
  >(shift.closingReport?.unitFinalCondition || 'conforme');

  const [summaryNotes, setSummaryNotes] = useState<string>(
    shift.closingReport?.summaryNotes ||
      'Jornada y ruta completadas conforme. Unidad estacionada en base con frenos de seguridad, cabina aseada y llaves en garita.'
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numFinalOdo = Number(finalOdoInput);
  const kmDriven = numFinalOdo && numFinalOdo >= initialOdo ? numFinalOdo - initialOdo : 0;

  // Calculate hours worked
  const calculateHours = () => {
    if (!shift.shiftStartTime) return 10;
    try {
      const parts = shift.shiftStartTime.split(' ');
      if (parts.length >= 2) {
        const timePart = parts[1];
        const [h, m] = timePart.split(':').map(Number);
        const now = new Date();
        const startHours = h + (m || 0) / 60;
        const currentHours = now.getHours() + now.getMinutes() / 60;
        let diff = currentHours - startHours;
        if (diff < 0) diff += 24;
        return Number(Math.max(1, diff).toFixed(1));
      }
    } catch {
      return 9.5;
    }
    return 9.5;
  };

  const hoursWorked = calculateHours();

  // Mark Clock Out
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

  // Add Incident to Bitácora
  const handleAddIncident = () => {
    if (!incidentDescription.trim()) {
      setErrorMessage('Debe ingresar una descripción de la novedad o confirmar el estado de la jornada.');
      return;
    }

    const typeLabels: Record<DailyIncident['type'], string> = {
      falla_mecanica: 'Falla Mecánica / Desperfecto',
      demora_rampa: 'Demora en Rampa / Carga o Descarga',
      trafico_peajes: 'Tráfico Severo / Retención en Peaje',
      clima_ruta: 'Percance Climático en Carretera',
      mercancia_dano: 'Observación en Mercancía / Embalaje',
      ninguna: 'Jornada 100% Conforme (Sin Novedad)',
    };

    const newIncident: DailyIncident = {
      id: `inc-${Date.now()}`,
      type: incidentType,
      categoryLabel: typeLabels[incidentType],
      description: incidentDescription.trim(),
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      severity: incidentType === 'ninguna' ? 'baja' : incidentSeverity,
      photoUrl: incidentPhoto || undefined,
    };

    const updatedIncidents = [...incidents, newIncident];
    setIncidents(updatedIncidents);

    // Reset draft fields
    setIncidentDescription('');
    setIncidentPhoto('');
    setIncidentType('ninguna');
    setIncidentSeverity('baja');
    setErrorMessage(null);
    setIncidentSuccessMsg('Novedad registrada formalmente en la bitácora diaria.');
    setTimeout(() => setIncidentSuccessMsg(null), 3500);
  };

  const handleRemoveIncident = (id: string) => {
    setIncidents((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateItemStatus = (id: string, status: ChecklistStatus) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)));
  };

  const handleMarkAllGood = () => {
    setItems((prev) => prev.map((it) => ({ ...it, status: 'B' })));
  };

  const handleTakeFinalPhoto = () => {
    onRequestPhotoUpload('Foto Obligatoria: Tablero al Cierre de Jornada (Odómetro Final)', (url) => {
      setFinalOdoPhoto(url);
      setErrorMessage(null);
    });
  };

  const handleTakeIncidentPhoto = () => {
    onRequestPhotoUpload('Foto de Respaldo: Incidencia / Novedad en Ruta', (url) => {
      setIncidentPhoto(url);
    });
  };

  const handleSubmitClosing = () => {
    // 1. Clock Out validation
    let effectiveClockOut = clockOutTime;
    if (!effectiveClockOut) {
      const now = new Date();
      effectiveClockOut = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setClockOutTime(effectiveClockOut);
    }

    // 2. Final Odometer validation
    if (!numFinalOdo || numFinalOdo <= initialOdo) {
      setErrorMessage(
        `El odómetro final (${numFinalOdo} km) debe ser mayor al odómetro inicial registrado (${initialOdo.toLocaleString()} km).`
      );
      return;
    }

    // 3. Mandatory Dashboard Photo
    if (!finalOdoPhoto) {
      setErrorMessage(
        'La fotografía del odómetro final del tablero es ESTRICTAMENTE OBLIGATORIA para certificar el recorrido y cerrar la bitácora.'
      );
      return;
    }

    // 4. Mandatory Daily Incidents Log validation
    if (incidents.length === 0) {
      setErrorMessage(
        'Módulo obligatorio de Incidencias: Debe registrar al menos una entrada en su bitácora diaria (detalle de novedad o confirmar "Jornada 100% Conforme").'
      );
      return;
    }

    // 5. Visual Inspection validation
    const uncompletedItems = items.filter((it) => it.status === null);
    if (uncompletedItems.length > 0) {
      setErrorMessage(
        `Debe calificar todos los puntos de la inspección visual de cierre (${uncompletedItems.length} pendientes).`
      );
      return;
    }

    setIsSubmitting(true);
    const now = new Date();
    const formattedDate = now.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const closureCode = `CIERRE-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const closingReport: ClosingReport = {
      closedAt: formattedDate,
      clockOutTime: effectiveClockOut,
      finalOdometer: numFinalOdo,
      finalOdometerPhoto: finalOdoPhoto,
      totalKmDriven: kmDriven,
      totalHoursDriven: hoursWorked,
      unitFinalCondition: unitCondition,
      summaryNotes,
      incidents,
      sentToControlTower: true,
      sentToFinance: true,
      closureId: closureCode,
    };

    onUpdateShift({
      ...shift,
      isActive: false,
      phase: 'jornada_cerrada',
      clockOutTime: effectiveClockOut,
      shiftEndTime: formattedDate,
      finalOdometer: numFinalOdo,
      finalOdometerPhoto: finalOdoPhoto,
      dailyIncidents: incidents,
      closingChecklist: items,
      closingReport,
    });

    setIsSubmitting(false);
    setErrorMessage(null);
  };

  const isClosed = shift.phase === 'jornada_cerrada';
  const report = shift.closingReport;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600 text-white font-bold">
              <StopCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                  MÓDULO DE FIN DE JORNADA
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-mono">SALIDA LABORAL & BITÁCORA DIARIA</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                2. Cierre de Jornada y Registro de Incidencias del Día
              </h2>
            </div>
          </div>

          <div>
            {isClosed ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Jornada Cerrada y Bitácora Emitida
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-bold text-amber-900">
                <Clock className="h-4 w-4 text-amber-600" />
                Cierre de Turno Pendiente
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-3">
          Este registro formaliza la <strong>Salida Laboral</strong>, audita el kilometraje final del odómetro mediante fotografía obligatoria del tablero, consolida la <strong>Bitácora de Incidencias del Día</strong> y remite el reporte final a la Torre de Control y Finanzas.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-800 flex items-start gap-3 shadow-xs">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold mb-0.5">Requisito de Seguridad Pendiente:</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {incidentSuccessMsg && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{incidentSuccessMsg}</span>
        </div>
      )}

      {/* Display Summary Certificate if Closed */}
      {isClosed && report && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200 pb-4">
            <div>
              <div className="text-xs font-mono font-bold text-emerald-800">
                CONSTANCIA DE CIERRE FORMAL: {report.closureId}
              </div>
              <h3 className="text-lg font-extrabold text-emerald-950 mt-0.5">
                Bitácora y Cierre de Jornada Emitidos Exitosamente
              </h3>
              <p className="text-xs text-emerald-700">
                Hora de Salida: <strong>{report.clockOutTime}</strong> · Transmitido el {report.closedAt}
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs">
              <ShieldCheck className="h-4 w-4" />
              Operación y Bitácora Transmitidas
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="rounded-lg bg-white p-3 border border-emerald-200">
              <span className="text-slate-400 block text-[11px]">Odómetro Inicial:</span>
              <strong className="text-sm font-mono text-slate-800">
                {initialOdo.toLocaleString()} km
              </strong>
            </div>

            <div className="rounded-lg bg-white p-3 border border-emerald-200">
              <span className="text-slate-400 block text-[11px]">Odómetro Final:</span>
              <strong className="text-sm font-mono text-slate-800">
                {report.finalOdometer.toLocaleString()} km
              </strong>
            </div>

            <div className="rounded-lg bg-white p-3 border border-emerald-200">
              <span className="text-slate-400 block text-[11px]">Recorrido del Día:</span>
              <strong className="text-base font-mono font-black text-emerald-700">
                {report.totalKmDriven.toLocaleString()} km
              </strong>
            </div>

            <div className="rounded-lg bg-white p-3 border border-emerald-200">
              <span className="text-slate-400 block text-[11px]">Horas Conducidas:</span>
              <strong className="text-base font-mono font-black text-slate-800">
                {report.totalHoursDriven} hrs
              </strong>
            </div>
          </div>

          {/* Incidents Recorded in Report */}
          <div className="bg-white rounded-lg border border-emerald-200 p-4 space-y-2 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-emerald-700" />
              <span>Bitácora de Novedades del Turno Registradas ({report.incidents?.length || 0}):</span>
            </div>
            {report.incidents && report.incidents.length > 0 ? (
              <div className="space-y-2">
                {report.incidents.map((inc) => (
                  <div key={inc.id} className="rounded-md bg-slate-50 border border-slate-200 p-2.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{inc.categoryLabel}</span>
                      <span className="font-mono text-slate-500">{inc.timestamp}</span>
                    </div>
                    <p className="text-slate-600 mt-1">{inc.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 italic">Jornada 100% conforme sin incidencias.</div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-emerald-200 pt-3 text-xs">
            <div className="text-slate-700">
              <strong>Estado Final:</strong>{' '}
              <span className="capitalize font-semibold text-emerald-900">
                {report.unitFinalCondition.replace('_', ' ')}
              </span>
              <span className="mx-2 text-emerald-400">·</span>
              <span>{report.summaryNotes}</span>
            </div>

            {report.finalOdometerPhoto && (
              <button
                type="button"
                onClick={() =>
                  onViewPhoto(
                    report.finalOdometerPhoto,
                    `Foto Odómetro Final - ${report.finalOdometer} km`
                  )
                }
                className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:underline"
              >
                <Camera className="h-4 w-4" />
                Ver Foto Tablero Certificada
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Closing Form (Active while shift not closed) */}
      {!isClosed && (
        <div className="space-y-6">
          {/* SECCIÓN 1: Registro de Salida Laboral (Marcación de Fin de Jornada) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-red-600" />
                  1. Registro de Salida Laboral (Marcación de Fin de Turno)
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Marcación formal de hora de salida al culminar la operación y retornar a base
                </p>
              </div>

              {!clockOutTime ? (
                <button
                  type="button"
                  onClick={handleMarkClockOut}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 transition-colors shadow-xs"
                >
                  <Clock className="h-4 w-4" />
                  Marcar Hora de Salida Laboral
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Hora de Salida Registrada: <strong className="font-mono text-sm">{clockOutTime}</strong></span>
                  <button
                    type="button"
                    onClick={handleMarkClockOut}
                    className="text-[10px] text-slate-500 underline ml-1 hover:text-slate-800"
                  >
                    Actualizar
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Conductor:</span>
                <strong className="text-slate-800">{shift.driverName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Hora de Entrada (Apertura):</span>
                <strong className="text-slate-800 font-mono">{shift.clockInTime || '06:00 AM'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Horas Totales Estimadas:</span>
                <strong className="text-slate-900 font-mono text-sm">{hoursWorked} horas de servicio</strong>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Kilometraje Final del Odómetro y Foto Obligatoria del Tablero */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-amber-600" />
                2. Kilometraje Final del Odómetro con Foto Obligatoria del Tablero
              </span>
              <span className="text-xs font-mono text-slate-500">
                Lectura Inicial: {initialOdo.toLocaleString()} km
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lectura del Odómetro de Cierre (KM)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={finalOdoInput}
                    onChange={(e) => setFinalOdoInput(e.target.value)}
                    placeholder="Ej. 254820"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono font-bold text-slate-900 outline-none focus:border-red-500"
                  />
                  <span className="text-xs font-bold text-slate-500">KM</span>
                </div>
              </div>

              {/* Calculated Stats */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Recorrido Exacto de la Jornada:
                </span>
                <div className="text-xl font-black font-mono text-slate-900">
                  {kmDriven > 0 ? `${kmDriven.toLocaleString()} km` : '0 km'}
                </div>
                <span className="text-[10px] text-slate-400">
                  Final ({numFinalOdo || 0}) - Inicial ({initialOdo})
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Horas de Operación Acumuladas:
                </span>
                <div className="text-xl font-black font-mono text-slate-900">
                  {hoursWorked} hrs
                </div>
                <span className="text-[10px] text-slate-400">
                  Conforme a regulaciones del MTC
                </span>
              </div>
            </div>

            {/* Mandatory Photo of Final Dashboard */}
            <div className="rounded-lg border border-red-200 bg-red-50/40 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-red-950 flex items-center gap-1.5 uppercase">
                    <Camera className="h-4 w-4 text-red-600" />
                    Fotografía Obligatoria del Tablero (Odómetro Final)
                  </span>
                  <p className="text-[11px] text-red-800">
                    Debe mostrar con total claridad la lectura final de kilometraje para auditar ruta y consumo de combustible.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleTakeFinalPhoto}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-slate-800 transition-colors shadow-xs shrink-0"
                >
                  <Camera className="h-4 w-4" />
                  {finalOdoPhoto ? 'Cambiar Foto de Tablero' : 'Tomar Foto Obligatoria del Tablero'}
                </button>
              </div>

              {finalOdoPhoto ? (
                <div className="flex items-center gap-3 pt-1">
                  <div
                    onClick={() =>
                      onViewPhoto(finalOdoPhoto, 'Foto Tablero - Odómetro Final')
                    }
                    className="group relative h-16 w-28 overflow-hidden rounded-lg border border-slate-300 cursor-pointer shadow-xs"
                  >
                    <img
                      src={finalOdoPhoto}
                      alt="Odómetro Final"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-[10px] font-bold text-white">
                      Zoom
                    </div>
                  </div>
                  <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Foto de odómetro final adjunta y certificada
                  </div>
                </div>
              ) : (
                <div className="rounded border border-dashed border-red-300 bg-white p-2.5 text-xs text-red-600">
                  ⚠️ Fotografía pendiente. Requisito indispensable para emitir el cierre de turno.
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 3: MÓDULO OBLIGATORIO DE REGISTRO DE INCIDENCIAS DEL DÍA (Bitácora Diaria) */}
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50/20 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4 text-amber-600" />
                  3. Módulo Obligatorio: Registro de Incidencias del Día (Bitácora Diaria)
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Espacio obligatorio donde el conductor detalla cualquier novedad, falla mecánica, demora o percance ocurrido durante el turno
                </p>
              </div>

              <div className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-lg border border-slate-200">
                Incidencias Registradas: <span className="text-amber-600 font-mono">{incidents.length}</span>
              </div>
            </div>

            {/* Entry Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Tipo de Novedad / Incidencia:
                  </label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value as DailyIncident['type'])}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-amber-500"
                  >
                    <option value="ninguna">✅ Sin Incidencias / Operación 100% Conforme</option>
                    <option value="falla_mecanica">⚙️ Falla Mecánica / Desperfecto en Ruta</option>
                    <option value="demora_rampa">⏳ Demora en Rampa / Carga o Descarga en Cliente</option>
                    <option value="trafico_peajes">🚗 Tráfico Severo / Retenciones en Peaje / Desvío</option>
                    <option value="clima_ruta">🌧️ Percance Climático en Ruta (Neblina, Lluvia, etc.)</option>
                    <option value="mercancia_dano">📦 Observación o Daño en Mercancía / Embalaje</option>
                  </select>
                </div>

                {incidentType !== 'ninguna' && (
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Nivel de Severidad del Percance:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'baja', label: 'Baja', color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
                        { key: 'media', label: 'Media', color: 'bg-amber-50 text-amber-900 border-amber-300' },
                        { key: 'alta', label: 'Crítica / Alta', color: 'bg-red-50 text-red-900 border-red-300' },
                      ].map((sev) => (
                        <button
                          key={sev.key}
                          type="button"
                          onClick={() => setIncidentSeverity(sev.key as DailyIncident['severity'])}
                          className={`rounded-md border py-2 text-xs font-bold transition-all ${
                            incidentSeverity === sev.key
                              ? `${sev.color} ring-2 ring-slate-900 shadow-2xs`
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {sev.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Detalle y Explicación de la Novedad (Obligatorio en Bitácora):
                </label>
                <textarea
                  rows={2}
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  placeholder={
                    incidentType === 'ninguna'
                      ? 'Ej. Operación realizada con normalidad. Sin fallas mecánicas, demoras en rampa ni percances en carretera.'
                      : 'Detalle lugar exacto, hora del suceso, causas de la demora o falla mecánica observada...'
                  }
                  className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTakeIncidentPhoto}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    <Camera className="h-3.5 w-3.5 text-slate-600" />
                    <span>{incidentPhoto ? 'Foto Adjunta (Cambiar)' : 'Adjuntar Foto de Evidencia'}</span>
                  </button>

                  {incidentPhoto && (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Foto lista
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddIncident}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-extrabold text-slate-950 hover:bg-amber-400 transition-colors shadow-xs shrink-0"
                >
                  <PlusCircle className="h-4 w-4" />
                  Registrar en Bitácora Diaria
                </button>
              </div>
            </div>

            {/* List of Logged Incidents */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Bitácora de Novedades del Turno ({incidents.length}):
              </span>

              {incidents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-amber-300 bg-white p-4 text-center text-xs text-amber-900">
                  ⚠️ No ha registrado aún ninguna entrada en la bitácora. Seleccione una categoría y agregue el reporte para poder cerrar el turno.
                </div>
              ) : (
                <div className="space-y-2">
                  {incidents.map((inc) => (
                    <div
                      key={inc.id}
                      className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono ${
                            inc.severity === 'alta'
                              ? 'bg-red-100 text-red-800'
                              : inc.severity === 'media'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {inc.categoryLabel}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Hora: {inc.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium">{inc.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {inc.photoUrl && (
                          <button
                            type="button"
                            onClick={() => onViewPhoto(inc.photoUrl!, `Incidencia: ${inc.categoryLabel}`)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded hover:bg-sky-100"
                          >
                            <Camera className="h-3.5 w-3.5" /> Ver Foto
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveIncident(inc.id)}
                          className="text-slate-400 hover:text-red-600 p-1"
                          title="Eliminar de bitácora"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 4: Inspección Visual de Cierre Post-Operacional */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-red-600" />
                  4. Inspección Visual de Cierre y Verificación de Daños Post-Ruta
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspección técnica de neumáticos en caliente, fluidos, carrocería, frenos y cabina
                </p>
              </div>

              <button
                type="button"
                onClick={handleMarkAllGood}
                className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-amber-400 hover:bg-slate-800 transition-colors shadow-xs shrink-0"
              >
                Marcar Todo Conforme (B)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((item) => {
                const isGood = item.status === 'B';
                const isFail = item.status === 'F';
                return (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-3.5 transition-all ${
                      isFail
                        ? 'border-red-400 bg-red-50/60 shadow-xs'
                        : isGood
                        ? 'border-slate-200 bg-white'
                        : 'border-dashed border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                          {item.category}
                        </div>
                        <div className="text-xs font-semibold text-slate-900 mt-0.5 leading-snug">
                          {item.label}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemStatus(item.id, 'B')}
                          className={`flex h-8 w-9 items-center justify-center rounded font-black text-xs transition-all ${
                            isGood
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                          }`}
                          title="Bueno / Conforme"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateItemStatus(item.id, 'F')}
                          className={`flex h-8 w-9 items-center justify-center rounded font-black text-xs transition-all ${
                            isFail
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-red-50'
                          }`}
                          title="Falla / Daño Detectado"
                        >
                          F
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECCIÓN 5: Dictamen y Observaciones Finales */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <FileText className="h-4 w-4 text-red-600" />
              5. Dictamen Operativo y Cierre Oficial de la Jornada
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  key: 'conforme',
                  label: 'Unidad Conforme',
                  desc: 'Apta para siguiente turno o viaje',
                  color: 'border-emerald-500 bg-emerald-50/50 text-emerald-950',
                },
                {
                  key: 'con_observaciones',
                  label: 'Con Observaciones Menores',
                  desc: 'Desgaste operacional sin impedimento',
                  color: 'border-amber-500 bg-amber-50/50 text-amber-950',
                },
                {
                  key: 'requiere_taller_urgente',
                  label: 'Requiere Taller Urgente',
                  desc: 'Bloqueo preventivo en base',
                  color: 'border-red-500 bg-red-50/50 text-red-950',
                },
              ].map((opt) => (
                <div
                  key={opt.key}
                  onClick={() =>
                    setUnitCondition(
                      opt.key as 'conforme' | 'con_observaciones' | 'requiere_taller_urgente'
                    )
                  }
                  className={`cursor-pointer rounded-lg border-2 p-3 text-xs transition-all ${
                    unitCondition === opt.key ? opt.color : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observaciones Generales de Entrega y Cierre
              </label>
              <textarea
                rows={2}
                value={summaryNotes}
                onChange={(e) => setSummaryNotes(e.target.value)}
                placeholder="Indique novedades de entrega de llaves, estacionamiento en patio, precintos o novedades generales..."
                className="w-full rounded-md border border-slate-300 p-2.5 text-xs text-slate-900 outline-none focus:border-red-500"
              />
            </div>

            {/* Submission Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="text-xs text-slate-500">
                Al certificar, se transmitirá el reporte completo con bitácora de novedades a la Torre de Control y Finanzas, concluyendo formalmente el servicio.
              </div>

              <button
                type="button"
                onClick={handleSubmitClosing}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-xs font-bold text-white hover:bg-red-700 transition-all shadow-md shrink-0"
              >
                <Send className="h-4 w-4" />
                CERTIFICAR SALIDA Y TRANSMITIR BITÁCORA DIARIA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
