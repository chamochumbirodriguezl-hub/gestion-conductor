import React, { useState } from 'react';
import { Fuel, Camera, Check, AlertCircle, Plus, Receipt, DollarSign, Gauge } from 'lucide-react';
import { FuelEntry } from '../../types';

interface FuelRefuelFormProps {
  entries: FuelEntry[];
  currentUnitMileage: number;
  onAddFuelEntry: (entry: FuelEntry) => void;
  onRequestPhotoUpload: (title: string, onSuccess: (url: string) => void) => void;
  onViewPhoto: (url: string, title: string) => void;
}

const COMMON_GAS_STATIONS = [
  'Primax Panamericana Sur Km 114 - Cañete',
  'Repsol Estación Huacho Km 148 Norte',
  'Petroperú Pisco Planta San Andrés',
  'Primax Lurín Almacenes Km 32',
  'Mobil / Terpel Carretera Central Km 42',
];

export const FuelRefuelForm: React.FC<FuelRefuelFormProps> = ({
  entries,
  currentUnitMileage,
  onAddFuelEntry,
  onRequestPhotoUpload,
  onViewPhoto,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [gasStation, setGasStation] = useState(COMMON_GAS_STATIONS[0]);
  const [fuelType, setFuelType] = useState('Diésel B5 S-50');
  const [gallons, setGallons] = useState<string>('60.0');
  const [totalAmount, setTotalAmount] = useState<string>('1080.00');
  const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [receiptNumber, setReceiptNumber] = useState('F003-0094125');
  const [receiptPhoto, setReceiptPhoto] = useState('');
  const [odometerAtRefuel, setOdometerAtRefuel] = useState(currentUnitMileage.toString());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const calculatedPricePerGallon =
    Number(gallons) > 0 ? (Number(totalAmount) / Number(gallons)).toFixed(2) : '0.00';

  const handleTakeReceiptPhoto = () => {
    onRequestPhotoUpload('Foto Obligatoria: Ticket / Factura de Combustible en Grifo', (url) => {
      setReceiptPhoto(url);
      setErrorMsg(null);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!gasStation.trim()) {
      setErrorMsg('Debe especificar el nombre o ubicación de la Estación de Servicio / Grifo.');
      return;
    }
    const numGallons = Number(gallons);
    const numAmount = Number(totalAmount);
    if (!numGallons || numGallons <= 0 || !numAmount || numAmount <= 0) {
      setErrorMsg('Debe ingresar valores válidos para galones y monto.');
      return;
    }
    if (!receiptPhoto) {
      setErrorMsg('La foto del comprobante / ticket de combustible es OBLIGATORIA.');
      return;
    }

    const newEntry: FuelEntry = {
      id: `fuel-${Date.now()}`,
      timestamp: new Date().toLocaleString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
      gasStation,
      fuelType,
      gallons: numGallons,
      pricePerGallon: Number(calculatedPricePerGallon),
      totalAmount: numAmount,
      currency,
      receiptNumber: receiptNumber || 'S/N',
      receiptPhoto,
      odometerAtRefuel: Number(odometerAtRefuel) || currentUnitMileage,
    };

    onAddFuelEntry(newEntry);
    setIsAdding(false);
    setReceiptPhoto('');
    setErrorMsg(null);
  };

  const totalGallonsLogged = entries.reduce((acc, curr) => acc + curr.gallons, 0);
  const totalAmountLogged = entries.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950">
            <Fuel className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Registro Rápido de Combustible en Ruta (Obligatorio)
            </h2>
            <p className="text-xs text-slate-500">
              Captura obligatoria de grifo, galonaje, importe y ticket fiscal para liquidación
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-slate-500">Total Abastecido:</span>{' '}
            <strong className="font-mono text-slate-900">{totalGallonsLogged.toFixed(1)} Glns</strong>
            <span className="mx-1 text-slate-300">|</span>
            <strong className="font-mono text-slate-900">S/. {totalAmountLogged.toFixed(2)}</strong>
          </div>

          {!isAdding && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Registrar Carga de Diésel
            </button>
          )}
        </div>
      </div>

      {/* New Fuel Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-amber-300 bg-amber-50/40 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200 pb-2">
            <span className="text-xs font-bold uppercase text-amber-900 flex items-center gap-1.5">
              <Receipt className="h-4 w-4 text-amber-700" />
              Nuevo Abastecimiento en Grifo / Estación de Servicio
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cerrar Formulario
            </button>
          </div>

          {errorMsg && (
            <div className="rounded-md bg-red-100 border border-red-300 p-2.5 text-xs text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {/* Gas Station */}
            <div className="lg:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Estación de Servicio / Grifo
              </label>
              <input
                type="text"
                list="gas-stations"
                value={gasStation}
                onChange={(e) => setGasStation(e.target.value)}
                placeholder="Nombre de la estación, marca y kilometraje"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
              />
              <datalist id="gas-stations">
                {COMMON_GAS_STATIONS.map((gs) => (
                  <option key={gs} value={gs} />
                ))}
              </datalist>
            </div>

            {/* Receipt Number */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                N° Factura / Ticket del Grifo
              </label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="Ej. F003-0094125"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono"
              />
            </div>

            {/* Gallons */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Cantidad de Galones (Glns)
              </label>
              <input
                type="number"
                step="0.01"
                value={gallons}
                onChange={(e) => setGallons(e.target.value)}
                placeholder="Ej. 65.4"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono font-bold"
              />
            </div>

            {/* Total Amount */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Monto Total Pagado
              </label>
              <div className="flex items-center gap-1">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as 'PEN' | 'USD')}
                  className="rounded-md border border-slate-300 bg-white px-2 py-2 text-slate-700 text-xs font-bold"
                >
                  <option value="PEN">S/.</option>
                  <option value="USD">$</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="Ej. 1167.39"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>
            </div>

            {/* Calculated Price & Odometer */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Precio Calculado por Galón
              </label>
              <div className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-mono font-bold text-slate-700">
                {currency === 'PEN' ? 'S/.' : '$'} {calculatedPricePerGallon} / Gln
              </div>
            </div>

            {/* Odometer at refuel */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Odómetro al Abastecer (KM)
              </label>
              <input
                type="number"
                value={odometerAtRefuel}
                onChange={(e) => setOdometerAtRefuel(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono"
              />
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tipo de Diésel</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
              >
                <option value="Diésel B5 S-50">Diésel B5 S-50 (Ultra Bajo Azufre)</option>
                <option value="Diésel Premium Extra">Diésel Premium con Aditivos</option>
                <option value="AdBlue / Urea Automotriz">AdBlue / Urea Automotriz (SCR)</option>
              </select>
            </div>
          </div>

          {/* Mandatory Photo of Fuel Ticket */}
          <div className="rounded-lg border border-slate-300 bg-white p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Camera className="h-4 w-4 text-amber-600" />
                  Fotografía Obligatoria del Recibo / Factura del Grifo
                </span>
                <p className="text-[11px] text-slate-500">
                  Debe mostrar con nitidez el RUC del grifo, galones, precio y total
                </p>
              </div>

              <button
                type="button"
                onClick={handleTakeReceiptPhoto}
                className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-slate-800 transition-colors"
              >
                <Camera className="h-3.5 w-3.5" />
                {receiptPhoto ? 'Cambiar Foto de Ticket' : 'Tomar Foto de Ticket'}
              </button>
            </div>

            {receiptPhoto ? (
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onViewPhoto(receiptPhoto, 'Factura / Ticket de Combustible')}
                  className="h-16 w-24 overflow-hidden rounded border border-slate-300 shadow-xs"
                >
                  <img
                    src={receiptPhoto}
                    alt="Ticket de combustible"
                    className="h-full w-full object-cover"
                  />
                </button>
                <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="h-4 w-4" /> Comprobante fotográfico adjunto y certificado
                </div>
              </div>
            ) : (
              <div className="rounded border border-dashed border-red-300 bg-red-50/50 p-2 text-xs text-red-600">
                Falta capturar la foto física del ticket para poder guardar.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-sm"
            >
              <Check className="h-4 w-4" />
              Guardar Abastecimiento
            </button>
          </div>
        </form>
      )}

      {/* History of logged fuel tickets */}
      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
          No hay registros de combustible aún para este servicio. Utilice el botón superior para ingresar cargas en ruta.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-slate-50 text-xs gap-3"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onViewPhoto(
                      entry.receiptPhoto,
                      `Ticket Combustible ${entry.receiptNumber} - ${entry.gasStation}`
                    )
                  }
                  className="group relative h-12 w-16 shrink-0 overflow-hidden rounded border border-slate-300"
                >
                  <img
                    src={entry.receiptPhoto}
                    alt={entry.receiptNumber}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-slate-950/20 text-[9px] font-bold text-white flex items-center justify-center">
                    Zoom
                  </div>
                </button>

                <div>
                  <div className="font-bold text-slate-900">{entry.gasStation}</div>
                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                    <span>Ticket: <strong className="font-mono text-slate-700">{entry.receiptNumber}</strong></span>
                    <span>·</span>
                    <span>{entry.timestamp}</span>
                    <span>·</span>
                    <span>Odómetro: <strong className="font-mono">{entry.odometerAtRefuel.toLocaleString()} km</strong></span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono font-bold text-sm text-slate-900">
                  {entry.currency === 'PEN' ? 'S/.' : '$'} {entry.totalAmount.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {entry.gallons.toFixed(1)} Glns @ {entry.currency === 'PEN' ? 'S/.' : '$'}{entry.pricePerGallon.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
