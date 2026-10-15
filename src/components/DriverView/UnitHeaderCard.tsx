import React from 'react';
import { Truck, Shield, AlertTriangle, Layers, Gauge, Package, Lock, Check } from 'lucide-react';
import { UnitInfo, VehicleType } from '../../types';

interface UnitHeaderCardProps {
  unit: UnitInfo;
  allUnits?: UnitInfo[];
  selectedVehicleType: VehicleType;
  onSelectVehicleType?: (type: VehicleType) => void;
  onSelectUnit?: (unitId: string) => void;
}

export const UnitHeaderCard: React.FC<UnitHeaderCardProps> = ({
  unit,
  allUnits,
  selectedVehicleType,
  onSelectVehicleType,
  onSelectUnit,
}) => {
  const kmToOilChange = (unit.lastOilChangeMileage + unit.oilChangeInterval) - unit.currentMileage;
  const isOilWarning = kmToOilChange <= 1200 && kmToOilChange > 0;
  const isOilCritical = kmToOilChange <= 0;

  const isTracto = selectedVehicleType === 'Tracto';

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900 text-white shadow-xl">
      {/* Top Banner with Vehicle Type Selection */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg font-black shadow-md ${
            isTracto ? 'bg-amber-500 text-slate-950' : 'bg-sky-500 text-slate-950'
          }`}>
            {isTracto ? <Truck className="h-6 w-6" /> : <Package className="h-6 w-6" />}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                isTracto ? 'text-amber-400' : 'text-sky-400'
              }`}>
                UNIDAD EN SERVICIO: {selectedVehicleType.toUpperCase()}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400 font-mono">ID: {unit.id.toUpperCase()}</span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              {unit.model}
            </h1>
          </div>
        </div>

        {/* Vehicle Type Switcher & Unit Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {onSelectVehicleType && (
            <div className="flex items-center rounded-lg bg-slate-800 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => onSelectVehicleType('Tracto')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
                  selectedVehicleType === 'Tracto'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Truck className="h-3.5 w-3.5" />
                <span>Tracto</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectVehicleType('Furgón')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
                  selectedVehicleType === 'Furgón'
                    ? 'bg-sky-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                <span>Furgón</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectVehicleType('Vehículo Pequeño')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${
                  selectedVehicleType === 'Vehículo Pequeño'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🚗 Veh. Pequeño</span>
              </button>
            </div>
          )}

          {allUnits && onSelectUnit && (
            <select
              value={unit.id}
              onChange={(e) => onSelectUnit(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 outline-none focus:border-amber-400"
            >
              {allUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.vehicleType}: {u.tractPlate} · {u.model}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main Callouts: Differentiated layout according to Tracto vs Furgón */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-900/90">
        {/* Tracto / Camión Plate */}
        <div className="relative rounded-lg border border-slate-700/80 bg-slate-950/70 p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-amber-400" />
              {isTracto ? 'Placa del Tracto' : 'Placa Camión Furgón'}
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
              PERÚ
            </span>
          </div>
          <div className="text-2xl font-black tracking-wider text-amber-400 font-mono">
            {unit.tractPlate}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>{isTracto ? 'Tractocamión Articulado 6x4' : 'Camión Rígido Furgón Carga'}</span>
          </div>
        </div>

        {/* Second Box: Carreta for Tracto OR Precinto & Capacidad for Furgón */}
        {isTracto ? (
          <div className="relative rounded-lg border border-slate-700/80 bg-slate-950/70 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-sky-400" />
                Placa de Carreta
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                SEMI-REMOLQUE
              </span>
            </div>
            <div className="text-2xl font-black tracking-wider text-sky-400 font-mono">
              {unit.trailerPlate}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {unit.trailerType || 'Semirremolque Plataforma 3 Ejes'}
            </div>
          </div>
        ) : (
          <div className="relative rounded-lg border border-slate-700/80 bg-slate-950/70 p-3.5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                Precinto & Capacidad
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                HERMÉTICO
              </span>
            </div>
            <div className="text-lg font-black tracking-wider text-emerald-400 font-mono truncate">
              {unit.securitySealNumber || 'SEAL-ALICORP-4912'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Capacidad: <strong>{unit.boxCapacityM3 || 62} m³</strong></span>
              <span className="text-sky-300">{unit.isRefrigerated ? 'Refrigerado (-18°C)' : 'Carga Seca'}</span>
            </div>
          </div>
        )}

        {/* Current Mileage */}
        <div className="relative rounded-lg border border-slate-700/80 bg-slate-950/70 p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="h-3.5 w-3.5 text-emerald-400" />
              Kilometraje Odómetro
            </span>
            <span className="text-[10px] text-slate-400 font-mono">ACTUAL</span>
          </div>
          <div className="text-2xl font-black tracking-wider text-slate-100 font-mono tabular-nums">
            {unit.currentMileage.toLocaleString()} <span className="text-xs font-normal text-slate-400">km</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            Capacidad Tanque: {unit.fuelTankCapacityGln} glns
          </div>
        </div>

        {/* Maintenance / Safety Status */}
        <div className={`relative rounded-lg border p-3.5 ${
          isOilCritical
            ? 'border-red-600 bg-red-950/40 text-red-100'
            : isOilWarning
            ? 'border-amber-600 bg-amber-950/30 text-amber-100'
            : 'border-emerald-700/60 bg-emerald-950/20 text-emerald-100'
        }`}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5">
              {isOilCritical ? (
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              ) : (
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
              )}
              Mantenimiento
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40">
              {isOilCritical ? 'VENCIDO' : isOilWarning ? 'PREVENTIVO' : 'AL DÍA'}
            </span>
          </div>
          <div className="text-lg font-bold font-mono tabular-nums">
            {kmToOilChange > 0 ? `${kmToOilChange.toLocaleString()} km rest.` : `${Math.abs(kmToOilChange)} km excedidos`}
          </div>
          <div className="text-[11px] opacity-80 mt-1 truncate">
            Próx. Cambio de Aceite
          </div>
        </div>
      </div>
    </div>
  );
};
