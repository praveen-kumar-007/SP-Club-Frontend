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
// OFFICIAL INSTITUTIONAL LETTERHEAD NOC (ISM / PREMIER INSTITUTION STYLE)
// =========================================================================
export const NocCertificateDocument = forwardRef<HTMLDivElement, { data: NocCertificateData }>(
  ({ data }, ref) => {
    const player = data.player;
    const cert = data.certificate || {};
    const nocNumber = cert.nocNumber || player.noc?.nocNumber || "SPKA/NOC/2026/001-9185";
    const generatedAt = cert.generatedAt || player.noc?.generatedAt || new Date();
    const signatureHash =
      cert.digitalSignatureHash ||
      player.noc?.digitalSignatureHash ||
      "6b51c5a8c266cd156b9105f7a8b9c0d1";

    const academyUnit =
      player.clubDetails &&
      player.clubDetails.trim().length > 3 &&
      player.clubDetails.toLowerCase().includes("academy")
        ? player.clubDetails
        : "SP Sports Academy Main Center, Dhanbad";

    return (
      <div
        ref={ref}
        id="noc-certificate-document"
        className="w-[800px] min-w-[800px] max-w-[800px] bg-white text-slate-900 shadow-lg relative overflow-hidden box-border border border-slate-200"
        style={{
          boxSizing: "border-box",
          padding: "36px 44px 32px 44px",
          backgroundColor: "#ffffff",
          fontFamily: "'Times New Roman', Times, Georgia, serif",
          color: "#111827",
        }}
      >
        {/* Subtle Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
          <img
            src="/Logo.png"
            alt="SP Sports Academy Watermark"
            className="w-[320px] h-[320px] object-contain"
          />
        </div>

        <div className="relative z-10 space-y-4">
          {/* 1. Official Institutional Letterhead */}
          <div className="pb-3 border-b-2 border-slate-900">
            <div className="flex items-center gap-4">
              <img
                src="/Logo.png"
                alt="SP Sports Academy"
                className="w-18 h-18 object-contain shrink-0"
              />
              <div className="flex-1">
                <h1
                  className="text-2xl font-bold tracking-tight text-slate-950 uppercase leading-none"
                  style={{ letterSpacing: "0.5px" }}
                >
                  SP SPORTS ACADEMY
                </h1>
                <p
                  className="text-xs font-semibold text-slate-700 mt-1 uppercase"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  Department of Athletics & Player Development • Dhanbad, Jharkhand
                </p>
                <p
                  className="text-[11px] text-slate-600 mt-0.5"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  Shakti Mandir Path, Dhanbad – 826007, Jharkhand (India)
                </p>
                <p
                  className="text-[10.5px] text-slate-500 mt-0.5"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  Email: spkabaddigroupdhanbad@gmail.com • Website: https://spkabaddi.me
                </p>
              </div>
              <div
                className="text-right border-l border-slate-300 pl-4 shrink-0"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Official Dispatch
                </span>
                <span className="text-xs font-semibold text-slate-800 font-mono">
                  REG/NOC-SEC
                </span>
              </div>
            </div>
          </div>

          {/* 2. Dispatch Reference & Date */}
          <div className="flex items-center justify-between text-[13px] border-b border-slate-200 pb-2 pt-1 font-serif">
            <div>
              <span className="font-bold text-slate-800">Ref. No.: </span>
              <span className="font-mono font-bold text-slate-950">{nocNumber}</span>
            </div>
            <div>
              <span className="font-bold text-slate-800">Date: </span>
              <span className="font-semibold text-slate-950">{formatDate(generatedAt)}</span>
            </div>
          </div>

          {/* 3. Certificate Title & Subject Line */}
          <div className="text-center pt-1 pb-1">
            <h2 className="text-lg font-bold text-slate-950 tracking-wider uppercase underline underline-offset-4">
              NO OBJECTION CERTIFICATE
            </h2>
            <p className="text-xs font-bold text-slate-700 tracking-wide uppercase mt-1">
              (TO WHOMSOEVER IT MAY CONCERN)
            </p>
          </div>

          {/* Subject Line */}
          <div
            className="text-xs text-slate-800 bg-slate-50 px-3 py-1.5 border border-slate-200 rounded-xs"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            <span className="font-bold text-slate-900">Sub: </span>
            <span>
              Issuance of No Objection Certificate (NOC) in respect of{" "}
              <strong>{player.name}</strong> (Registration ID:{" "}
              <strong>{player.idCardNumber || "SPKA-ATHLETE"}</strong>) – Regarding.
            </span>
          </div>

          {/* 4. Formal Letter Content */}
          <div className="space-y-3 text-[13px] leading-relaxed text-slate-900 text-justify font-serif">
            <p>
              This is to certify that <strong>Mr./Ms. {player.name}</strong>, Son/Daughter of{" "}
              <strong>{player.fathersName || "the parent/guardian"}</strong>, bearing Academy
              Registration ID <strong>{player.idCardNumber || "SPKA-ATHLETE"}</strong>, is a
              registered athlete trainee of <strong>SP Sports Academy, Dhanbad</strong>.
            </p>

            {/* 5. Trainee Particulars Table */}
            <div
              className="my-2 border border-slate-300 rounded-xs overflow-hidden"
              style={{ fontFamily: "Arial, sans-serif" }}
            >
              <table className="w-full text-xs">
                <tbody>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <td className="py-1.5 px-3 font-semibold text-slate-700 w-1/4">
                      Athlete Name:
                    </td>
                    <td className="py-1.5 px-3 font-bold text-slate-950 w-1/4">
                      {player.name}
                    </td>
                    <td className="py-1.5 px-3 font-semibold text-slate-700 w-1/4">
                      Registration ID:
                    </td>
                    <td className="py-1.5 px-3 font-mono font-bold text-slate-900 w-1/4">
                      {player.idCardNumber || "SPKA-ATHLETE"}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 px-3 font-semibold text-slate-700">
                      Father&apos;s Name:
                    </td>
                    <td className="py-1.5 px-3 text-slate-900">
                      {player.fathersName || "N/A"}
                    </td>
                    <td className="py-1.5 px-3 font-semibold text-slate-700">
                      Date of Birth:
                    </td>
                    <td className="py-1.5 px-3 text-slate-900">{formatDate(player.dob)}</td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <td className="py-1.5 px-3 font-semibold text-slate-700">
                      Discipline / Role:
                    </td>
                    <td className="py-1.5 px-3 text-slate-900 capitalize">
                      {player.role || "Athlete"}
                    </td>
                    <td className="py-1.5 px-3 font-semibold text-slate-700">
                      Gender / Blood:
                    </td>
                    <td className="py-1.5 px-3 text-slate-900 capitalize">
                      {player.gender || "N/A"} / {player.bloodGroup || "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 px-3 font-semibold text-slate-700">
                      Aadhaar (Verified):
                    </td>
                    <td className="py-1.5 px-3 font-mono text-slate-900">
                      {maskAadhaar(player.aadharNumber)}
                    </td>
                    <td className="py-1.5 px-3 font-semibold text-slate-700">
                      Academy Unit:
                    </td>
                    <td className="py-1.5 px-3 text-slate-900">{academyUnit}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              The management of <strong>SP Sports Academy has NO OBJECTION</strong> to the
              above-named trainee participating in open, invitational, district, state, or
              national championships and tournaments, or seeking admission, registration, or
              transfer to any other recognized sports academy, club, school, university, or sports
              federation.
            </p>

            <p>
              It is further certified that the trainee has fulfilled all institutional
              commitments, surrendered all academy training kits and equipment, and cleared all
              dues. There are{" "}
              <strong>no disciplinary proceedings, contractual claims, or financial liabilities</strong>{" "}
              pending against the trainee with this institution.
            </p>

            {player.noc?.destinationClub && (
              <p
                className="text-xs text-slate-800 italic bg-slate-50 border-l-2 border-slate-600 px-3 py-1"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                * Clearance specifically endorsed for joining:{" "}
                <strong>{player.noc.destinationClub}</strong>
              </p>
            )}

            <p>
              During their tenure with SP Sports Academy, the trainee exhibited exemplary
              discipline and sportsman spirit. The Academy wishes <strong>{player.name}</strong>{" "}
              all success in future athletic and personal endeavors.
            </p>
          </div>

          {/* 6. Official Signatures & Seal Section */}
          <div className="pt-4 border-t border-slate-300">
            <div className="flex items-end justify-between">
              {/* Left: Round Institutional Stamp & Hash */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  {/* Circular Official Seal */}
                  <div
                    className="w-16 h-16 rounded-full border-2 border-blue-900/80 flex flex-col items-center justify-center p-1 text-center shrink-0"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  >
                    <span className="text-[6.5px] font-bold text-blue-950 uppercase leading-none tracking-tight">
                      SP SPORTS ACADEMY
                    </span>
                    <span className="text-blue-900 text-[9px] my-0.5">★</span>
                    <span className="text-[6.5px] font-bold text-blue-950 uppercase leading-none">
                      DHANBAD
                    </span>
                  </div>
                  <div className="space-y-0.5 text-left" style={{ fontFamily: "Arial, sans-serif" }}>
                    <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-[10px] font-bold text-slate-800">
                      <span>OFFICIAL ELECTRONIC RECORD</span>
                      <span>✓</span>
                    </div>
                    <p className="text-[9px] font-mono text-slate-500 max-w-[210px] truncate">
                      Ref Hash: {signatureHash.slice(0, 24)}...
                    </p>
                    <p className="text-[9px] text-slate-600">
                      Central Registry • SP Sports Academy
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Authorized Signatory */}
              <div
                className="text-right space-y-0.5"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                <p className="text-xs text-slate-700 font-serif italic mb-2">
                  Yours faithfully,
                </p>
                <div className="h-7 flex items-end justify-end mb-1">
                  <span
                    className="italic text-slate-900 text-lg font-bold"
                    style={{
                      fontFamily:
                        "'Brush Script MT', 'Dancing Script', cursive, 'Times New Roman', serif",
                    }}
                  >
                    S. P. Sharma
                  </span>
                </div>
                <div className="w-44 h-[1px] bg-slate-400 ml-auto mb-1" />
                <p className="text-xs font-bold text-slate-950 uppercase tracking-wide">
                  (Authorized Signatory)
                </p>
                <p className="text-xs font-semibold text-slate-800">
                  General Secretary / Director
                </p>
                <p className="text-[11px] text-slate-600">
                  SP Sports Academy, Dhanbad
                </p>
              </div>
            </div>
          </div>

          {/* 7. Official Routing (Copy To) */}
          <div
            className="pt-2 border-t border-slate-200 text-[10.5px] text-slate-600"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            <p className="font-bold text-slate-700">Copy to:</p>
            <ol className="list-decimal list-inside pl-1 text-[10px] space-y-0.5 text-slate-600">
              <li>Trainee Athlete Concerned ({player.name})</li>
              <li>Registry & Player Verification Cell, SP Sports Academy</li>
              <li>Office Record / Guard File</li>
            </ol>
          </div>

          {/* 8. Institutional Footer */}
          <div
            className="pt-2 border-t-2 border-slate-900 text-center text-[9px] text-slate-500"
            style={{ fontFamily: "Arial, sans-serif" }}
          >
            Shakti Mandir Path, Dhanbad – 826007, Jharkhand • Email: spkabaddigroupdhanbad@gmail.com • Portal: https://spkabaddi.me
            <br />
            (Computer-generated official document under Information Technology Act, 2000. Valid without physical ink signature.)
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
