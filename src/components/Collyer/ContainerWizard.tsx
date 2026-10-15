import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Box,
  ShieldCheck,
  Check,
  Sparkles,
  ZoomIn,
  Anchor,
  Truck,
  Car,
  Layers,
  RefreshCw,
  AlertCircle,
  Navigation,
  FileText,
  Calendar,
} from 'lucide-react';
import {
  TransportService,
  ServiceEvidence,
  StageId,
  VehicleType,
  RouteItineraryPoint,
  TrackingPointStatus,
} from '../../types';
import { RouteTrackingTimeline } from './RouteTrackingTimeline';

interface ContainerWizardProps {
  currentService: TransportService;
  onCompleteStage: (stageId: StageId, data: Partial<ServiceEvidence>) => void;
  onCertifyTerminado: (serviceId: string) => void;
  onUpdatePointStatus?: (pointId: string, status: TrackingPointStatus) => void;
  onRequestPhotoUpload: (title: string, onSuccess: (url: string, label?: string) => void) => void;
  onViewPhoto: (url: string, title: string) => void;
  onBackToHome: () => void;
}

interface StepInfo {
  id: StageId;
  stepNumber: number;
  title: string;
  shortLabel: string;
  instruction: string;
  locationHint: string;
  icon: React.ComponentType<{ className?: string }>;
}

const GET_STEPS_FOR_VEHICLE = (vehicleType: VehicleType, service: TransportService): StepInfo[] => {
  if (vehicleType === 'Furgón') {
    return [
      {
        id: 1,
        stepNumber: 1,
        title: '1. Presentación Furgón en Origen',
        shortLabel: 'Origen Furgón',
        instruction: 'Toma una foto del camión furgón en garita de carga y guía de remisión remitente.',
        locationHint: service.origin || 'Almacén Central Garita Origen',
        icon: Box,
      },
      {
        id: 2,
        stepNumber: 2,
        title: '2. Carga Estibada y Precinto Puesto',
        shortLabel: 'Carga & Precinto',
        instruction: 'Toma foto de mercadería palletizada dentro del furgón y precinto de seguridad colocado.',
        locationHint: 'Rampa de Carga y Despacho',
        icon: ShieldCheck,
      },
      {
        id: 3,
        stepNumber: 3,
        title: '3. Arribo y Descarga en Cliente',
        shortLabel: 'Descarga Cliente',
        instruction: 'Toma foto al llegar a la planta del cliente con precinto intacto previo al desprecintado.',
        locationHint: service.destination || 'Planta de Recepción del Cliente',
        icon: Truck,
      },
      {
        id: 4,
        stepNumber: 4,
        title: '4. Furgón Desocupado e Inspección',
        shortLabel: 'Furgón Vacío',
        instruction: 'Toma foto del interior del furgón totalmente desocupado, barrido y sin mermas.',
        locationHint: 'Bahía de Descarga del Cliente',
        icon: Layers,
      },
      {
        id: 5,
        stepNumber: 5,
        title: '5. Acta de Conformidad y Retorno',
        shortLabel: 'Acta & Retorno',
        instruction: 'Toma foto de la guía / acta de recepción sellada por almacén y retorno a base.',
        locationHint: 'Garita de Retorno Base Collyer',
        icon: RefreshCw,
      },
    ];
  }

  if (vehicleType === 'Vehículo Pequeño') {
    return [
      {
        id: 1,
        stepNumber: 1,
        title: '1. Recojo de Paquetería / Encomiendas',
        shortLabel: 'Recojo Express',
        instruction: 'Toma foto de los bultos cargados en la furgoneta y el manifiesto de entrega.',
        locationHint: service.origin || 'Almacén de Distribución Express',
        icon: Car,
      },
      {
        id: 2,
        stepNumber: 2,
        title: '2. En Tránsito / Control de Ruta',
        shortLabel: 'Ruta Ágil',
        instruction: 'Toma foto de paso por peaje o punto de control en ruta urbana hacia destino.',
        locationHint: 'Vía Expresa / Peaje Urbano',
        icon: Navigation,
      },
      {
        id: 3,
        stepNumber: 3,
        title: '3. Entrega en Destino al Cliente',
        shortLabel: 'Entrega Cliente',
        instruction: 'Toma foto de la entrega directa al receptor con la dirección del cliente visible.',
        locationHint: service.destination || 'Dirección de Entrega Cliente',
        icon: MapPin,
      },
      {
        id: 4,
        stepNumber: 4,
        title: '4. Cargo Firmado y Sellado',
        shortLabel: 'Cargo Firmado',
        instruction: 'Toma foto nítida de la guía de remisión o cargo con firma, DNI y sello de recibido.',
        locationHint: 'Mesa de Partes / Recepción',
        icon: FileText,
      },
      {
        id: 5,
        stepNumber: 5,
        title: '5. Retorno a Centro Logístico',
        shortLabel: 'Retorno Base',
        instruction: 'Toma foto de la furgoneta en garita final de retorno a la base de Collyer.',
        locationHint: 'Base Logística Collyer',
        icon: RefreshCw,
      },
    ];
  }

  // Default: Tracto (Ciclo de Contenedores)
  return [
    {
      id: 1,
      stepNumber: 1,
      title: '1. Llegada al Lugar de Recojo',
      shortLabel: 'Llegada al Recojo',
      instruction: 'Toma una foto de la unidad al llegar a la garita del terminal portuario o depósito.',
      locationHint: service.container?.depotPickup || 'APM Terminals Callao (Muelle Norte)',
      icon: Anchor,
    },
    {
      id: 2,
      stepNumber: 2,
      title: '2. Entrega del Container en Cliente',
      shortLabel: 'Entrega en Cliente',
      instruction: 'Toma una foto del contenedor posicionado en la rampa del cliente con precinto visible.',
      locationHint: service.container?.deliveryLocation || 'Planta del Cliente (Rampa de Descarga)',
      icon: Truck,
    },
    {
      id: 3,
      stepNumber: 3,
      title: '3. Vaciado del Container',
      shortLabel: 'Vaciado / Descarga',
      instruction: 'Toma una foto durante el proceso de vaciado o descarga de la mercadería.',
      locationHint: 'Área de Desestiba y Almacén',
      icon: Layers,
    },
    {
      id: 4,
      stepNumber: 4,
      title: '4. Finalización y Cierre del Container',
      shortLabel: 'Contenedor Vacío',
      instruction: 'Toma una foto del contenedor vacío, barrido y con las compuertas cerradas.',
      locationHint: 'Patio de Maniobras del Cliente',
      icon: ShieldCheck,
    },
    {
      id: 5,
      stepNumber: 5,
      title: '5. Retorno del Container a Depósito',
      shortLabel: 'Retorno a Depósito',
      instruction: 'Toma una foto al devolver el contenedor en el depósito y captura el ticket EIR firmado.',
      locationHint: service.container?.depotReturn || 'Depósito Ransa Neptunia Callao',
      icon: RefreshCw,
    },
  ];
};

