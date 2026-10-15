import React, { useState } from 'react';
import {
  Truck,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Layers,
  MapPin,
  Calendar,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  Clock,
  Fuel,
} from 'lucide-react';
import { UnitInfo, TransportService } from '../../types';

interface ControlTowerModuleProps {
  units: UnitInfo[];
  services: TransportService[];
  onSelectUnitForDriverView: (unitId: string) => void;
  onUpdateUnitMileage: (unitId: string, newMileage: number) => void;
  onResetOilChange: (unitId: string, mechanic: string) => void;
}

export const ControlTowerModule: React.FC<ControlTowerModuleProps> = ({
  units,
  services,
  onSelectUnitForDriverView,
  onUpdateUnitMileage,
  onResetOilChange,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnitForModal, setSelectedUnitForModal] = useState<UnitInfo | null>(null);
  const [workshopNameInput, setWorkshopNameInput] = useState('Taller Central Lurín');

  // KPI Calculations
  const totalUnits = units.length;
  const inTransitUnits = units.filter((u) => u.status === 'in_transit').length;
  const inMaintenanceUnits = units.filter((u) => {
    const kmLeft = (u.lastOilChangeMileage + u.oilChangeInterval) - u.currentMileage;
    return u.status === 'maintenance' || kmLeft <= 0;
  }).length;
  const availableUnits = units.filter((u) => u.status === 'available').length;
  const operationalAvailabilityPct = Math.round(((totalUnits - inMaintenanceUnits) / totalUnits) * 100);

  // Critical inspection failures across all services
  const criticalChecklistIssues = services.flatMap((srv) =>
    srv.checklistItems
      .filter((chk) => chk.status === 'F' && chk.isCritical)
      .map((chk) => ({
        serviceCode: srv.serviceCode,
        unitTract: srv.unit.tractPlate,
        driverName: srv.driver.driverName,
        issue: chk.label,
        category: chk.category,
        notes: chk.notes,
      }))
  );

  const filteredUnits = units.filter((unit) => {
    const matchesFilter =
      filterStatus === 'all'
        ? true
        : filterStatus === 'maintenance_alert'
        ? (unit.lastOilChangeMileage + unit.oilChangeInterval) - unit.currentMileage <= 1500
        : unit.status === filterStatus;

    const matchesSearch =
      unit.tractPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.trailerPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.model.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleExecuteMaintenance = (unit: UnitInfo) => {
    onResetOilChange(unit.id, workshopNameInput || 'Taller Central Especializado');
    setSelectedUnitForModal(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-amber-400">
              <Truck className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Torre de Control & Gestión de Mantenimiento de Flota
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Monitoreo en tiempo real de unidades pesadas, odómetros, intervalos de cambio de aceite y salud operativa
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Última sincronización:</span>
          <span className="text-xs font-mono font-semibold text-slate-800">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Flota Total</span>
            <Truck className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {totalUnits} <span className="text-xs font-normal text-slate-500">Tractos</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            100% articulados con semirremolque
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>En Ruta Activa</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono tabular-nums">
            {inTransitUnits}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Servicios con GPS y evidencias en vivo
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Alertas de Mantenimiento</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono tabular-nums">
            {inMaintenanceUnits}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Próximos a superar límite de aceite
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Disponibilidad Operativa</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
            {operationalAvailabilityPct}%
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-semibold">
            Flota apta para nuevos despachos
          </div>
        </div>
      </div>

      {/* Critical Safety Notifications if any checklist failure exists */}
      {criticalChecklistIssues.length > 0 && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black uppercase text-red-800">
                  ALERTA DE SEGURIDAD EN VIVO: {criticalChecklistIssues.length} INCIDENCIA(S) DETECTADA(S) EN CHECKLIST
                </span>
                <span className="text-[11px] font-mono text-red-600 bg-red-100 px-2 py-0.5 rounded">
                  Inspección Pre-Ruta
                </span>
              </div>

              <div className="divide-y divide-red-200/80">
                {criticalChecklistIssues.map((issue, idx) => (
                  <div key={idx} className="pt-2 pb-1 text-xs text-red-900 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <strong className="font-mono text-slate-900 bg-white px-1.5 py-0.5 rounded border border-red-200 mr-2">
                        {issue.unitTract}
                      </strong>
                      <span>{issue.issue}</span>
                      <span className="text-red-700 ml-2 italic">({issue.category})</span>
                    </div>
                    <div className="text-[11px] text-red-700 font-mono">
                      Conductor: {issue.driverName} · {issue.serviceCode}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por placa tracto, carreta o modelo..."
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { key: 'all', label: 'Todas las Unidades' },
            { key: 'in_transit', label: 'En Ruta' },
            { key: 'loading', label: 'En Carga' },
            { key: 'available', label: 'Disponibles' },
            { key: 'maintenance_alert', label: 'Alerta Mantenimiento' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === tab.key
                  ? 'bg-slate-900 text-amber-400'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredUnits.map((unit) => {
          const kmSinceLastChange = unit.currentMileage - unit.lastOilChangeMileage;
          const targetNextChange = unit.lastOilChangeMileage + unit.oilChangeInterval;
          const kmRemaining = targetNextChange - unit.currentMileage;
          const pctUsed = Math.min(100, Math.round((kmSinceLastChange / unit.oilChangeInterval) * 100));

          const isOverdue = kmRemaining <= 0;
          const isWarning = kmRemaining > 0 && kmRemaining <= 1500;

          // Find active service for this unit
          const activeService = services.find((s) => s.unit.id === unit.id);

          return (
            <div
              key={unit.id}
              className={`rounded-xl border bg-white p-5 shadow-xs space-y-4 transition-all hover:shadow-md ${
                isOverdue
                  ? 'border-red-400 ring-1 ring-red-300'
                  : isWarning
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Unit Header Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900">{unit.model}</span>
                    <span
                      className={`text-[10px] font-bold uppercase rounded px-2 py-0.5 ${
                        unit.status === 'in_transit'
                          ? 'bg-emerald-100 text-emerald-800'
                          : unit.status === 'loading'
                          ? 'bg-blue-100 text-blue-800'
                          : unit.status === 'maintenance'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {unit.status === 'in_transit'
                        ? 'En Ruta'
                        : unit.status === 'loading'
                        ? 'En Carga'
                        : unit.status === 'maintenance'
                        ? 'Mantenimiento'
                        : 'Disponible'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Tracto: {unit.tractPlate}
                    </span>
                    <span className="flex items-center gap-1 font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      Carreta: {unit.trailerPlate}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Odómetro Actual</div>
                  <div className="text-lg font-black text-slate-900 font-mono tabular-nums">
                    {unit.currentMileage.toLocaleString()} <span className="text-xs font-normal">km</span>
                  </div>
                </div>
              </div>

              {/* Maintenance Bar & Status */}
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5 text-slate-500" />
                    Control de Aceite de Motor:
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      isOverdue
                        ? 'text-red-600'
                        : isWarning
                        ? 'text-amber-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {isOverdue
                      ? `¡Vencido por ${Math.abs(kmRemaining).toLocaleString()} km!`
                      : isWarning
                      ? `Atención: Quedan ${kmRemaining.toLocaleString()} km`
                      : `Óptimo (${kmRemaining.toLocaleString()} km rest.)`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full transition-all ${
                      isOverdue
                        ? 'bg-red-600'
                        : isWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pctUsed}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-1.5">
                  <span className="truncate max-w-[200px]">
                    Último cambio por: <strong>{unit.lastOilChangeMechanic}</strong>
                  </span>
                  <span className="font-mono">
                    {unit.lastOilChangeMileage.toLocaleString()} km ➔ {targetNextChange.toLocaleString()} km
                  </span>
                </div>
              </div>

              {/* Active Service Summary */}
              {activeService && (
                <div className="text-xs text-slate-700 border-t border-slate-100 pt-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <span className="font-semibold text-slate-900">{activeService.serviceCode}:</span>{' '}
                      <span>{activeService.origin.split(' ')[0]} ➔ {activeService.destination.split(' ')[0]}</span>
                      <span className="text-slate-400 ml-1">({activeService.driver.driverName})</span>
                    </div>
                    <span className="font-mono text-emerald-700 font-bold shrink-0">
                      S/. {activeService.agreedRate.toLocaleString()}
                    </span>
                  </div>

                  {/* Shift Status in Control Tower */}
                  <div className="flex items-center justify-between text-[11px] bg-slate-50 rounded p-1.5 border border-slate-200/60">
                    <span className="text-slate-500">Estado de Jornada Conductor:</span>
                    {activeService.driver.phase === 'apertura_pendiente' ? (
                      <span className="font-bold text-red-700 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        Apertura Pendiente (Bloqueada)
                      </span>
                    ) : activeService.driver.phase === 'cierre_pendiente' ? (
                      <span className="font-bold text-amber-700 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Cierre Post-Ruta Requerido
                      </span>
                    ) : activeService.driver.phase === 'jornada_cerrada' ? (
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Cierre Certificado ({activeService.driver.closingReport?.totalKmDriven} km)
                      </span>
                    ) : (
                      <span className="font-bold text-blue-700 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        En Ruta Activa
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => onSelectUnitForDriverView(unit.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Truck className="h-3.5 w-3.5 text-amber-600" />
                  Abrir Vista Conductor
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedUnitForModal(unit)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-slate-800 transition-colors"
                >
                  <Wrench className="h-3.5 w-3.5" />
                  Registrar Servicio en Taller
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Workshop Registration Modal */}
      {selectedUnitForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white border border-slate-200 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-600" />
                Registrar Cambio de Aceite y Filtros
              </h3>
              <button
                onClick={() => setSelectedUnitForModal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Se restablecerá el contador preventivo para la unidad{' '}
              <strong>{selectedUnitForModal.model} ({selectedUnitForModal.tractPlate})</strong> tomando
              el odómetro actual ({selectedUnitForModal.currentMileage.toLocaleString()} km).
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre del Taller / Mecánico Responsable
                </label>
                <input
                  type="text"
                  value={workshopNameInput}
                  onChange={(e) => setWorkshopNameInput(e.target.value)}
                  placeholder="Ej. Taller Central Lurín - Ing. Mario Vargas"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nuevo Odómetro de Salida (km)
                </label>
                <input
                  type="number"
                  defaultValue={selectedUnitForModal.currentMileage}
                  onChange={(e) =>
                    onUpdateUnitMileage(selectedUnitForModal.id, Number(e.target.value))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-3">
              <button
                type="button"
                onClick={() => setSelectedUnitForModal(null)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleExecuteMaintenance(selectedUnitForModal)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirmar y Resetear Intervalo (10,000 km)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
