import React, { useState } from 'react';
import {
  Box,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  ZoomIn,
  ShieldCheck,
  Layers,
  FileCheck,
  AlertCircle,
  Building,
  RefreshCw,
  Anchor,
  ArrowRight,
  PackageCheck,
  Check,
  Sparkles,
  Lock,
} from 'lucide-react';
import { TransportService, ServiceEvidence, StageId } from '../../types';

interface ContainerCycleModuleProps {
  currentService: TransportService;
  onCompleteStage: (stageId: StageId, data: Partial<ServiceEvidence>) => void;
  onCertifyServiceTerminado: (serviceId: string) => void;
  onRequestPhotoUpload: (title: string, onSuccess: (url: string, label?: string) => void) => void;
  onViewPhoto: (url: string, title: string) => void;
}

interface ContainerStageConfig {
  id: StageId;
  name: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  requiredPhotoHint: string;
  icon: React.ComponentType<{ className?: string }>;
  isFinalReturn?: boolean;
}

const CONTAINER_STAGES: ContainerStageConfig[] = [
  {
    id: 1,
    name: 'Etapa 1: Llegada al lugar de recojo',
    shortTitle: '1. Arribo a Recojo',
    subtitle: 'Foto de arribo al terminal portuario / almacén de origen y presentación de la unidad',
    description:
      'Acreditación fotográfica geolocalizada de la llegada del tracto y chasis a la garita de ingreso del terminal portuario (APM / DP World) o depósito extraportuario.',
    requiredPhotoHint: 'Foto de arribo a garita terminal portuario',
    icon: Anchor,
  },
  {
    id: 2,
    name: 'Etapa 2: Entrega del container',
    shortTitle: '2. Entrega en Planta',
    subtitle: 'Foto de entrega / posicionamiento del contenedor en la planta o almacén del cliente',
    description:
      'Posicionamiento del contenedor en la bahía o rampa designada por el cliente. Verificación visual del precinto de seguridad intacto antes de la apertura.',
    requiredPhotoHint: 'Foto de contenedor posicionado en rampa cliente',
    icon: MapPin,
  },
  {
    id: 3,
    name: 'Etapa 3: Vaciado del container',
    shortTitle: '3. Vaciado / Desestiba',
    subtitle: 'Foto del proceso de desestiba / vaciado de la mercadería en instalaciones del cliente',
    description:
      'Evidencia del proceso activo de vaciado del contenedor (cuadrilla o montacargas), garantizando la ausencia de daños internos al equipo durante la descarga.',
    requiredPhotoHint: 'Foto del proceso de desestiba y vaciado',
    icon: Layers,
  },
  {
    id: 4,
    name: 'Etapa 4: Finalización del container',
    shortTitle: '4. Cierre y Condición',
    subtitle: 'Foto de cierre / condición final del contenedor vacío, barrido y sin remanentes',
    description:
      'Inspección del piso y paredes internas del contenedor completamente vacío, barrido y compuertas cerradas aptas para devolución.',
    requiredPhotoHint: 'Foto del contenedor limpio y compuertas cerradas',
    icon: ShieldCheck,
  },
  {
    id: 5,
    name: 'Etapa 5: Retorno del container',
    shortTitle: '5. Retorno a Depósito',
    subtitle: 'Foto de devolución al depósito temporal / terminal portuario con ticket EIR de intercambio',
    description:
      'Acreditación final de devolución del contenedor vacío en el depósito designado por la naviera y captura del ticket EIR (Equipment Interchange Receipt) firmado.',
    requiredPhotoHint: 'Foto de entrega en depósito y ticket EIR',
    icon: RefreshCw,
    isFinalReturn: true,
  },
];