export const ContainerWizard: React.FC<ContainerWizardProps> = ({
  currentService,
  onCompleteStage,
  onCertifyTerminado,
  onUpdatePointStatus,
  onRequestPhotoUpload,
  onViewPhoto,
  onBackToHome,
}) => {
  const container = currentService.container;
  const stages = currentService.stages;
  const unit = currentService.unit;
  const vehicleType = unit.vehicleType || currentService.driver.selectedVehicleType || 'Tracto';

  const wizardSteps = GET_STEPS_FOR_VEHICLE(vehicleType, currentService);

  // Tab mode: 'wizard' (one stage at a time) or 'tracking' (mini-tracking itinerary)
  const [activeTab, setActiveTab] = useState<'wizard' | 'tracking'>('wizard');

  // Determine current active step (defaults to first uncompleted step)
  const firstUncompleted = stages.find((s) => !s.isCompleted)?.stageId || 1;
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(Math.max(0, firstUncompleted - 1));

  const activeConfig = wizardSteps[currentStepIndex] || wizardSteps[0];
  const activeStage = stages.find((s) => s.stageId === activeConfig.id) || stages[0];
  const hasPhoto = activeStage.photos && activeStage.photos.length > 0;
  const lastPhoto = hasPhoto ? activeStage.photos[activeStage.photos.length - 1] : null;

  const completedCount = stages.filter((s) => s.isCompleted).length;
  const isTerminado = currentService.executionStatus === 'terminado';
  const scheduledTime = currentService.scheduledDepartureTime || '07:00 AM';

  const handleTakePhoto = () => {
    onRequestPhotoUpload(
      `Paso ${activeConfig.stepNumber}: ${activeConfig.title}`,
      (url, returnedLabel) => {
        const newPhoto = {
          id: `ph-wiz-${Date.now()}`,
          label: returnedLabel || activeConfig.shortLabel,
          url,
          timestamp: new Date().toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        };

        const updatedPhotos = [newPhoto]; // Keep main latest photo
        const now = new Date();
        const formattedTimestamp = now.toLocaleString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });

        onCompleteStage(activeConfig.id, {
          isCompleted: true,
          photos: updatedPhotos,
          timestamp: formattedTimestamp,
          geolocation: {
            lat: -12.0528 + (Math.random() - 0.5) * 0.01,
            lng: -77.1428 + (Math.random() - 0.5) * 0.01,
            address:
              activeConfig.id === 1
                ? container?.depotPickup || currentService.origin || 'APM Terminals Callao - Garita'
                : activeConfig.id === 5
                ? container?.depotReturn || 'Depósito Ransa Neptunia Callao'
                : container?.deliveryLocation || currentService.destination || 'Planta Alicorp Lurín',
          },
          notes: `${activeConfig.title} fotografiada y certificada en campo.`,
        });
      }
    );
  };

  const handleNextStep = () => {
    if (currentStepIndex < 4) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Step 5 completed: Certify service as Terminado
      onCertifyTerminado(currentService.id);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSelectStageFromTimeline = (stageId: number) => {
    const stepIdx = wizardSteps.findIndex((s) => s.id === stageId);
    if (stepIdx !== -1) {
      setCurrentStepIndex(stepIdx);
      setActiveTab('wizard');
    }
  };

  const handleCapturePointPhoto = (point: RouteItineraryPoint) => {
    onRequestPhotoUpload(`Foto de Control: ${point.name}`, (url) => {
      if (point.linkedStageId) {
        onCompleteStage(point.linkedStageId, {
          isCompleted: true,
          photos: [
            {
              id: `ph-pt-${Date.now()}`,
              label: point.label,
              url,
              timestamp: new Date().toLocaleTimeString('es-PE', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
          ],
        });
      }
      if (onUpdatePointStatus) {
        onUpdatePointStatus(point.id, 'completado');
      }
    });
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      {/* Top Simple Back Button */}
      <button
        type="button"
        onClick={onBackToHome}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-sm transition-colors shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>← Volver al Menú Principal</span>
      </button>

      {/* ======================================================== */}
      {/* 1. DETALLE DE LA ORDEN DE SERVICIO & HORA DE SALIDA */}
      {/* ======================================================== */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-4 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 block">
              ORDEN DE TRANSPORTE
            </span>
            <h2 className="text-lg font-black text-white leading-tight">
              {currentService.orderNumber || currentService.serviceCode}
            </h2>
            <div className="text-xs text-slate-300 font-medium truncate max-w-[220px]">
              {currentService.clientName}
            </div>
          </div>

          {/* HORA DE SALIDA PROGRAMADA HIGHLIGHT */}
          <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-400/25 to-amber-500/10 px-3.5 py-2 text-right shadow-md">
            <span className="text-[9px] font-mono uppercase font-black text-amber-300 block flex items-center gap-1 justify-end">
              <Clock className="h-3 w-3" />
              SALIDA PROG.
            </span>
            <span className="text-base font-black font-mono text-white tracking-wide">
              {scheduledTime}
            </span>
          </div>
        </div>

        {/* Tactical Vehicle & Identification Strip */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
          <div className="rounded-xl bg-slate-950 border border-slate-800/80 p-2 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-semibold block">
              {vehicleType === 'Tracto' ? 'PLACA TRACTO' : vehicleType === 'Furgón' ? 'PLACA FURGÓN' : 'PLACA VEHÍCULO'}
            </span>
            <span className="text-sm font-black text-amber-400">{unit.tractPlate}</span>
          </div>
          <div className="rounded-xl bg-slate-950 border border-slate-800/80 p-2 text-center">
            <span className="text-[9px] text-slate-400 uppercase font-semibold block">
              {vehicleType === 'Tracto' ? 'PLACA CHASIS' : vehicleType === 'Furgón' ? 'PRECINTO DE SEG.' : 'MODALIDAD'}
            </span>
            <span className="text-sm font-black text-sky-400 truncate block">
              {vehicleType === 'Tracto'
                ? unit.trailerPlate
                : vehicleType === 'Furgón'
                ? unit.securitySealNumber || 'COL-SEC-8910'
                : 'Express 3.5T'}
            </span>
          </div>
        </div>

        {/* Cargo Specification Pill */}
        <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 px-3 py-2 text-xs flex items-center justify-between text-slate-300">
          <span className="text-slate-400 flex items-center gap-1 font-semibold">
            {vehicleType === 'Tracto' ? 'Contenedor:' : vehicleType === 'Furgón' ? 'Capacidad:' : 'Carga:'}
          </span>
          <span className="font-mono font-bold text-amber-300">
            {vehicleType === 'Tracto'
              ? container?.containerNumber || 'MSKU-948102-3 (40HC)'
              : vehicleType === 'Furgón'
              ? `${unit.boxCapacityM3 || 48} m³ / Palletizado`
              : 'Paquetería Express'}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* VIEW SELECTOR: [ 📸 CÁMARA DE ETAPAS ] vs [ 🗺️ TRACKING RUTA ] */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('wizard')}
          className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'wizard'
              ? 'bg-amber-400 text-slate-950 shadow-md scale-102'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>📸 Modo Cámara ({currentStepIndex + 1}/5)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tracking')}
          className={`py-3 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'tracking'
              ? 'bg-sky-400 text-slate-950 shadow-md scale-102'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Navigation className="h-4 w-4" />
          <span>🗺️ Itinerario & Ruta</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MINI-TRACKING ITINERARIO DE RUTA (LÍNEA DE TIEMPO) */}
      {/* ======================================================== */}
      {activeTab === 'tracking' && (
        <div className="space-y-4">
          <RouteTrackingTimeline
            currentService={currentService}
            onUpdatePointStatus={onUpdatePointStatus}
            onViewPhoto={onViewPhoto}
            onCapturePointPhoto={handleCapturePointPhoto}
            onSelectStage={handleSelectStageFromTimeline}
          />

          <button
            type="button"
            onClick={() => setActiveTab('wizard')}
            className="w-full min-h-[60px] rounded-2xl bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
          >
            <Camera className="h-5 w-5" />
            <span>CONTINUAR CON LA FOTO DEL PASO {currentStepIndex + 1}</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MODO ASISTENTE CON BOTÓN GIGANTE DE CÁMARA */}
      {/* ======================================================== */}
      {activeTab === 'wizard' && (
        <div className="space-y-4">
          {/* Progress Indicators (5 Bold Step Bars) */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-sm">
                PASO {activeConfig.stepNumber} DE 5
              </span>
              <span className="text-slate-400 font-bold">
                {completedCount} / 5 Completados
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 h-3.5">
              {wizardSteps.map((st, idx) => {
                const isStageDone = stages.find((s) => s.stageId === st.id)?.isCompleted;
                const isCurrent = currentStepIndex === idx;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setCurrentStepIndex(idx)}
                    className={`h-full rounded-full transition-all ${
                      isStageDone
                        ? 'bg-emerald-500 shadow-sm'
                        : isCurrent
                        ? 'bg-amber-400 animate-pulse ring-2 ring-amber-400/50'
                        : 'bg-slate-800'
                    }`}
                    title={st.title}
                  />
                );
              })}
            </div>
          </div>

          {/* THE GIANT STEP CARD (ONE SINGLE STAGE AT A TIME) */}
          <div className="rounded-3xl border-2 border-slate-700 bg-slate-900 p-5 sm:p-6 shadow-2xl space-y-5 text-white">
            {/* Step Header */}
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg">
                {React.createElement(activeConfig.icon, { className: 'h-8 w-8' })}
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 block">
                  ETAPA OBLIGATORIA CON FOTO
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mt-0.5">
                  {activeConfig.title}
                </h2>
              </div>
            </div>

            {/* Clear Big Instruction */}
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-slate-200">
              <p className="text-base font-semibold leading-snug">
                {activeConfig.instruction}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-mono">
                <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span className="truncate">{activeConfig.locationHint}</span>
              </div>
            </div>

            {/* Big Tactical Cargo Pill */}
            <div className="flex items-center justify-between text-xs bg-slate-800/80 rounded-xl px-4 py-2.5 font-mono">
              <span className="text-slate-400">
                {vehicleType === 'Tracto' ? 'Contenedor:' : vehicleType === 'Furgón' ? 'Furgón:' : 'Vehículo:'}
              </span>
              <span className="text-amber-300 font-bold text-sm">
                {vehicleType === 'Tracto'
                  ? container?.containerNumber || 'MSKU-948102-3'
                  : vehicleType === 'Furgón'
                  ? `${unit.tractPlate} (Precinto ${unit.securitySealNumber || 'COL-8910'})`
                  : `${unit.tractPlate} (3.5 Tn Express)`}
              </span>
            </div>

            {/* THE GIANT CAMERA BUTTON OR PHOTO PREVIEW */}
            {!hasPhoto ? (
              <button
                type="button"
                onClick={handleTakePhoto}
                className="w-full flex items-center justify-center gap-3 min-h-[78px] rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-98 transition-all shadow-xl font-black text-lg sm:text-xl tracking-tight"
              >
                <Camera className="h-8 w-8 text-slate-950" />
                <span>📸 TOMAR FOTO CON LA CÁMARA</span>
              </button>
            ) : (
              <div className="space-y-3">
                {/* Photo Preview Card */}
                <div
                  onClick={() => onViewPhoto(lastPhoto!.url, activeConfig.title)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-emerald-500 bg-black aspect-video shadow-lg"
                >
                  <img
                    src={lastPhoto!.url}
                    alt="Foto de evidencia"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3.5">
                    <div>
                      <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>FOTO REGISTRADA CON ÉXITO</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono mt-0.5">
                        {activeStage.timestamp}
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-lg">
                      <ZoomIn className="h-3.5 w-3.5" /> Ver Grande
                    </span>
                  </div>
                </div>

                {/* Change Photo Small Action */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline flex items-center gap-1"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Volver a tomar foto</span>
                  </button>
                </div>

                {/* Giant Green Advance Button */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full flex items-center justify-center gap-3 min-h-[76px] rounded-2xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-98 transition-all shadow-xl font-black text-lg sm:text-xl tracking-tight"
                >
                  {currentStepIndex < 4 ? (
                    <>
                      <span>CONFIRMAR Y PASAR AL PASO {currentStepIndex + 2}</span>
                      <ArrowRight className="h-6 w-6" />
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-6 w-6" />
                      <span>TERMINAR Y CERTIFICAR SERVICIO</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step Navigation Arrows (Back & Forward) */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <button
                type="button"
                disabled={currentStepIndex === 0}
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Paso Anterior</span>
              </button>

              <button
                type="button"
                disabled={currentStepIndex === 4}
                onClick={() => setCurrentStepIndex(currentStepIndex + 1)}
                className="flex items-center gap-1.5 py-2 px-3 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <span>Paso Siguiente</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick link to see itinerary */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setActiveTab('tracking')}
              className="text-xs text-sky-400 hover:underline font-bold inline-flex items-center gap-1.5"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Ver Itinerario Completo y Puntos de Control</span>
            </button>
          </div>
        </div>
      )}

      {/* Completion Banner if Terminado */}
      {isTerminado && (
        <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-950/90 text-white p-5 text-center space-y-2 shadow-lg">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-black text-base">
            <CheckCircle2 className="h-6 w-6" />
            <span>¡SERVICIO 100% CONCLUIDO Y CERTIFICADO!</span>
          </div>
          <p className="text-xs text-emerald-200">
            Las 5 etapas fueron fotografiadas y certificadas en campo. Proceda a{' '}
            <strong>Paso 3: Marcar Salida e Incidencias</strong> para finalizar formalmente su jornada.
          </p>
        </div>
      )}
    </div>
  );
};
