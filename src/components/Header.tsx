import React from 'react';
import { Truck, ShieldCheck, BarChart3, Receipt, PlusCircle, Smartphone } from 'lucide-react';

export type ActiveModule = 'driver' | 'control_tower' | 'billing';

interface HeaderProps {
  activeModule: ActiveModule;
  onChangeModule: (module: ActiveModule) => void;
  pendingBillingCount: number;
  criticalAlertCount: number;
  onOpenNewServiceModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  onChangeModule,
  pendingBillingCount,
  criticalAlertCount,
  onOpenNewServiceModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950 text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 py-3">
        {/* Zone 1: Brand Wordmark (Single element) */}
        <div
          onClick={() => onChangeModule('driver')}
          className="flex cursor-pointer items-center gap-2.5 whitespace-nowrap shrink-0"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-slate-950 font-black">
            <Truck className="h-5 w-5" />
          </div>
          <span className="text-base sm:text-lg font-black tracking-tight text-white">
            TRANSCONTROL <span className="text-amber-400">360</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links (Single-line, 4 items) */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-300">
          <button
            type="button"
            onClick={() => onChangeModule('driver')}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeModule === 'driver'
                ? 'text-amber-400 border-b-2 border-amber-400 font-bold'
                : 'hover:text-white'
            }`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Vista Conductor Móvil</span>
          </button>

          <button
            type="button"
            onClick={() => onChangeModule('control_tower')}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeModule === 'control_tower'
                ? 'text-amber-400 border-b-2 border-amber-400 font-bold'
                : 'hover:text-white'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Torre de Control</span>
            {criticalAlertCount > 0 && (
              <span className="rounded-full bg-red-600 px-1.5 py-0.2 text-[10px] font-mono text-white">
                {criticalAlertCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangeModule('billing')}
            className={`flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeModule === 'billing'
                ? 'text-amber-400 border-b-2 border-amber-400 font-bold'
                : 'hover:text-white'
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>Liquidación y Facturación</span>
            {pendingBillingCount > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 py-0.2 text-[10px] font-mono text-slate-950 font-bold">
                {pendingBillingCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenNewServiceModal}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors shadow-xs whitespace-nowrap shrink-0"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Nuevo Despacho</span>
          </button>
        </div>
      </div>

      {/* Mobile Bar below md */}
      <div className="flex md:hidden border-t border-slate-800 bg-slate-900 px-4 py-2 justify-around text-xs font-medium">
        <button
          type="button"
          onClick={() => onChangeModule('driver')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded ${
            activeModule === 'driver' ? 'text-amber-400 font-bold bg-slate-800' : 'text-slate-400'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          <span>Conductor</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeModule('control_tower')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded ${
            activeModule === 'control_tower' ? 'text-amber-400 font-bold bg-slate-800' : 'text-slate-400'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Torre</span>
          {criticalAlertCount > 0 && (
            <span className="rounded-full bg-red-600 px-1 py-0.1 text-[9px] text-white">
              {criticalAlertCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onChangeModule('billing')}
          className={`flex items-center gap-1.5 px-2 py-1 rounded ${
            activeModule === 'billing' ? 'text-amber-400 font-bold bg-slate-800' : 'text-slate-400'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Liquidación</span>
          {pendingBillingCount > 0 && (
            <span className="rounded-full bg-amber-500 px-1 py-0.1 text-[9px] text-slate-950 font-bold">
              {pendingBillingCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
