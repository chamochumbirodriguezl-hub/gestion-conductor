import React, { useState } from 'react';
import {
  PlayCircle,
  StopCircle,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Gauge,
  ShieldCheck,
  User,
  Wrench,
  Check,
  ClipboardCheck,
  AlertCircle,
  Truck,
  Layers,
  Send,
  FileText,
  PlusCircle,
  Trash2,
  ClipboardList,
} from 'lucide-react';
import {
  TransportService,
  DriverShift,
  ChecklistItem,
  ChecklistStatus,
  DailyIncident,
  ClosingChecklistItem,
  ClosingReport,
} from '../../types';
import { Checklist30Points } from '../DriverView/Checklist30Points';
import { CLOSING_CHECKLIST_ITEMS } from '../../data/mockData';

interface CollyerShiftModuleProps {
  currentService: TransportService;
  onUpdateShift: (shift: DriverShift) => void;
  onUpdateChecklistItem: (id: string, status: ChecklistStatus, notes?: string) => void;
  onRequestPhotoUpload: (title: string, onSuccess: (url: string) => void) => void;
  onViewPhoto: (url: string, title: string) => void;
  onUnlockContainerCycle: () => void;
}

export const CollyerShiftModule: React.FC<CollyerShiftModuleProps> = ({
  currentService,
  onUpdateShift,
  onUpdateChecklistItem,
  onRequestPhotoUpload,
  onViewPhoto,
  onUnlockContainerCycle,
}) => {
  const shift = currentService.driver;
  const unit = currentService.unit;

  const isOpeningPending = shift.phase === 'apertura_pendiente';
  const isClosingPending = shift.phase === 'cierre_pendiente' || (shift.phase === 'en_ruta' && currentService.stages.every((s) => s.isCompleted));
  const isShiftClosed = shift.phase === 'jornada_cerrada';

  // Sub-moment selector: Inicio del Día vs Fin del Día
  const [activeMoment, setActiveMoment] = useState<'inicio' | 'fin'>(
    isOpeningPending ? 'inicio' : isClosingPending || isShiftClosed ? 'fin' : 'inicio'
  );

  // --- MOMENTO 1: INGRESO ---
  const [clockInTime, setClockInTime] = useState<string>(shift.clockInTime || '');
  const [driverName, setDriverName] = useState(shift.driverName);
  const [driverLicense, setDriverLicense] = useState(shift.driverLicense);
  const [initialOdoInput, setInitialOdoInput] = useState<string>(shift.initialOdometer.toString());
  const [initialOdoPhoto, setInitialOdoPhoto] = useState<string>(shift.initialOdometerPhoto || '');
  const [oilCheckAcknowledged, setOilCheckAcknowledged] = useState<boolean>(
    shift.initialOilCheckAcknowledged !== undefined ? shift.initialOilCheckAcknowledged : false
  );
  const [initialFuelTankLevel, setInitialFuelTankLevel] = useState<string>(
    shift.initialFuelTankLevel || '95% (Tanque Lleno)'
  );

  // --- MOMENTO 2: SALIDA & INCIDENCIAS ---
  const [clockOutTime, setClockOutTime] = useState<string>(shift.clockOutTime || '');
  const initialOdo = shift.initialOdometer;
  const [finalOdoInput, setFinalOdoInput] = useState<string>(
    shift.finalOdometer ? shift.finalOdometer.toString() : (initialOdo + 320).toString()
  );
  const [finalOdoPhoto, setFinalOdoPhoto] = useState<string>(shift.finalOdometerPhoto || '');
  const [incidents, setIncidents] = useState<DailyIncident[]>(shift.dailyIncidents || []);
  const [incidentType, setIncidentType] = useState<DailyIncident['type']>('ninguna');
  const [incidentSeverity, setIncidentSeverity] = useState<DailyIncident['severity']>('baja');
  const [incidentDescription, setIncidentDescription] = useState<string>('');
  const [incidentPhoto, setIncidentPhoto] = useState<string>('');
  const [incidentFeedback, setIncidentFeedback] = useState<string | null>(null);

  const [closingItems, setClosingItems] = useState<ClosingChecklistItem[]>(
    shift.closingChecklist && shift.closingChecklist.length > 0
      ? shift.closingChecklist
      : CLOSING_CHECKLIST_ITEMS
  );
  const [unitFinalCondition, setUnitFinalCondition] = useState<
    'conforme' | 'con_observaciones' | 'requiere_taller_urgente'
  >(shift.closingReport?.unitFinalCondition || 'conforme');
  const [summaryNotes, setSummaryNotes] = useState<string>(
    shift.closingReport?.summaryNotes ||
      'Jornada portuaria y entrega de contenedor concluidas. Chasis estacionado en base Callao, twistlocks operativos y llaves en garita.'
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Preventive Maintenance Calculations
  const kmToNextOilChange = (unit.lastOilChangeMileage + unit.oilChangeInterval) - unit.currentMileage;
  const isOilOverdue = kmToNextOilChange <= 0;
  const isOilWarning = kmToNextOilChange > 0 && kmToNextOilChange <= 1500;

  // Checklist Count
  const checklistItems = currentService.checklistItems;
  const completedChecklistCount = checklistItems.filter((i) => i.status !== null).length;
  const criticalFails = checklistItems.filter((i) => i.status === 'F' && i.isCritical);

  // Final Odometer & Driving Calculation
  const numFinalOdo = Number(finalOdoInput);
  const kmDriven = numFinalOdo && numFinalOdo >= initialOdo ? numFinalOdo - initialOdo : 0;

  const calculateHours = () => {
    if (!shift.shiftStartTime) return 9.5;
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

  // Handlers for Moment 1 (Ingreso)
  const handleMarkClockIn = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setClockInTime(formattedTime);
    setErrorMessage(null);
  };

  const handleTakeInitialPhoto = () => {
    onRequestPhotoUpload('Foto Obligatoria: Tablero al Inicio de Jornada (Odómetro Inicial)', (url) => {
      setInitialOdoPhoto(url);
      setErrorMessage(null);
    });
  };

  const handleCertifyOpening = () => {
    if (!clockInTime) {
      setErrorMessage('Debe presionar el botón "Marcar Hora de Entrada Laboral" antes de continuar.');
      return;
    }

    const odoNum = Number(initialOdoInput);
    if (!odoNum || odoNum <= 0) {
      setErrorMessage('Debe ingresar un valor numérico válido para el kilometraje inicial del odómetro.');
      return;
    }

    if (!initialOdoPhoto) {
      setErrorMessage(
        'La fotografía del odómetro del tablero al inicio del día es ESTRICTAMENTE OBLIGATORIA.'
      );
      return;
    }

    if (!oilCheckAcknowledged) {
      setErrorMessage(
        'Debe validar la condición del último cambio de aceite y marcar la casilla de conformidad.'
      );
      return;
    }

    if (completedChecklistCount < 30) {
      setErrorMessage(
        `Debe calificar los 30 puntos del checklist preventivo de la unidad (calificados ${completedChecklistCount}/30).`
      );
      return;
    }

    if (criticalFails.length > 0) {
      setErrorMessage(
        `BLOQUEO OPERATIVO: Hay ${criticalFails.length} falla(s) crítica(s) de seguridad. Reporte inmediatamente al taller Collyer.`
      );
      return;
    }

    const now = new Date();
    const formattedTimestamp = now.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    onUpdateShift({
      ...shift,
      driverName,
      driverLicense,
      clockInTime,
      attendanceMarked: true,
      isActive: true,
      phase: 'en_ruta',
      shiftStartTime: shift.shiftStartTime || formattedTimestamp,
      initialOdometer: odoNum,
      initialOdometerPhoto: initialOdoPhoto,
      initialChecklistCompleted: true,
      initialOilCheckAcknowledged: true,
      initialFuelTankLevel,
    });

    setErrorMessage(null);
    onUnlockContainerCycle();
  };

  // Handlers for Moment 2 (Salida e Incidencias)
  const handleMarkClockOut = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setClockOutTime(formattedTime);
    setErrorMessage(null);
  };

  const handleTakeFinalPhoto = () => {
    onRequestPhotoUpload('Foto Obligatoria: Tablero al Cierre de Jornada (Odómetro Final)', (url) => {
      setFinalOdoPhoto(url);
      setErrorMessage(null);
    });
  };

  const handleAddIncident = () => {
    if (!incidentDescription.trim()) {
      setErrorMessage('Debe ingresar el detalle de la novedad o confirmar el estado de su jornada.');
      return;
    }

    const typeLabels: Record<DailyIncident['type'], string> = {
      falla_mecanica: 'Falla Mecánica en Tracto o Chasis',
      demora_rampa: 'Demora en Terminal Portuario / Balanza',
      trafico_peajes: 'Tráfico Severo / Retención en Peaje',
      clima_ruta: 'Percance Climático en Ruta',
      mercancia_dano: 'Observación en Contenedor / Precinto',
      ninguna: 'Jornada 100% Conforme sin Novedades',
    };

    const newInc: DailyIncident = {
      id: `inc-collyer-${Date.now()}`,
      type: incidentType,
      categoryLabel: typeLabels[incidentType],
      description: incidentDescription.trim(),
      timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      severity: incidentType === 'ninguna' ? 'baja' : incidentSeverity,
      photoUrl: incidentPhoto || undefined,
    };

    const updatedIncidents = [...incidents, newInc];
    setIncidents(updatedIncidents);

    setIncidentDescription('');
    setIncidentPhoto('');
    setIncidentType('ninguna');
    setIncidentSeverity('baja');
    setErrorMessage(null);
    setIncidentFeedback('Novedad registrada formalmente en la bitácora diaria.');
    setTimeout(() => setIncidentFeedback(null), 3000);
  };

  const handleRemoveIncident = (id: string) => {
    setIncidents((prev) => prev.filter((i) => i.id !== id));
  };

  const handleTakeIncidentPhoto = () => {
    onRequestPhotoUpload('Foto de Respaldo: Novedad o Incidencia en Ruta / Terminal', (url) => {
      setIncidentPhoto(url);
    });
  };

  const handleCertifyClosing = () => {
    let effectiveClockOut = clockOutTime;
    if (!effectiveClockOut) {
      effectiveClockOut = new Date().toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setClockOutTime(effectiveClockOut);
    }

    if (!numFinalOdo || numFinalOdo <= initialOdo) {
      setErrorMessage(
        `El odómetro final (${numFinalOdo} km) debe ser mayor al inicial (${initialOdo.toLocaleString()} km).`
      );
      return;
    }

    if (!finalOdoPhoto) {
      setErrorMessage(
        'La fotografía del odómetro final del tablero es ESTRICTAMENTE OBLIGATORIA para certificar el cierre de turno.'
      );
      return;
    }

    if (incidents.length === 0) {
      setErrorMessage(
        'Módulo obligatorio de Incidencias: Debe registrar al menos una entrada en su bitácora diaria (detalle de novedad o confirmar "Jornada 100% Conforme").'
      );
      return;
    }

    const uncompletedItems = closingItems.filter((it) => it.status === null);
    if (uncompletedItems.length > 0) {
      setErrorMessage(
        `Debe calificar todos los puntos de la inspección visual de cierre (${uncompletedItems.length} pendientes).`
      );
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const closureCode = `CIERRE-COLLYER-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const closingReport: ClosingReport = {
      closedAt: formattedDate,
      clockOutTime: effectiveClockOut,
      finalOdometer: numFinalOdo,
      finalOdometerPhoto: finalOdoPhoto,
      totalKmDriven: kmDriven,
      totalHoursDriven: hoursWorked,
      unitFinalCondition,
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
      closingChecklist: closingItems,
      closingReport,
    });

    setErrorMessage(null);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-10">
      {/* Moment Toggle Segmented Controls */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-md grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setActiveMoment('inicio')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-black transition-all ${
            activeMoment === 'inicio'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <PlayCircle className="h-4 w-4" />
          <span>1. Registro de Ingreso (Inicio del Día)</span>
          {shift.initialChecklistCompleted && (
            <CheckCircle2 className="h-4 w-4 text-emerald-900 ml-1" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveMoment('fin')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-xs font-black transition-all ${
            activeMoment === 'fin'
              ? 'bg-red-600 text-white shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <StopCircle className="h-4 w-4" />
          <span>2. Registro de Salida e Incidencias (Fin del Día)</span>
          {isShiftClosed && (
            <CheckCircle2 className="h-4 w-4 text-emerald-300 ml-1" />
          )}
        </button>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4 text-xs text-red-900 flex items-start gap-3 shadow-md">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold mb-0.5">Requisito Obligatorio Pendiente:</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BLOQUE 1.1: REGISTRO DE INGRESO (INICIO DEL DÍA) */}
      {/* ======================================================== */}
      {activeMoment === 'inicio' && (
        <div className="space-y-5">
          {/* Section: Status & Identity */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5 font-mono">
                  <PlayCircle className="h-4 w-4" />
                  MOMENTO 1: APERTURA DE TURNO LABORAL
                </span>
                <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Registro de Ingreso y Mantenimiento Diario de la Unidad
                </h2>
              </div>

              <div>
                {shift.initialChecklistCompleted ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Ingreso y Mantenimiento Certificados
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 border border-red-300 px-3.5 py-1.5 text-xs font-bold text-red-900 animate-pulse">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Ingreso Pendiente (Ruta Bloqueada)
                  </span>
                )}
              </div>
            </div>

            {/* Permanent Unit Identification Callouts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">
                  Placa Tracto / Camión:
                </span>
                <div className="text-2xl font-black font-mono text-amber-600 tracking-wider">
                  {unit.tractPlate}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{unit.model}</div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">
                  Placa Carreta / Chasis Contenedor:
                </span>
                <div className="text-2xl font-black font-mono text-sky-600 tracking-wider">
                  {unit.trailerPlate}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 truncate">{unit.trailerType}</div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
                <span className="text-slate-500 uppercase text-[10px] font-bold block mb-1">
                  Tanque Diésel Inicial:
                </span>
                <select
                  value={initialFuelTankLevel}
                  disabled={shift.initialChecklistCompleted}
                  onChange={(e) => setInitialFuelTankLevel(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold text-slate-900"
                >
                  <option value="100% (Tanque Lleno)">100% (Tanque Lleno)</option>
                  <option value="95% (Tanque Lleno)">95% (Tanque Lleno)</option>
                  <option value="3/4 de Tanque">3/4 de Tanque</option>
                  <option value="1/2 Tanque">1/2 Tanque</option>
                </select>
                <div className="text-[11px] text-slate-400 mt-1">Capacidad: {unit.fuelTankCapacityGln} galones</div>
              </div>
            </div>
          </div>

          {/* Sub-item A: Marcación de Asistencia Laboral */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  A. Marcación de Asistencia Laboral (Hora de Entrada)
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registro formal de entrada a garita y puesta a disposición operativa
                </p>
              </div>

              {!clockInTime ? (
                <button
                  type="button"
                  onClick={handleMarkClockIn}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-500 transition-colors shadow-sm"
                >
                  <Clock className="h-4 w-4" />
                  Marcar Hora de Entrada Laboral
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-950">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Hora de Entrada: <strong className="font-mono text-sm">{clockInTime}</strong></span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Conductor Asignado</label>
                <input
                  type="text"
                  value={driverName}
                  disabled={shift.initialChecklistCompleted}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 bg-slate-50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Licencia de Conducir (Brevete)</label>
                <input
                  type="text"
                  value={driverLicense}
                  disabled={shift.initialChecklistCompleted}
                  onChange={(e) => setDriverLicense(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 font-mono bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Sub-item B: Odómetro Inicial con Foto del Tablero */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Gauge className="h-4 w-4 text-amber-600" />
              B. Kilometraje Actual del Odómetro con Fotografía Obligatoria del Tablero
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kilometraje del Tablero (Odómetro Inicial)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={initialOdoInput}
                    disabled={shift.initialChecklistCompleted}
                    onChange={(e) => setInitialOdoInput(e.target.value)}
                    placeholder="Ej. 254410"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono font-bold text-slate-900 outline-none focus:border-amber-500 disabled:bg-slate-100"
                  />
                  <span className="text-xs font-bold text-slate-500">KM</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Lectura del odómetro al encender el tracto en la garita de salida.
                </p>
              </div>

              {/* Photo Box */}
              <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                    <Camera className="h-4 w-4 text-amber-600" />
                    Foto Obligatoria del Tablero:
                  </span>
                  {!shift.initialChecklistCompleted && (
                    <button
                      type="button"
                      onClick={handleTakeInitialPhoto}
                      className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-slate-800 shadow-xs"
                    >
                      {initialOdoPhoto ? 'Cambiar Foto' : 'Tomar Foto Tablero'}
                    </button>
                  )}
                </div>

                {initialOdoPhoto ? (
                  <div className="flex items-center gap-3 mt-1">
                    <div
                      onClick={() => onViewPhoto(initialOdoPhoto, 'Foto Tablero - Odómetro Inicial')}
                      className="group relative h-14 w-24 overflow-hidden rounded-lg border border-slate-300 cursor-pointer shadow-xs"
                    >
                      <img
                        src={initialOdoPhoto}
                        alt="Odómetro inicial"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-[10px] font-bold text-white">
                        Zoom
                      </div>
                    </div>
                    <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                      <Check className="h-4 w-4" /> Foto de tablero certificada
                    </span>
                  </div>
                ) : (
                  <div className="text-xs text-red-600 font-semibold">
                    ⚠️ Foto pendiente. Obligatoria para certificar el inicio de jornada.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub-item C: Verificación del Último Cambio de Aceite y Responsable */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Wrench className="h-4 w-4 text-amber-600" />
              C. Control de Mantenimiento Preventivo (Último Cambio de Aceite y Taller)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <span className="text-slate-400 block text-[11px]">Kilometraje del Último Cambio:</span>
                <strong className="text-sm font-mono text-slate-800">
                  {unit.lastOilChangeMileage.toLocaleString()} km
                </strong>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                <span className="text-slate-400 block text-[11px]">Mecánico / Taller Responsable:</span>
                <strong className="text-xs text-slate-800 block truncate">
                  {unit.lastOilChangeMechanic}
                </strong>
              </div>

              <div className={`rounded-lg border p-3 ${
                isOilOverdue
                  ? 'bg-red-50 border-red-300 text-red-900'
                  : isOilWarning
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}>
                <span className="block text-[11px] font-semibold opacity-75">Margen de Seguridad:</span>
                <strong className="text-sm font-mono block">
                  {kmToNextOilChange > 0
                    ? `${kmToNextOilChange.toLocaleString()} km restantes`
                    : `¡Vencido por ${Math.abs(kmToNextOilChange).toLocaleString()} km!`}
                </strong>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-slate-800">
              <input
                type="checkbox"
                checked={oilCheckAcknowledged}
                disabled={shift.initialChecklistCompleted}
                onChange={(e) => setOilCheckAcknowledged(e.target.checked)}
                className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="font-semibold">
                Confirmo haber verificado varilla de aceite, refrigerante en tanque y estado del motor con {kmToNextOilChange.toLocaleString()} km de margen.
              </span>
            </label>
          </div>

          {/* Sub-item D: Checklist Preventivo de la Unidad (30 Puntos) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ClipboardCheck className="h-4 w-4 text-amber-600" />
                  D. Checklist Preventivo Obligatorio de la Unidad (30 Puntos)
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspección técnica de neumáticos, motor/fluidos, sistema eléctrico, frenos y pines twistlocks del chasis
                </p>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-500">Puntos calificados:</span>{' '}
                <strong className="font-mono text-amber-600">{completedChecklistCount}/30</strong>
              </div>
            </div>

            <Checklist30Points
              items={currentService.checklistItems}
              onUpdateItemStatus={onUpdateChecklistItem}
              onRequestPhotoUpload={onRequestPhotoUpload}
              onViewPhoto={onViewPhoto}
            />
          </div>

          {/* Action: Certify Shift Opening */}
          {!shift.initialChecklistCompleted && (
            <div className="rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Certificar Registro de Ingreso y Habilitar Ciclo de Contenedores
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Transmite la apertura con timestamp geolocalizado a la central Collyer y desbloquea el registro de evidencias de la orden asignada.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCertifyOpening}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-xs font-black text-slate-950 hover:bg-amber-400 transition-all shadow-md shrink-0"
                >
                  <Check className="h-4 w-4" />
                  CERTIFICAR INGRESO Y HABILITAR CONTENEDOR
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* BLOQUE 1.2: REGISTRO DE SALIDA E INCIDENCIAS (FIN DEL DÍA) */}
      {/* ======================================================== */}
      {activeMoment === 'fin' && (
        <div className="space-y-5">
          {/* Section: Header Status */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5 font-mono">
                  <StopCircle className="h-4 w-4" />
                  MOMENTO 2: CIERRE FORMAL DE JORNADA LABORAL
                </span>
                <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Registro de Salida, Odómetro Final y Bitácora Obligatoria de Incidencias
                </h2>
              </div>

              <div>
                {isShiftClosed ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Jornada Cerrada y Bitácora Transmitida
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3.5 py-1.5 text-xs font-bold text-amber-900">
                    <Clock className="h-4 w-4 text-amber-600" />
                    Cierre Pendiente
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Complete la marcación de salida laboral, la fotografía del odómetro final del tablero y el registro obligatorio de incidencias ocurridas durante la ruta portuaria.
            </p>
          </div>

          {/* Sub-item A: Registro de Salida Laboral */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-red-600" />
                  A. Marcación de Salida Laboral (Fin de Turno)
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Marcación formal al entregar la unidad en base y finalizar labores
                </p>
              </div>

              {!clockOutTime ? (
                <button
                  type="button"
                  onClick={handleMarkClockOut}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-black text-white hover:bg-red-500 transition-colors shadow-sm"
                >
                  <Clock className="h-4 w-4" />
                  Marcar Hora de Salida Laboral
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-100 border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-950">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Hora de Salida: <strong className="font-mono text-sm">{clockOutTime}</strong></span>
                  {!isShiftClosed && (
                    <button
                      type="button"
                      onClick={handleMarkClockOut}
                      className="text-[10px] text-slate-500 underline ml-2 hover:text-slate-800"
                    >
                      Actualizar
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 rounded-lg p-3 border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Conductor:</span>
                <strong className="text-slate-800">{shift.driverName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Hora de Entrada:</span>
                <strong className="text-slate-800 font-mono">{shift.clockInTime || '06:15 AM'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Horas Totales del Turno:</span>
                <strong className="text-slate-900 font-mono text-sm">{hoursWorked} horas</strong>
              </div>
            </div>
          </div>

          {/* Sub-item B: Odómetro Final y Fotografía del Tablero */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Gauge className="h-4 w-4 text-red-600" />
                B. Kilometraje Final del Odómetro y Fotografía Obligatoria del Tablero
              </span>
              <span className="text-xs font-mono text-slate-500">
                Inicial: {initialOdo.toLocaleString()} km
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
                    disabled={isShiftClosed}
                    onChange={(e) => setFinalOdoInput(e.target.value)}
                    placeholder="Ej. 254820"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono font-bold text-slate-900 outline-none focus:border-red-500 disabled:bg-slate-100"
                  />
                  <span className="text-xs font-bold text-slate-500">KM</span>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Recorrido Exacto del Día:
                </span>
                <div className="text-xl font-black font-mono text-slate-900">
                  {kmDriven > 0 ? `${kmDriven.toLocaleString()} km` : '0 km'}
                </div>
                <span className="text-[10px] text-slate-400">
                  Calculado: Final ({numFinalOdo || 0}) - Inicial ({initialOdo})
                </span>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 flex flex-col justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">
                  Límite de Horas de Conducción:
                </span>
                <div className="text-xl font-black font-mono text-emerald-700">
                  {hoursWorked} hrs
                </div>
                <span className="text-[10px] text-slate-400">
                  Conforme a regulaciones MTC
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
                    Debe mostrar con total claridad la lectura final de kilometraje para auditar la ruta portuaria y el consumo.
                  </p>
                </div>

                {!isShiftClosed && (
                  <button
                    type="button"
                    onClick={handleTakeFinalPhoto}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-slate-800 transition-colors shadow-xs shrink-0"
                  >
                    <Camera className="h-4 w-4" />
                    {finalOdoPhoto ? 'Cambiar Foto de Tablero' : 'Tomar Foto Obligatoria del Tablero'}
                  </button>
                )}
              </div>

              {finalOdoPhoto ? (
                <div className="flex items-center gap-3 pt-1">
                  <div
                    onClick={() => onViewPhoto(finalOdoPhoto, 'Foto Tablero - Odómetro Final')}
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
                  <div className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Foto de odómetro final adjunta y certificada
                  </div>
                </div>
              ) : (
                <div className="rounded border border-dashed border-red-300 bg-white p-2.5 text-xs text-red-600">
                  ⚠️ Fotografía pendiente. Requisito obligatorio para cerrar la jornada.
                </div>
              )}
            </div>
          </div>

          {/* Sub-item C: MÓDULO OBLIGATORIO DE REGISTRO DE INCIDENCIAS DEL DÍA */}
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50/20 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-3">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                  <ClipboardList className="h-4 w-4 text-amber-600" />
                  C. Módulo Obligatorio: Registro de Incidencias del Día (Bitácora Diaria)
                </span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Espacio obligatorio donde el conductor detalla novedades, fallas mecánicas, demoras en terminal o confirma jornada conforme
                </p>
              </div>

              <div className="text-xs font-bold text-slate-800 bg-white px-3 py-1 rounded-lg border border-slate-200">
                Incidencias Registradas: <span className="text-amber-600 font-mono">{incidents.length}</span>
              </div>
            </div>

            {/* Entry Form */}
            {!isShiftClosed && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Tipo de Novedad o Percance:
                    </label>
                    <select
                      value={incidentType}
                      onChange={(e) => setIncidentType(e.target.value as DailyIncident['type'])}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-amber-500"
                    >
                      <option value="ninguna">✅ Jornada 100% Conforme sin Novedades</option>
                      <option value="demora_rampa">⏳ Demora en Terminal Portuario / Balanza</option>
                      <option value="falla_mecanica">⚙️ Falla Mecánica en Tracto o Chasis</option>
                      <option value="trafico_peajes">🚗 Tráfico Severo / Retención en Peaje</option>
                      <option value="mercancia_dano">📦 Novedad en Contenedor / Precinto</option>
                      <option value="clima_ruta">🌧️ Percance Climático en Carretera</option>
                    </select>
                  </div>

                  {incidentType !== 'ninguna' && (
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Severidad del Percance:
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
                    Detalle y Descripción de la Novedad (Obligatorio en Bitácora):
                  </label>
                  <textarea
                    rows={2}
                    value={incidentDescription}
                    onChange={(e) => setIncidentDescription(e.target.value)}
                    placeholder={
                      incidentType === 'ninguna'
                        ? 'Ej. Jornada portuaria concluida con normalidad. Sin novedades mecánicas ni demoras extraordinarias en terminal.'
                        : 'Indique lugar exacto, hora de la demora o falla mecánica observada en tracto o chasis...'
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
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-400 transition-colors shadow-xs shrink-0"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Registrar en Bitácora Diaria
                  </button>
                </div>
              </div>
            )}

            {/* List of Logged Incidents in Shift */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Bitácora de Novedades del Turno ({incidents.length}):
              </span>

              {incidents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-amber-300 bg-white p-4 text-center text-xs text-amber-900 font-medium">
                  ⚠️ No ha registrado aún ninguna entrada en la bitácora. Debe agregar al menos una entrada para cerrar su turno.
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
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded hover:bg-sky-100"
                          >
                            <Camera className="h-3.5 w-3.5" /> Ver Foto
                          </button>
                        )}
                        {!isShiftClosed && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIncident(inc.id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                            title="Eliminar de bitácora"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sub-item D: Inspección Visual de Cierre Post-Ruta */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-red-600" />
                  D. Inspección Visual de Cierre (Tracto y Chasis Portacontenedor)
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verificación de twistlocks, neumáticos en caliente, mangueras y condición final
                </p>
              </div>

              {!isShiftClosed && (
                <button
                  type="button"
                  onClick={() => setClosingItems((prev) => prev.map((it) => ({ ...it, status: 'B' })))}
                  className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-amber-400 hover:bg-slate-800 transition-colors shadow-xs shrink-0"
                >
                  Marcar Todo Conforme (B)
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {closingItems.map((item) => {
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

                      {!isShiftClosed && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              setClosingItems((prev) =>
                                prev.map((it) => (it.id === item.id ? { ...it, status: 'B' } : it))
                              )
                            }
                            className={`flex h-8 w-9 items-center justify-center rounded font-black text-xs transition-all ${
                              isGood
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                            }`}
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setClosingItems((prev) =>
                                prev.map((it) => (it.id === item.id ? { ...it, status: 'F' } : it))
                              )
                            }
                            className={`flex h-8 w-9 items-center justify-center rounded font-black text-xs transition-all ${
                              isFail
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-red-50'
                            }`}
                          >
                            F
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action: Certify Shift Closing */}
          {!isShiftClosed && (
            <div className="rounded-xl border-2 border-red-500 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Certificar Salida Laboral y Transmitir Bitácora Final
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Al confirmar, se transmitirá la bitácora diaria y el odómetro certificado a la central de operaciones Collyer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCertifyClosing}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-xs font-black text-white hover:bg-red-700 transition-all shadow-md shrink-0"
                >
                  <Send className="h-4 w-4" />
                  CERTIFICAR SALIDA Y TRANSMITIR BITÁCORA
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
