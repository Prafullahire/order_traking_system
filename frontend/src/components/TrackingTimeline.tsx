'use client';

import React from 'react';
import { OrderStatus, OrderTracking } from '../lib/types';
import { formatDate, ORDER_LIFECYCLE_STEPS, ORDER_STATUS_CONFIG } from '../lib/utils';
import {
  Clock,
  CheckCircle2,
  Package,
  Truck,
  Send,
  CheckCheck,
  XCircle,
  MapPin,
  Calendar,
} from 'lucide-react';

interface TrackingTimelineProps {
  currentStatus: OrderStatus;
  trackingHistory: OrderTracking[];
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  currentStatus,
  trackingHistory = [],
}) => {
  const isCancelled = currentStatus === 'CANCELLED';
  const currentStepIndex = ORDER_STATUS_CONFIG[currentStatus]?.stepIndex ?? 0;

  const getStepIcon = (status: OrderStatus, isComplete: boolean, isCurrent: boolean) => {
    const iconClass = 'w-5 h-5';
    switch (status) {
      case 'PENDING':
        return <Clock className={iconClass} />;
      case 'CONFIRMED':
        return <CheckCircle2 className={iconClass} />;
      case 'PROCESSING':
        return <Package className={iconClass} />;
      case 'SHIPPED':
        return <Truck className={iconClass} />;
      case 'OUT_FOR_DELIVERY':
        return <Send className={iconClass} />;
      case 'DELIVERED':
        return <CheckCheck className={iconClass} />;
      default:
        return <Package className={iconClass} />;
    }
  };

  return (
    <div className="space-y-10">
      {/* Milestone Progress Bar (for active non-cancelled orders) */}
      {!isCancelled ? (
        <div className="relative py-6 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="hidden md:flex items-center justify-between relative z-10">
            {/* Progress bar background line */}
            <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1.5 bg-slate-100 dark:bg-slate-800 -z-10 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${(Math.min(currentStepIndex, 5) / 5) * 100}%`,
                }}
              />
            </div>

            {ORDER_LIFECYCLE_STEPS.map((step, idx) => {
              const isComplete = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isPending = idx > currentStepIndex;
              const config = ORDER_STATUS_CONFIG[step];

              return (
                <div key={step} className="flex flex-col items-center group">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isComplete
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                        : isCurrent
                        ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950/60 shadow-lg shadow-brand-500/30 scale-110 animate-pulse'
                        : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    {getStepIcon(step, isComplete, isCurrent)}
                  </div>
                  <span
                    className={`mt-3 text-xs font-semibold text-center transition ${
                      isCurrent
                        ? 'text-brand-600 dark:text-brand-400 font-bold'
                        : isComplete
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile Step Carousel/List */}
          <div className="md:hidden space-y-3">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">
              Progress Checklist
            </p>
            {ORDER_LIFECYCLE_STEPS.map((step, idx) => {
              const isComplete = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const config = ORDER_STATUS_CONFIG[step];

              return (
                <div
                  key={step}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition ${
                    isCurrent
                      ? 'bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800/50'
                      : isComplete
                      ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      : 'text-slate-400 dark:text-slate-600 opacity-60'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isComplete
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {getStepIcon(step, isComplete, isCurrent)}
                  </div>
                  <div>
                    <p className="text-xs font-bold">{config.label}</p>
                    <p className="text-[11px] text-slate-500">{config.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <XCircle className="w-7 h-7" />
          </div>
          <div>
            <h4 className="text-base font-bold text-rose-900 dark:text-rose-200">
              Order Has Been Cancelled
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
              This order was terminated. Inventory reserved for this order has been restocked.
            </p>
          </div>
        </div>
      )}

      {/* Chronological Checkpoint Logs */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Tracking Checkpoint History</span>
            <span className="text-xs px-2.5 py-0.5 font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
              {trackingHistory.length} logs
            </span>
          </h3>
        </div>

        {trackingHistory.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
            No tracking events recorded yet. Updates will appear here in real time.
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {trackingHistory.map((item, index) => {
              const isFirst = index === 0;
              const config = ORDER_STATUS_CONFIG[item.status] || {
                label: item.status,
                dotClass: 'bg-slate-400',
              };

              return (
                <div key={item.id || index} className="relative group">
                  {/* Timeline node marker */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all ${
                      isFirst
                        ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950/60 shadow-md'
                        : 'bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${isFirst ? 'bg-white' : config.dotClass}`} />
                  </div>

                  {/* Log Content Card */}
                  <div
                    className={`p-5 rounded-2xl border transition-all duration-200 ${
                      isFirst
                        ? 'bg-white dark:bg-slate-900 border-brand-200 dark:border-brand-800/60 shadow-md'
                        : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border ${
                            ORDER_STATUS_CONFIG[item.status]?.badgeClass || 'bg-slate-100'
                          }`}
                        >
                          {config.label}
                        </span>
                        {isFirst && (
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded-md border border-brand-200 dark:border-brand-800/40">
                            Latest Milestone
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-2">
                      {item.message}
                    </p>

                    {item.location && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingTimeline;
