import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { API_ENDPOINTS } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  ShieldCheck,
  FileText,
  Upload,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  FileCheck,
  FileX,
  Lock,
} from "lucide-react";

interface VerifiedPlayer {
  name: string;
  idCardNumber: string;
  photo?: string;
  email: string;
  currentStatus: string;
  noc: {
    nocNumber?: string | null;
    status?: string;
    generatedAt?: string | null;
  };
  recovery?: {
    status: string;
    tokenExpiresAt?: string;
    termsAgreed?: boolean;
    termsAgreedAt?: string;
    policyAgreed?: boolean;
    policyAgreedAt?: string;
    submittedAt?: string;
  };
}

const NocRecovery: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [player, setPlayer] = useState<VerifiedPlayer | null>(null);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [applicationNote, setApplicationNote] = useState("");

  // SEPARATE Agreement Checkboxes and Timestamps
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsAgreedAt, setTermsAgreedAt] = useState<Date | null>(null);

  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [policyAgreedAt, setPolicyAgreedAt] = useState<Date | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [submissionReceipt, setSubmissionReceipt] = useState<{
    submittedAt: string;
    termsAgreedAt: string;
    policyAgreedAt: string;
  } | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setErrorMessage("Recovery token is missing from the link.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.PLAYER_RECOVERY_VERIFY(token));
        const data = await response.json();

        if (response.status === 410 || data.expired) {
          setIsExpired(true);
          setErrorMessage(data.message || "This re-admission link has expired.");
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          setIsValid(false);
          setErrorMessage(data.message || "Invalid or deactivated recovery link.");
          setIsLoading(false);
          return;
        }

        setIsValid(true);
        setPlayer(data.player);

        // If previously submitted and awaiting review
        if (data.player?.recovery?.status === "pending_review") {
          setSubmittedSuccess(true);
          setSubmissionReceipt({
            submittedAt: data.player.recovery.submittedAt || new Date().toISOString(),
            termsAgreedAt: data.player.recovery.termsAgreedAt || new Date().toISOString(),
            policyAgreedAt: data.player.recovery.policyAgreedAt || new Date().toISOString(),
          });
        }
      } catch (err) {
        setErrorMessage("Failed to connect to the academy server. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  // Handle Terms Agreement change
  const handleTermsToggle = (checked: boolean) => {
    setTermsAgreed(checked);
    if (checked) {
      setTermsAgreedAt(new Date());
    } else {
      setTermsAgreedAt(null);
    }
  };

  // Handle Policy Agreement change
  const handlePolicyToggle = (checked: boolean) => {
    setPolicyAgreed(checked);
    if (checked) {
      setPolicyAgreedAt(new Date());
    } else {
      setPolicyAgreedAt(null);
    }
  };

  // File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 10MB
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Application document must be under 10MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    if (!selectedFile) {
      toast({
        title: "Document Required",
        description: "Please upload your signed re-admission application letter (PDF or image).",
        variant: "destructive",
      });
      return;
    }

    if (!termsAgreed || !termsAgreedAt) {
      toast({
        title: "Terms Agreement Required",
        description: "You must read and check the SP Sports Academy Terms & Conditions box.",
        variant: "destructive",
      });
      return;
    }

    if (!policyAgreed || !policyAgreedAt) {
      toast({
        title: "Policy Agreement Required",
        description: "You must read and check the Academy Rules & Code of Conduct Policy box.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("letter", selectedFile);
      formData.append("applicationNote", applicationNote.trim());
      formData.append("termsAgreed", "true");
      formData.append("termsAgreedAt", termsAgreedAt.toISOString());
      formData.append("policyAgreed", "true");
      formData.append("policyAgreedAt", policyAgreedAt.toISOString());

      const response = await fetch(API_ENDPOINTS.PLAYER_RECOVERY_SUBMIT(token), {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit re-admission application.");
      }

      setSubmittedSuccess(true);
      setSubmissionReceipt({
        submittedAt: data.submittedAt || new Date().toISOString(),
        termsAgreedAt: data.termsAgreedAt || termsAgreedAt.toISOString(),
        policyAgreedAt: data.policyAgreedAt || policyAgreedAt.toISOString(),
      });

      toast({
        title: "Application Submitted Successfully",
        description: "Your re-admission letter and signed agreements have been transmitted to the Academy administration.",
      });
    } catch (err: unknown) {
      toast({
        title: "Submission Error",
        description: err instanceof Error ? err.message : "Failed to transmit application.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateString?: string | Date | null) => {
    if (!dateString) return "N/A";
    const d = typeof dateString === "string" ? new Date(dateString) : dateString;
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-300 font-medium">Verifying institutional re-admission token...</p>
        </div>
      </div>
    );
  }

  if (isExpired || !isValid) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-900/50 bg-slate-900 text-white shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-700/50 flex items-center justify-center mx-auto mb-3">
              <FileX className="w-7 h-7 text-red-400" />
            </div>
            <CardTitle className="text-xl text-red-400 font-bold">
              {isExpired ? "Re-Admission Link Expired" : "Invalid Recovery Portal Link"}
            </CardTitle>
            <CardDescription className="text-slate-400 text-sm mt-1">
              {errorMessage || "The security token provided is not valid or has exceeded its authorization period."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center pt-4">
            <div className="bg-slate-800/80 rounded-lg p-3 text-xs text-slate-300 border border-slate-700 text-left space-y-1">
              <p className="font-semibold text-slate-200">How to proceed:</p>
              <p>• Contact the Academy Office at <strong>+91 8271882034</strong></p>
              <p>• Email <strong>spkabaddigroupdhanbad@gmail.com</strong></p>
              <p>• Request the Super Admin to issue an updated recovery invitation link.</p>
            </div>
            <Link to="/">
              <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Academy Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold text-amber-400 tracking-wide uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            Official Institutional Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            SP SPORTS ACADEMY
          </h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Student Re-Admission & Academy Comeback Application Portal
          </p>
        </div>

        {/* Member Profile Card */}
        {player && (
          <Card className="bg-slate-900/90 border-slate-800 shadow-xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500" />
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {player.photo ? (
                  <img
                    src={player.photo}
                    alt={player.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-amber-500 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 shadow-md">
                    <User className="w-10 h-10" />
                  </div>
                )}
                <div className="text-center sm:text-left space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-white truncate">{player.name}</h2>
                    <Badge variant="outline" className="border-amber-500/60 text-amber-400 font-mono text-xs">
                      {player.idCardNumber}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400">{player.email}</p>
                  <div className="pt-2 flex flex-wrap gap-2 text-[11px] justify-center sm:justify-start">
                    {player.noc.nocNumber && (
                      <span className="bg-slate-800 px-2.5 py-1 rounded text-slate-300 font-mono">
                        Previous NOC: <strong className="text-indigo-400">{player.noc.nocNumber}</strong>
                      </span>
                    )}
                    <span className="bg-slate-800 px-2.5 py-1 rounded text-slate-300">
                      Status: <strong className="text-amber-400 uppercase">{player.noc.status}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Confirmation State */}
        {submittedSuccess ? (
          <Card className="bg-emerald-950/40 border-emerald-700/60 shadow-2xl text-slate-100">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-emerald-900/60 border border-emerald-500/60 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-emerald-300">
                Application Submitted for Institutional Review
              </CardTitle>
              <CardDescription className="text-slate-300 text-xs sm:text-sm">
                Your re-admission application letter and individual legal agreements have been safely logged.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs">
                <div className="text-slate-400 font-sans font-semibold text-xs border-b border-slate-800 pb-1.5 flex items-center justify-between">
                  <span>Cryptographic Audit Receipt</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-mono">
                    <Lock className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400">Submission Timestamp:</span>
                  <span className="text-slate-200 font-semibold">{formatDateTime(submissionReceipt?.submittedAt)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Terms & Conditions Agreed:</span>
                  <span className="text-emerald-400 font-semibold">
                    {formatDateTime(submissionReceipt?.termsAgreedAt)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Academy Policy Agreed:</span>
                  <span className="text-emerald-400 font-semibold">
                    {formatDateTime(submissionReceipt?.policyAgreedAt)}
                  </span>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-400" /> Next Administrative Steps
                </p>
                <p className="text-slate-300 leading-relaxed">
                  The SP Sports Academy Directorate will review your application letter, attendance dossier, and clearance logs. Upon approval, your member login and active registration status will be restored immediately and an official welcome-back notification will be dispatched to your email.
                </p>
              </div>

              <div className="text-center pt-2">
                <Link to="/">
                  <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-200">
                    Return to Academy Homepage
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Application Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-slate-900 border-slate-800 shadow-xl">
              <CardHeader className="border-b border-slate-800/80 pb-4">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  1. Upload Formal Re-Admission Request Letter
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  Upload a signed handwritten or typed application letter explaining your desire to re-join SP Sports Academy. (PDF, JPG, PNG up to 10MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-6 text-center transition-colors bg-slate-950/40">
                  <input
                    type="file"
                    id="letter-file"
                    accept=".pdf,image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="letter-file" className="cursor-pointer block space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-amber-400 group-hover:scale-105 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    {selectedFile ? (
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                          <FileCheck className="w-4 h-4" />
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click to change document
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-200">
                          Click to select application letter or drag and drop
                        </p>
                        <p className="text-xs text-slate-500">
                          Supported formats: PDF, JPEG, PNG, WebP (Max 10MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                {filePreview && (
                  <div className="mt-2 text-center">
                    <p className="text-xs text-slate-400 mb-1">Image Preview:</p>
                    <img
                      src={filePreview}
                      alt="Letter Preview"
                      className="max-h-56 mx-auto rounded border border-slate-700 object-contain shadow"
                    />
                  </div>
                )}

                {/* Additional Note */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Applicant Statement / Remarks (Optional)
                  </label>
                  <Textarea
                    placeholder="Provide any additional context regarding your return, training availability, or reason for previous NOC..."
                    value={applicationNote}
                    onChange={(e) => setApplicationNote(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 min-h-20 text-xs sm:text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEPARATE Checkboxes for Terms & Conditions and Academy Rules/Policy */}
            <Card className="bg-slate-900 border-indigo-900/40 shadow-xl">
              <CardHeader className="border-b border-slate-800/80 pb-4">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  2. Institutional Declaration & Separate Agreements
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs">
                  In compliance with institutional policy, each agreement must be acknowledged independently. Individual electronic agreement timestamps will be legally recorded.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-5">
                {/* Agreement 1: Terms & Conditions */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    termsAgreed
                      ? "bg-indigo-950/30 border-indigo-500/50 shadow-sm"
                      : "bg-slate-950/60 border-slate-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agree-terms"
                      checked={termsAgreed}
                      onCheckedChange={(checked) => handleTermsToggle(Boolean(checked))}
                      className="mt-0.5 border-slate-600 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                    />
                    <div className="space-y-1 flex-1">
                      <label
                        htmlFor="agree-terms"
                        className="text-xs sm:text-sm font-semibold text-slate-100 cursor-pointer block"
                      >
                        I solemnly agree to the SP Sports Academy Terms & Conditions.
                      </label>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        I acknowledge the academy constitution, operational procedures, liability terms, and registration framework.
                      </p>
                      <div className="pt-1 flex items-center gap-2 flex-wrap">
                        <Link
                          to="/terms-conditions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 underline inline-flex items-center gap-1"
                        >
                          Review Official Terms & Conditions <ExternalLink className="w-3 h-3" />
                        </Link>
                        {termsAgreed && termsAgreedAt && (
                          <span className="text-[10px] font-mono bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-indigo-400" />
                            Agreed at: {formatDateTime(termsAgreedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agreement 2: Academy Rules & Code of Conduct Policy */}
                <div
                  className={`p-4 rounded-xl border transition-all ${
                    policyAgreed
                      ? "bg-emerald-950/30 border-emerald-500/50 shadow-sm"
                      : "bg-slate-950/60 border-slate-800"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="agree-policy"
                      checked={policyAgreed}
                      onCheckedChange={(checked) => handlePolicyToggle(Boolean(checked))}
                      className="mt-0.5 border-slate-600 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    />
                    <div className="space-y-1 flex-1">
                      <label
                        htmlFor="agree-policy"
                        className="text-xs sm:text-sm font-semibold text-slate-100 cursor-pointer block"
                      >
                        I solemnly agree to the Academy Code of Conduct, Training Discipline & Institutional Policies.
                      </label>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        I commit to upholding squad discipline, 100% sportsmanship, coach directives, attendance rigor, and zero-tolerance anti-doping policies.
                      </p>
                      <div className="pt-1 flex items-center gap-2 flex-wrap">
                        <Link
                          to="/privacy-policy"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 underline inline-flex items-center gap-1"
                        >
                          Review Academy Code & Privacy Policy <ExternalLink className="w-3 h-3" />
                        </Link>
                        {policyAgreed && policyAgreedAt && (
                          <span className="text-[10px] font-mono bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            Agreed at: {formatDateTime(policyAgreedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Action */}
            <div className="space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting || !selectedFile || !termsAgreed || !policyAgreed}
                className="w-full h-12 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-bold text-sm sm:text-base shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Transmitting Application & Verifying Agreements...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Submit Re-Admission Application
                  </span>
                )}
              </Button>

              {(!termsAgreed || !policyAgreed || !selectedFile) && (
                <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  Application letter and both separate agreement confirmations are required before submission.
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default NocRecovery;
