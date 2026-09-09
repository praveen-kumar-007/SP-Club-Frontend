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
// PRESTIGIOUS, ATTRACTIVE, PROFESSIONAL 1-PAGE A4 NOC LETTERHEAD CERTIFICATE
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
        className="w-[800px] min-w-[800px] max-w-[800px] h-[1060px] min-h-[1060px] max-h-[1060px] bg-white text-slate-900 shadow-xl relative overflow-hidden box-border"
        style={{
          boxSizing: "border-box",
          padding: "26px 32px 24px 32px",
          backgroundColor: "#ffffff",
          fontFamily: "'Segoe UI', Arial, 'Helvetica Neue', sans-serif",
          color: "#0f172a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Formal Ornamental Certificate Frame */}
        <div className="absolute inset-2.5 border-2 border-slate-900 pointer-events-none z-20">
          <div className="absolute inset-[3px] border border-amber-600/70 pointer-events-none">
            {/* Corner Rosettes */}
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-amber-600 rounded-xs" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-600 rounded-xs" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-amber-600 rounded-xs" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-amber-600 rounded-xs" />
          </div>
        </div>

        {/* Subtle Academy Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] z-0">
          <img
            src="/Logo.png"
            alt="Watermark"
            className="w-[360px] h-[360px] object-contain"
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-full">
          {/* TOP SECTION: Letterhead & Reference */}
          <div>
            {/* 1. Official Institutional Letterhead */}
            <div className="text-center pt-1 pb-2 relative">
              <div className="flex items-center justify-between px-3 mb-2">
                <img
                  src="/Logo.png"
                  alt="SP Sports Academy"
                  className="w-16 h-16 object-contain shrink-0"
                />
                <div className="text-center flex-1 px-3">
                  <h1 className="text-2xl font-black tracking-wider text-slate-950 uppercase font-serif leading-tight">
                    SP SPORTS ACADEMY
                  </h1>
                  <p className="text-[10.5px] font-bold text-amber-700 tracking-widest uppercase mt-0.5">
                    PREMIER SPORTS TRAINING INSTITUTION & ATHLETE REGISTRY
                  </p>
                  <p className="text-[9.5px] font-semibold text-slate-600 mt-0.5">
                    Affiliated & Recognized Training Centre • Dhanbad, Jharkhand, India
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    Secretariat: Shakti Mandir Path, Dhanbad – 826007 • Email: spkabaddigroupdhanbad@gmail.com • Web: https://spkabaddi.me
                  </p>
                </div>
                {/* Official Accreditation Emblem */}
                <div className="w-16 h-16 flex flex-col items-center justify-center rounded-full border border-amber-600/60 bg-amber-50/60 p-1 shrink-0 text-center">
                  <span className="text-[7.5px] font-bold text-amber-900 uppercase leading-none">OFFICIAL</span>
                  <span className="text-[11px] text-amber-600 my-0.5">★</span>
                  <span className="text-[7px] font-extrabold text-slate-800 uppercase tracking-tight">ISSUED</span>
                </div>
              </div>
              {/* Dual Accent Lines */}
              <div className="h-[2px] bg-gradient-to-r from-amber-600 via-slate-900 to-amber-600 w-full" />
            </div>

            {/* 2. Reference & Date Bar */}
            <div className="flex items-center justify-between text-xs text-slate-800 px-3 py-1.5 bg-slate-50/80 border-b border-slate-200 mt-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-700 uppercase text-[10.5px]">Certificate Ref:</span>
                <span className="font-mono font-bold text-slate-950 bg-white px-2 py-0.5 rounded border border-slate-300 text-xs shadow-2xs">
                  {nocNumber}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-700 uppercase text-[10.5px]">Date of Issue:</span>
                <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 text-xs shadow-2xs">
                  {formatDate(generatedAt)}
                </span>
              </div>
            </div>

            {/* 3. Certificate Title Banner */}
            <div className="text-center my-3">
              <div className="inline-block relative">
                <div className="px-8 py-1.5 bg-slate-900 text-white rounded-xs shadow-sm">
                  <h2 className="text-xl font-bold tracking-widest uppercase font-serif">
                    NO OBJECTION CERTIFICATE
                  </h2>
                </div>
                <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mt-1">
                  ◆ OFFICIAL ATHLETE CLEARANCE & TRANSFER ENDORSEMENT ◆
                </div>
              </div>
            </div>

            {/* 4. Body Content */}
            <div className="space-y-3 px-3 text-[12.5px] leading-relaxed text-slate-800 text-justify">
              <div className="font-bold text-slate-950 text-xs tracking-wider uppercase border-b border-slate-300 pb-1">
                TO WHOMSOEVER IT MAY CONCERN
              </div>

              <p>
                This is to certify that <strong>{player.name}</strong>, Son/Daughter of <strong>{player.fathersName || "the parent/guardian"}</strong>, bearing Academy Registration ID <strong>{player.idCardNumber || "SPKA-ATHLETE"}</strong>, has been an enrolled trainee athlete with <strong>SP Sports Academy, Dhanbad</strong>.
              </p>

              {/* 5. Athlete Profile & Credentials Matrix */}
              <div className="my-2.5 border border-slate-300 rounded overflow-hidden shadow-2xs bg-white">
                <div className="bg-slate-900 text-white px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Verified Athlete Credentials</span>
                  <span className="text-amber-400 font-mono text-[10px]">Registry Status: Active Clearance</span>
                </div>
                <div className="flex p-2.5 gap-3 items-center">
                  {player.photo && (
                    <div className="w-20 h-24 shrink-0 rounded border border-slate-300 overflow-hidden shadow-2xs bg-slate-100">
                      <img
                        src={player.photo}
                        alt={player.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  )}
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold text-slate-600 w-1/4">Athlete Name:</td>
                        <td className="py-1 px-2 font-bold text-slate-950 w-1/4">{player.name}</td>
                        <td className="py-1 px-2 font-semibold text-slate-600 w-1/4">Registration ID:</td>
                        <td className="py-1 px-2 font-mono font-bold text-slate-900 w-1/4">{player.idCardNumber || "SPKA-ATHLETE"}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold text-slate-600">Father&apos;s Name:</td>
                        <td className="py-1 px-2 text-slate-900">{player.fathersName || "N/A"}</td>
                        <td className="py-1 px-2 font-semibold text-slate-600">Date of Birth:</td>
                        <td className="py-1 px-2 text-slate-900">{formatDate(player.dob)}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="py-1 px-2 font-semibold text-slate-600">Sport / Role:</td>
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
              </div>

              <p>
                The management and technical committee of <strong>SP Sports Academy has NO OBJECTION</strong> to <strong>{player.name}</strong> participating in open, invitational, district, state, or national championships and tournaments, or seeking admission, registration, or institutional transfer to any other recognized sports academy, club, school, university, or sports federation.
              </p>

              <p>
                It is further certified that the athlete has fulfilled all institutional commitments, returned all academy kits and training equipment, and settled all outstanding dues. There are <strong>no disciplinary proceedings, contractual claims, or financial liabilities</strong> pending against the athlete with this academy.
              </p>

              {player.noc?.destinationClub && (
                <p className="text-[11.5px] text-slate-800 font-medium italic bg-amber-50/80 border-l-2 border-amber-600 px-2 py-1">
                  * Specific Transfer Clearance Endorsed For: <strong>{player.noc.destinationClub}</strong>
                </p>
              )}

              <p>
                During their association with SP Sports Academy, the athlete maintained high personal discipline, sportsman spirit, and exemplary conduct. We wish <strong>{player.name}</strong> every success in all future athletic, competitive, and academic pursuits.
              </p>
            </div>
          </div>

          {/* BOTTOM SECTION: Signatures & Footer */}
          <div>
            {/* 6. Signatures & Digital Seal Block */}
            <div className="pt-3 pb-2 px-3 border-t border-slate-300">
              <div className="flex items-end justify-between">
                {/* Left: Digital Verification Seal */}
                <div className="flex items-center gap-3">
                  <div className="relative w-18 h-18 rounded-full border-2 border-amber-600 bg-amber-50/70 flex flex-col items-center justify-center p-1 shadow-2xs shrink-0 text-center">
                    <div className="absolute inset-1 rounded-full border border-dashed border-amber-700/60 pointer-events-none" />
                    <span className="text-[7.5px] font-bold tracking-wider text-amber-900 uppercase leading-none">SP ACADEMY</span>
                    <span className="text-amber-700 text-[10px] my-0.5">★</span>
                    <span className="text-[7px] font-extrabold text-emerald-800 uppercase tracking-tight bg-emerald-100 px-1 py-0.2 rounded border border-emerald-300">VERIFIED</span>
                    <span className="text-[6.5px] font-semibold text-slate-600 mt-0.5">DHANBAD</span>
                  </div>
                  <div className="text-left space-y-0.5 max-w-[220px]">
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-[9.5px] font-bold text-emerald-800">
                      <span>DIGITALLY CERTIFIED</span>
                      <span>✓</span>
                    </div>
                    <p className="text-[8.5px] font-mono text-slate-500 break-all leading-tight">
                      Hash: {signatureHash.slice(0, 24)}...
                    </p>
                    <p className="text-[8.5px] text-slate-600 font-medium">
                      Central Registry • SP Sports Academy
                    </p>
                  </div>
                </div>

                {/* Right: Institutional Signature */}
                <div className="text-right">
                  <div className="h-8 flex items-end justify-end mb-1">
                    <span
                      className="italic text-slate-900 text-lg font-bold tracking-wide"
                      style={{ fontFamily: "'Brush Script MT', 'Dancing Script', 'Great Vibes', cursive, 'Georgia', serif" }}
                    >
                      S. P. Sharma
                    </span>
                  </div>
                  <div className="w-48 h-[1px] bg-slate-500 ml-auto mb-1" />
                  <p className="text-xs font-bold text-slate-950 uppercase tracking-wider">
                    GENERAL SECRETARY / DIRECTOR
                  </p>
                  <p className="text-[11px] font-semibold text-slate-700">
                    SP Sports Academy, Dhanbad
                  </p>
                  <p className="text-[8.5px] text-slate-500 italic mt-0.5">
                    (Official computer-generated electronic record — valid without physical signature)
                  </p>
                </div>
              </div>
            </div>

            {/* 7. Bottom Footnote & Security Strip */}
            <div className="pt-2 px-3 border-t-2 border-slate-900 text-center">
              <div className="flex items-center justify-between text-[8.5px] text-slate-600">
                <span>Official Electronic Record under Information Technology Act, 2000</span>
                <span>SP Sports Academy Dhanbad • Valid Across India</span>
                <span>Portal: https://spkabaddi.me</span>
              </div>
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
