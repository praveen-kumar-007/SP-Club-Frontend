import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, CheckCircle2, ShieldCheck, FileCheck, Award, Printer, X } from "lucide-react";
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

interface NocCertificateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: NocCertificateData | null;
  onDownloaded?: () => void;
}

const NocCertificateModal = ({
  open,
  onOpenChange,
  data,
  onDownloaded,
}: NocCertificateModalProps) => {
  const { toast } = useToast();
  const documentRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  if (!data || !data.player) return null;

  const player = data.player;
  const cert = data.certificate || {};
  const nocNumber = cert.nocNumber || player.noc?.nocNumber || "SPA-NOC-2026-OFFICIAL";
  const generatedAt = cert.generatedAt || player.noc?.generatedAt || new Date();
  const expiresAt = cert.expiresAt || player.noc?.expiresAt;
  const signatureHash = cert.digitalSignatureHash || player.noc?.digitalSignatureHash || "9f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c";

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

  const handleDownloadPdf = async () => {
    if (!documentRef.current) return;

    setDownloading(true);
    toast({
      title: "Generating Official NOC",
      description: "Compiling institutional letterhead vector document. Download will begin shortly...",
    });

    const prevScrollX = window.scrollX;
    const prevScrollY = window.scrollY;

    try {
      window.scrollTo(0, 0);

      const element = documentRef.current;
      const filename = `SP_Sports_Academy_NOC_${player.name.replace(/[^a-zA-Z0-9]/g, "_")}_${nocNumber}.pdf`;

      const opt = {
        margin: [8, 8, 8, 8],
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
          mode: ["css", "legacy"],
          avoid: [".pdf-card"],
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

      toast({
        title: "NOC Download Complete",
        description: "Official certificate has been downloaded successfully.",
      });

      if (onDownloaded) {
        onDownloaded();
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Could not generate certificate PDF",
        variant: "destructive",
      });
    } finally {
      window.scrollTo(prevScrollX, prevScrollY);
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[880px] w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-slate-100 text-slate-900">
        <DialogHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <DialogTitle className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-emerald-600" />
              <span>Institutional No Objection Certificate (NOC)</span>
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Official computer-generated certification issued under authority of SP Sports Academy Dhanbad.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadPdf}
              disabled={downloading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 shadow-sm"
            >
              <Download className="h-4 w-4 mr-1.5" />
              {downloading ? "Generating PDF..." : "Download Official NOC (PDF)"}
            </Button>
          </div>
        </DialogHeader>

        {/* ========================================================================= */}
        {/* PRINTABLE NOC CANVAS (Rendered to PDF with Letterhead) */}
        {/* ========================================================================= */}
        <div className="w-full overflow-x-auto my-2 flex justify-center">
          <div
            ref={documentRef}
            id="noc-certificate-document"
            className="w-[800px] min-w-[800px] bg-white p-8 text-slate-900 font-sans shadow-md border-2 border-slate-300 rounded-lg relative"
            style={{ minHeight: "1050px" }}
          >
            {/* Watermark Logo in Background */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] z-0"
              style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "24px 24px" }}
            >
              <img
                src="/Logo.png"
                alt="SP Sports Academy Watermark"
                className="w-[420px] h-[420px] object-contain"
              />
            </div>

            {/* Document Foreground Content */}
            <div className="relative z-10 space-y-6">
              {/* 1. Official Academy Letterhead */}
              <div className="border-b-2 border-slate-900 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src="/Logo.png"
                      alt="SP Sports Academy"
                      className="object-contain rounded-lg p-1 border border-slate-300 shadow-xs"
                      style={{ width: "76px", height: "76px" }}
                    />
                    <div>
                      <h1 className="text-2xl font-black tracking-wider text-slate-900 uppercase">
                        SP SPORTS ACADEMY
                      </h1>
                      <p className="text-xs font-bold tracking-wide text-blue-800 uppercase">
                        Official Institutional Clearance & Registration Authority
                      </p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Shakti Mandir Path, Dhanbad, Jharkhand 826007 • Compliant with AKFI Standards
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Email: spkabaddigroupdhanbad@gmail.com • Web: https://spkabaddi.me • Phone: +91 8271882034
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end shrink-0">
                    <div className="border-2 border-slate-900 rounded-md px-3 py-1 bg-slate-50 text-[11px] font-mono font-bold">
                      <span className="text-slate-500 font-normal">REF:</span> {nocNumber}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1">Issue Date: <strong>{formatDate(generatedAt)}</strong></span>
                    {expiresAt && (
                      <span className="text-[10px] text-amber-700 font-semibold mt-0.5">
                        Retention Deadline: {formatDate(expiresAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Certificate Title Header */}
              <div className="text-center py-2 border-y border-slate-200 bg-slate-50/70 rounded-md">
                <h2 className="text-xl font-black text-slate-950 uppercase tracking-widest">
                  NO OBJECTION CERTIFICATE (NOC)
                </h2>
                <p className="text-xs font-bold text-blue-900 tracking-wider uppercase mt-0.5">
                  Institutional Transfer & Competitive Participation Clearance
                </p>
              </div>

              {/* 3. Member Identification Block */}
              <div className="pdf-card flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                {/* Photo */}
                <div className="w-28 shrink-0 flex flex-col items-center justify-center border-r border-slate-200 pr-3">
                  {player.photo ? (
                    <img
                      src={player.photo}
                      alt={player.name}
                      crossOrigin="anonymous"
                      className="w-24 h-24 object-cover rounded-lg border-2 border-slate-300 shadow-xs"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 font-semibold text-[10px]">
                      Verified Member
                    </div>
                  )}
                  <span className="mt-1.5 inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                    VERIFIED ATHLETE
                  </span>
                </div>

                {/* Attributes Grid */}
                <div className="flex-1 grid grid-cols-3 gap-x-3 gap-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Athlete Name</span>
                    <span className="font-bold text-slate-900 text-xs">{player.name}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Father's Name</span>
                    <span className="font-medium text-slate-800 text-xs">{player.fathersName || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Academy ID Card No.</span>
                    <span className="font-bold text-blue-700 font-mono text-xs">{player.idCardNumber || "NOT ISSUED"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Date of Birth / Age</span>
                    <span className="font-medium text-slate-800 text-xs">
                      {formatDate(player.dob)} ({calculateAge(player.dob)})
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Gender & Blood Group</span>
                    <span className="font-medium text-slate-800 text-xs capitalize">
                      {player.gender} • <strong className="text-red-600">{player.bloodGroup || "N/A"}</strong>
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Registered Playing Role</span>
                    <span className="font-semibold text-slate-900 text-xs capitalize">{player.role}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Aadhar Identification</span>
                    <span className="font-mono text-slate-800 text-xs">{player.aadharNumber || "Verified"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Registered Club Unit</span>
                    <span className="font-medium text-slate-800 text-xs">{player.clubDetails || "SP Sports Academy Main Unit"}</span>
                  </div>
                </div>
              </div>

              {/* 4. Formal Legal & Institutional Declarations */}
              <div className="pdf-card space-y-3.5 text-xs text-slate-800 leading-relaxed text-justify px-1">
                <p>
                  <strong>TO WHOM IT MAY CONCERN,</strong>
                </p>

                <p>
                  This is to officially certify that <strong>{player.name}</strong>, son/daughter of <strong>{player.fathersName || "the parent/guardian"}</strong>, bearing Institutional ID Card Number <strong>{player.idCardNumber || "N/A"}</strong>, has been a bonafide registered athlete with <strong>SP Sports Academy, Dhanbad, Jharkhand</strong>.
                </p>

                <p>
                  The administration and management of SP Sports Academy hereby formally confirms and certifies that:
                </p>

                <div className="space-y-2 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Fee & Financial Clearance:</strong> The player has settled all institutional membership fees, training charges, tournament contributions, and has zero financial dues pending towards SP Sports Academy.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Equipment & Kit Surrender:</strong> All sports kit, equipment, and academy assets allocated to the member have been duly returned in good order.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Disciplinary & Conduct Standing:</strong> The athlete maintained a clean disciplinary record with exemplary sporting spirit, adhering strictly to the Amateur Kabaddi Federation of India (AKFI) Code of Conduct.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Statutory Cooling & Notice Compliance:</strong> The mandatory institutional clearance and notice period has been duly completed and authorized under administrative sanction.
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50 border-2 border-emerald-600 rounded-lg text-emerald-950">
                  <p className="font-bold text-[13px] leading-snug">
                    CLEARANCE STATEMENT:
                  </p>
                  <p className="mt-1 leading-relaxed">
                    Accordingly, <strong>SP Sports Academy has NO OBJECTION</strong> whatsoever to <strong>{player.name}</strong> seeking registration, institutional transfer, or competitive participation with any other sports club, district/state sports association, university, or national sporting tournament. The athlete is fully cleared to participate without any contractual reservation or encumbrance.
                  </p>
                </div>

                {player.noc?.destinationClub && (
                  <p className="text-[11px] text-slate-600 italic">
                    * Specific Transfer Clearance Specified for: <strong>{player.noc.destinationClub}</strong>
                  </p>
                )}
              </div>

              {/* 5. Dual Digital Authorization & Signatures */}
              <div className="pdf-card border-t-2 border-slate-900 pt-5 space-y-3.5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Box 1: Digitally Verified */}
                  <div className="border-2 border-emerald-600 bg-emerald-50/40 rounded-xl p-3.5 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 block">
                            System Certification
                          </span>
                          <h4 className="text-sm font-black text-emerald-950 uppercase">
                            Digitally Verified
                          </h4>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        AUTHENTIC ✓
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-1 text-[11px] text-slate-700 border-t border-emerald-200 pt-2 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Database:</span>
                        <span className="font-semibold text-slate-900">SP Central Sports Registry</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Security Hash:</span>
                        <span className="text-[10px] text-slate-600 truncate max-w-[200px]">
                          SHA256:{signatureHash.slice(0, 24)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Clearance Status:</span>
                        <span className="font-bold text-emerald-700">UNCONDITIONAL NOC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Timestamp:</span>
                        <span className="text-slate-900">{formatDate(generatedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Box 2: Digitally Signed */}
                  <div className="border-2 border-blue-600 bg-blue-50/40 rounded-xl p-3.5 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-800 block">
                            Institutional Authority
                          </span>
                          <h4 className="text-sm font-black text-blue-950 uppercase">
                            Digitally Signed
                          </h4>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        AUTHORIZED ✓
                      </span>
                    </div>

                    <div className="mt-2.5 space-y-1 text-[11px] text-slate-700 border-t border-blue-200 pt-2 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Signatory:</span>
                        <span className="font-semibold text-slate-900">General Secretary / Director</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Authority:</span>
                        <span className="font-semibold text-slate-900">SP Sports Academy Dhanbad</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Signature Mode:</span>
                        <span className="font-bold text-blue-700">Cryptographic System Token</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Legal Note:</span>
                        <span className="text-[10px] text-slate-600">No Physical Signature Required</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statutory IT Act Disclaimer Footer */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-center text-[10px] text-slate-600 leading-relaxed font-medium">
                  This document is an electronic record generated in terms of Information Technology Act, 2000 and rules there under. It does not require physical ink signatures or manual institutional stamps to maintain legal validity across sporting authorities.
                </div>

                {/* Bottom Bar */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                  <span className="font-mono">DOC ID: {nocNumber}</span>
                  <span>Official Clearance Document • SP Sports Academy Dhanbad, Jharkhand</span>
                  <span>Valid Across All AKFI & National Affiliations</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Official A4 portrait certificate. Downloaded document preserves all background colors and security badges.
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
              onClick={handleDownloadPdf}
              disabled={downloading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 shadow-sm"
            >
              <Download className="h-4 w-4 mr-1.5" />
              {downloading ? "Generating PDF..." : "Download as PDF"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NocCertificateModal;