export const ContainerCycleModule: React.FC<ContainerCycleModuleProps> = ({
  currentService,
  onCompleteStage,
  onCertifyServiceTerminado,
  onRequestPhotoUpload,
  onViewPhoto,
}) => {
  const container = currentService.container;
  const shift = currentService.driver;
  const unit = currentService.unit;
  const stages = currentService.stages;

  const isOpeningPending = shift.phase === 'apertura_pendiente';

  // Find active stage
  const [activeStageId, setActiveStageId] = useState<StageId>(
    (stages.find((s) => !s.isCompleted)?.stageId as StageId) || 1
  );

  const [stageNotes, setStageNotes] = useState('');
  const [eirTicketInput, setEirTicketInput] = useState(container?.eirNumber || 'EIR-APM-8891024');

  const currentStage = stages.find((s) => s.stageId === activeStageId) || stages[0];
  const currentConfig = CONTAINER_STAGES.find((c) => c.id === activeStageId) || CONTAINER_STAGES[0];

  const completedCount = stages.filter((s) => s.isCompleted).length;
  const isAllStagesCompleted = completedCount === 5;
  const isTerminado = currentService.executionStatus === 'terminado';

  const handleAddPhoto = (photoHint?: string) => {
    onRequestPhotoUpload(
      `Evidencia Contenedor: ${currentConfig.name} - ${photoHint || 'Foto de Campo'}`,
      (url, returnedLabel) => {
        const newPhoto = {
          id: `ph-cont-${Date.now()}`,
          label: photoHint || returnedLabel || 'Evidencia de Contenedor',
          url,
          timestamp: new Date().toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
        };

        const updatedPhotos = [...(currentStage.photos || []), newPhoto];
        const now = new Date();
        const formattedTimestamp = now.toLocaleString('es-PE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });

        // Default realistic geolocation per stage
        let defaultAddress = 'Callao Portuario - Garita';
        let defaultLat = -12.0528;
        let defaultLng = -77.1428;

        if (activeStageId === 1) {
          defaultAddress = container?.depotPickup || 'APM Terminals Callao - Garita Balboa Muelle Norte';
          defaultLat = -12.0528;
          defaultLng = -77.1428;
        } else if (activeStageId === 2 || activeStageId === 3 || activeStageId === 4) {
          defaultAddress = container?.deliveryLocation || 'Complejo Industrial Alicorp - Av. Argentina 4793';
          defaultLat = -12.0435;
          defaultLng = -77.0812;
        } else if (activeStageId === 5) {
          defaultAddress = container?.depotReturn || 'Depósito Ransa Neptunia Callao - Av. Néstor Gambetta Km 3.5';
          defaultLat = -12.0125;
          defaultLng = -77.1298;
        }

        onCompleteStage(activeStageId, {
          photos: updatedPhotos,
          timestamp: currentStage.timestamp || formattedTimestamp,
          geolocation: currentStage.geolocation || {
            lat: defaultLat + (Math.random() - 0.5) * 0.005,
            lng: defaultLng + (Math.random() - 0.5) * 0.005,
            address: defaultAddress,
          },
        });
      }
    );
  };

  const handleMarkStageDone = () => {
    if (!currentStage.photos || currentStage.photos.length === 0) {
      alert('Debe tomar o adjuntar al menos una fotografía geolocalizada para certificar esta etapa.');
      return;
    }

    const now = new Date();
    const formattedTimestamp = now.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    onCompleteStage(activeStageId, {
      isCompleted: true,
      timestamp: formattedTimestamp,
      notes: stageNotes || currentStage.notes || `${currentConfig.name} certificada conforme por conductor Collyer.`,
    });

    // Advance to next stage if available
    if (activeStageId < 5) {
      setActiveStageId((activeStageId + 1) as StageId);
    }
  };

  const handleCertifyTerminado = () => {
    if (!isAllStagesCompleted) {
      alert('Debe completar y fotografiar las 5 etapas del ciclo de contenedores antes de darlo por terminado.');
      return;
    }

    onCertifyServiceTerminado(currentService.id);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Clear Card of Assigned Container Service */}
      <div className="rounded-2xl border-2 border-slate-700 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-lg">
              <Box className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-amber-400 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded">
                  {currentService.orderNumber || currentService.serviceCode}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-300 font-medium">{currentService.clientName}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                Ciclo Operativo de Contenedor Marítimo
              </h2>
            </div>
          </div>

          <div>
            {isTerminado ? (
              <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-black text-slate-950 shadow-lg">
                <CheckCircle2 className="h-4 w-4" />
                SERVICIO TERMINADO Y CERTIFICADO
              </span>
            ) : isAllStagesCompleted ? (
              <span className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-black text-slate-950 shadow-lg animate-pulse">
                <Sparkles className="h-4 w-4" />
                5/5 Etapas Listas · Requiere Certificación
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl bg-slate-800 border border-slate-700 px-3.5 py-1.5 text-xs font-bold text-slate-300">
                <Clock className="h-4 w-4 text-amber-400" />
                En Ejecución ({completedCount}/5 Etapas)
              </span>
            )}
          </div>
        </div>

        {/* Big Container Highlight Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
          {/* Box 1: Container & Seal */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Contenedor Asignado:
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 tracking-wider truncate">
              {container?.containerNumber || 'MSKU-948102-3'}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-300 flex-wrap">
              <span className="font-semibold">{container?.containerType || '40ft High Cube'}</span>
              <span className="text-slate-600">·</span>
              <span className="text-sky-400 font-semibold">{container?.shippingLine || 'Maersk Line'}</span>
            </div>
            <div className="mt-2 text-[11px] font-mono text-emerald-400 bg-slate-900 px-2 py-1 rounded inline-flex items-center gap-1.5">
              <Lock className="h-3 w-3" />
              Precinto: <strong>{container?.sealNumber || 'ML-PE-94810'}</strong>
            </div>
          </div>

          {/* Box 2: Route Points */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                1. Lugar de Recojo (Terminal / Depósito):
              </span>
              <div className="text-slate-200 font-medium truncate mt-0.5">
                {container?.depotPickup || currentService.origin}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                2. Entrega en Cliente:
              </span>
              <div className="text-slate-200 font-medium truncate mt-0.5">
                {container?.deliveryLocation || currentService.destination}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-amber-400 block">
                3. Devolución Vacío (Depósito Naviera):
              </span>
              <div className="text-amber-200 font-medium truncate mt-0.5">
                {container?.depotReturn || 'Depósito Ransa Neptunia Callao'}
              </div>
            </div>
          </div>

          {/* Box 3: Tractor, Chassis & Payload */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tracto Collyer:</span>
              <strong className="font-mono text-amber-400 font-bold text-sm">{unit.tractPlate}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Chasis Portacontenedor:</span>
              <strong className="font-mono text-sky-400 font-bold text-sm">{unit.trailerPlate}</strong>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800/80 pt-1.5">
              <span className="text-slate-400">Carga / Peso Bruto:</span>
              <strong className="font-mono text-slate-200">{currentService.cargoWeightTn} Tn</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Ticket EIR Portuario:</span>
              <strong className="font-mono text-emerald-400">{container?.eirNumber || 'EIR-APM-8891024'}</strong>
            </div>
          </div>
        </div>

        {/* Progress Bar of the 5 Stages */}
        <div className="border-t border-slate-800 pt-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-300">
              Progreso del Ciclo de Evidencias:
            </span>
            <span className="font-mono font-bold text-amber-400">
              {completedCount} de 5 Etapas Certificadas ({Math.round((completedCount / 5) * 100)}%)
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                isAllStagesCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-amber-400'
              }`}
              style={{ width: `${(completedCount / 5) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Interactive 5-Stage Stepper for Containers */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {CONTAINER_STAGES.map((cfg) => {
          const stageData = stages.find((s) => s.stageId === cfg.id);
          const isDone = stageData?.isCompleted;
          const isCurrent = activeStageId === cfg.id;
          const Icon = cfg.icon;

          return (
            <button
              key={cfg.id}
              type="button"
              onClick={() => setActiveStageId(cfg.id)}
              className={`relative flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                isCurrent
                  ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-400 text-slate-950'
                  : isDone
                  ? 'border-emerald-300 bg-emerald-50/70 hover:border-emerald-400 text-slate-800'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black shadow-xs ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isDone ? <Check className="h-5 w-5" /> : cfg.id}
                </div>

                {cfg.isFinalReturn && (
                  <span className="text-[9px] font-black uppercase rounded bg-sky-100 text-sky-900 px-1.5 py-0.5">
                    EIR
                  </span>
                )}
              </div>

              <div className="font-extrabold text-xs truncate w-full">
                {cfg.shortTitle}
              </div>

              <div className="text-[11px] truncate w-full mt-0.5">
                {isDone ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Certificada
                  </span>
                ) : isCurrent ? (
                  <span className="text-amber-800 font-bold">En Registro</span>
                ) : (
                  <span className="text-slate-400">Pendiente</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 3. Selected Stage Detail & Geotagged Photo Requirement */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-amber-400 shadow-md">
              {React.createElement(currentConfig.icon, { className: 'h-6 w-6' })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  {currentConfig.name}
                </h3>
                {currentStage.isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Etapa Certificada
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                    <Clock className="h-3.5 w-3.5" /> Foto Obligatoria Requerida
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 font-medium mt-0.5">{currentConfig.subtitle}</p>
              <p className="text-[11px] text-slate-500 mt-1">{currentConfig.description}</p>
            </div>
          </div>

          {/* Quick Photo Trigger Button */}
          <button
            type="button"
            onClick={() => handleAddPhoto(currentConfig.requiredPhotoHint)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-black text-amber-400 hover:bg-slate-800 transition-colors shadow-md shrink-0"
          >
            <Camera className="h-4 w-4" />
            Tomar / Subir Foto de Etapa
          </button>
        </div>

        {/* Geolocation & Timestamp Watermark Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 rounded-xl border border-slate-200 p-3.5">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="h-4 w-4 text-red-500 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Geolocalización Certificada en Campo:</div>
              <div className="text-[11px] text-slate-600 font-mono truncate">
                {currentStage.geolocation
                  ? `${currentStage.geolocation.address} (${currentStage.geolocation.lat.toFixed(4)}, ${currentStage.geolocation.lng.toFixed(4)})`
                  : 'GPS activo: Se registrarán coordenadas al disparar la cámara'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="h-4 w-4 text-blue-500 shrink-0" />
            <div>
              <div className="font-bold text-slate-900">Marca de Tiempo (Timestamp):</div>
              <div className="text-[11px] text-slate-600 font-mono font-bold">
                {currentStage.timestamp || 'Sello horario automático en tiempo real'}
              </div>
            </div>
          </div>
        </div>

        {/* Special verification inputs for Stage 5 (Retorno del Container & Ticket EIR) */}
        {activeStageId === 5 && (
          <div className="rounded-xl border border-sky-300 bg-sky-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-sky-950 uppercase flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-sky-700" />
                Validación de Devolución de Contenedor Vacío (Ticket EIR)
              </span>
              <span className="text-[10px] font-bold uppercase bg-sky-200 text-sky-900 px-2 py-0.5 rounded font-mono">
                DEVOLUCIÓN NAVIERA
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Número de Ticket EIR de Intercambio (EIR Number):
                </label>
                <input
                  type="text"
                  value={eirTicketInput}
                  onChange={(e) => setEirTicketInput(e.target.value)}
                  placeholder="Ej. EIR-APM-8891024"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Depósito de Devolución Certificado:
                </label>
                <input
                  type="text"
                  readOnly
                  value={container?.depotReturn || 'Depósito Ransa Neptunia Callao'}
                  className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-slate-700"
                />
              </div>
            </div>
          </div>
        )}

        {/* Photos Gallery for this stage */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Fotografías de Respaldo Certificadas ({currentStage.photos?.length || 0})
            </span>
            <span className="text-[11px] text-slate-500">
              Haga clic sobre cualquier foto para ampliar y revisar detalles
            </span>
          </div>

          {currentStage.photos && currentStage.photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {currentStage.photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => onViewPhoto(photo.url, `${currentConfig.name} - ${photo.label}`)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-300 bg-slate-900 aspect-video shadow-xs"
                >
                  <img
                    src={photo.url}
                    alt={photo.label}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5 text-white">
                    <div className="text-[11px] font-bold truncate">{photo.label}</div>
                    <div className="text-[9px] text-slate-300 font-mono flex items-center justify-between mt-0.5">
                      <span>{photo.timestamp}</span>
                      <span className="flex items-center gap-0.5 text-amber-300 font-bold">
                        <ZoomIn className="h-3 w-3" /> Zoom
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-xs text-slate-500 space-y-2">
              <Camera className="mx-auto h-8 w-8 text-slate-400" />
              <div className="font-semibold text-slate-700">No hay fotografías cargadas aún para esta etapa.</div>
              <div className="text-[11px] text-slate-400">
                Evidencia obligatoria: <strong className="text-slate-600">{currentConfig.requiredPhotoHint}</strong>
              </div>
              <button
                type="button"
                onClick={() => handleAddPhoto(currentConfig.requiredPhotoHint)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-black text-slate-950 hover:bg-amber-400"
              >
                <Camera className="h-4 w-4" />
                Capturar Foto Ahora
              </button>
            </div>
          )}
        </div>

        {/* Notes Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Observaciones o Novedades de la Etapa (Opcional):
          </label>
          <input
            type="text"
            value={stageNotes || currentStage.notes || ''}
            onChange={(e) => setStageNotes(e.target.value)}
            placeholder="Ej. Ingreso expedito a balanza, sin observaciones en twistlocks ni contenedor."
            className="w-full rounded-md border border-slate-300 p-2 text-xs text-slate-900 outline-none focus:border-amber-500"
          />
        </div>

        {/* Stage Completion Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="text-xs text-slate-500">
            {currentStage.isCompleted ? (
              <span className="text-emerald-700 font-bold">
                ✓ Etapa certificada en sistema Collyer con foto geolocalizada.
              </span>
            ) : (
              <span>
                Para certificar esta etapa, asegúrese de haber tomado la fotografía obligatoria de campo.
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleMarkStageDone}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black transition-all shadow-sm ${
              currentStage.isCompleted
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {currentStage.isCompleted
              ? 'Actualizar Datos de Etapa'
              : `Finalizar y Certificar ${currentConfig.shortTitle}`}
          </button>
        </div>
      </div>

      {/* 4. FINAL SERVICE CERTIFICATION BANNER */}
      {isAllStagesCompleted && (
        <div className={`rounded-2xl border-2 p-6 shadow-xl transition-all ${
          isTerminado
            ? 'border-emerald-500 bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-950 text-white'
            : 'border-amber-400 bg-gradient-to-br from-amber-500/20 via-slate-900 to-amber-500/10 text-white'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-black">
                  {isTerminado
                    ? '¡SERVICIO DE CONTENEDOR 100% TERMINADO Y CERTIFICADO!'
                    : 'VALIDACIÓN DE CONTENEDOR LISTA PARA CERTIFICACIÓN'}
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                {isTerminado
                  ? `La orden ${currentService.orderNumber} con contenedor ${container?.containerNumber} ha sido concluida y devuelta conforme en ${container?.depotReturn}.`
                  : 'Las 5 etapas (Llegada, Entrega, Vaciado, Finalización y Retorno) cuentan con evidencia fotográfica. Presione el botón para certificar el servicio como Terminado.'}
              </p>
            </div>

            {!isTerminado && (
              <button
                type="button"
                onClick={handleCertifyTerminado}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3.5 text-xs font-black text-slate-950 hover:bg-amber-300 transition-all shadow-lg shrink-0"
              >
                <Check className="h-5 w-5" />
                CERTIFICAR SERVICIO COMO TERMINADO
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
