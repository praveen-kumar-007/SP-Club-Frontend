import { useState, useEffect, useMemo } from "react";
import { Clock, ShieldAlert, Zap, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export interface NocCountdownBannerProps {
  noc?: {
    coolingEndsAt?: string | Date;
    appliedAt?: string | Date;
    reason?: string;
    destinationClub?: string;
  };
  coolingEndsAt?: string | Date;
  appliedAt?: string | Date;
  playerName?: string;
  onTimerComplete?: () => void;
  onComplete?: () => void;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  onBypassClick?: () => void;
  onCancelClick?: () => void;
  reason?: string;
  destinationClub?: string;
  isBypassing?: boolean;
}

interface TimeRemaining {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

export const calculateNocTimeRemaining = (targetDate: string | Date): TimeRemaining => {
  const targetMs = new Date(targetDate).getTime();
  const nowMs = Date.now();
  const totalMs = targetMs - nowMs;

  if (totalMs <= 0 || isNaN(totalMs)) {
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
  }

  const seconds = Math.floor((totalMs / 1000) % 60);
  const minutes = Math.floor((totalMs / (1000 * 60)) % 60);
  const hours = Math.floor((totalMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));

  return { totalMs, days, hours, minutes, seconds, isComplete: false };
};

const NocCountdownBanner = ({
  noc,
  coolingEndsAt: propCoolingEndsAt,
  appliedAt: propAppliedAt,
  playerName,
  onTimerComplete,
  onComplete,
  isAdmin = false,
  isSuperAdmin = false,
  onBypassClick,
  onCancelClick,
  reason: propReason,
  destinationClub: propDestinationClub,
  isBypassing = false,
}: NocCountdownBannerProps) => {
  const coolingEndsAt = useMemo(() => {
    return noc?.coolingEndsAt || propCoolingEndsAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  }, [noc?.coolingEndsAt, propCoolingEndsAt]);
  const appliedAt = noc?.appliedAt || propAppliedAt;
  const reason = noc?.reason || propReason;
  const destinationClub = noc?.destinationClub || propDestinationClub;
  const notifyComplete = onComplete || onTimerComplete;

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateNocTimeRemaining(coolingEndsAt)
  );
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    // Ticking every 1000ms (1 second)
    const interval = setInterval(() => {
      const updated = calculateNocTimeRemaining(coolingEndsAt);
      setTimeRemaining(updated);

      if (updated.isComplete) {
        clearInterval(interval);
        if (notifyComplete) {
          notifyComplete();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [coolingEndsAt, notifyComplete]);

  // Calculate elapsed percentage of the 14 days
  const progressPercent = useMemo(() => {
    if (!appliedAt) return 0;
    const startMs = new Date(appliedAt).getTime();
    const endMs = new Date(coolingEndsAt).getTime();
    const nowMs = Date.now();

    if (nowMs >= endMs) return 100;
    if (nowMs <= startMs) return 0;

    const totalDuration = endMs - startMs;
    const elapsed = nowMs - startMs;
    return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
  }, [appliedAt, coolingEndsAt]);

  const targetDateLabel = useMemo(() => {
    try {
      return new Date(coolingEndsAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "14 Days from Application";
    }
  }, [coolingEndsAt]);

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-500/10 via-amber-50 to-orange-50/70 p-5 sm:p-6 shadow-md">
      {/* Background Institutional Accent */}
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-amber-200/30 blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-amber-200/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm ring-4 ring-amber-100">
              <Clock className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black tracking-wider uppercase bg-amber-200 text-amber-900">
                  Institutional Cooling Period
                </span>
                <span className="text-[11px] font-bold text-slate-500">14-Day Mandatory Notice</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
                No Objection Certificate (NOC) Processing Countdown
              </h3>
            </div>
          </div>

          {/* Terms & Conditions Modal Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 border-amber-300 bg-white/90 text-amber-900 hover:bg-amber-100 text-xs font-semibold shadow-xs"
                >
                  <FileText className="h-3.5 w-3.5 mr-1 text-amber-600" />
                  NOC Terms & Guidelines
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md sm:max-w-lg bg-white text-slate-900">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
                    <ShieldAlert className="h-5 w-5 text-amber-600" />
                    SP Sports Academy — NOC Institutional Guidelines
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 max-h-[60vh] overflow-y-auto pr-1">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 font-medium leading-relaxed">
                    Under standard SP Sports Academy and Amateur Kabaddi Federation of India (AKFI) regulations, a mandatory <strong>14-day institutional cooling period</strong> applies to all official No Objection Certificate (NOC) requests.
                  </div>

                  <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                    Clearance Obligations During 14-Day Period:
                  </h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
                    <li>
                      <strong>Dues & Fee Settlement:</strong> All monthly training fees, tournament contributions, and academy club dues must be fully cleared.
                    </li>
                    <li>
                      <strong>Equipment & Kit Surrender:</strong> Academy equipment, official jerseys, and inventory allocated must be surrendered to the equipment manager.
                    </li>
                    <li>
                      <strong>Disciplinary Clearance:</strong> Verification of zero active disciplinary actions or contractual tournament commitments.
                    </li>
                    <li>
                      <strong>Automated Issuance:</strong> Once the 14-day countdown completes, the official computer-generated NOC with institutional letterhead and cryptographic hash will unlock immediately.
                    </li>
                    <li>
                      <strong>Post-Issuance Download Window:</strong> The member receives a 14-day window to download their official certificate and dossiers before profile credentials are automatically archived.
                    </li>
                  </ul>

                  <div className="p-3 bg-slate-100 rounded-lg text-slate-500 text-xs flex items-center justify-between">
                    <span>Authorized by SP Sports Academy Authority</span>
                    <a
                      href="https://spkabaddi.me/terms"
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                    >
                      General Terms <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowTermsModal(false)} size="sm" className="bg-slate-900 text-white">
                    Understood & Acknowledged
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Admin Cancel NOC Button */}
            {isAdmin && onCancelClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelClick}
                className="h-8 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Cancel NOC
              </Button>
            )}
          </div>
        </div>

        {/* Reason / Destination Callout (If Present) */}
        {(reason || destinationClub) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700 bg-white/70 px-3 py-1.5 rounded-lg border border-amber-200/60">
            {destinationClub && (
              <span>
                <strong className="text-slate-900">Destination:</strong> {destinationClub}
              </span>
            )}
            {reason && (
              <span>
                <strong className="text-slate-900">Application Reason:</strong> {reason}
              </span>
            )}
          </div>
        )}

        {/* Live Second-by-Second Countdown Display Grid */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
          {/* Days */}
          <div className="bg-white rounded-xl border border-amber-200 p-2.5 sm:p-3 shadow-xs">
            <span className="block text-2xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
              {String(timeRemaining.days).padStart(2, "0")}
            </span>
            <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800 mt-0.5">
              Days
            </span>
          </div>

          {/* Hours */}
          <div className="bg-white rounded-xl border border-amber-200 p-2.5 sm:p-3 shadow-xs">
            <span className="block text-2xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
              {String(timeRemaining.hours).padStart(2, "0")}
            </span>
            <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800 mt-0.5">
              Hours
            </span>
          </div>

          {/* Minutes */}
          <div className="bg-white rounded-xl border border-amber-200 p-2.5 sm:p-3 shadow-xs">
            <span className="block text-2xl sm:text-4xl font-black text-slate-900 font-mono tracking-tight">
              {String(timeRemaining.minutes).padStart(2, "0")}
            </span>
            <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800 mt-0.5">
              Minutes
            </span>
          </div>

          {/* Seconds (Tick Animation) */}
          <div className="bg-white rounded-xl border border-amber-300 p-2.5 sm:p-3 shadow-xs ring-2 ring-amber-300/40">
            <span className="block text-2xl sm:text-4xl font-black text-amber-600 font-mono tracking-tight animate-pulse">
              {String(timeRemaining.seconds).padStart(2, "0")}
            </span>
            <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800 mt-0.5">
              Seconds
            </span>
          </div>
        </div>

        {/* Progress Bar & ETA Indicator */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
            <span>Progress: {progressPercent}% of 14 days elapsed</span>
            <span>NOC Unlock Date: <strong>{targetDateLabel}</strong></span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-amber-200/80">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Super Admin Instant Bypass Special Action Button */}
        {isSuperAdmin && onBypassClick && (
          <div className="pt-2 border-t border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/60 p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-600 fill-emerald-600" />
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Super Admin Expedited Clearance Override
                </p>
                <p className="text-[11px] text-slate-500">
                  Bypass the remaining {timeRemaining.days}d {timeRemaining.hours}h and generate the official NOC immediately.
                </p>
              </div>
            </div>

            <Button
              onClick={onBypassClick}
              disabled={isBypassing}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 shadow-sm shrink-0"
            >
              <Zap className="h-3.5 w-3.5 mr-1 fill-white" />
              {isBypassing ? "Generating Instant NOC..." : "⚡ Generate NOC Instantly (Bypass Timer)"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NocCountdownBanner;
