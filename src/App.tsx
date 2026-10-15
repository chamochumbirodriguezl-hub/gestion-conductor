import React, { useState } from 'react';
import { DriverMainMenu } from './components/Collyer/DriverMainMenu';
import { ContainerWizard } from './components/Collyer/ContainerWizard';
import { IngresoWizard } from './components/Collyer/IngresoWizard';
import { SalidaWizard } from './components/Collyer/SalidaWizard';
import { FuelRefuelForm } from './components/DriverView/FuelRefuelForm';
import { PhotoUploadModal } from './components/Common/PhotoUploadModal';
import { ImageViewerModal } from './components/Common/ImageViewerModal';
import { MOCK_UNITS, MOCK_SERVICES, VEHICLE_PRESETS } from './data/mockData';
import {
  TransportService,
  UnitInfo,
  DriverShift,
  ChecklistStatus,
  FuelEntry,
  ServiceEvidence,
  StageId,
  VehicleType,
  TrackingPointStatus,
} from './types';
import {
  Truck,
  Wifi,
  Battery,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Smartphone,
} from 'lucide-react';

export type DriverViewMode = 'home' | 'ingreso' | 'containers' | 'salida' | 'fuel';

export default function App() {
  const [viewMode, setViewMode] = useState<DriverViewMode>('home');
  const [units, setUnits] = useState<UnitInfo[]>(MOCK_UNITS);
  const [services, setServices] = useState<TransportService[]>(MOCK_SERVICES);

  // Active Service ID
  const [activeServiceId, setActiveServiceId] = useState<string>(services[0].id);

  // Modals state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoModalTitle, setPhotoModalTitle] = useState('📸 Tomar Foto con la Cámara');
  const [photoSaveCallback, setPhotoSaveCallback] = useState<
    ((data: { url: string; label: string; timestamp: string }) => void) | null
  >(null);

  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [viewerData, setViewerData] = useState<{
    imageUrl: string;
    title: string;
    subtitle?: string;
  }>({ imageUrl: '', title: '' });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [completionModalService, setCompletionModalService] = useState<TransportService | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentService =
    services.find((s) => s.id === activeServiceId) || services[0];
  const currentUnit =
    units.find((u) => u.id === currentService.unit.id) || units[0];

  // Handler: Update shift
  const handleUpdateShift = (updatedShift: DriverShift) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === currentService.id) {
          return {
            ...s,
            driver: updatedShift,
            unit: {
              ...s.unit,
              currentMileage:
                updatedShift.finalOdometer || updatedShift.initialOdometer || s.unit.currentMileage,
            },
          };
        }
        return s;
      })
    );

    if (updatedShift.finalOdometer) {
      setUnits((prev) =>
        prev.map((u) =>
          u.id === currentUnit.id ? { ...u, currentMileage: updatedShift.finalOdometer! } : u
        )
      );
    }

    if (updatedShift.phase === 'jornada_cerrada') {
      showToast('✓ Salida e incidencias registradas con éxito.');
    } else if (updatedShift.phase === 'en_ruta') {
      showToast('✓ Ingreso y mantenimiento certificados. Ruta habilitada.');
    }
  };

  // Handler: Update checklist item
  const handleUpdateChecklistItem = (
    id: string,
    status: ChecklistStatus,
    notes?: string
  ) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === currentService.id) {
          const updatedItems = s.checklistItems.map((chk) => {
            if (chk.id === id) {
              return { ...chk, status, notes: notes !== undefined ? notes : chk.notes };
            }
            return chk;
          });
          return { ...s, checklistItems: updatedItems };
        }
        return s;
      })
    );
  };

  // Handler: Select Vehicle Type (Tracto, Furgón, Vehículo Pequeño)
  const handleSelectVehicleType = (vehicleType: VehicleType) => {
    const preset = VEHICLE_PRESETS[vehicleType] || VEHICLE_PRESETS['Tracto'];
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === currentService.id) {
          return {
            ...s,
            driver: {
              ...s.driver,
              selectedVehicleType: vehicleType,
            },
            unit: {
              ...s.unit,
              vehicleType: vehicleType,
              model: preset.model,
              tractPlate: preset.tractPlate,
              trailerPlate: preset.trailerPlate,
              trailerType: preset.trailerType,
              securitySealNumber: preset.securitySealNumber,
              boxCapacityM3: preset.boxCapacityM3,
              fuelTankCapacityGln: preset.fuelTankCapacityGln,
            },
          };
        }
        return s;
      })
    );

    setUnits((prev) =>
      prev.map((u) => {
        if (u.id === currentUnit.id) {
          return {
            ...u,
            vehicleType,
            model: preset.model,
            tractPlate: preset.tractPlate,
            trailerPlate: preset.trailerPlate,
            trailerType: preset.trailerType,
            securitySealNumber: preset.securitySealNumber,
            boxCapacityM3: preset.boxCapacityM3,
            fuelTankCapacityGln: preset.fuelTankCapacityGln,
          };
        }
        return u;
      })
    );

    showToast(`Vehículo asignado: ${vehicleType} (${preset.tractPlate})`);
  };

  // Handler: Update route itinerary point status
  const handleUpdateRoutePointStatus = (pointId: string, status: TrackingPointStatus) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === currentService.id && s.itinerary) {
          const updatedItin = s.itinerary.map((p) => {
            if (p.id === pointId) {
              return {
                ...p,
                status,
                completedAt:
                  status === 'completado'
                    ? new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                    : p.completedAt,
              };
            }
            return p;
          });
          return { ...s, itinerary: updatedItin };
        }
        return s;
      })
    );
    showToast(
      status === 'en_transito'
        ? '⏱️ Rumbo iniciado hacia el punto de control.'
        : '✓ Punto de control completado.'
    );
  };

  // Handler: Complete container stage
  const handleCompleteStage = (stageId: StageId, data: Partial<ServiceEvidence>) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === currentService.id) {
          const updatedStages = s.stages.map((stg) => {
            if (stg.stageId === stageId) {
              return { ...stg, ...data };
            }
            return stg;
          });

          // Also synchronize matching itinerary points
          const updatedItinerary = s.itinerary
            ? s.itinerary.map((p) => {
                if (p.linkedStageId === stageId) {
                  return {
                    ...p,
                    status: 'completado' as TrackingPointStatus,
                    completedAt: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
                    photoUrl: data.photos && data.photos.length > 0 ? data.photos[0].url : p.photoUrl,
                  };
                }
                return p;
              })
            : s.itinerary;

          const allDone = updatedStages.every((st) => st.isCompleted);
          return {
            ...s,
            stages: updatedStages,
            itinerary: updatedItinerary,
            executionStatus: allDone ? 'terminado' : s.executionStatus,
          };
        }
        return s;
      })
    );

    showToast(`✓ Foto del Paso ${stageId} registrada.`);
  };

  // Handler: Certify service as Terminado
  const handleCertifyTerminado = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          return {
            ...s,
            executionStatus: 'terminado',
            completedDate: new Date().toLocaleString('es-PE'),
            financialStatus: 'ready_to_invoice',
          };
        }
        return s;
      })
    );

    const targetService = services.find((s) => s.id === serviceId) || currentService;
    setCompletionModalService(targetService);
  };

  // Handler: Fuel
  const handleAddFuelEntry = (newFuel: FuelEntry) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === currentService.id) {
          return {
            ...s,
            fuelEntries: [newFuel, ...s.fuelEntries],
          };
        }
        return s;
      })
    );
    showToast(`Vale de combustible registrado: ${newFuel.gallons} glns.`);
    setViewMode('home');
  };

  // Photo modal trigger
  const requestPhotoUpload = (
    title: string,
    onSuccess: (url: string, label?: string) => void
  ) => {
    setPhotoModalTitle(title);
    setPhotoSaveCallback(() => (data: { url: string; label: string }) => {
      onSuccess(data.url, data.label);
    });
    setIsPhotoModalOpen(true);
  };

  const handleViewPhoto = (imageUrl: string, title: string) => {
    setViewerData({ imageUrl, title });
    setIsViewerModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 sm:py-6 sm:px-4 flex justify-center items-center">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 z-50 flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-xs font-black text-slate-950 shadow-2xl border border-emerald-400 animate-slide-in">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* DISEÑO MÓVIL ESTRICTO: SMARTPHONE DEVICE FRAME */}
      {/* ======================================================== */}
      <div className="w-full sm:max-w-[450px] min-h-screen sm:min-h-[890px] sm:max-h-[92vh] sm:rounded-[44px] sm:border-[10px] sm:border-slate-800 bg-slate-950 text-white shadow-2xl overflow-y-auto flex flex-col relative sm:ring-4 sm:ring-black/40">
        {/* Native Mobile Status Bar Simulation */}
        <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md px-6 pt-3 pb-2 flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-900">
          <span className="font-bold text-slate-200">08:30</span>

          {/* Speaker Notch on Desktop */}
          <div className="hidden sm:block h-3.5 w-24 rounded-full bg-slate-800 mx-auto" />

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-400">5G</span>
            <Wifi className="h-3.5 w-3.5 text-slate-300" />
            <Battery className="h-4 w-4 text-emerald-400" />
          </div>
        </div>

        {/* Top Operational App Header */}
        <header className="px-5 py-3.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black shadow-md">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[9px] font-black tracking-widest text-amber-400 uppercase font-mono leading-none">
                COLLYER LOGISTICS
              </div>
              <h1 className="text-sm font-black text-white leading-tight mt-0.5">
                Gestión del Conductor
              </h1>
            </div>
          </div>

          {viewMode !== 'home' ? (
            <button
              type="button"
              onClick={() => setViewMode('home')}
              className="py-1 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Inicio</span>
            </button>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </header>

        {/* MAIN BODY: SWITCHES BETWEEN HOME (3 BOTONES) AND WIZARDS */}
        <main className="flex-1 p-4 sm:p-5 overflow-y-auto">
          {viewMode === 'home' && (
            <DriverMainMenu
              currentService={currentService}
              allServices={services}
              onSelectService={(id) => setActiveServiceId(id)}
              onSelectVehicleType={handleSelectVehicleType}
              onOpenIngreso={() => setViewMode('ingreso')}
              onOpenContainers={() => setViewMode('containers')}
              onOpenSalida={() => setViewMode('salida')}
              onOpenFuel={() => setViewMode('fuel')}
            />
          )}

          {viewMode === 'ingreso' && (
            <IngresoWizard
              currentService={currentService}
              onUpdateShift={handleUpdateShift}
              onUpdateChecklistItem={handleUpdateChecklistItem}
              onSelectVehicleType={handleSelectVehicleType}
              onRequestPhotoUpload={requestPhotoUpload}
              onViewPhoto={handleViewPhoto}
              onBackToHome={() => setViewMode('home')}
              onProceedToContainers={() => setViewMode('containers')}
            />
          )}

          {viewMode === 'containers' && (
            <ContainerWizard
              currentService={currentService}
              onCompleteStage={handleCompleteStage}
              onCertifyTerminado={handleCertifyTerminado}
              onUpdatePointStatus={handleUpdateRoutePointStatus}
              onRequestPhotoUpload={requestPhotoUpload}
              onViewPhoto={handleViewPhoto}
              onBackToHome={() => setViewMode('home')}
            />
          )}

          {viewMode === 'salida' && (
            <SalidaWizard
              currentService={currentService}
              onUpdateShift={handleUpdateShift}
              onRequestPhotoUpload={requestPhotoUpload}
              onViewPhoto={handleViewPhoto}
              onBackToHome={() => setViewMode('home')}
            />
          )}

          {viewMode === 'fuel' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setViewMode('home')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>← Volver al Menú Principal</span>
              </button>

              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 text-white">
                <FuelRefuelForm
                  entries={currentService.fuelEntries}
                  currentUnitMileage={currentService.unit.currentMileage}
                  onAddFuelEntry={handleAddFuelEntry}
                  onRequestPhotoUpload={requestPhotoUpload}
                  onViewPhoto={handleViewPhoto}
                />
              </div>
            </div>
          )}
        </main>

        {/* Native Mobile Bottom Navigation / Home Indicator Bar */}
        <div className="py-2.5 px-4 bg-slate-950 border-t border-slate-900 flex justify-center items-center">
          <div className="h-1 w-28 rounded-full bg-slate-700" />
        </div>
      </div>

      {/* Completion Modal when Service is certified as "Terminado" */}
      {completionModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-emerald-500 p-6 text-center space-y-4 shadow-2xl text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-black shadow-lg">
              <Sparkles className="h-8 w-8" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
                COLLYER OPERACIONES
              </span>
              <h2 className="text-xl font-black text-white">
                ¡Servicio de Contenedor Terminado!
              </h2>
              <p className="text-xs text-slate-300">
                Se registraron y geolocalizaron con éxito las 5 etapas del contenedor{' '}
                <strong className="text-amber-400 font-mono">
                  {completionModalService.container?.containerNumber || 'Contenedor'}
                </strong>.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950 p-3.5 text-xs text-left space-y-1.5 border border-slate-800 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Orden:</span>
                <strong className="text-white">{completionModalService.orderNumber}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cliente:</span>
                <strong className="text-white">{completionModalService.clientName.split(' ')[0]}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Devolución:</span>
                <strong className="text-sky-400">Depósito Ransa</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ticket EIR:</span>
                <strong className="text-emerald-400">{completionModalService.container?.eirNumber}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setCompletionModalService(null);
                setViewMode('salida');
              }}
              className="w-full min-h-[56px] rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Ir a Marcar Salida e Incidencias</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Common Camera Photo Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        title={photoModalTitle}
        onSave={(data) => {
          if (photoSaveCallback) {
            photoSaveCallback(data);
          }
        }}
      />

      {/* Common High-Resolution Image Zoom Modal */}
      <ImageViewerModal
        isOpen={isViewerModalOpen}
        onClose={() => setIsViewerModalOpen(false)}
        imageUrl={viewerData.imageUrl}
        title={viewerData.title}
        subtitle={viewerData.subtitle}
        metadata={{
          timestamp: new Date().toLocaleTimeString('es-PE'),
          location: 'Coordenadas Certificadas GPS Collyer',
          verified: true,
        }}
      />
    </div>
  );
}
