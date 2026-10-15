import React, { useState, useEffect } from 'react';
import {
  PlayCircle,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Gauge,
  ShieldCheck,
  User,
  Wrench,
  Fuel,
  Check,
  ClipboardCheck,
  AlertCircle,
  Truck,
  Package,
  Layers,
  Lock,
} from 'lucide-react';
import {
  TransportService,
  DriverShift,
  ChecklistItem,
  ChecklistStatus,
  ShiftType,
  VehicleType,
} from '../../types';
import { Checklist30Points } from './Checklist30Points';

interface ShiftOpeningModuleProps {
  currentService: TransportService;
  onUpdateShift: (shift: DriverShift) => void;
  onUpdateChecklistItem: (id: string, status: ChecklistStatus, notes?: string) => void;
  onRequestPhotoUpload: (title: string, onSuccess: (url: string) => void) => void;
  onViewPhoto: (url: string, title: string) => void;
}

export const ShiftOpeningModule: React.FC<ShiftOpeningModuleProps> = ({
  currentService,
  onUpdateShift,
  onUpdateChecklistItem,
  onRequestPhotoUpload,
  onViewPhoto,
}) => {
  const shift = currentService.driver;
  const unit = currentService.unit;

  // 1. Vehicle Type Selection & Identification
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleType>(
    shift.selectedVehicleType || unit.vehicleType || 'Tracto'
  );

  useEffect(() => {
    if (shift.selectedVehicleType && shift.selectedVehicleType !== selectedVehicleType) {
      setSelectedVehicleType(shift.selectedVehicleType);
    }
  }, [shift.selectedVehicleType]);

  const handleSelectVehicleType = (type: VehicleType) => {
    setSelectedVehicleType(type);
    onUpdateShift({
      ...shift,
      selectedVehicleType: type,
    });
  };

  // 2. Registro de Ingreso Laboral
  const [clockInTime, setClockInTime] = useState<string>(
    shift.clockInTime || ''
  );
  const [driverName, setDriverName] = useState(shift.driverName);
  const [driverLicense, setDriverLicense] = useState(shift.driverLicense);
  const [driverDni, setDriverDni] = useState(shift.driverDni);
  const [shiftType, setShiftType] = useState<ShiftType>(shift.shiftType);
  const [attendanceMarked, setAttendanceMarked] = useState<boolean>(
    shift.attendanceMarked !== undefined ? shift.attendanceMarked : false
  );

  // 3. Odómetro inicial con foto obligatoria del tablero
  const [initialOdoInput, setInitialOdoInput] = useState<string>(
    shift.initialOdometer.toString()
  );
  const [initialOdoPhoto, setInitialOdoPhoto] = useState<string>(
    shift.initialOdometerPhoto || ''
  );

  // 4. Mantenimiento Preventivo (último cambio de aceite)
  const [oilCheckAcknowledged, setOilCheckAcknowledged] = useState<boolean>(
    shift.initialOilCheckAcknowledged !== undefined ? shift.initialOilCheckAcknowledged : false
  );

  const [initialFuelTankLevel, setInitialFuelTankLevel] = useState<string>(
    shift.initialFuelTankLevel || '100% (Tanque Lleno)'
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Maintenance calculations
  const kmToNextOilChange = (unit.lastOilChangeMileage + unit.oilChangeInterval) - unit.currentMileage;
  const isOilOverdue = kmToNextOilChange <= 0;
  const isOilWarning = kmToNextOilChange > 0 && kmToNextOilChange <= 1500;

  // Checklist verification
  const checklistItems = currentService.checklistItems;
  const completedChecklistCount = checklistItems.filter((i) => i.status !== null).length;
  const criticalFails = checklistItems.filter((i) => i.status === 'F' && i.isCritical);

  const handleMarkClockIn = () => {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    setClockInTime(formattedTime);
    setAttendanceMarked(true);
    setErrorMessage(null);
  };

  const handleTakeInitialPhoto = () => {
    onRequestPhotoUpload('Foto Obligatoria: Tablero al Inicio de Jornada (Odómetro Inicial)', (url) => {
      setInitialOdoPhoto(url);
      setErrorMessage(null);
    });
  };

  const handleOpenShift = () => {
    if (!clockInTime) {
      setErrorMessage('Debe presionar el botón "Registrar Marcación de Entrada Laboral".');
      return;
    }

    const odoNum = Number(initialOdoInput);
    if (!odoNum || odoNum <= 0) {
      setErrorMessage('Debe ingresar un valor numérico válido para el kilometraje inicial del odómetro.');
      return;
    }

    if (!initialOdoPhoto) {
      setErrorMessage(
        'La fotografía del odómetro del tablero al inicio de jornada es ESTRICTAMENTE OBLIGATORIA.'
      );
      return;
    }

    if (!oilCheckAcknowledged) {
      setErrorMessage(
        'Debe validar la condición del mantenimiento preventivo (cambio de aceite) antes de iniciar labores.'
      );
      return;
    }

    if (completedChecklistCount < 30) {
      setErrorMessage(
        `Debe calificar los 30 puntos del checklist preventivo (completados ${completedChecklistCount}/30).`
      );
      return;
    }

    if (criticalFails.length > 0) {
      setErrorMessage(
        `BLOQUEO OPERATIVO: Hay ${criticalFails.length} falla(s) crítica(s) de seguridad. No se puede iniciar ruta hasta subsanar con taller.`
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
      driverDni,
      shiftType,
      selectedVehicleType,
      clockInTime,
      isActive: true,
      phase: 'en_ruta',
      attendanceMarked: true,
      shiftStartTime: shift.shiftStartTime || formattedTimestamp,
      initialOdometer: odoNum,
      initialOdometerPhoto: initialOdoPhoto,
      initialChecklistCompleted: true,
      initialOilCheckAcknowledged: true,
      initialFuelTankLevel,
    });

    setErrorMessage(null);
  };

  const isShiftOpen = shift.phase === 'en_ruta' || shift.phase === 'cierre_pendiente' || shift.phase === 'jornada_cerrada';
  const isTracto = selectedVehicleType === 'Tracto';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-amber-400 font-bold">
              <PlayCircle className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                  MÓDULO DE INICIO DE JORNADA
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-xs text-slate-500 font-mono">APERTURA Y CONTROL LABORAL</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">
                1. Selección de Vehículo, Ingreso Laboral y Control Preventivo
              </h2>
            </div>
          </div>

          <div>
            {isShiftOpen ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Ingreso Laboral y Turno Activo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3.5 py-1.5 text-xs font-bold text-red-900 animate-pulse-subtle">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                Ingreso Laboral Pendiente (Ruta Bloqueada)
              </span>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-3">
          Complete la identificación de su unidad ({selectedVehicleType}), su marcación de hora de entrada,
          el odómetro certificado con foto y el checklist preventivo antes de iniciar el traslado.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-xs text-red-800 flex items-start gap-3 shadow-xs">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="block font-bold mb-0.5">Requisito Obligatorio Pendiente:</strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* SECCIÓN 1: Gestión del Tipo de Vehículo Asignado (Tracto o Furgón) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Truck className="h-4 w-4 text-amber-600" />
              1. Selección e Identificación del Tipo de Vehículo Asignado
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Seleccione la modalidad que operará hoy para adaptar automáticamente la línea de tiempo y evidencias
            </p>
          </div>

          {!isShiftOpen && (
            <div className="inline-flex items-center rounded-lg bg-slate-100 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => handleSelectVehicleType('Tracto')}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  isTracto
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="h-3.5 w-3.5" />
                Tractocamión (Tracto)
              </button>

              <button
                type="button"
                onClick={() => handleSelectVehicleType('Furgón')}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  !isTracto
                    ? 'bg-sky-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                Camión Furgón (Furgón)
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Vehicle Plating Display according to Tracto vs Furgón */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Main Truck Plate */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-slate-500 font-semibold uppercase text-[11px] block">
              {isTracto ? 'Placa del Tracto / Camión:' : 'Placa del Camión Furgón:'}
            </span>
            <div className="text-2xl font-black font-mono text-amber-600 tracking-wider">
              {unit.tractPlate}
            </div>
            <div className="text-[11px] text-slate-500">{unit.model}</div>
          </div>

          {/* Conditional Trailer Plate (Tracto) or Seal & Box Volume (Furgón) */}
          {isTracto ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1">
              <span className="text-slate-500 font-semibold uppercase text-[11px] block">
                Placa de Carreta / Semirremolque:
              </span>
              <div className="text-2xl font-black font-mono text-sky-600 tracking-wider">
                {unit.trailerPlate}
              </div>
              <div className="text-[11px] text-slate-500">
                {unit.trailerType || 'Plataforma Baranda 3 Ejes'}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1">
              <span className="text-slate-500 font-semibold uppercase text-[11px] block flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-emerald-600" />
                Precinto & Capacidad Furgón:
              </span>
              <div className="text-lg font-black font-mono text-emerald-700 truncate">
                {unit.securitySealNumber || 'SEAL-ALICORP-4912'}
              </div>
              <div className="text-[11px] text-slate-500">
                Volumen: <strong>{unit.boxCapacityM3 || 62} m³</strong> · {unit.isRefrigerated ? 'Térmico' : 'Carga Seca'}
              </div>
            </div>
          )}

          {/* Fuel Tank Level */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-1">
            <span className="text-slate-500 font-semibold uppercase text-[11px] block">
              Nivel de Combustible al Iniciar:
            </span>
            <select
              value={initialFuelTankLevel}
              disabled={isShiftOpen}
              onChange={(e) => setInitialFuelTankLevel(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 disabled:bg-slate-100"
            >
              <option value="100% (Tanque Lleno)">100% (Tanque Lleno)</option>
              <option value="3/4 de Tanque">3/4 de Tanque</option>
              <option value="1/2 Tanque">1/2 Tanque</option>
              <option value="1/4 de Tanque (Abastecer en ruta)">1/4 de Tanque (Abastecer en ruta)</option>
            </select>
            <div className="text-[11px] text-slate-400">
              Tanque: {unit.fuelTankCapacityGln} galones diésel
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Registro de Ingreso Laboral (Marcación de Hora de Entrada) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-600" />
              2. Registro de Ingreso Laboral (Marcación de Entrada)
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Marcación formal de asistencia y control del inicio de la jornada diaria
            </p>
          </div>

          {!clockInTime ? (
            <button
              type="button"
              onClick={handleMarkClockIn}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-colors shadow-xs"
            >
              <Clock className="h-4 w-4" />
              Marcar Hora de Entrada Laboral
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 border border-emerald-300 px-3 py-1.5 text-xs font-bold text-emerald-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Hora de Entrada: <strong className="font-mono text-sm">{clockInTime}</strong></span>
            </div>
          )}
        </div>

        {/* Driver identity credentials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nombre del Conductor</label>
            <input
              type="text"
              value={driverName}
              disabled={isShiftOpen}
              onChange={(e) => setDriverName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Licencia de Conducir (Brevete)</label>
            <input
              type="text"
              value={driverLicense}
              disabled={isShiftOpen}
              onChange={(e) => setDriverLicense(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 font-mono disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">DNI del Conductor</label>
            <input
              type="text"
              value={driverDni}
              disabled={isShiftOpen}
              onChange={(e) => setDriverDni(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 font-mono disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Turno Asignado</label>
            <select
              value={shiftType}
              disabled={isShiftOpen}
              onChange={(e) => setShiftType(e.target.value as ShiftType)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 disabled:bg-slate-100"
            >
              <option value="Día (06:00 - 18:00)">Día (06:00 - 18:00)</option>
              <option value="Noche (18:00 - 06:00)">Noche (18:00 - 06:00)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: Odómetro Inicial y Foto Obligatoria del Tablero */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Gauge className="h-4 w-4 text-amber-600" />
          3. Kilometraje Actual del Odómetro con Foto Obligatoria del Tablero
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lectura del Odómetro de Partida (KM)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={initialOdoInput}
                disabled={isShiftOpen}
                onChange={(e) => setInitialOdoInput(e.target.value)}
                placeholder="Ej. 254410"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono font-bold text-slate-900 outline-none focus:border-amber-500 disabled:bg-slate-100"
              />
              <span className="text-xs font-bold text-slate-500">KM</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Kilometraje registrado en tablero al encender la unidad en garita.
            </p>
          </div>

          {/* Photo Trigger Box */}
          <div className="rounded-lg border border-amber-200 bg-amber-50/40 p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                <Camera className="h-4 w-4 text-amber-600" />
                Fotografía del Tablero (Obligatoria):
              </span>
              {!isShiftOpen && (
                <button
                  type="button"
                  onClick={handleTakeInitialPhoto}
                  className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-slate-800"
                >
                  {initialOdoPhoto ? 'Cambiar Foto' : 'Tomar Foto Tablero'}
                </button>
              )}
            </div>

            {initialOdoPhoto ? (
              <div className="flex items-center gap-3 mt-1">
                <div
                  onClick={() => onViewPhoto(initialOdoPhoto, 'Foto Tablero - Odómetro Inicial')}
                  className="group relative h-12 w-20 overflow-hidden rounded border border-slate-300 cursor-pointer shadow-xs"
                >
                  <img
                    src={initialOdoPhoto}
                    alt="Odómetro inicial"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-[9px] font-bold text-white">
                    Zoom
                  </div>
                </div>
                <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                  <Check className="h-4 w-4" /> Foto certificada
                </span>
              </div>
            ) : (
              <div className="text-xs text-red-600 font-medium">
                ⚠️ Fotografía pendiente. No se puede certificar el ingreso sin la foto del tablero.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: Control Preventivo del Último Cambio de Aceite */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Wrench className="h-4 w-4 text-amber-600" />
          4. Control Preventivo del Último Cambio de Aceite (Kilometraje y Taller)
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <span className="text-slate-400 block text-[11px]">Kilometraje del Último Cambio:</span>
            <strong className="text-sm font-mono text-slate-800">
              {unit.lastOilChangeMileage.toLocaleString()} km
            </strong>
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <span className="text-slate-400 block text-[11px]">Taller / Responsable Técnico:</span>
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
            <span className="block text-[11px] font-semibold opacity-75">Margen Disponible:</span>
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
            disabled={isShiftOpen}
            onChange={(e) => setOilCheckAcknowledged(e.target.checked)}
            className="h-4 w-4 rounded text-amber-600 focus:ring-amber-500"
          />
          <span className="font-semibold">
            Confirmo que he validado el nivel de aceite en varilla, kilometraje restante ({kmToNextOilChange.toLocaleString()} km) y no existen fugas impeditivas en el motor.
          </span>
        </label>
      </div>

      {/* SECCIÓN 5: Checklist Preventivo de 30 Puntos */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <ClipboardCheck className="h-4 w-4 text-amber-600" />
              5. Checklist Preventivo de Puntos Críticos (30 Puntos)
            </span>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspección de neumáticos, motor/fluidos, sistema eléctrico, frenos y acople
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

      {/* Final Button: Certificar e Iniciar Jornada */}
      {!isShiftOpen && (
        <div className="rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Confirmar Ingreso Laboral y Habilitar Ruta ({selectedVehicleType})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Al confirmar, se transmitirá la apertura con geolocalización y timestamp a la Torre de Control,
                desbloqueando el acceso a las etapas de servicio y abastecimiento de combustible.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenShift}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-xs font-extrabold text-slate-950 hover:bg-amber-400 transition-all shadow-md shrink-0"
            >
              <Check className="h-4 w-4" />
              CERTIFICAR INGRESO Y ABRIR TURNO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
