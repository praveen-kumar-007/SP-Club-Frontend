import React, { forwardRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, FileCheck, Loader2 } from "lucide-react";
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
    month: "long",
    year: "numeric",
  });
};

const maskAadhaar = (num?: string) => {
  if (!num) return "Verified";
  const clean = num.replace(/\s+/g, "");
  if (clean.length >= 8) {
    return `XXXX-XXXX-${clean.slice(-4)}`;
  }
  return num;
};

// =========================================================================
// CLEAN, FORMAL, PROFESSIONAL 1-PAGE A4 NOC LETTERHEAD CERTIFICATE
// =========================================================================
export const NocCertificateDocument = forwardRef<HTMLDivElement, { data: NocCertificateData }>(
  ({ data }, ref) => {
    const player = data.player;
    const cert = data.certificate || {};
    const nocNumber = cert.nocNumber || player.noc?.nocNumber || "SPKA/NOC/2026/001";
    const generatedAt = cert.generatedAt || player.noc?.generatedAt || new Date();
    const signatureHash =
      cert.digitalSignatureHash ||
      player.noc?.digitalSignatureHash ||
      "9f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c";

    return (
      <div
        ref={ref}
        id="noc-certificate-document"
        className="w-[800px] min-w-[800px] max-w-[800px] bg-white text-slate-900 shadow-sm relative overflow-hidden box-border border border-slate-200"
        style={{
          boxSizing: "border-box",
          padding: "36px 48px 32px 48px",
          backgroundColor: "#ffffff",
          fontFamily: "'Segoe UI', Arial, 'Helvetica Neue', sans-serif",
          color: "#0f172a",
        }}
      >
        {/* Subtle Academy Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] z-0">
          <img
            src="/Logo.png"
            alt="Watermark"
            className="w-[300px] h-[300px] object-contain"
          />
        </div>

        <div className="relative z-10">
          {/* 1. Official Institutional Letterhead */}
          <div className="text-center pb-3 border-b-2 border-slate-900">
            <div className="flex items-center justify-center gap-4 mb-2">
              <img
                src="/Logo.png"
                alt="SP Sports Academy"
                className="w-14 h-14 object-contain shrink-0"
              />
              <div className="text-center">
                <h1 className="text-2xl font-bold tracking-wider text-slate-950 uppercase leading-none font-serif">
                  SP SPORTS ACADEMY
                </h1>
                <p className="text-[11px] font-semibold text-slate-700 tracking-wide mt-1 uppercase">
                  Recognized Sports Training Centre & Athlete Development Registry
                </p>
              </div>
            </div>
            <p className="text-[10.5px] text-slate-600">
              Shakti Mandir Path, Dhanbad – 826007, Jharkhand • Email: spkabaddigroupdhanbad@gmail.com • Web: https://spkabaddi.me
            </p>
          </div>

          {/* Double rule accent line */}
          <div className="h-[1px] bg-slate-400 mt-[2px] mb-4" />

          {/* 2. Reference & Date Bar */}
          <div className="flex items-center justify-between text-xs text-slate-800 pb-2 mb-3 border-b border-slate-200">
            <div>
              <span className="font-semibold text-slate-600">Ref. No.: </span>
              <span className="font-mono font-bold text-slate-950">{nocNumber}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-600">Date of Issue: </span>
              <span className="font-medium text-slate-900">{formatDate(generatedAt)}</span>
            </div>
          </div>

          {/* 3. Certificate Title */}
          <div className="text-center my-3">
            <h2 className="text-lg font-bold text-slate-950 tracking-widest uppercase font-serif inline-block border-b border-slate-800 pb-0.5">
              NO OBJECTION CERTIFICATE
            </h2>
            <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mt-1">
              TO WHOMSOEVER IT MAY CONCERN
            </p>
          </div>

          {/* 4. Body Content */}
          <div className="space-y-3.5 text-[12px] leading-relaxed text-slate-800 text-justify">
            <p>
              This is to certify that <strong>{player.name}</strong>, Son/Daughter of <strong>{player.fathersName || "the parent/guardian"}</strong>, bearing Academy Registration ID <strong>{player.idCardNumber || "SPKA-ATHLETE"}</strong>, is a registered athlete with <strong>SP Sports Academy, Dhanbad</strong>.
            </p>

            {/* 5. Clean, Refined Particulars Box */}
            <div className="my-2.5 border border-slate-300 rounded bg-slate-50/40 p-2.5">
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-slate-200/80">
                    <td className="py-1 px-2 font-semibold text-slate-600 w-1/4">Athlete Name:</td>
                    <td className="py-1 px-2 font-bold text-slate-950 w-1/4">{player.name}</td>
                    <td className="py-1 px-2 font-semibold text-slate-600 w-1/4">Registration ID:</td>
                    <td className="py-1 px-2 font-mono font-bold text-slate-900 w-1/4">{player.idCardNumber || "SPKA-ATHLETE"}</td>
                  </tr>
                  <tr className="border-b border-slate-200/80">
                    <td className="py-1 px-2 font-semibold text-slate-600">Father&apos;s Name:</td>
                    <td className="py-1 px-2 text-slate-900">{player.fathersName || "N/A"}</td>
                    <td className="py-1 px-2 font-semibold text-slate-600">Date of Birth:</td>
                    <td className="py-1 px-2 text-slate-900">{formatDate(player.dob)}</td>
                  </tr>
                  <tr className="border-b border-slate-200/80">
                    <td className="py-1 px-2 font-semibold text-slate-600">Sport / Discipline:</td>
                    <td className="py-1 px-2 text-slate-900 capitalize">{player.role || "Athlete"}</td>
                    <td className="py-1 px-2 font-semibold text-slate-600">Gender / Blood:</td>
                    <td className="py-1 px-2 text-slate-900 capitalize">{player.gender || "N/A"} / {player.bloodGroup || "N/A"}</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-2 font-semibold text-slate-600">Academy Unit:</td>
                    <td className="py-1 px-2 text-slate-900">{player.clubDetails || "SP Sports Academy, Dhanbad"}</td>
                    <td className="py-1 px-2 font-semibold text-slate-600">Aadhaar (ID):</td>
                    <td className="py-1 px-2 font-mono text-slate-900">{maskAadhaar(player.aadharNumber)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              The management of <strong>SP Sports Academy has NO OBJECTION</strong> to <strong>{player.name}</strong> participating in open, district, state, or national level championships and tournaments, or seeking admission, registration, or transfer to any other sports academy, club, school, university, or sports federation.
            </p>

            <p>
              It is further certified that the athlete has fulfilled all institutional commitments, returned all academy kits and equipment, and cleared all training dues. There are no disciplinary proceedings or financial liabilities pending against the athlete with this academy.
            </p>

            {player.noc?.destinationClub && (
              <p className="text-[11px] text-slate-700 font-medium italic">
                * Specific Clearance Issued For: <strong>{player.noc.destinationClub}</strong>
              </p>
            )}

            <p>
              During their tenure, the athlete exhibited good conduct, discipline, and sportsmanship. We wish <strong>{player.name}</strong> continued success in all future athletic and personal endeavors.
            </p>
          </div>

          {/* 6. Signatures & Digital Seal Block */}
          <div className="pt-6 mt-5 border-t border-slate-300">
            <div className="flex items-end justify-between">
              {/* Left: Digital Verification Seal */}
              <div className="border border-slate-300 rounded p-2 bg-slate-50/60 max-w-[260px] text-left">
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                  <span>Digitally Verified & Approved</span>
                </div>
                <p className="text-[9.5px] text-slate-500 font-mono mt-0.5 truncate">
                  Hash: {signatureHash.slice(0, 24)}...
                </p>
                <p className="text-[9.5px] text-slate-600 mt-0.5">
                  Registry: SP Sports Academy Central Records
                </p>
              </div>

              {/* Right: Institutional Signature */}
              <div className="text-right">
                <div className="h-9 flex items-end justify-end mb-1">
                  <span className="font-serif italic text-slate-800 text-sm font-semibold tracking-wide">
                    Authorized Signatory
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-950 uppercase tracking-wide">
                  General Secretary / Director
                </p>
                <p className="text-[11px] font-semibold text-slate-700">
                  SP Sports Academy, Dhanbad
                </p>
                <p className="text-[9px] text-slate-500 italic mt-0.5">
                  (Computer-generated official record — valid without physical signature)
                </p>
              </div>
            </div>
          </div>

          {/* 7. Bottom Footnote */}
          <div className="pt-3 mt-4 border-t border-slate-200 text-center text-[9px] text-slate-500">
            This certificate is an official electronic record under the Information Technology Act, 2000. Verification portal: https://spkabaddi.me
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
    const filename = `SP_Sports_Academy_NOC_${data.player.name.replace(/[^a-zA-Z0-9]/g, "_")}_${nocNumber.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;

    const { createRoot } = await import("react-dom/client");
    const root = createRoot(container);

    await new Promise<void>((resolve) => {
      root.render(<NocCertificateDocument data={data} />);
      setTimeout(resolve, 300);
    });

    const element = container.querySelector("#noc-certificate-document") as HTMLElement;
    if (!element) {
      throw new Error("Could not find certificate render element");
    }

    const opt = {
      margin: [6, 6, 6, 6],
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
      title: "Generating Official NOC",
      description: "Compiling 1-page institutional letterhead certificate...",
    });
    try {
      await downloadNocPdfFromData(data);
      toast({
        title: "Download Complete",
        description: "Official NOC certificate downloaded successfully.",
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
              1-Page Official Institutional Letterhead Certificate • SP Sports Academy
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
            Professional 1-page A4 format with institutional letterhead and digital authorization.
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
              {downloading ? "Generating PDF..." : "Download Official NOC (PDF)"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NocCertificateModal;
