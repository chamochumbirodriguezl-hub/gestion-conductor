import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Camera,
  AlertCircle,
  FileCheck,
  Truck,
  PackageCheck,
  ShieldCheck,
  Navigation,
  ZoomIn,
  Package,
  Lock,
  Layers,
  Thermometer,
} from 'lucide-react';
import { ServiceEvidence, StageId, VehicleType } from '../../types';

interface StagesTimelineProps {
  stages: ServiceEvidence[];
  vehicleType?: VehicleType;
  onCompleteStage: (stageId: StageId, newEvidence: Partial<ServiceEvidence>) => void;
  onRequestPhotoUpload: (title: string, onSuccess: (url: string, label?: string) => void) => void;
  onViewPhoto: (url: string, title: string) => void;
}

interface StageDefinition {
  id: StageId;
  name: string;
  subtitle: string;
  description: string;
  requiredPhotos: string[];
  icon: React.ComponentType<{ className?: string }>;
  isBillingCritical?: boolean;
}

export const StagesTimeline: React.FC<StagesTimelineProps> = ({
  stages,
  vehicleType = 'Tracto',
  onCompleteStage,
  onRequestPhotoUpload,
  onViewPhoto,
}) => {
  const isTracto = vehicleType === 'Tracto';

  // Dynamic stage definitions based on vehicle type
  const stageConfigs: StageDefinition[] = isTracto
    ? [
        {
          id: 1,
          name: 'Etapa 1: Origen / Presentación Tracto y Carreta',
          subtitle: 'Foto de plataforma vacía e inspección de barandas + Guía Remitente (GRR)',
          description:
            'Inspección inicial obligatoria de la unidad vacía, plato de acople y verificación de la Guía de Remisión Remitente (GRR) emitida por el cliente.',
          requiredPhotos: ['Foto de plataforma/carreta vacía', 'Guía remitente del cliente (GRR)'],
          icon: Truck,
        },
        {
          id: 2,
          name: 'Etapa 2: Carga, Estiba y Aseguramiento Tracto',
          subtitle: 'Mercancía estibada y asegurada con fajas/rachets de 4", tacos y entoldado',
          description:
            'Distribución simétrica de pesos por ejes en la plataforma, colocación de rachets tensores, esquineros y lona o carpa impermeable amarrada.',
          requiredPhotos: ['Foto estiba y amarre con fajas rachets', 'Entoldado y carpa protectora'],
          icon: PackageCheck,
        },
        {
          id: 3,
          name: 'Etapa 3: Tránsito y Control en Ruta / Balanza Provías',
          subtitle: 'Reporte de paso en ruta, tickets de peaje y ticket de control en balanza pesaje por ejes',
          description:
            'Trazabilidad en autopista, reporte de peajes concesionados y pesaje dinámico por ejes en balanza autorizada de Provías Nacional.',
          requiredPhotos: ['Ticket de peaje en ruta', 'Ticket de pesaje por ejes balanza Provías'],
          icon: Navigation,
        },
        {
          id: 4,
          name: 'Etapa 4: Destino y Llegada a Patio Cliente',
          subtitle: 'Llegada al patio de maniobras y posicionamiento en rampa pesada de cliente',
          description:
            'Acreditación de arribo dentro de la ventana horaria, toma de turno y cuadre de la unidad en la bahía de desestiba designada.',
          requiredPhotos: ['Tracto acoderado en rampa de descarga'],
          icon: Clock,
        },
        {
          id: 5,
          name: 'Etapa 5: POD - Guía Sellada y Firmada (Facturable)',
          subtitle: 'Guía física de transportista y cliente con SELLO LEGIBLE y firma de recepción conforme',
          description:
            'Evidencia indispensable de recepción satisfactoria de mercancía. El sello legible de la empresa cliente desbloquea automáticamente la facturación en administración.',
          requiredPhotos: ['Guía POD física con SELLO LEGIBLE y firma'],
          icon: FileCheck,
          isBillingCritical: true,
        },
      ]
    : [
        {
          id: 1,
          name: 'Etapa 1: Origen / Presentación de Camión Furgón',
          subtitle: 'Foto de furgón abierto vacío e higienizado + Verificación de precinto + Guía GRR',
          description:
            'Comprobación del estado interno del furgón metálico (seco, limpio, sin olores) y verificación del número de precinto de seguridad asignado.',
          requiredPhotos: ['Foto furgón abierto e higienizado', 'Guía remitente y precinto asignado'],
          icon: Package,
        },
        {
          id: 2,
          name: 'Etapa 2: Carga, Estiba y Precinto de Seguridad Furgón',
          subtitle: 'Mercancía paletizada zunchada dentro de la caja, barras tracas y colocación de precinto',
          description:
            'Carga estibada y bloqueada con barras de seguridad, compuertas traseras cerradas y colocación de precinto hermético numerado.',
          requiredPhotos: ['Estiba interna paletizada con barras de traba', 'Compuertas cerradas con precinto colocado'],
          icon: Lock,
        },
        {
          id: 3,
          name: 'Etapa 3: Tránsito y Control de Ruta / Reparto',
          subtitle: 'Control en ruta, tickets de peaje, termoregistro de temperatura y paradas de reparto',
          description:
            'Control de ruta urbana o interurbana, peajes, control de temperatura (-18°C o ambiente) e integridad de precinto en cada escala.',
          requiredPhotos: ['Ticket peaje o parada de reparto', 'Foto de precinto intacto / termoregistro'],
          icon: Navigation,
        },
        {
          id: 4,
          name: 'Etapa 4: Destino y Llegada en Almacén / Tienda Cliente',
          subtitle: 'Llegada al centro de distribución o tienda comercial del cliente y verificación de precinto',
          description:
            'Posicionamiento en muelle de descarga retail o almacén central; verificación visual del precinto intacto previo al rompimiento.',
          requiredPhotos: ['Furgón en muelle comercial cliente', 'Foto de precinto intacto previa apertura'],
          icon: Clock,
        },
        {
          id: 5,
          name: 'Etapa 5: Acta de Conformidad y Recepción (Facturable)',
          subtitle: 'Acta de entrega conforme / guía de reparto sellada, verificación de bultos completos sin mermas',
          description:
            'Inspección conjunta con el receptor: conteo de bultos al 100%, corte de precinto y emisión del acta de conformidad firmada y sellada para facturar.',
          requiredPhotos: ['Acta de recepción sellada y firmada', 'Conformidad de bultos sin faltantes'],
          icon: FileCheck,
          isBillingCritical: true,
        },
      ];

  const [activeStageId, setActiveStageId] = useState<StageId>(
    (stages.find((s) => !s.isCompleted)?.stageId as StageId) || 5
  );

  const [receiverName, setReceiverName] = useState('');
  const [receiverDni, setReceiverDni] = useState('');
  const [stampVerified, setStampVerified] = useState(true);
  const [sealCutVerified, setSealCutVerified] = useState(true);
  const [packagesMatchVerified, setPackagesMatchVerified] = useState(true);
  const [stageNotes, setStageNotes] = useState('');

  const currentStage = stages.find((s) => s.stageId === activeStageId) || stages[0];
  const currentConfig = stageConfigs.find((c) => c.id === activeStageId) || stageConfigs[0];

  const handleAddPhotoToCurrentStage = (photoLabelHint?: string) => {
    onRequestPhotoUpload(
      `Evidencia ${vehicleType}: ${currentConfig.name.split(':')[0]} - ${photoLabelHint || 'Captura Fotográfica'}`,
      (url, returnedLabel) => {
        const newPhoto = {
          id: `ph-${Date.now()}`,
          label: photoLabelHint || returnedLabel || 'Evidencia fotográfica',
          url,
          timestamp: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
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

        onCompleteStage(activeStageId, {
          photos: updatedPhotos,
          timestamp: currentStage.timestamp || formattedTimestamp,
          geolocation: currentStage.geolocation || {
            lat: isTracto ? -12.12 + Math.random() * 0.1 : -11.98 + Math.random() * 0.1,
            lng: isTracto ? -77.01 + Math.random() * 0.1 : -77.08 + Math.random() * 0.1,
            address:
              activeStageId === 1
                ? isTracto ? 'Planta Siderúrgica Pisco - Garita 1' : 'CD Industrial Faucett - Puerta 2'
                : activeStageId === 5
                ? isTracto ? 'Almacén Destinatario Lurín' : 'Centro de Distribución Trujillo - Recepción'
                : 'Carretera Panamericana Km 114 - Punto de Control',
          },
        });
      }
    );
  };

  const handleMarkStageComplete = () => {
    if (!currentStage.photos || currentStage.photos.length === 0) {
      alert('Debe adjuntar al menos una evidencia fotográfica geolocalizada para certificar esta etapa.');
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
      notes: stageNotes || currentStage.notes || `Etapa cumplida conforme en modalidad ${vehicleType}.`,
      receiverData:
        activeStageId === 5
          ? {
              fullName: receiverName || currentStage.receiverData?.fullName || 'Roberto Salas Mendoza',
              dni: receiverDni || currentStage.receiverData?.dni || '10984521',
              stampVerified,
            }
          : undefined,
    });

    // Advance to next stage if available
    if (activeStageId < 5) {
      setActiveStageId((activeStageId + 1) as StageId);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-6">
      {/* Title & Vehicle Adaptation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Seguimiento Operativo de Servicio y Evidencias por Etapas
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-500">
              Línea de tiempo interactiva adaptada según tipo de vehículo:
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider font-mono ${
              isTracto ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-sky-100 text-sky-900 border border-sky-300'
            }`}>
              {isTracto ? <Truck className="h-3 w-3" /> : <Package className="h-3 w-3" />}
              MODALIDAD {vehicleType.toUpperCase()}
            </span>
          </div>
        </div>

        {/* POD Alert Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3.5 py-1.5 text-xs font-semibold text-amber-900 shadow-xs">
          <FileCheck className="h-4 w-4 text-amber-600" />
          <span>
            {isTracto
              ? 'Etapa 5 (POD Guía Sellada) habilita facturación'
              : 'Etapa 5 (Acta de Conformidad) habilita facturación'}
          </span>
        </div>
      </div>

      {/* 5-Step Visual Interactive Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {stageConfigs.map((cfg) => {
          const stageData = stages.find((s) => s.stageId === cfg.id);
          const isDone = stageData?.isCompleted;
          const isCurrent = activeStageId === cfg.id;
          const Icon = cfg.icon;

          return (
            <button
              key={cfg.id}
              type="button"
              onClick={() => setActiveStageId(cfg.id)}
              className={`relative flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                isCurrent
                  ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-1 ring-amber-500'
                  : isDone
                  ? 'border-emerald-300 bg-emerald-50/30 hover:border-emerald-400'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="h-4 w-4" /> : cfg.id}
                </div>

                {cfg.isBillingCritical && (
                  <span className="text-[10px] font-bold uppercase rounded bg-red-100 text-red-800 px-1.5 py-0.5">
                    {isTracto ? 'POD' : 'ACTA'}
                  </span>
                )}
              </div>

              <div className="font-bold text-xs text-slate-900 truncate w-full">
                {cfg.name.split(':')[1] ? cfg.name.split(':')[1].trim() : cfg.name}
              </div>

              <div className="text-[11px] text-slate-500 truncate w-full mt-0.5">
                {isDone ? (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Certificado
                  </span>
                ) : isCurrent ? (
                  <span className="text-amber-800 font-semibold">En Registro</span>
                ) : (
                  'Pendiente'
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Stage Detail Panel */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
        {/* Stage Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-amber-400">
              {React.createElement(currentConfig.icon, { className: 'h-5 w-5' })}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {currentConfig.name}
                </h3>
                {currentStage.isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Concluida
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    <Clock className="h-3.5 w-3.5" /> Pendiente de Certificación
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">{currentConfig.subtitle}</p>
              <p className="text-[11px] text-slate-500 mt-1">{currentConfig.description}</p>
            </div>
          </div>

          {/* Quick Upload Button */}
          <button
            type="button"
            onClick={() => handleAddPhotoToCurrentStage()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-amber-400 hover:bg-slate-800 transition-colors shadow-xs shrink-0"
          >
            <Camera className="h-4 w-4" />
            Tomar / Adjuntar Foto ({vehicleType})
          </button>
        </div>

        {/* Geolocation & Timestamp Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-700">
            <MapPin className="h-4 w-4 text-red-500 shrink-0" />
            <div>
              <div className="font-semibold text-slate-800">Geolocalización Certificada en Etapa:</div>
              <div className="text-[11px] text-slate-500 truncate font-mono">
                {currentStage.geolocation
                  ? `${currentStage.geolocation.address} (${currentStage.geolocation.lat.toFixed(4)}, ${currentStage.geolocation.lng.toFixed(4)})`
                  : 'Coordenadas GPS automáticas registradas al capturar la evidencia'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="h-4 w-4 text-blue-500 shrink-0" />
            <div>
              <div className="font-semibold text-slate-800">Marca de Hora y Lugar Exacto (Timestamp):</div>
              <div className="text-[11px] text-slate-600 font-mono font-bold">
                {currentStage.timestamp || 'Registro en tiempo real con sello horario'}
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery for this stage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Evidencias Fotográficas Certificadas ({currentStage.photos?.length || 0})
            </span>
            <span className="text-[11px] text-slate-500">
              Haga clic sobre cualquier foto para zoom en alta definición
            </span>
          </div>

          {currentStage.photos && currentStage.photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {currentStage.photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => onViewPhoto(photo.url, `${currentConfig.name} - ${photo.label}`)}
                  className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-300 bg-slate-900 aspect-video shadow-xs"
                >
                  <img
                    src={photo.url}
                    alt={photo.label}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 text-white">
                    <div className="text-[11px] font-semibold truncate">{photo.label}</div>
                    <div className="text-[9px] text-slate-300 font-mono flex items-center justify-between">
                      <span>{photo.timestamp}</span>
                      <span className="flex items-center gap-0.5 text-amber-300">
                        <ZoomIn className="h-3 w-3" /> Zoom
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500 space-y-2">
              <Camera className="mx-auto h-7 w-7 text-slate-400" />
              <div>No hay fotos cargadas todavía para esta etapa.</div>
              <div className="text-[11px] text-slate-400">
                Evidencias requeridas en {vehicleType}:{' '}
                <strong className="text-slate-600">{currentConfig.requiredPhotos.join(', ')}</strong>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                {currentConfig.requiredPhotos.map((photoHint, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleAddPhotoToCurrentStage(photoHint)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Subir {photoHint}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Special Section for Stage 5: POD (Tracto) vs Acta de Conformidad (Furgón) */}
        {activeStageId === 5 && (
          <div className="rounded-lg border border-amber-300 bg-amber-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 uppercase flex items-center gap-1.5">
                <FileCheck className="h-4 w-4 text-amber-700" />
                {isTracto
                  ? 'Validación de POD Guía Sellada (Requisito Indispensable para Facturar Tracto)'
                  : 'Validación de Acta de Conformidad de Entrega (Requisito para Facturar Furgón)'}
              </span>
              <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-mono">
                HABILITA BANDEJA FACTURACIÓN
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo del Receptor (Cliente / Almacenero)
                </label>
                <input
                  type="text"
                  value={receiverName || currentStage.receiverData?.fullName || ''}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="Ej. Roberto Salas Mendoza"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  DNI o Documento de Identidad del Receptor
                </label>
                <input
                  type="text"
                  value={receiverDni || currentStage.receiverData?.dni || ''}
                  onChange={(e) => setReceiverDni(e.target.value)}
                  placeholder="Ej. 10984521"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 font-mono"
                />
              </div>
            </div>

            {/* Checkboxes based on vehicle type */}
            <div className="space-y-2 pt-1 text-xs text-slate-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={stampVerified}
                  onChange={(e) => setStampVerified(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="font-medium">
                  {isTracto ? (
                    <>
                      Confirmo que la guía física tiene el <strong>SELLO LEGIBLE</strong> de la empresa cliente con fecha, hora y firma de recepción conforme.
                    </>
                  ) : (
                    <>
                      Confirmo que el acta o guía de reparto cuenta con el <strong>SELLO Y FIRMA DE CONFORMIDAD</strong> del almacén receptor.
                    </>
                  )}
                </span>
              </label>

              {!isTracto && (
                <>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sealCutVerified}
                      onChange={(e) => setSealCutVerified(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-medium">
                      Precinto de seguridad verificado intacto antes de corte frente al recepcionista.
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={packagesMatchVerified}
                      onChange={(e) => setPackagesMatchVerified(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-medium">
                      Conteo de bultos 100% conforme sin mermas, faltantes ni reclamos comerciales.
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        {/* Stage Complete Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <div className="text-xs text-slate-500">
            {currentStage.isCompleted ? (
              <span className="text-emerald-700 font-medium">
                Esta etapa ya se encuentra certificada con evidencia geolocalizada en tiempo real.
              </span>
            ) : (
              <span>
                Para certificar esta etapa ({vehicleType}), asegúrese de haber subido las fotos reglamentarias con timestamp.
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleMarkStageComplete}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold transition-all shadow-sm ${
              currentStage.isCompleted
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {currentStage.isCompleted
              ? 'Actualizar Datos de Etapa'
              : `Certificar ${currentConfig.name.split(':')[0]} (${vehicleType})`}
          </button>
        </div>
      </div>
    </div>
  );
};
