import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  ClipboardCheck,
  Disc,
  Droplet,
  Zap,
  Gauge,
  Layers,
  Camera,
  MessageSquare,
} from 'lucide-react';
import { ChecklistItem, ChecklistStatus } from '../../types';

interface Checklist30PointsProps {
  items: ChecklistItem[];
  onUpdateItemStatus: (id: string, status: ChecklistStatus, notes?: string) => void;
  onRequestPhotoUpload: (title: string, onSuccess: (url: string) => void) => void;
  onViewPhoto: (url: string, title: string) => void;
}

export const Checklist30Points: React.FC<Checklist30PointsProps> = ({
  items,
  onUpdateItemStatus,
  onRequestPhotoUpload,
  onViewPhoto,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  const categories = [
    { key: 'all', label: 'Todos (30)', icon: ClipboardCheck },
    { key: 'Neumáticos', label: 'Neumáticos (6)', icon: Disc },
    { key: 'Motor y Fluidos', label: 'Motor y Fluidos (6)', icon: Droplet },
    { key: 'Sistema Eléctrico', label: 'Sistema Eléctrico (6)', icon: Zap },
    { key: 'Frenos y Aire', label: 'Frenos y Aire (6)', icon: Gauge },
    { key: 'Suspensión y Acople', label: 'Suspensión y Acople (6)', icon: Layers },
  ];

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter((it) => it.category === activeCategory);

  const completedCount = items.filter((it) => it.status !== null).length;
  const criticalFailures = items.filter((it) => it.status === 'F' && it.isCritical);
  const nonCriticalFailures = items.filter((it) => it.status === 'F' && !it.isCritical);

  const handleMarkAllGood = () => {
    items.forEach((it) => {
      onUpdateItemStatus(it.id, 'B');
    });
  };

  const handleSaveNote = (id: string) => {
    const item = items.find((it) => it.id === id);
    if (item) {
      onUpdateItemStatus(id, item.status, noteText);
    }
    setEditingNoteId(null);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-5">
      {/* Header and Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
              Checklist Preventivo de Seguridad (30 Puntos Obligatorios)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspección pre-operacional 360° para tractocamión y semirremolque
          </p>
        </div>

        {/* Action & Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right text-xs">
            <div className="font-semibold text-slate-700">
              Progreso: <span className="font-mono text-amber-600">{completedCount}/30</span>
            </div>
            <div className="text-[11px] text-slate-500">
              {completedCount === 30 ? 'Inspección 100% completada' : 'Faltan puntos por revisar'}
            </div>
          </div>

          <button
            type="button"
            onClick={handleMarkAllGood}
            className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-amber-400 hover:bg-slate-800 transition-colors shadow-xs"
          >
            Marcar Todos Conforme (B)
          </button>
        </div>
      </div>

      {/* Critical Alert Banner if any critical safety item fails */}
      {criticalFailures.length > 0 && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900 shadow-sm animate-pulse-subtle">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600 text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-black uppercase tracking-wider text-red-700">
                BLOQUEO OPERATIVO: {criticalFailures.length} INCIDENCIA(S) CRÍTICA(S) DETECTADA(S)
              </div>
              <p className="text-xs text-red-800">
                La unidad presenta fallas en componentes de alto riesgo para la seguridad vial:{' '}
                <strong>{criticalFailures.map((f) => f.label).join(' · ')}</strong>.
                Está prohibido el despacho o tránsito continuo hasta subsanar con taller.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Non-critical notice */}
      {criticalFailures.length === 0 && nonCriticalFailures.length > 0 && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            Se registraron {nonCriticalFailures.length} observación(es) menores que requieren atención
            preventiva en el próximo retorno a base.
          </span>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* 30-Point Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map((item, index) => {
          const isGood = item.status === 'B';
          const isFail = item.status === 'F';
          const isCriticalFail = isFail && item.isCritical;

          return (
            <div
              key={item.id}
              className={`relative rounded-lg border p-3.5 transition-all ${
                isCriticalFail
                  ? 'border-red-400 bg-red-50/70 shadow-xs'
                  : isFail
                  ? 'border-amber-400 bg-amber-50/50'
                  : isGood
                  ? 'border-slate-200 bg-white hover:border-slate-300'
                  : 'border-dashed border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="font-mono font-bold text-slate-600">
                      #{item.id.replace('chk-', '').padStart(2, '0')}
                    </span>
                    <span>·</span>
                    <span className="text-slate-500">{item.category}</span>
                    {item.isCritical && (
                      <span className="rounded bg-red-100 px-1.5 py-0.2 text-[10px] font-bold text-red-700">
                        CRÍTICO
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-slate-900 leading-snug">
                    {item.label}
                  </div>
                </div>

                {/* Status Toggle Buttons: Bueno (B) / Falla (F) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateItemStatus(item.id, 'B')}
                    className={`flex h-9 w-10 items-center justify-center rounded-lg font-black text-xs transition-all ${
                      isGood
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                    title="Bueno / Conforme"
                  >
                    B
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateItemStatus(item.id, 'F')}
                    className={`flex h-9 w-10 items-center justify-center rounded-lg font-black text-xs transition-all ${
                      isFail
                        ? item.isCritical
                          ? 'bg-red-600 text-white shadow-xs animate-pulse-subtle'
                          : 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700'
                    }`}
                    title="Falla / Incidencia"
                  >
                    F
                  </button>
                </div>
              </div>

              {/* Notes and photo section if flagged as Falla */}
              {isFail && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-red-700 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Detalle de Incidencia
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onRequestPhotoUpload(`Evidencia de Falla: ${item.label}`, (url) => {
                          const existingNotes = item.notes || '';
                          onUpdateItemStatus(item.id, 'F', existingNotes);
                          item.photoUrl = url;
                        })
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 hover:text-amber-600"
                    >
                      <Camera className="h-3 w-3" />
                      {item.photoUrl ? 'Cambiar Foto' : 'Adjuntar Foto de Daño'}
                    </button>
                  </div>

                  {editingNoteId === item.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Describa el motivo de la falla..."
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveNote(item.id)}
                        className="rounded bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-amber-400"
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setEditingNoteId(item.id);
                        setNoteText(item.notes || '');
                      }}
                      className="cursor-pointer rounded bg-white/80 p-2 text-slate-700 hover:bg-white text-[11px] italic border border-slate-200 flex items-center justify-between"
                    >
                      <span>{item.notes || 'Haga clic para detallar observación técnica...'}</span>
                      <MessageSquare className="h-3 w-3 text-slate-400" />
                    </div>
                  )}

                  {item.photoUrl && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onViewPhoto(item.photoUrl!, `Falla: ${item.label}`)}
                        className="h-10 w-16 overflow-hidden rounded border border-red-300"
                      >
                        <img
                          src={item.photoUrl}
                          alt="Evidencia falla"
                          className="h-full w-full object-cover"
                        />
                      </button>
                      <span className="text-[11px] text-slate-600">Foto de daño adjunta</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
