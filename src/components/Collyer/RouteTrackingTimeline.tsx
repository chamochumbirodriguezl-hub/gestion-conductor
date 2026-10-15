import React from 'react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Navigation,
  Camera,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { RouteItineraryPoint, TrackingPointStatus, TransportService } from '../../types';

interface RouteTrackingTimelineProps {
  currentService: TransportService;
  onUpdatePointStatus?: (pointId: string, status: TrackingPointStatus) => void;
  onViewPhoto?: (url: string, title: string) => void;
  onCapturePointPhoto?: (point: RouteItineraryPoint) => void;
  onSelectStage?: (stageId: number) => void;
}

export const RouteTrackingTimeline: React.FC<RouteTrackingTimelineProps> = ({
  currentService,
  onUpdatePointStatus,
  onViewPhoto,
  onCapturePointPhoto,
  onSelectStage,
}) => {
  const itinerary = currentService.itinerary || [];
  const scheduledTime = currentService.scheduledDepartureTime || '07:00 AM';

  const completedCount = itinerary.filter((p) => p.status === 'completado').length;
  const totalCount = itinerary.length;

  return (
    <div className="rounded-3xl border-2 border-slate-800 bg-slate-900/95 p-4 sm:p-5 text-white shadow-xl space-y-4">
      {/* 1. Header with Scheduled Departure Time Highlight */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-extrabold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
              MINI-TRACKING DE RUTA
            </span>
            <span className="text-xs font-mono text-slate-400">
              {currentService.orderNumber || currentService.serviceCode}
            </span>
          </div>
          <h3 className="text-base font-black text-white mt-0.5 flex items-center gap-1.5">
            <Navigation className="h-4 w-4 text-sky-400" />
            <span>Itinerario y Puntos de Control</span>
          </h3>
        </div>

        {/* Big Scheduled Departure Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-2 border-amber-400/80 rounded-2xl px-3.5 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-black shrink-0 shadow">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase font-bold text-amber-300 block leading-none">
              SALIDA PROGRAMADA
            </span>
            <span className="text-base font-black font-mono text-white tracking-wide">
              {scheduledTime}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Quick Progress Summary Bar */}
      <div className="flex items-center justify-between text-xs font-mono bg-slate-950/80 rounded-xl px-3 py-2 border border-slate-800/80">
        <span className="text-slate-300 font-bold">Avance de Ruta:</span>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold">
            {completedCount} de {totalCount} puntos completados
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black border border-emerald-500/30">
            {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* 3. The Interactive Itinerary Timeline */}
      <div className="space-y-3 relative">
        {itinerary.map((point, index) => {
          const isCompleted = point.status === 'completado';
          const isInTransit = point.status === 'en_transito';
          const isPending = point.status === 'pendiente';
          const isLast = index === itinerary.length - 1;

          return (
            <div key={point.id} className="relative flex items-start gap-3.5 group">
              {/* Vertical connector line */}
              {!isLast && (
                <div
                  className={`absolute left-[19px] top-9 w-0.5 h-[calc(100%+12px)] z-0 transition-colors ${
                    isCompleted ? 'bg-emerald-500' : isInTransit ? 'bg-sky-400/60' : 'bg-slate-800'
                  }`}
                />
              )}

              {/* Status Indicator Icon */}
              <div className="relative z-10 shrink-0 mt-0.5">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl border-2 font-black text-sm shadow-md transition-all ${
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950 ring-2 ring-emerald-500/30'
                      : isInTransit
                      ? 'bg-sky-500 border-sky-400 text-slate-950 animate-pulse ring-2 ring-sky-400/50'
                      : 'bg-slate-950 border-slate-700 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : isInTransit ? (
                    <Navigation className="h-5 w-5" />
                  ) : (
                    <span>{point.order}</span>
                  )}
                </div>
              </div>

              {/* Point Card Content */}
              <div
                className={`flex-1 min-w-0 rounded-2xl border p-3.5 space-y-2 transition-all ${
                  isInTransit
                    ? 'border-sky-400/80 bg-gradient-to-r from-slate-950 via-slate-950 to-sky-950/40 shadow-lg'
                    : isCompleted
                    ? 'border-emerald-500/50 bg-slate-950/70'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400'
                }`}
              >
                {/* Header: Label, Type & Scheduled Time */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                        point.type === 'origen'
                          ? 'bg-purple-950 text-purple-300 border border-purple-500/40'
                          : point.type === 'intermedio'
                          ? 'bg-blue-950 text-blue-300 border border-blue-500/40'
                          : point.type === 'destino'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {point.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="h-3 w-3 text-slate-400" />
                    <span className="text-slate-300 font-semibold">{point.scheduledTime}</span>
                  </div>
                </div>

                {/* Point Name and Location */}
                <div>
                  <h4 className="text-sm font-extrabold text-white leading-tight">
                    {point.name}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <MapPin className="h-3 w-3 text-red-400 shrink-0" />
                    <span className="truncate">{point.address}</span>
                  </div>
                </div>

                {/* Status Badge & Actions */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 flex-wrap">
                  {/* Status Chip */}
                  <div>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        Completado {point.completedAt ? `(${point.completedAt})` : ''}
                      </span>
                    ) : isInTransit ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/20 border border-sky-400 px-2.5 py-0.5 text-[11px] font-bold text-sky-300 animate-pulse">
                        <Navigation className="h-3 w-3" />
                        En Tránsito
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 border border-slate-700 px-2.5 py-0.5 text-[11px] font-bold text-slate-400">
                        <Clock className="h-3 w-3 text-amber-400" />
                        Pendiente
                      </span>
                    )}
                  </div>

                  {/* Tactile Action Buttons */}
                  <div className="flex items-center gap-2">
                    {point.photoUrl && onViewPhoto && (
                      <button
                        type="button"
                        onClick={() => onViewPhoto(point.photoUrl!, point.name)}
                        className="inline-flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-xs font-bold text-amber-400 border border-slate-700 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Ver Foto</span>
                      </button>
                    )}

                    {isPending && onUpdatePointStatus && (
                      <button
                        type="button"
                        onClick={() => onUpdatePointStatus(point.id, 'en_transito')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 px-3 py-1 text-xs font-black shadow-sm transition-all active:scale-95"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        <span>Iniciar Rumbo</span>
                      </button>
                    )}

                    {isInTransit && onCapturePointPhoto && (
                      <button
                        type="button"
                        onClick={() => onCapturePointPhoto(point)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-3 py-1 text-xs font-black shadow-sm transition-all active:scale-95"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Llegada con Foto</span>
                      </button>
                    )}

                    {point.linkedStageId && onSelectStage && (
                      <button
                        type="button"
                        onClick={() => onSelectStage(point.linkedStageId!)}
                        className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:underline font-bold"
                        title="Ir a la cámara de este paso"
                      >
                        <span>Ir a Paso {point.linkedStageId}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
