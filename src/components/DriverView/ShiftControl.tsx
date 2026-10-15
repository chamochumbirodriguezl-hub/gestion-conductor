import React, { useState } from 'react';
import { User, Clock, Camera, CheckCircle2, PlayCircle, StopCircle, Gauge, Calendar } from 'lucide-react';
import { DriverShift, ShiftType } from '../../types';

interface ShiftControlProps {
  shift: DriverShift;
  onUpdateShift: (updated: DriverShift) => void;
  onRequestPhotoUpload: (
    title: string,
    onSuccess: (url: string) => void
  ) => void;
  onViewPhoto: (url: string, title: string) => void;
}

export const ShiftControl: React.FC<ShiftControlProps> = ({
  shift,
  onUpdateShift,
  onRequestPhotoUpload,
  onViewPhoto,
}) => {
  const [driverName, setDriverName] = useState(shift.driverName);
  const [driverLicense, setDriverLicense] = useState(shift.driverLicense);
  const [driverDni, setDriverDni] = useState(shift.driverDni);
  const [shiftType, setShiftType] = useState<ShiftType>(shift.shiftType);

  const [initialOdoInput, setInitialOdoInput] = useState(shift.initialOdometer.toString());
  const [finalOdoInput, setFinalOdoInput] = useState(shift.finalOdometer ? shift.finalOdometer.toString() : '');

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleStartShift = () => {
    const odoNum = Number(initialOdoInput);
    if (!odoNum || odoNum <= 0) {
      setValidationError('Debe ingresar un odómetro inicial válido.');
      return;
    }
    if (!shift.initialOdometerPhoto) {
      setValidationError('La fotografía del tablero para el odómetro inicial es OBLIGATORIA.');
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

    onUpdateShift({
      ...shift,
      driverName,
      driverLicense,
      driverDni,
      shiftType,
      isActive: true,
      shiftStartTime: formattedDate,
      initialOdometer: odoNum,
    });
    setValidationError(null);
  };

  const handleEndShift = () => {
    const odoNum = Number(finalOdoInput);
    if (!odoNum || odoNum <= shift.initialOdometer) {
      setValidationError('El odómetro final debe ser mayor que el odómetro inicial.');
      return;
    }
    if (!shift.finalOdometerPhoto) {
      setValidationError('La fotografía del tablero para el odómetro final es OBLIGATORIA.');
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

    onUpdateShift({
      ...shift,
      isActive: false,
      shiftEndTime: formattedDate,
      finalOdometer: odoNum,
    });
    setValidationError(null);
  };

  const handleTakeInitialPhoto = () => {
    onRequestPhotoUpload('Fotografía Obligatoria: Tablero - Odómetro Inicial', (url) => {
      onUpdateShift({
        ...shift,
        initialOdometerPhoto: url,
      });
      setValidationError(null);
    });
  };

  const handleTakeFinalPhoto = () => {
    onRequestPhotoUpload('Fotografía Obligatoria: Tablero - Odómetro Final', (url) => {
      onUpdateShift({
        ...shift,
        finalOdometerPhoto: url,
      });
      setValidationError(null);
    });
  };

  const kmTraveled = shift.finalOdometer
    ? shift.finalOdometer - shift.initialOdometer
    : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
      {/* Title & Status Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-amber-400">
            <User className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Marcación de Jornada y Registro de Conductor
            </h2>
            <p className="text-xs text-slate-500">
              Control de horas de servicio, odómetros certificados y presencia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {shift.isActive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Jornada Activa (En Ruta)
            </span>
          ) : shift.shiftEndTime ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-500" />
              Jornada Concluida
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Pendiente de Marcación
            </span>
          )}
        </div>
      </div>

      {validationError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700 flex items-center justify-between">
          <span>{validationError}</span>
          <button
            onClick={() => setValidationError(null)}
            className="text-red-900 font-bold hover:underline"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Driver Form Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Nombre del Conductor</label>
          <input
            type="text"
            value={driverName}
            disabled={shift.isActive}
            onChange={(e) => setDriverName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Licencia de Conducir (Brevete)</label>
          <input
            type="text"
            value={driverLicense}
            disabled={shift.isActive}
            onChange={(e) => setDriverLicense(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 font-mono disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">DNI del Conductor</label>
          <input
            type="text"
            value={driverDni}
            disabled={shift.isActive}
            onChange={(e) => setDriverDni(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 font-mono disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Turno de Operación</label>
          <select
            value={shiftType}
            disabled={shift.isActive}
            onChange={(e) => setShiftType(e.target.value as ShiftType)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 disabled:bg-slate-100"
          >
            <option value="Día (06:00 - 18:00)">Día (06:00 - 18:00)</option>
            <option value="Noche (18:00 - 06:00)">Noche (18:00 - 06:00)</option>
          </select>
        </div>
      </div>

      {/* Odometers & Photos Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Initial Odometer Box */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-amber-600" />
              1. Odómetro Inicial (Salida)
            </span>
            {shift.shiftStartTime && (
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {shift.shiftStartTime}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Ej. 254410"
              value={initialOdoInput}
              disabled={shift.isActive || !!shift.shiftEndTime}
              onChange={(e) => setInitialOdoInput(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-mono font-bold text-slate-900 disabled:bg-slate-100"
            />
            <span className="text-xs font-bold text-slate-500">KM</span>
          </div>

          {/* Photo button & Thumbnail */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={shift.isActive || !!shift.shiftEndTime}
              onClick={handleTakeInitialPhoto}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5 text-amber-600" />
              {shift.initialOdometerPhoto ? 'Cambiar Foto Tablero' : 'Foto Tablero Obligatoria'}
            </button>

            {shift.initialOdometerPhoto ? (
              <button
                type="button"
                onClick={() =>
                  onViewPhoto(
                    shift.initialOdometerPhoto,
                    'Foto Tablero - Odómetro Inicial'
                  )
                }
                className="group relative h-10 w-16 overflow-hidden rounded border border-slate-300 shadow-xs"
              >
                <img
                  src={shift.initialOdometerPhoto}
                  alt="Odómetro Inicial"
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                />
                <span className="absolute inset-0 bg-slate-950/20 text-[9px] font-bold text-white flex items-center justify-center">
                  Ver
                </span>
              </button>
            ) : (
              <span className="text-[11px] text-red-500 font-medium">Requerida</span>
            )}
          </div>

          {!shift.isActive && !shift.shiftEndTime && (
            <button
              type="button"
              onClick={handleStartShift}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-slate-800 transition-colors shadow-xs"
            >
              <PlayCircle className="h-4 w-4" />
              MARCAR INICIO DE JORNADA (TIMESTAMP)
            </button>
          )}
        </div>

        {/* Final Odometer Box */}
        <div className={`rounded-lg border p-4 space-y-3 ${
          shift.isActive
            ? 'border-amber-300 bg-amber-50/30'
            : shift.shiftEndTime
            ? 'border-slate-200 bg-slate-50/70'
            : 'border-slate-200 bg-slate-100/50 opacity-60'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
              <Gauge className="h-4 w-4 text-emerald-600" />
              2. Odómetro Final (Cierre)
            </span>
            {shift.shiftEndTime && (
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {shift.shiftEndTime}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Ej. 254820"
              disabled={!shift.isActive}
              value={finalOdoInput}
              onChange={(e) => setFinalOdoInput(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-mono font-bold text-slate-900 disabled:bg-slate-100"
            />
            <span className="text-xs font-bold text-slate-500">KM</span>
          </div>

          {/* Photo button & Thumbnail */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              disabled={!shift.isActive}
              onClick={handleTakeFinalPhoto}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <Camera className="h-3.5 w-3.5 text-emerald-600" />
              {shift.finalOdometerPhoto ? 'Cambiar Foto Tablero' : 'Foto Tablero Obligatoria'}
            </button>

            {shift.finalOdometerPhoto ? (
              <button
                type="button"
                onClick={() =>
                  onViewPhoto(
                    shift.finalOdometerPhoto!,
                    'Foto Tablero - Odómetro Final'
                  )
                }
                className="group relative h-10 w-16 overflow-hidden rounded border border-slate-300 shadow-xs"
              >
                <img
                  src={shift.finalOdometerPhoto}
                  alt="Odómetro Final"
                  className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                />
                <span className="absolute inset-0 bg-slate-950/20 text-[9px] font-bold text-white flex items-center justify-center">
                  Ver
                </span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400">Requerida al cierre</span>
            )}
          </div>

          {shift.isActive && (
            <button
              type="button"
              onClick={handleEndShift}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-xs"
            >
              <StopCircle className="h-4 w-4" />
              CERRAR JORNADA Y REGISTRAR ODÓMETRO
            </button>
          )}

          {kmTraveled !== null && (
            <div className="rounded bg-emerald-50 border border-emerald-200 p-2 text-center">
              <span className="text-xs font-medium text-emerald-800">
                Recorrido Total de la Jornada:{' '}
                <strong className="font-mono text-sm">{kmTraveled} km</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
