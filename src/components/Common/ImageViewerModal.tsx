import React from 'react';
import { X, ZoomIn, Download, MapPin, Clock, ShieldCheck } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
  metadata?: {
    timestamp?: string;
    location?: string;
    verified?: boolean;
    additionalNote?: string;
  };
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
  metadata,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-slate-900 border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-900/90 text-white">
          <div className="space-y-0.5">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <ZoomIn className="h-4 w-4 text-amber-400" />
              {title}
            </h3>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image Preview Container */}
        <div className="relative flex-1 overflow-auto bg-black p-4 flex items-center justify-center min-h-[360px] max-h-[65vh]">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-full max-w-full rounded object-contain shadow-lg"
          />

          {/* Watermark badge overlay */}
          <div className="absolute bottom-6 left-6 rounded bg-slate-950/85 px-3 py-1.5 text-[11px] font-mono text-slate-300 backdrop-blur-xs border border-slate-700/60">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-400">TRANSCONTROL 360</span>
              <span className="text-slate-500">|</span>
              <span>EVIDENCIA CERTIFICADA</span>
            </div>
            {metadata?.timestamp && <div className="text-slate-400">FECHA/HORA: {metadata.timestamp}</div>}
          </div>
        </div>

        {/* Footer with Metadata */}
        <div className="border-t border-slate-800 bg-slate-900 px-5 py-3 text-slate-300 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            {metadata?.timestamp && (
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                {metadata.timestamp}
              </span>
            )}
            {metadata?.location && (
              <span className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                {metadata.location}
              </span>
            )}
            {metadata?.verified && (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                Sello / POD Verificado
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Abrir Original
            </a>
            <button
              onClick={onClose}
              className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
            >
              Cerrar Visor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
