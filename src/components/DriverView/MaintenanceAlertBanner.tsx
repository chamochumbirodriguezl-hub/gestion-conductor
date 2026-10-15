import React from 'react';
import { AlertTriangle, Wrench, CheckCircle2, User, Gauge } from 'lucide-react';
import { UnitInfo } from '../../types';

interface MaintenanceAlertBannerProps {
  unit: UnitInfo;
}

export const MaintenanceAlertBanner: React.FC<MaintenanceAlertBannerProps> = ({ unit }) => {
  const kmSinceLastChange = unit.currentMileage - unit.lastOilChangeMileage;
  const targetNextChange = unit.lastOilChangeMileage + unit.oilChangeInterval;
  const kmRemaining = targetNextChange - unit.currentMileage;
  const percentageUsed = Math.min(100, Math.round((kmSinceLastChange / unit.oilChangeInterval) * 100));

  const isOverdue = kmRemaining <= 0;
  const isNearLimit = kmRemaining > 0 && kmRemaining <= 1500;
  const isOptimal = kmRemaining > 1500;

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition-all ${
        isOverdue
          ? 'border-red-300 bg-red-50/90 text-red-950'
          : isNearLimit
          ? 'border-amber-300 bg-amber-50/90 text-amber-950'
          : 'border-emerald-200 bg-emerald-50/70 text-emerald-950'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Left: Indicator Icon and Summary */}
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              isOverdue
                ? 'bg-red-600 text-white'
                : isNearLimit
                ? 'bg-amber-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isOverdue ? (
              <AlertTriangle className="h-5 w-5" />
            ) : isNearLimit ? (
              <Wrench className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                {isOverdue
                  ? 'ALERTA CRÍTICA: CAMBIO DE ACEITE VENCIDO'
                  : isNearLimit
                  ? 'ALERTA PREVENTIVA: CAMBIO DE ACEITE PRÓXIMO'
                  : 'MANTENIMIENTO PREVENTIVO AL DÍA'}
              </span>
              <span className="text-xs font-mono font-bold">
                ({percentageUsed}% de intervalo utilizado)
              </span>
            </div>

            <p className="text-xs mt-0.5 opacity-90">
              {isOverdue ? (
                <>
                  La unidad ha sobrepasado el ciclo por{' '}
                  <strong className="font-semibold underline">
                    {Math.abs(kmRemaining).toLocaleString()} km
                  </strong>
                  . Notifique de inmediato al jefe de mantenimiento antes de continuar ruta larga.
                </>
              ) : isNearLimit ? (
                <>
                  Faltan solo{' '}
                  <strong className="font-semibold">{kmRemaining.toLocaleString()} km</strong>{' '}
                  para el objetivo de mantenimiento preventivo ({targetNextChange.toLocaleString()} km).
                </>
              ) : (
                <>
                  Vida útil de lubricante en rango seguro. Faltan{' '}
                  <strong className="font-semibold">{kmRemaining.toLocaleString()} km</strong> para el
                  próximo servicio.
                </>
              )}
            </p>

            {/* Verification details of last oil change */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs opacity-80 border-t pt-1.5 border-current/15">
              <span className="flex items-center gap-1">
                <Gauge className="h-3.5 w-3.5" />
                <span>Último cambio:</span>{' '}
                <strong className="font-mono">{unit.lastOilChangeMileage.toLocaleString()} km</strong>
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>Responsable / Taller:</span>{' '}
                <strong className="font-medium">{unit.lastOilChangeMechanic}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Wrench className="h-3.5 w-3.5" />
                <span>Intervalo estándar:</span>{' '}
                <strong className="font-mono">{unit.oilChangeInterval.toLocaleString()} km</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Progress visual */}
        <div className="w-full md:w-48 shrink-0 bg-white/70 rounded-lg p-2.5 border border-current/20">
          <div className="flex justify-between text-[11px] font-mono mb-1">
            <span>Km actual</span>
            <span className="font-bold">{unit.currentMileage.toLocaleString()} km</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full transition-all duration-500 ${
                isOverdue ? 'bg-red-600' : isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, percentageUsed)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>{unit.lastOilChangeMileage.toLocaleString()} km</span>
            <span>Meta: {targetNextChange.toLocaleString()} km</span>
          </div>
        </div>
      </div>
    </div>
  );
};
