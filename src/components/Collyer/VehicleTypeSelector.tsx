import React from 'react';
import { Truck, Box, Car, ShieldCheck, Check, Info } from 'lucide-react';
import { VehicleType } from '../../types';
import { VEHICLE_PRESETS } from '../../data/mockData';

interface VehicleTypeSelectorProps {
  selectedType: VehicleType;
  onSelectType: (type: VehicleType) => void;
  compact?: boolean;
}

export const VehicleTypeSelector: React.FC<VehicleTypeSelectorProps> = ({
  selectedType,
  onSelectType,
  compact = false,
}) => {
  const currentPreset = VEHICLE_PRESETS[selectedType] || VEHICLE_PRESETS['Tracto'];

  const vehicleOptions: {
    type: VehicleType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tag: string;
  }[] = [
    {
      type: 'Tracto',
      label: 'Tracto',
      icon: Truck,
      tag: 'Carga Pesada',
    },
    {
      type: 'Furgón',
      label: 'Furgón',
      icon: Box,
      tag: 'Carga Seca',
    },
    {
      type: 'Vehículo Pequeño',
      label: 'Vehículo Pequeño',
      icon: Car,
      tag: 'Reparto Ágil',
    },
  ];

  return (
    <div className="space-y-3">
      {/* 3 Giant Tactile Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {vehicleOptions.map((opt) => {
          const isSelected = selectedType === opt.type;
          const IconComp = opt.icon;

          return (
            <button
              key={opt.type}
              type="button"
              onClick={() => onSelectType(opt.type)}
              className={`min-h-[68px] sm:min-h-[74px] p-2 sm:p-2.5 rounded-2xl border-2 font-black transition-all flex flex-col items-center justify-center gap-1 active:scale-95 shadow-md ${
                isSelected
                  ? 'border-amber-400 bg-gradient-to-b from-amber-400/20 to-amber-500/10 text-white ring-2 ring-amber-400/50'
                  : 'border-slate-800 bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isSelected ? 'bg-amber-400 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-400'
                }`}
              >
                <IconComp className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <span className={`text-[11px] sm:text-xs leading-tight font-extrabold text-center ${
                isSelected ? 'text-amber-300' : 'text-slate-300'
              }`}>
                {opt.label}
              </span>
              <span className="text-[9px] font-mono text-slate-400 font-normal">
                {opt.tag}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Plate & Cargo Adaptation Banner */}
      {!compact && (
        <div className="rounded-2xl bg-slate-950 border border-slate-800/90 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              Configuración de Unidad Adaptada:
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold px-2 py-0.5 text-[10px] font-mono">
              <Check className="h-3 w-3" /> {selectedType}
            </span>
          </div>

          {/* Plates Display */}
          <div className="grid grid-cols-2 gap-2 text-center pt-0.5">
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">
                {selectedType === 'Tracto' ? 'Placa Tracto' : selectedType === 'Furgón' ? 'Placa Furgón' : 'Placa Vehículo'}
              </span>
              <span className="text-sm font-black font-mono text-amber-400">
                {currentPreset.tractPlate}
              </span>
            </div>

            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-2">
              <span className="text-[9px] text-slate-400 uppercase font-semibold block">
                {selectedType === 'Tracto' ? 'Placa Chasis' : selectedType === 'Furgón' ? 'Precinto de Seg.' : 'Modalidad'}
              </span>
              <span className="text-sm font-black font-mono text-sky-400 truncate block">
                {selectedType === 'Tracto'
                  ? currentPreset.trailerPlate
                  : selectedType === 'Furgón'
                  ? currentPreset.securitySealNumber
                  : 'Furgoneta 3.5T'}
              </span>
            </div>
          </div>

          {/* Cargo Requirements & Capacity Description */}
          <div className="rounded-xl bg-slate-900/60 p-2.5 text-[11px] text-slate-300 flex items-start gap-2 border border-slate-800/60">
            <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-semibold">
                Requerimiento de Carga y Carrocería:
              </strong>
              <span className="text-slate-300">{currentPreset.cargoRequirementLabel}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
