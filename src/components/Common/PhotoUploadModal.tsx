import React, { useState } from 'react';
import { Camera, Upload, Check, X, MapPin, Clock } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  defaultCategory?: string;
  onSave: (photoData: {
    url: string;
    label: string;
    timestamp: string;
    location?: { lat: number; lng: number; address: string };
  }) => void;
}

const PRESET_EVIDENCES: {
  category: string;
  title: string;
  url: string;
  defaultLocation: string;
}[] = [
  {
    category: 'stage1',
    title: '1. Llegada al Terminal / Depósito (Tracto en Garita Balboa)',
    url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=900&q=80',
    defaultLocation: 'APM Terminals Callao - Garita Balboa Muelle Norte',
  },
  {
    category: 'stage2',
    title: '2. Entrega del Container en Planta Cliente (Posicionado en Rampa)',
    url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80',
    defaultLocation: 'Complejo Industrial Alicorp - Bahía 4',
  },
  {
    category: 'stage3',
    title: '3. Vaciado del Container (Desestiba y Descarga Activa)',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80',
    defaultLocation: 'Planta Alicorp - Nave de Silos',
  },
  {
    category: 'stage4',
    title: '4. Finalización del Container (Vacío, Barrido y Compuertas Cerradas)',
    url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=80',
    defaultLocation: 'Patio de Maniobras Cliente',
  },
  {
    category: 'stage5',
    title: '5. Retorno del Container y Ticket EIR en Depósito Ransa',
    url: 'https://images.unsplash.com/photo-1568214379698-8aeb8c6c6ac8?auto=format&fit=crop&w=900&q=80',
    defaultLocation: 'Depósito Ransa Neptunia Callao (Av. Gambetta)',
  },
  {
    category: 'odometer',
    title: 'Tablero Digital - Odómetro 254,820 km',
    url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=900&q=80',
    defaultLocation: 'Base Callao - Garita Principal',
  },
  {
    category: 'fuel',
    title: 'Factura / Ticket Grifo Primax Diésel',
    url: 'https://images.unsplash.com/photo-1554415707-9e49fe74a64c?auto=format&fit=crop&w=900&q=80',
    defaultLocation: 'Estación Primax Gambetta Km 4.5',
  },
];

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({
  isOpen,
  onClose,
  title,
  onSave,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');
  const [label, setLabel] = useState<string>('Evidencia fotográfica en ruta');
  const [customLocation, setCustomLocation] = useState<string>(
    'Carretera Panamericana Sur Km 114'
  );

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomPhotoUrl(reader.result as string);
        setSelectedPreset(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentPreviewUrl = selectedPreset || customPhotoUrl || PRESET_EVIDENCES[0].url;

  const handleConfirm = () => {
    const now = new Date();
    const formattedTimestamp = now.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    onSave({
      url: currentPreviewUrl,
      label: label || 'Evidencia verificada',
      timestamp: formattedTimestamp,
      location: {
        lat: -12.4512 + (Math.random() * 0.05 - 0.025),
        lng: -76.8912 + (Math.random() * 0.05 - 0.025),
        address: customLocation,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white border border-slate-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Action Row: Real Upload & Presets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Capturar o Seleccionar Evidencia
              </label>
              <span className="text-xs text-slate-500 font-mono">Geotagging Activo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* File upload button */}
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center hover:border-amber-500 hover:bg-amber-50/50 transition-colors">
                <Upload className="h-6 w-6 text-slate-400 mb-1" />
                <span className="text-xs font-medium text-slate-700">Subir foto o usar cámara</span>
                <span className="text-[11px] text-slate-500">JPG, PNG o tomar en vivo</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Quick Preset Selector */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 flex flex-col justify-between">
                <div className="text-xs font-medium text-slate-700 mb-1">
                  Plantillas Operativas Rápidas:
                </div>
                <div className="space-y-1">
                  {PRESET_EVIDENCES.slice(0, 3).map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(preset.url);
                        setCustomPhotoUrl('');
                        setLabel(preset.title);
                        setCustomLocation(preset.defaultLocation);
                      }}
                      className={`w-full text-left truncate text-xs px-2.5 py-1.5 rounded transition-colors ${
                        selectedPreset === preset.url
                          ? 'bg-amber-100 text-amber-900 font-medium'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current Preview */}
          <div>
            <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Vista Previa con Estampado Legal
            </div>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-900 border border-slate-300">
              <img
                src={currentPreviewUrl}
                alt="Preview"
                className="h-full w-full object-cover"
              />
              {/* Live simulated metadata overlay */}
              <div className="absolute bottom-2 left-2 right-2 rounded bg-slate-950/80 p-2 text-white text-[11px] font-mono backdrop-blur-xs flex flex-wrap items-center justify-between gap-2 border border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>{new Date().toLocaleTimeString()} - {new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300 truncate max-w-xs">
                  <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <span className="truncate">{customLocation}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Input details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Descripción / Referencia
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ej. Guía remitente sellada o Tablero"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Punto de Geolocalización
              </label>
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Ubicación de captura"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 shadow-sm transition-colors"
          >
            <Check className="h-4 w-4" />
            Certificar y Adjuntar Evidencia
          </button>
        </div>
      </div>
    </div>
  );
};
