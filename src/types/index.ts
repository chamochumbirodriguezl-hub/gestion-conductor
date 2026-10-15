export type ShiftType = 'Día (06:00 - 18:00)' | 'Noche (18:00 - 06:00)';

export type ChecklistStatus = 'B' | 'F' | null;

export interface ChecklistItem {
  id: string;
  category: 'Neumáticos' | 'Motor y Fluidos' | 'Sistema Eléctrico' | 'Frenos y Aire' | 'Suspensión y Acople';
  label: string;
  isCritical: boolean;
  status: ChecklistStatus;
  notes?: string;
  photoUrl?: string;
}

export type VehicleType = 'Tracto' | 'Furgón' | 'Vehículo Pequeño';

export type TrackingPointStatus = 'pendiente' | 'en_transito' | 'completado';

export interface RouteItineraryPoint {
  id: string;
  order: number;
  type: 'origen' | 'intermedio' | 'destino' | 'retorno';
  label: string; // ej. '1. Origen / Recojo'
  name: string; // ej. 'APM Terminals Callao'
  address: string; // ej. 'Muelle Norte, Garita Balboa'
  scheduledTime: string; // ej. '07:15 AM'
  status: TrackingPointStatus;
  completedAt?: string;
  photoUrl?: string;
  notes?: string;
  linkedStageId?: StageId;
}

export interface DailyIncident {
  id: string;
  type: 'falla_mecanica' | 'demora_rampa' | 'trafico_peajes' | 'clima_ruta' | 'mercancia_dano' | 'ninguna';
  categoryLabel: string;
  description: string;
  timestamp: string;
  photoUrl?: string;
  severity: 'baja' | 'media' | 'alta';
}

export interface UnitInfo {
  id: string;
  model: string;
  vehicleType: VehicleType;
  tractPlate: string;
  trailerPlate: string;
  trailerType: string;
  boxCapacityM3?: number;
  securitySealNumber?: string;
  isRefrigerated?: boolean;
  currentMileage: number;
  lastOilChangeMileage: number;
  lastOilChangeMechanic: string;
  oilChangeInterval: number; // e.g. 10000 km
  status: 'available' | 'in_transit' | 'loading' | 'unloading' | 'maintenance';
  fuelTankCapacityGln: number;
}

export type ShiftPhase =
  | 'apertura_pendiente' // Bloqueo: Debe realizar Registro de Ingreso y Checklist Inicial
  | 'en_ruta'            // En ruta activa: Ejecutando el ciclo de contenedores
  | 'cierre_pendiente'   // Concluyó etapas: Debe realizar Registro de Salida y Bitácora de Incidencias
  | 'jornada_cerrada';   // Cierre completado formalmente

export interface ClosingChecklistItem {
  id: string;
  category: 'Carrocería y Carreta' | 'Neumáticos tras ruta' | 'Fluidos y Motor en Caliente' | 'Sistema Eléctrico y Frenos' | 'Seguridad y Cabina';
  label: string;
  isCritical: boolean;
  status: ChecklistStatus;
  notes?: string;
  photoUrl?: string;
}

export interface ClosingReport {
  closedAt: string;
  clockOutTime: string;
  finalOdometer: number;
  finalOdometerPhoto: string;
  totalKmDriven: number;
  totalHoursDriven: number;
  unitFinalCondition: 'conforme' | 'con_observaciones' | 'requiere_taller_urgente';
  summaryNotes: string;
  incidents: DailyIncident[];
  sentToControlTower: boolean;
  sentToFinance: boolean;
  closureId: string;
}

export interface DriverShift {
  driverName: string;
  driverLicense: string;
  driverDni: string;
  isActive: boolean;
  phase: ShiftPhase;
  selectedVehicleType: VehicleType;
  clockInTime: string;
  clockOutTime?: string;
  shiftStartTime: string;
  shiftEndTime?: string;
  shiftType: ShiftType;
  attendanceMarked?: boolean;
  initialFuelTankLevel?: string;
  initialOdometer: number;
  initialOdometerPhoto: string;
  initialChecklistCompleted: boolean;
  initialOilCheckAcknowledged: boolean;
  finalOdometer?: number;
  finalOdometerPhoto?: string;
  dailyIncidents: DailyIncident[];
  closingChecklist?: ClosingChecklistItem[];
  closingReport?: ClosingReport;
}

export interface FuelEntry {
  id: string;
  serviceId?: string;
  timestamp: string;
  gasStation: string;
  fuelType: string;
  gallons: number;
  pricePerGallon: number;
  totalAmount: number;
  currency: 'PEN' | 'USD';
  receiptNumber: string;
  receiptPhoto: string;
  odometerAtRefuel: number;
}

export type StageId = 1 | 2 | 3 | 4 | 5;

export interface ServiceEvidence {
  stageId: StageId;
  stageName: string;
  description: string;
  isCompleted: boolean;
  timestamp?: string;
  geolocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  photos: {
    id: string;
    label: string;
    url: string;
    timestamp: string;
  }[];
  notes?: string;
  receiverData?: {
    fullName: string;
    dni: string;
    stampVerified: boolean;
  };
}

export interface ContainerDetails {
  containerNumber: string; // ej. MSKU-948102-3
  containerType: '20ft Standard' | '40ft High Cube' | '40ft Standard' | '40ft Reefer';
  sealNumber: string; // Precinto de aduana / naviera
  shippingLine: string; // Maersk, MSC, Hapag-Lloyd, CMA CGM
  depotPickup: string; // Lugar de recojo (terminal portuario / depósito)
  deliveryLocation: string; // Lugar de entrega (planta o almacén del cliente)
  depotReturn: string; // Lugar de devolución del contenedor vacío
  eirNumber?: string; // Ticket EIR (Equipment Interchange Receipt)
  tareWeightKg?: number;
  payloadKg?: number;
}

export type ServiceFinancialStatus = 'pending_validation' | 'ready_to_invoice' | 'invoiced' | 'needs_correction';
export type ServiceExecutionStatus = 'asignado' | 'en_curso' | 'terminado';

export interface TransportService {
  id: string;
  serviceCode: string;
  orderNumber?: string; // Orden de transporte Collyer ej. OTC-2026-4401
  clientName: string;
  clientRuc: string;
  origin: string;
  destination: string;
  cargoDescription: string;
  cargoWeightTn: number;
  agreedRate: number;
  currency: 'PEN' | 'USD';
  unit: UnitInfo;
  driver: DriverShift;
  container?: ContainerDetails; // Ciclo de contenedores
  executionStatus: ServiceExecutionStatus;
  startDate: string;
  scheduledDepartureTime?: string; // ej. '07:00 AM'
  estimatedArrival: string;
  completedDate?: string;
  itinerary?: RouteItineraryPoint[]; // Mini-tracking detallado de la ruta
  stages: ServiceEvidence[];
  fuelEntries: FuelEntry[];
  checklistItems: ChecklistItem[];
  financialStatus: ServiceFinancialStatus;
  preInvoiceNumber?: string;
  invoicedAt?: string;
  correctionReason?: string;
  validationChecklist?: {
    podStampLegible: boolean;
    fuelReceiptsMatch: boolean;
    mileageWithinTolerance: boolean;
    zeroDamageReported: boolean;
  };
}
