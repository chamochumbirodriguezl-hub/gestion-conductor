import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  DollarSign,
  TrendingUp,
  Clock,
  Truck,
  ShieldCheck,
  Receipt,
  UserCheck,
  Calendar,
  Layers,
  ArrowRight,
  Printer,
  ChevronRight,
  XCircle,
} from 'lucide-react';
import { TransportService, ServiceFinancialStatus } from '../../types';

interface BillingModuleProps {
  services: TransportService[];
  onApproveForBilling: (serviceId: string) => void;
  onRequestCorrection: (serviceId: string, reason: string) => void;
  onViewPhoto: (url: string, title: string) => void;
}

export const BillingModule: React.FC<BillingModuleProps> = ({
  services,
  onApproveForBilling,
  onRequestCorrection,
  onViewPhoto,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    services.find((s) => s.financialStatus === 'pending_validation')?.id || services[0]?.id || ''
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [correctionReasonModalOpen, setCorrectionReasonModalOpen] = useState(false);
  const [correctionReasonText, setCorrectionReasonText] = useState('');
  const [isPrintPreview, setIsPrintPreview] = useState(false);

  // Active service object
  const activeService = services.find((s) => s.id === selectedServiceId) || services[0];

  // Financial status filter
  const filteredServices = services.filter((srv) => {
    if (filterStatus === 'all') return true;
    return srv.financialStatus === filterStatus;
  });

  // Calculate DSO / Pipeline KPIs
  const totalPendingAmount = services
    .filter((s) => s.financialStatus === 'pending_validation')
    .reduce((acc, s) => acc + s.agreedRate, 0);

  const totalReadyToInvoiceAmount = services
    .filter((s) => s.financialStatus === 'ready_to_invoice')
    .reduce((acc, s) => acc + s.agreedRate, 0);

  const totalFuelCost = activeService?.fuelEntries.reduce((acc, f) => acc + f.totalAmount, 0) || 0;
  const grossMargin = activeService ? activeService.agreedRate - totalFuelCost : 0;
  const grossMarginPct = activeService ? Math.round((grossMargin / activeService.agreedRate) * 100) : 0;

  // Stages & POD references
  const podStage = activeService?.stages.find((s) => s.stageId === 5);
  const podPhoto = podStage?.photos?.[0]?.url;

  const handleApprove = () => {
    if (!activeService) return;
    onApproveForBilling(activeService.id);
  };

  const handleSendCorrection = () => {
    if (!correctionReasonText.trim()) return;
    onRequestCorrection(activeService.id, correctionReasonText);
    setCorrectionReasonModalOpen(false);
    setCorrectionReasonText('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <FileText className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Liquidación y Facturación (Auditoría Administrativa Cruzada)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Validación de evidencias físicas, cotejo POD con firma/sello y reducción acelerada del DSO (Días de Cobro)
          </p>
        </div>

        {/* DSO Optimization Callout */}
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <div className="text-xs">
            <div className="font-bold text-emerald-950">DSO Estimado: 18 Días (-55%)</div>
            <div className="text-[11px] text-emerald-700">Validación y facturación el mismo día del servicio</div>
          </div>
        </div>
      </div>

      {/* Financial Pipeline Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs">
          <div className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
            Pendiente de Validación POD
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono tabular-nums mt-1">
            S/. {totalPendingAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-800 mt-1">
            {services.filter((s) => s.financialStatus === 'pending_validation').length} servicios por auditar
          </div>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
          <div className="text-xs font-semibold text-emerald-900 uppercase tracking-wide">
            Listo para Facturar (Pre-facturado)
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono tabular-nums mt-1">
            S/. {totalReadyToInvoiceAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-800 mt-1">
            Expedientes completos listos para emisión de Factura Electrónica
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Control de Cobranza & Capital
          </div>
          <div className="text-xs text-slate-600 mt-1">
            Al validar digitalmente el POD con geolocalización, se elimina la pérdida de guías físicas y demoras de cobranza.
          </div>
          <div className="text-[11px] font-mono font-bold text-slate-800 mt-1">
            Ciclo de Cierre: &lt; 24 Horas
          </div>
        </div>
      </div>

      {/* Service Selector Tray */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'pending_validation', label: 'Pendientes' },
            { key: 'ready_to_invoice', label: 'Listos para Facturar' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                filterStatus === tab.key
                  ? 'bg-slate-900 text-amber-400'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Selected Service dropdown / indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">Servicio en auditoría:</span>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-500"
          >
            {filteredServices.map((srv) => (
              <option key={srv.id} value={srv.id}>
                {srv.serviceCode} · {srv.clientName} ({srv.financialStatus === 'ready_to_invoice' ? 'LISTO' : 'PENDIENTE'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CROSS SIDE-BY-SIDE AUDIT VIEW (PARALLEL SPLIT) */}
      {activeService ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LADO A: Datos Comerciales y Operativos (7 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-extrabold text-slate-900 bg-slate-100 px-2.5 py-1 rounded">
                    {activeService.serviceCode}
                  </span>
                  <span
                    className={`text-xs font-bold uppercase rounded px-2.5 py-1 ${
                      activeService.financialStatus === 'ready_to_invoice'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {activeService.financialStatus === 'ready_to_invoice'
                      ? 'Listo para Facturar'
                      : 'Pendiente de Validación'}
                  </span>
                </div>

                {activeService.preInvoiceNumber && (
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">
                    Pre-Factura: {activeService.preInvoiceNumber}
                  </span>
                )}
              </div>

              {/* Client & Commercial Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Cliente:</span>
                  <strong className="text-slate-900 text-sm block">{activeService.clientName}</strong>
                  <span className="font-mono text-slate-500">RUC: {activeService.clientRuc}</span>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 block">Tarifa Flete Convenida:</span>
                  <strong className="text-xl font-black text-slate-900 font-mono tabular-nums block">
                    {activeService.currency === 'PEN' ? 'S/.' : '$'}{' '}
                    {activeService.agreedRate.toLocaleString()}
                  </strong>
                  <span className="text-[11px] text-slate-500">+ I.G.V. 18%</span>
                </div>
              </div>

              {/* Route & Cargo */}
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Ruta del Servicio:</span>
                    <strong className="text-slate-800">{activeService.origin} ➔ {activeService.destination}</strong>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 pt-2 flex flex-wrap items-center justify-between gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500">Carga:</span>{' '}
                    <strong>{activeService.cargoDescription}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Peso:</span>{' '}
                    <strong className="font-mono">{activeService.cargoWeightTn} Toneladas</strong>
                  </div>
                </div>
              </div>

              {/* Fleet Unit and Driver Assigment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-slate-200 p-3 space-y-1">
                  <div className="text-slate-400 font-semibold uppercase text-[10px] flex items-center gap-1">
                    <Truck className="h-3 w-3 text-amber-600" />
                    Unidad Asignada
                  </div>
                  <div className="font-bold text-slate-900">{activeService.unit.model}</div>
                  <div className="flex items-center gap-2 font-mono flex-wrap">
                    <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">
                      {activeService.unit.vehicleType === 'Furgón' ? 'Furgón' : 'Tracto'}: {activeService.unit.tractPlate}
                    </span>
                    {activeService.unit.vehicleType === 'Furgón' ? (
                      <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
                        Precinto: {activeService.unit.securitySealNumber || 'Hermético'}
                      </span>
                    ) : (
                      <span className="bg-sky-100 text-sky-900 px-1.5 py-0.5 rounded font-bold">
                        Carreta: {activeService.unit.trailerPlate}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-3 space-y-1">
                  <div className="text-slate-400 font-semibold uppercase text-[10px] flex items-center gap-1">
                    <UserCheck className="h-3 w-3 text-emerald-600" />
                    Conductor Titular ({activeService.driver.shiftType})
                  </div>
                  <div className="font-bold text-slate-900">{activeService.driver.driverName}</div>
                  <div className="text-slate-500 font-mono text-[11px] flex items-center justify-between">
                    <span>Brevete: {activeService.driver.driverLicense}</span>
                    <span>Salida: {activeService.driver.clockOutTime || 'En Ruta'}</span>
                  </div>
                </div>
              </div>

              {/* Daily Incidents Cross-Audit Block */}
              <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs space-y-1.5">
                <div className="font-bold text-slate-800 uppercase tracking-wide text-[10px] flex items-center justify-between">
                  <span>Bitácora de Novedades del Turno (Reporte Conductor):</span>
                  <span className="font-mono text-amber-700">
                    {activeService.driver.dailyIncidents?.length || 0} registrada(s)
                  </span>
                </div>
                {activeService.driver.dailyIncidents && activeService.driver.dailyIncidents.length > 0 ? (
                  <div className="space-y-1.5">
                    {activeService.driver.dailyIncidents.map((inc) => (
                      <div key={inc.id} className="rounded bg-white p-2 border border-slate-200 text-[11px]">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-800">{inc.categoryLabel}</strong>
                          <span className="text-slate-400 font-mono">{inc.timestamp}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{inc.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 italic text-[11px]">
                    Operación 100% conforme. No se registraron incidentes ni averías en ruta.
                  </div>
                )}
              </div>

              {/* Odometers & Route Kilometers */}
              <div className="rounded-lg border border-slate-200 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Odómetro Inicial: <strong className="font-mono">{activeService.driver.initialOdometer.toLocaleString()} km</strong></span>
                  <span>Odómetro Final: <strong className="font-mono">{activeService.driver.finalOdometer?.toLocaleString() || 'En Ruta'} km</strong></span>
                </div>
                {activeService.driver.finalOdometer && (
                  <div className="border-t border-slate-100 pt-1 text-slate-800 flex items-center justify-between font-medium">
                    <span>Distancia Total Recorrida:</span>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {activeService.driver.finalOdometer - activeService.driver.initialOdometer} km
                    </span>
                  </div>
                )}
              </div>

              {/* Financial Breakdown (Fuel vs Margin) */}
              <div className="rounded-lg border border-slate-200 bg-slate-900 text-white p-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span>Cálculo Operativo de Liquidación</span>
                  <span className="font-mono text-amber-400">LIQ-{activeService.serviceCode}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Tarifa Flete Convenida:</span>
                  <span className="font-mono font-bold">
                    {activeService.currency === 'PEN' ? 'S/.' : '$'} {activeService.agreedRate.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-red-400">
                  <span>(-) Combustible en Ruta Registrado:</span>
                  <span className="font-mono font-bold">
                    - S/. {totalFuelCost.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-2 text-emerald-400">
                  <span className="font-bold">(=) Margen Operativo Bruto:</span>
                  <div className="text-right">
                    <div className="font-mono font-black text-sm">
                      S/. {grossMargin.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">{grossMarginPct}% de margen</div>
                  </div>
                </div>
              </div>

              {/* 4-Point Administrative Validation Checklist */}
              <div className="rounded-lg border border-slate-200 p-3 space-y-2 text-xs">
                <div className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">
                  Criterios de Conformidad para Facturar
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-slate-700">
                    <input
                      type="checkbox"
                      defaultChecked={activeService.validationChecklist?.podStampLegible}
                      className="h-4 w-4 rounded text-emerald-600"
                    />
                    <span>1. Guía sellada y firmada legible sin enmendaduras (POD verificado)</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-700">
                    <input
                      type="checkbox"
                      defaultChecked={activeService.validationChecklist?.fuelReceiptsMatch}
                      className="h-4 w-4 rounded text-emerald-600"
                    />
                    <span>2. Comprobante de combustible con foto legible coincide con monto</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-700">
                    <input
                      type="checkbox"
                      defaultChecked={activeService.validationChecklist?.mileageWithinTolerance}
                      className="h-4 w-4 rounded text-emerald-600"
                    />
                    <span>3. Kilometraje de tablero dentro del rango estándar de la ruta</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-700">
                    <input
                      type="checkbox"
                      defaultChecked={activeService.validationChecklist?.zeroDamageReported}
                      className="h-4 w-4 rounded text-emerald-600"
                    />
                    <span>4. Sin observaciones de daño de carga ni reclamos de cliente</span>
                  </label>

                  <label className="flex items-center gap-2 text-slate-700">
                    <input
                      type="checkbox"
                      defaultChecked={activeService.driver.phase === 'jornada_cerrada' || !!activeService.driver.closingReport}
                      className="h-4 w-4 rounded text-emerald-600"
                    />
                    <span className="font-semibold text-slate-900">
                      5. Reporte de Cierre de Jornada (Momento 2) recibido con odómetro final e inspección post-operacional
                    </span>
                  </label>
                </div>
              </div>

              {/* Action Buttons: Aprobar para Facturar / Solicitar Corrección */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCorrectionReasonModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Observar / Solicitar Subsanación
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-xs font-bold transition-all shadow-md ${
                    activeService.financialStatus === 'ready_to_invoice'
                      ? 'bg-slate-900 text-amber-400 hover:bg-slate-800'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500 ring-2 ring-emerald-400/50'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {activeService.financialStatus === 'ready_to_invoice'
                    ? 'Aprobado (Listo para Facturar)'
                    : 'APROBAR PARA FACTURAR'}
                </button>
              </div>
            </div>
          </div>

          {/* LADO B: Miniaturas y Auditoría Fotográfica Cruzada (5 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Galería de Evidencias Digitales para Cotejo
                </h3>
                <span className="text-[11px] text-slate-500">Haga clic para zoom en alta resolución</span>
              </div>

              {/* Key Evidence 1: POD / Delivery Receipt (Featured) */}
              <div className="rounded-xl border-2 border-amber-400 bg-amber-50/30 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-950 uppercase flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    {activeService.unit.vehicleType === 'Furgón'
                      ? 'Acta de Conformidad y Entrega (Furgón)'
                      : 'POD: Guía Sellada y Firmada por el Cliente (Tracto)'}
                  </span>
                  <span className="rounded bg-emerald-600 text-white font-mono text-[10px] px-2 py-0.5 font-bold">
                    INDISPENSABLE
                  </span>
                </div>

                {podPhoto ? (
                  <div
                    onClick={() =>
                      onViewPhoto(
                        podPhoto,
                        `Guía Sellada y Firmada (POD) - ${activeService.serviceCode}`,
                      )
                    }
                    className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-300 bg-black aspect-video shadow-xs"
                  >
                    <img
                      src={podPhoto}
                      alt="Guía sellada POD"
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3 text-white">
                      <div>
                        <div className="text-xs font-bold">Sello y Firma Verificados</div>
                        <div className="text-[10px] text-slate-300">
                          Receptor: {podStage?.receiverData?.fullName || 'Roberto Salas Mendoza'}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500 px-2 py-1 text-[11px] font-bold text-slate-950">
                        <ZoomIn className="h-3 w-3" /> Ampliar Sello
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded border border-dashed border-red-300 p-4 text-center text-xs text-red-600">
                    El conductor aún no ha subido la foto de la guía sellada (Etapa 5).
                  </div>
                )}
              </div>

              {/* Key Evidence 2: Fuel Receipts */}
              <div className="rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5 text-amber-600" />
                    Comprobantes de Combustible en Ruta
                  </span>
                  <span className="font-mono text-slate-500">
                    {activeService.fuelEntries.length} ticket(s)
                  </span>
                </div>

                {activeService.fuelEntries.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {activeService.fuelEntries.map((fuel) => (
                      <div
                        key={fuel.id}
                        onClick={() =>
                          onViewPhoto(
                            fuel.receiptPhoto,
                            `Ticket Combustible ${fuel.receiptNumber} - ${fuel.gasStation}`
                          )
                        }
                        className="group relative cursor-pointer overflow-hidden rounded border border-slate-200 aspect-video bg-black"
                      >
                        <img
                          src={fuel.receiptPhoto}
                          alt="Ticket combustible"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-1.5 text-white">
                          <span className="text-[10px] font-bold truncate">{fuel.gasStation}</span>
                          <span className="text-[9px] font-mono text-amber-300">
                            {fuel.currency === 'PEN' ? 'S/.' : '$'} {fuel.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">No se registraron abastecimientos.</div>
                )}
              </div>

              {/* Key Evidence 3: Initial and Final Odometer Photos */}
              <div className="rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="text-xs font-bold text-slate-800">
                  Fotos de Tablero - Odómetro Inicial y Final
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {activeService.driver.initialOdometerPhoto && (
                    <div
                      onClick={() =>
                        onViewPhoto(
                          activeService.driver.initialOdometerPhoto,
                          `Odómetro Inicial: ${activeService.driver.initialOdometer.toLocaleString()} km`
                        )
                      }
                      className="group relative cursor-pointer overflow-hidden rounded border border-slate-200 aspect-video bg-black"
                    >
                      <img
                        src={activeService.driver.initialOdometerPhoto}
                        alt="Odómetro Inicial"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1.5 text-white text-[10px] font-mono">
                        Inicial: {activeService.driver.initialOdometer.toLocaleString()} km
                      </div>
                    </div>
                  )}

                  {activeService.driver.finalOdometerPhoto ? (
                    <div
                      onClick={() =>
                        onViewPhoto(
                          activeService.driver.finalOdometerPhoto!,
                          `Odómetro Final: ${activeService.driver.finalOdometer?.toLocaleString()} km`
                        )
                      }
                      className="group relative cursor-pointer overflow-hidden rounded border border-slate-200 aspect-video bg-black"
                    >
                      <img
                        src={activeService.driver.finalOdometerPhoto}
                        alt="Odómetro Final"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-1.5 text-white text-[10px] font-mono">
                        Final: {activeService.driver.finalOdometer?.toLocaleString()} km
                      </div>
                    </div>
                  ) : (
                    <div className="rounded border border-dashed border-slate-200 flex items-center justify-center text-[11px] text-slate-400">
                      Pendiente odómetro final
                    </div>
                  )}
                </div>
              </div>

              {/* Key Evidence 4: Cargo & Stowing Evidences */}
              <div className="rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="text-xs font-bold text-slate-800">
                  Inspección de Mercancía Estibada y Plataforma
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {activeService.stages
                    .flatMap((s) => s.photos)
                    .slice(0, 3)
                    .map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => onViewPhoto(photo.url, photo.label)}
                        className="group relative cursor-pointer overflow-hidden rounded border border-slate-200 aspect-video bg-black"
                      >
                        <img
                          src={photo.url}
                          alt={photo.label}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-end p-1 text-white text-[9px] truncate">
                          {photo.label}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 text-xs">
          Seleccione un servicio para ver los detalles de liquidación.
        </div>
      )}

      {/* Observation / Correction Modal */}
      {correctionReasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl bg-white border border-slate-200 p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Solicitar Corrección / Subsanación al Conductor
            </h3>
            <p className="text-xs text-slate-600">
              Indique qué fotografía o dato requiere rectificación por parte del operador de la unidad.
            </p>

            <textarea
              rows={3}
              value={correctionReasonText}
              onChange={(e) => setCorrectionReasonText(e.target.value)}
              placeholder="Ej. La fotografía del sello en la guía está borrosa y no se distingue el DNI del receptor..."
              className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 outline-none focus:border-red-500"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCorrectionReasonModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendCorrection}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Enviar Notificación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
