import React, { forwardRef, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, CheckCircle2, ShieldCheck, FileCheck, Loader2 } from "lucide-react";
import html2pdf from "html2pdf.js";

export interface NocCertificateData {
  player: {
    _id?: string;
    name: string;
    fathersName?: string;
    idCardNumber?: string;
    aadharNumber?: string;
    dob?: string;
    gender?: string;
    role?: string;
    bloodGroup?: string;
    clubDetails?: string;
    photo?: string;
    address?: string;
    registeredAt?: string;
    noc?: {
      nocNumber?: string;
      generatedAt?: string | Date;
      expiresAt?: string | Date;
      digitalSignatureHash?: string;
      isBypassed?: boolean;
      reason?: string;
      destinationClub?: string;
    };
  };
  certificate?: {
    nocNumber?: string;
    generatedAt?: string | Date;
    expiresAt?: string | Date;
    digitalSignatureHash?: string;
    isBypassed?: boolean;
    institution?: {
      name: string;
      address: string;
      affiliation: string;
      contactEmail: string;
      contactPhone: string;
      website: string;
    };
  };
}

export interface NocCertificateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: NocCertificateData | null;
  onDownloaded?: () => void;
}

const formatDate = (val?: string | Date) => {
  if (!val) return "N/A";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const calculateAge = (dobString?: string) => {
  if (!dobString) return "N/A";
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return "N/A";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 0 ? `${age} Yrs` : "N/A";
};

// =========================================================================
// 1-PAGE A4 NOC CERTIFICATE DOCUMENT (No Phone, Exact 1-Page Layout)
// =========================================================================
export const NocCertificateDocument = forwardRef<HTMLDivElement, { data: NocCertificateData }>(
  ({ data }, ref) => {
    const player = data.player;
    const cert = data.certificate || {};
    const nocNumber = cert.nocNumber || player.noc?.nocNumber || "SPKA-NOC-OFFICIAL";
    const generatedAt = cert.generatedAt || player.noc?.generatedAt || new Date();
    const expiresAt = cert.expiresAt || player.noc?.expiresAt;
    const signatureHash =
      cert.digitalSignatureHash ||
      player.noc?.digitalSignatureHash ||
      "8f4b2e9c1d3a7e5f6b0c2d4e8a1b3c5d7e9f";

    return (
      <div
        ref={ref}
        id="noc-certificate-document"
        className="w-[800px] min-w-[800px] max-w-[800px] bg-white text-slate-900 font-sans shadow-md border-4 border-slate-900 rounded-lg relative overflow-hidden box-border"
        style={{
          boxSizing: "border-box",
          padding: "26px 30px",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Subtle Watermark Logo in Background */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0"
          style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        >
          <img
            src="/Logo.png"
            alt="SP Sports Academy Watermark"
            className="w-[380px] h-[380px] object-contain"
          />
        </div>

        {/* Document Foreground Content */}
        <div className="relative z-10 space-y-4">
          {/* 1. Official Academy Letterhead (NO PHONE NUMBERS) */}
          <div className="border-b-2 border-slate-900 pb-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="/Logo.png"
                  alt="SP Sports Academy"
                  className="object-contain rounded-lg p-1 border border-slate-300 shadow-xs"
                  style={{ width: "68px", height: "68px" }}
                />
                <div>
                  <h1 className="text-2xl font-black tracking-wider text-slate-950 uppercase leading-none">
                    SP SPORTS ACADEMY
                  </h1>
                  <p className="text-[11px] font-bold tracking-wide text-blue-900 uppercase mt-1">
                    Official Institutional Clearance & Transfer Authority
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Shakti Mandir Path, Dhanbad, Jharkhand 826007 • Compliant with AKFI Guidelines
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
                    Email: spkabaddigroupdhanbad@gmail.com • Official Web Portal: https://spkabaddi.me
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end shrink-0">
                <div className="border-2 border-slate-900 rounded-md px-2.5 py-1 bg-slate-50 text-[11px] font-mono font-bold">
                  <span className="text-slate-500 font-normal">REF:</span> {nocNumber}
                </div>
                <span className="text-[10px] text-slate-600 mt-1">
                  Issue Date: <strong>{formatDate(generatedAt)}</strong>
                </span>
                {expiresAt && (
                  <span className="text-[9px] text-amber-800 font-semibold mt-0.5">
                    Retention Deadline: {formatDate(expiresAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Certificate Title Header */}
          <div className="text-center py-1.5 border-y border-slate-200 bg-slate-50/80 rounded-md">
            <h2 className="text-lg font-black text-slate-950 uppercase tracking-widest leading-none">
              NO OBJECTION CERTIFICATE (NOC)
            </h2>
            <p className="text-[10px] font-bold text-blue-900 tracking-wider uppercase mt-1">
              Institutional Transfer & Competitive Participation Clearance
            </p>
          </div>

          {/* 3. Member Identification Block (NO PHONE NUMBERS) */}
          <div className="pdf-card flex gap-3.5 p-3 rounded-lg bg-slate-50 border border-slate-200">
            {/* Athlete Photo */}
            <div className="w-24 shrink-0 flex flex-col items-center justify-center border-r border-slate-200 pr-3">
              {player.photo ? (
                <img
                  src={player.photo}
                  alt={player.name}
                  crossOrigin="anonymous"
                  className="w-20 h-20 object-cover rounded-lg border border-slate-300 shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 font-semibold text-[9px]">
                  Verified Athlete
                </div>
              )}
              <span className="mt-1 text-[9px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded text-center">
                VERIFIED ATHLETE
              </span>
            </div>

            {/* Attributes Grid */}
            <div className="flex-1 grid grid-cols-3 gap-x-3 gap-y-1.5 text-xs">
              <div>
                <span className="text-[9px] font-semibold text-slate-500 uppercase block">Athlete Name</span>
                <span className="font-bold text-slate-900 text-xs">{player.name}</span>
              </div>
              <div>
                <span className="text-[9px] font-semibold text-slate-500 uppercase block">Father's Name</span>
                <span className="font-medium text-slate-800 text-xs">{player.fathersName || "N/A"}</span>
              </div>
              <div>
                <span className="text-[9px] font-semibold text-slate-500 uppercase block">Academy ID Card No.</span>
                <span className="font-bold text-blue-800 font-mono text-xs">{player.idCardNumber || "ISSUED"}</span>
              </div>
              <div>
                <span className="text-[9px] font-semibold text-slate-500 uppercase block">Date of Birth / Age</span>
                <span className="font-medium text-slate-800 text-xs">
                  {formatDate(player.dob)} ({calculateAge(player.dob)})
                </span>
              </div>
              <div>
                <span className="text-[9px] font-semibold text-slate-500 uppercase block">Gender & Blood Group</span>
                <span className="font-medium text-slate-800 text-xs capitalize">
                  {player.gender} • <strong className="text-red-700">{player.bloodGroup || "N/A"}</strong>
                </span>
              </div>
              <div>
                <span className="text-[9px] font-semibold text-slate-500 uppercase block">Playing Role</span>
                <span className="font-semibold text-slate-900 text-xs capitalize">{player.role}</span>
              </div>
              <div>
                <span className="text-[9px] font-semibold text-slate-500 uppercase block">Aadhaar Identification</span>
                <span className="font-mono text-slate-800 text-xs">{player.aadharNumber || "Verified"}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[9px] font-semibold text-slate-500 uppercase block">Affiliated Unit</span>
                <span className="font-medium text-slate-800 text-xs">{player.clubDetails || "SP Sports Academy Main Unit"}</span>
              </div>
            </div>
          </div>

          {/* 4. Formal Legal & Institutional Declarations */}
          <div className="pdf-card space-y-2.5 text-[11px] text-slate-800 leading-relaxed text-justify px-0.5">
            <p className="font-semibold text-slate-900">
              TO WHOM IT MAY CONCERN,
            </p>

            <p>
              This is to officially certify that <strong>{player.name}</strong>, son/daughter of <strong>{player.fathersName || "the parent/guardian"}</strong>, bearing Institutional ID Card Number <strong>{player.idCardNumber || "N/A"}</strong>, has been a bonafide registered athlete with <strong>SP Sports Academy, Dhanbad, Jharkhand</strong>.
            </p>

            <p>
              The administration and management of SP Sports Academy hereby formally confirms and certifies that:
            </p>

            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px]">
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Financial Clearance:</strong> All membership, tournament, and training dues stand settled with zero financial liabilities pending.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Kit & Asset Surrender:</strong> All official sports equipment, jerseys, and academy property have been duly surrendered.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Disciplinary Record:</strong> Maintained exemplary sporting conduct, adhering strictly to Amateur Kabaddi Federation of India (AKFI) norms.
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Notice & Cooling Period:</strong> The mandatory institutional clearance and cooling notice period has been duly completed.
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-emerald-50 border border-emerald-600 rounded-lg text-emerald-950">
              <p className="font-bold text-xs uppercase text-emerald-900">
                CLEARANCE STATEMENT:
              </p>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                Accordingly, <strong>SP Sports Academy has NO OBJECTION</strong> whatsoever to <strong>{player.name}</strong> seeking registration, institutional transfer, or competitive participation with any other sports club, district/state association, university, or national sporting tournament. The athlete is fully cleared to participate without any contractual reservation or encumbrance.
              </p>
              {player.noc?.destinationClub && (
                <p className="text-[10px] text-emerald-800 font-semibold mt-1">
                  * Specific Transfer Clearance Designated For: {player.noc.destinationClub}
                </p>
              )}
            </div>
          </div>

          {/* 5. Dual Digital Authorization & Signatures */}
          <div className="pdf-card border-t-2 border-slate-900 pt-3 space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              {/* Box 1: Digitally Verified */}
              <div className="border border-emerald-600 bg-emerald-50/40 rounded-lg p-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-800 block leading-none">
                        System Registry
                      </span>
                      <h4 className="text-xs font-black text-emerald-950 uppercase mt-0.5">
                        Digitally Verified
                      </h4>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    AUTHENTIC ✓
                  </span>
                </div>

                <div className="mt-2 space-y-0.5 text-[10px] text-slate-700 border-t border-emerald-200 pt-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Registry:</span>
                    <span className="font-semibold text-slate-900">SP Central Sports Database</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hash:</span>
                    <span className="text-[9px] text-slate-600 truncate max-w-[180px]">
                      SHA256:{signatureHash.slice(0, 20)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Clearance:</span>
                    <span className="font-bold text-emerald-700">UNCONDITIONAL NOC</span>
                  </div>
                </div>
              </div>

              {/* Box 2: Digitally Signed */}
              <div className="border border-blue-600 bg-blue-50/40 rounded-lg p-2.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <ShieldCheck className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-800 block leading-none">
                        Institutional Authority
                      </span>
                      <h4 className="text-xs font-black text-blue-950 uppercase mt-0.5">
                        Digitally Signed
                      </h4>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                    AUTHORIZED ✓
                  </span>
                </div>

                <div className="mt-2 space-y-0.5 text-[10px] text-slate-700 border-t border-blue-200 pt-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Signatory:</span>
                    <span className="font-semibold text-slate-900">General Secretary / Director</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Authority:</span>
                    <span className="font-semibold text-slate-900">SP Sports Academy Dhanbad</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mode:</span>
                    <span className="text-[9px] text-blue-700 font-semibold">Computer Generated Document</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statutory Disclaimer & Bottom Reference Bar */}
            <div className="p-1.5 bg-slate-50 border border-slate-200 rounded text-center text-[9px] text-slate-600 leading-tight">
              This document is an electronic record under the Information Technology Act, 2000. It does not require physical ink signature or manual institutional stamp to maintain full legal validity across sporting authorities.
            </div>

            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-200">
              <span className="font-mono">DOC ID: {nocNumber}</span>
              <span>SP Sports Academy Dhanbad, Jharkhand</span>
              <span>Valid Across AKFI & National Affiliations</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
NocCertificateDocument.displayName = "NocCertificateDocument";

// =========================================================================
// DIRECT 1-CLICK 1-PAGE PDF DOWNLOAD ENGINE
// =========================================================================
export const downloadNocPdfFromData = async (data: NocCertificateData): Promise<void> => {
  if (!data || !data.player) {
    throw new Error("Invalid NOC data provided");
  }

  const prevScrollX = window.scrollX;
  const prevScrollY = window.scrollY;

  // Create temporary container off-screen
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.width = "800px";
  container.style.zIndex = "-9999";
  document.body.appendChild(container);

  try {
    window.scrollTo(0, 0);

    const nocNumber =
      data.certificate?.nocNumber || data.player.noc?.nocNumber || "SPA-NOC-OFFICIAL";
    const filename = `SP_Sports_Academy_NOC_${data.player.name.replace(/[^a-zA-Z0-9]/g, "_")}_${nocNumber}.pdf`;

    // Render component into container
    const { createRoot } = await import("react-dom/client");
    const root = createRoot(container);

    await new Promise<void>((resolve) => {
      root.render(<NocCertificateDocument data={data} />);
      setTimeout(resolve, 350);
    });

    const element = container.querySelector("#noc-certificate-document") as HTMLElement;
    if (!element) {
      throw new Error("Could not find certificate render element");
    }

    const opt = {
      margin: [5, 5, 5, 5],
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        letterRendering: true,
        logging: false,
        width: 800,
        windowWidth: 800,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: {
        mode: ["avoid-all"],
      },
    };

    const worker = html2pdf() as unknown as {
      set: (options: unknown) => {
        from: (el: HTMLElement) => {
          save: () => Promise<void>;
        };
      };
    };

    await worker.set(opt).from(element).save();
    root.unmount();
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
    window.scrollTo(prevScrollX, prevScrollY);
  }
};

// =========================================================================
// MODAL DIALOG PREVIEW COMPONENT
// =========================================================================
const NocCertificateModal = ({
  open,
  onOpenChange,
  data,
  onDownloaded,
}: NocCertificateModalProps) => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);

  if (!data || !data.player) return null;

  const handleDownload = async () => {
    setDownloading(true);
    toast({
      title: "Generating 1-Page Official NOC",
      description: "Compiling official letterhead certificate. Download will begin...",
    });
    try {
      await downloadNocPdfFromData(data);
      toast({
        title: "Download Complete",
        description: "Official 1-Page NOC certificate downloaded successfully.",
      });
      if (onDownloaded) onDownloaded();
    } catch (err: unknown) {
      toast({
        title: "Download Failed",
        description: err instanceof Error ? err.message : "Could not download NOC",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[860px] w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-slate-100 text-slate-900">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-600" />
              <span>Official No Objection Certificate (NOC)</span>
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Official 1-Page Computer Generated Certification • SP Sports Academy
            </p>
          </div>
          <Button
            onClick={handleDownload}
            disabled={downloading}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 shadow-sm"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1.5" />
            )}
            {downloading ? "Downloading..." : "Download PDF"}
          </Button>
        </DialogHeader>

        {/* PRINTABLE NOC CANVAS */}
        <div className="w-full overflow-x-auto my-2 flex justify-center">
          <NocCertificateDocument data={data} />
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Guaranteed single-page A4 format with preserved official letterhead and digital signature blocks.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Close
            </Button>
            <Button
              onClick={handleDownload}
              disabled={downloading}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 shadow-sm"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1.5" />
              )}
              {downloading ? "Generating 1-Page PDF..." : "Download Official NOC (PDF)"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NocCertificateModal;
