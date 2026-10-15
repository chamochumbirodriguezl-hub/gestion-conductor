import React, { useState } from 'react';
import { X, Truck, Check, PlusCircle, MapPin, DollarSign, Calendar } from 'lucide-react';
import { TransportService, UnitInfo } from '../../types';
import { INITIAL_CHECKLIST_ITEMS, CLOSING_CHECKLIST_ITEMS } from '../../data/mockData';

interface NewServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  units: UnitInfo[];
  onAddService: (newService: TransportService) => void;
}

export const NewServiceModal: React.FC<NewServiceModalProps> = ({
  isOpen,
  onClose,
  units,
  onAddService,
}) => {
  const [clientName, setClientName] = useState('Siderperú S.A.A.');
  const [clientRuc, setClientRuc] = useState('20100062442');
  const [origin, setOrigin] = useState('Planta Chimbote Km 426');
  const [destination, setDestination] = useState('Almacén Central Lurín - Lima');
  const [cargoDescription, setCargoDescription] = useState('Palanquillas y Alambrón de Acero');
  const [cargoWeightTn, setCargoWeightTn] = useState('31.8');
  const [agreedRate, setAgreedRate] = useState('5200');
  const [selectedUnitId, setSelectedUnitId] = useState(units[0]?.id || '');
  const [driverName, setDriverName] = useState('Carlos Alberto Benites Ríos');
  const [driverLicense, setDriverLicense] = useState('B50912440');
  const [driverDni, setDriverDni] = useState('41982031');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedUnit = units.find((u) => u.id === selectedUnitId) || units[0];

    const serviceCode = `SRV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = now.toISOString();

    const newService: TransportService = {
      id: `srv-${Date.now()}`,
      serviceCode,
      orderNumber: `OTC-${serviceCode.replace('SRV-', '')}`,
      clientName,
      clientRuc,
      origin,
      destination,
      cargoDescription,
      cargoWeightTn: Number(cargoWeightTn) || 30,
      agreedRate: Number(agreedRate) || 4500,
      currency: 'PEN',
      unit: assignedUnit,
      executionStatus: 'asignado',
      container: {
        containerNumber: `CLU-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(1 + Math.random() * 9)}`,
        containerType: '40ft High Cube',
        sealNumber: `SEAL-CL-${Math.floor(1000 + Math.random() * 9000)}`,
        shippingLine: 'Maersk Line',
        depotPickup: origin,
        deliveryLocation: destination,
        depotReturn: 'Depósito Ransa Neptunia Callao',
      },
      driver: {
        driverName,
        driverLicense,
        driverDni,
        isActive: false,
        phase: 'apertura_pendiente',
        selectedVehicleType: assignedUnit.vehicleType || 'Tracto',
        clockInTime: '',
        shiftStartTime: '',
        shiftType: 'Día (06:00 - 18:00)',
        attendanceMarked: false,
        initialFuelTankLevel: '100% (Lleno)',
        initialOdometer: assignedUnit.currentMileage,
        initialOdometerPhoto: '',
        initialChecklistCompleted: false,
        initialOilCheckAcknowledged: false,
        dailyIncidents: [],
        closingChecklist: CLOSING_CHECKLIST_ITEMS.map((i) => ({ ...i, status: null })),
      },
      startDate: formattedDate,
      estimatedArrival: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      financialStatus: 'pending_validation',
      stages: assignedUnit.vehicleType === 'Furgón' ? [
        {
          stageId: 1,
          stageName: 'Etapa 1: Origen / Presentación de Furgón y Documentos',
          description: 'Foto furgón limpio, puertas abiertas e inspección de sellado + Guía de despacho',
          isCompleted: false,
          photos: [],
        },
        {
          stageId: 2,
          stageName: 'Etapa 2: Carga, Estiba y Precinto de Seguridad Furgón',
          description: 'Foto mercancía paletizada zunchada dentro del furgón, barra traba y precinto numerado',
          isCompleted: false,
          photos: [],
        },
        {
          stageId: 3,
          stageName: 'Etapa 3: Tránsito y Control de Precinto en Ruta',
          description: 'Verificación de integridad de precinto en peaje y control en ruta',
          isCompleted: false,
          photos: [],
        },
        {
          stageId: 4,
          stageName: 'Etapa 4: Destino y Llegada en Rampa Retail',
          description: 'Foto de furgón acoderado en muelle de tienda o CD cliente',
          isCompleted: false,
          photos: [],
        },
        {
          stageId: 5,
          stageName: 'Etapa 5: Conformidad de Entrega y Corte de Precinto (Facturable)',
          description: 'Acta de entrega conforme firmada, verificación de corte de precinto y sellos',
          isCompleted: false,
          photos: [],
        },
      ] : [
        {
          stageId: 1,
          stageName: 'Etapa 1: Origen / Presentación Tracto y Guía GRR',
          description: 'Foto plataforma/carreta vacía e inspeccionada + Guía de Remisión Remitente (GRR)',
          isCompleted: false,
          photos: [],
        },
        {
          stageId: 2,
          stageName: 'Etapa 2: Carga, Estiba y Aseguramiento Tracto',
          description: 'Mercancía amarrada con fajas rachets, tacos y entoldado de protección',
          isCompleted: false,
          photos: [],
        },
        {
          stageId: 3,
          stageName: 'Etapa 3: Tránsito y Control de Ruta / Balanza',
          description: 'Ticket peaje y balanza Provías de pesaje por ejes',
          isCompleted: false,
          photos: [],
        },
        {
          stageId: 4,
          stageName: 'Etapa 4: Destino y Llegada en Rampa Cliente',
          description: 'Tractocamión acoderado en bahía de descarga',
          isCompleted: false,
          photos: [],
        },
        {
          stageId: 5,
          stageName: 'Etapa 5: POD - Guía Firmada y Sellada (Facturable)',
          description: 'Guía física con SELLO LEGIBLE DE CONFORME Y FIRMA del cliente',
          isCompleted: false,
          photos: [],
        },
      ],
      fuelEntries: [],
      checklistItems: INITIAL_CHECKLIST_ITEMS.map((item) => ({ ...item, status: null })),
    };

    onAddService(newService);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white border border-slate-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              Registrar Nuevo Despacho y Asignación de Unidad
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Empresa Cliente</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">RUC del Cliente</label>
              <input
                type="text"
                required
                value={clientRuc}
                onChange={(e) => setClientRuc(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Origen (Punto de Partida)</label>
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destino (Punto de Entrega)</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Descripción de la Carga</label>
              <input
                type="text"
                required
                value={cargoDescription}
                onChange={(e) => setCargoDescription(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Peso (Tn)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={cargoWeightTn}
                  onChange={(e) => setCargoWeightTn(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tarifa Flete (S/.)</label>
                <input
                  type="number"
                  required
                  value={agreedRate}
                  onChange={(e) => setAgreedRate(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Unit selection */}
          <div className="border-t border-slate-200 pt-3 text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              Unidad Asignada (Tracto y Semirremolque)
            </label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 font-semibold"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.tractPlate} (Tracto) / {u.trailerPlate} (Carreta) · {u.model} · {u.currentMileage.toLocaleString()} km
                </option>
              ))}
            </select>
          </div>

          {/* Driver info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200 pt-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Conductor Asignado</label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brevete / Licencia</label>
              <input
                type="text"
                required
                value={driverLicense}
                onChange={(e) => setDriverLicense(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">DNI del Conductor</label>
              <input
                type="text"
                required
                value={driverDni}
                onChange={(e) => setDriverDni(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-sm"
            >
              <Check className="h-4 w-4" />
              Crear Servicio y Generar Código
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
