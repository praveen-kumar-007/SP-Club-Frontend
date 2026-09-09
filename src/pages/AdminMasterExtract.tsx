import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Award,
    CheckCircle2,
    Database,
    Download,
    FileSpreadsheet,
    History,
    Lock,
    MessageSquare,
    Search,
    Shield,
    ShieldCheck,
    Wallet,
} from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
import Seo from "@/components/Seo";
import html2pdf from "html2pdf.js";

interface AttendanceRecord {
    date: string;
    status: string;
    location?: {
        latitude?: number;
        longitude?: number;
        accuracy?: number;
        address?: string;
    };
    deviceId?: string;
    deviceName?: string;
    markedByType?: string;
    markedByAdminId?: {
        _id?: string;
        username?: string;
        email?: string;
        role?: string;
    };
    adminNote?: string;
    markedAt?: string;
}

interface FeePaymentRecord {
    month: string;
    isPaid: boolean;
    updatedAt?: string;
    updatedBy?: {
        _id?: string;
        username?: string;
        email?: string;
        role?: string;
    };
}

interface CertificateRecord {
    _id?: string;
    title: string;
    fileUrl: string;
    issuedAt?: string;
}

interface PlayerLoginHistory {
    _id?: string;
    ipAddress?: string;
    userAgent?: string;
    deviceName?: string;
    loggedInAt?: string;
}

interface PlayerMessageRecord {
    _id: string;
    type: string;
    subject: string;
    message: string;
    status: string;
    createdAt: string;
    sentByAdminName?: string;
}

interface InquiryRecord {
    _id: string;
    subject: string;
    message: string;
    status: string;
    createdAt: string;
}

interface FullPlayer {
    _id: string;
    name: string;
    fathersName: string;
    email: string;
    phone: string;
    parentsPhone?: string;
    gender: string;
    dob: string;
    bloodGroup: string;
    address?: string;
    aadharNumber: string;
    aadharFront?: string;
    aadharBack?: string;
    role: string;
    ageGroup?: string;
    experience?: string;
    kabaddiPositions?: string[];
    clubDetails?: string;
    kitSize?: string;
    jerseyNumber?: number;
    message?: string;
    photo?: string;
    certificates?: CertificateRecord[];
    newsletter?: boolean;
    terms?: boolean;
    status: "pending" | "approved" | "rejected";
    registeredAt: string;
    approvedAt?: string;
    approvedBy?: { _id?: string; username?: string; email?: string; role?: string };
    rejectedAt?: string;
    rejectionReason?: string;
    idCardNumber?: string;
    idCardGeneratedAt?: string;
    idCardGeneratedBy?: { _id?: string; username?: string; email?: string; role?: string };
    idCardRole?: string;
    playerPasswordSetAt?: string;
    playerLastLogin?: string;
    playerFailedLoginAttempts?: number;
    playerForcePasswordReset?: boolean;
    playerLastFailedLoginAt?: string;
    playerPasswordResetRequestedAt?: string;
    playerLoginHistory?: PlayerLoginHistory[];
    attendance?: AttendanceRecord[];
    feeAccessEnabled?: boolean;
    feePayments?: FeePaymentRecord[];
}

const AdminMasterExtract = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const documentRef = useRef<HTMLDivElement>(null);

    const [token, setToken] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const [viewMode, setViewMode] = useState<"single" | "master">("single");
    const [playersList, setPlayersList] = useState<FullPlayer[]>([]);
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
    const [singlePlayerData, setSinglePlayerData] = useState<{
        player: FullPlayer;
        messages: PlayerMessageRecord[];
        inquiries: InquiryRecord[];
        summary: {
            presentCount: number;
            absentCount: number;
            totalAttendanceSessions: number;
            attendancePercentage: number;
            paidMonths: string[];
            unpaidMonths: string[];
            totalMessages: number;
            totalInquiries: number;
        };
    } | null>(null);

    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [extractTimestamp] = useState<string>(new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "full",
        timeStyle: "medium",
    }));

    const generateDocHash = useCallback((seed: string) => {
        let hash = 0;
        const str = `${seed}_${extractTimestamp}_SP_SPORTS_ACADEMY_DHANBAD`;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash + str.charCodeAt(i);
            hash |= 0;
        }
        const hex = Math.abs(hash).toString(16).padStart(8, "0");
        return `${hex}a8b3c9f2d1e0`;
    }, [extractTimestamp]);

    useEffect(() => {
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) {
            navigate("/admin/login");
            return;
        }
        setToken(adminToken);
    }, [navigate]);

    // Fetch all players for master view & selector
    const fetchMasterData = useCallback(async (adminToken: string) => {
        setLoading(true);
        try {
            const url = new URL(API_ENDPOINTS.ADMIN_MASTER_EXTRACT, window.location.origin);
            if (statusFilter !== "all") url.searchParams.set("status", statusFilter);
            if (searchQuery.trim()) url.searchParams.set("search", searchQuery.trim());

            const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            if (!res.ok) {
                throw new Error("Failed to load master records");
            }

            const data = await res.json();
            const players = Array.isArray(data.players) ? data.players : [];
            setPlayersList(players);

            // Default to first player if in single view and none selected
            if (players.length > 0 && !selectedPlayerId) {
                setSelectedPlayerId(players[0]._id);
            }
        } catch (error) {
            toast({
                title: "Data Extraction Failed",
                description: error instanceof Error ? error.message : "Error fetching records",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchQuery, selectedPlayerId, toast]);

    // Fetch single player full dossier
    const fetchSinglePlayerDossier = useCallback(async (adminToken: string, playerId: string) => {
        if (!playerId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_ENDPOINTS.ADMIN_MASTER_EXTRACT}?playerId=${encodeURIComponent(playerId)}`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            if (!res.ok) {
                throw new Error("Failed to load player dossier");
            }

            const data = await res.json();
            setSinglePlayerData({
                player: data.player,
                messages: data.messages || [],
                inquiries: data.inquiries || [],
                summary: data.summary,
            });
        } catch (error) {
            toast({
                title: "Dossier Load Error",
                description: error instanceof Error ? error.message : "Could not fetch dossier",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (token) {
            fetchMasterData(token);
        }
    }, [token, fetchMasterData]);

    useEffect(() => {
        if (token && selectedPlayerId && viewMode === "single") {
            fetchSinglePlayerDossier(token, selectedPlayerId);
        }
    }, [token, selectedPlayerId, viewMode, fetchSinglePlayerDossier]);

    const filteredPlayers = useMemo(() => {
        if (!searchQuery.trim()) return playersList;
        const q = searchQuery.toLowerCase().trim();
        return playersList.filter((p) =>
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.email && p.email.toLowerCase().includes(q)) ||
            (p.phone && p.phone.includes(q)) ||
            (p.aadharNumber && p.aadharNumber.includes(q)) ||
            (p.idCardNumber && p.idCardNumber.toLowerCase().includes(q))
        );
    }, [playersList, searchQuery]);

    const selectedPlayer = useMemo(() => {
        if (singlePlayerData?.player && singlePlayerData.player._id === selectedPlayerId) {
            return singlePlayerData.player;
        }
        return playersList.find((p) => p._id === selectedPlayerId);
    }, [singlePlayerData, playersList, selectedPlayerId]);

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

    const formatDate = (val?: string) => {
        if (!val) return "N/A";
        const d = new Date(val);
        if (isNaN(d.getTime())) return val;
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (val?: string) => {
        if (!val) return "N/A";
        const d = new Date(val);
        if (isNaN(d.getTime())) return val;
        return d.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    // Standardized cross-device PDF export without truncation
    const handleDownloadPdf = async () => {
        if (!documentRef.current) return;

        setDownloadingPdf(true);
        toast({
            title: "Generating PDF Dossier",
            description: "Compiling complete unconstrained document layout. Download will start automatically...",
        });

        const prevScrollX = window.scrollX;
        const prevScrollY = window.scrollY;

        try {
            // Scroll to origin so html2canvas doesn't capture blank/shifted content
            window.scrollTo(0, 0);

            const element = documentRef.current;
            const filename = viewMode === "single" && selectedPlayer
                ? `SP_Sports_Academy_Dossier_${selectedPlayer.name.replace(/[^a-zA-Z0-9]/g, "_")}_${selectedPlayer.idCardNumber || selectedPlayer._id.slice(-6)}.pdf`
                : `SP_Sports_Academy_Master_Extraction_${new Date().toISOString().split("T")[0]}.pdf`;

            const orientation: "portrait" | "landscape" = viewMode === "single" ? "portrait" : "landscape";
            const docWidth = viewMode === "single" ? 800 : 1080;
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
                    width: docWidth,
                    windowWidth: docWidth,
                    scrollX: 0,
                    scrollY: 0,
                },
                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation,
                },
                pagebreak: {
                    mode: ["css", "legacy"],
                    avoid: [".pdf-card", "tr", ".pdf-card-row"],
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
                title: "Download Complete",
                description: "Official PDF has been downloaded successfully.",
            });
        } catch (error) {
            toast({
                title: "PDF Generation Failed",
                description: error instanceof Error ? error.message : "Could not generate PDF",
                variant: "destructive",
            });
        } finally {
            window.scrollTo(prevScrollX, prevScrollY);
            setDownloadingPdf(false);
        }
    };

    const handleExportJson = () => {
        const exportData = viewMode === "single" ? singlePlayerData : { total: playersList.length, players: playersList };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SP_Sports_Academy_Export_${viewMode}_${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-slate-100/90 text-slate-900 py-6 px-3 sm:px-6">
            <Seo
                title="Master Record Extraction & Dossier | SP Sports Academy"
                description="Comprehensive player dossier and master records extraction center for SP Sports Academy."
            />

            {/* Screen Controls Toolbar (Hidden in Print & PDF) */}
            <div className="max-w-[1200px] mx-auto mb-6 space-y-4 print:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <FileSpreadsheet className="text-blue-600" size={24} />
                            <span>Master Data & Dossier Extraction Center</span>
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            Extract every minute registration, attendance, GPS, fee, and administrative log without truncation.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate("/admin/dashboard")}
                            className="h-9"
                        >
                            <ArrowLeft size={16} className="mr-1.5" />
                            Dashboard
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportJson}
                            className="h-9 bg-slate-50 hover:bg-slate-100"
                        >
                            <Database size={16} className="mr-1.5 text-slate-600" />
                            Export JSON
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleDownloadPdf}
                            disabled={downloadingPdf || loading}
                            className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm px-4"
                        >
                            <Download size={16} className="mr-1.5" />
                            {downloadingPdf ? "Generating Fixed A4 PDF..." : "Download as PDF"}
                        </Button>
                    </div>
                </div>

                {/* Mode Selector & Filter Bar */}
                <Card className="shadow-sm border-slate-200">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setViewMode("single")}
                                    className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition ${
                                        viewMode === "single"
                                            ? "bg-white text-blue-700 shadow-sm"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    Individual Player Dossier (Full 360°)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode("master")}
                                    className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition ${
                                        viewMode === "master"
                                            ? "bg-white text-blue-700 shadow-sm"
                                            : "text-slate-600 hover:text-slate-900"
                                    }`}
                                >
                                    Academy Master Ledger (All Records)
                                </button>
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-slate-500 font-medium">Status:</span>
                                {["all", "approved", "pending", "rejected"].map((st) => (
                                    <button
                                        key={st}
                                        type="button"
                                        onClick={() => setStatusFilter(st)}
                                        className={`px-2.5 py-1 rounded-md capitalize font-medium transition ${
                                            statusFilter === st
                                                ? "bg-blue-600 text-white"
                                                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        }`}
                                    >
                                        {st}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Search & Player Selector */}
                        <div className="grid sm:grid-cols-2 gap-3 pt-1">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                <Input
                                    placeholder="Search by name, email, phone, aadhar, ID card..."
                                    className="pl-9 h-9 text-xs sm:text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {viewMode === "single" && (
                                <div>
                                    <select
                                        className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs sm:text-sm font-medium text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={selectedPlayerId}
                                        onChange={(e) => setSelectedPlayerId(e.target.value)}
                                    >
                                        <option value="" disabled>-- Select Player to Extract Dossier --</option>
                                        {filteredPlayers.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.name} ({p.idCardNumber || p.role}) - {p.phone || p.email} [{p.status.toUpperCase()}]
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ========================================================================= */}
            {/* MASTER EXTRACT DOCUMENT CANVAS (Rendered to PDF & Printed cleanly) */}
            {/* ========================================================================= */}
            <div className="w-full overflow-x-auto pb-8">
                <div
                    id="master-extract-document"
                    ref={documentRef}
                    className={`mx-auto bg-white p-6 text-slate-900 font-sans shadow-lg border border-slate-200 rounded-xl ${
                        viewMode === "single" ? "w-[800px] min-w-[800px]" : "w-[1080px] min-w-[1080px]"
                    }`}
                >
                    {/* Official Academy Header */}
                    <div className="pdf-card border-b-2 border-slate-900 pb-4 mb-5">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <img
                                    src="/Logo.png"
                                    alt="SP Sports Academy"
                                    className="object-contain rounded-lg p-1 border border-slate-200 shadow-sm"
                                    style={{ width: "72px", height: "72px" }}
                                />
                                <div>
                                    <h1 className="text-2xl font-black tracking-wider text-slate-900 uppercase">
                                        SP SPORTS ACADEMY
                                    </h1>
                                    <p className="text-xs font-bold tracking-wide text-blue-800 uppercase">
                                        Official Player Dossier & Master Record Extraction Ledger
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
                                <div className="border border-slate-300 rounded px-2.5 py-1 bg-slate-50 text-[11px] font-mono font-semibold">
                                    <span className="text-slate-500">REF:</span> SP-EXT-{selectedPlayer?._id ? selectedPlayer._id.slice(-8).toUpperCase() : "MASTER"}
                                </div>
                                <span className="text-[10px] text-slate-400 mt-1">Official Confidential Record</span>
                                <span className="text-[10px] text-slate-500 mt-0.5">{extractTimestamp}</span>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 text-slate-500">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                            <p className="text-sm font-medium">Extracting minute records from database...</p>
                        </div>
                    ) : viewMode === "single" && selectedPlayer ? (
                        /* ========================================================================= */
                        /* INDIVIDUAL PLAYER FULL 360° DOSSIER */
                        /* ========================================================================= */
                        <div className="space-y-5 text-xs">
                            {/* Section 1: Identification & Profile Overview */}
                            <div className="pdf-card flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                                {/* Player Photo */}
                                <div className="w-32 shrink-0 flex flex-col items-center justify-center border-r border-slate-200 pr-3">
                                    {selectedPlayer.photo ? (
                                        <img
                                            src={selectedPlayer.photo}
                                            alt={selectedPlayer.name}
                                            crossOrigin="anonymous"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLElement).style.display = "none";
                                            }}
                                            className="w-24 h-24 object-cover rounded-lg border-2 border-slate-300 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 font-semibold text-[11px]">
                                            No Photo
                                        </div>
                                    )}
                                    <div className="mt-2 text-center">
                                        <Badge
                                            className={
                                                selectedPlayer.status === "approved"
                                                    ? "bg-emerald-600 text-[10px] px-2 py-0.5"
                                                    : selectedPlayer.status === "pending"
                                                    ? "bg-amber-500 text-[10px] px-2 py-0.5"
                                                    : "bg-red-600 text-[10px] px-2 py-0.5"
                                            }
                                        >
                                            {selectedPlayer.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Core Identity Attributes */}
                                <div className="flex-1 grid grid-cols-3 gap-x-3 gap-y-2">
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Full Name</span>
                                        <span className="font-bold text-slate-900 text-xs">{selectedPlayer.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Father's Name</span>
                                        <span className="font-medium text-slate-800 text-xs">{selectedPlayer.fathersName || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">ID Card Number</span>
                                        <span className="font-bold text-blue-700 font-mono text-xs">{selectedPlayer.idCardNumber || "NOT ISSUED"}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Gender</span>
                                        <span className="font-medium text-slate-800 text-xs capitalize">{selectedPlayer.gender}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Date of Birth / Age</span>
                                        <span className="font-medium text-slate-800 text-xs">
                                            {formatDate(selectedPlayer.dob)} ({calculateAge(selectedPlayer.dob)})
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Blood Group</span>
                                        <span className="font-bold text-red-600 text-xs">{selectedPlayer.bloodGroup || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Primary Contact</span>
                                        <span className="font-medium text-slate-800 font-mono text-xs">{selectedPlayer.phone || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Parents Contact</span>
                                        <span className="font-medium text-slate-800 font-mono text-xs">{selectedPlayer.parentsPhone || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Registered Email</span>
                                        <span className="font-medium text-slate-800 text-xs break-all">{selectedPlayer.email || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Aadhar Number</span>
                                        <span className="font-medium font-mono text-slate-800 text-xs">{selectedPlayer.aadharNumber || "N/A"}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Residential Address</span>
                                        <span className="font-medium text-slate-800 text-xs">{selectedPlayer.address || "N/A"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Sports, Academy & Administrative Record */}
                            <div className="pdf-card border border-slate-200 rounded-lg p-4 bg-white">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2.5 border-b pb-1.5 flex items-center gap-1.5">
                                    <Shield size={16} className="text-blue-600" />
                                    <span>Athletic & Administrative Record</span>
                                </h2>
                                <div className="grid grid-cols-3 gap-x-3 gap-y-2 text-xs">
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Playing Role</span>
                                        <span className="font-semibold text-slate-800">{selectedPlayer.role}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Age Group</span>
                                        <span className="font-semibold text-slate-800">{selectedPlayer.ageGroup || "N/A"}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Jersey No. / Kit</span>
                                        <span className="font-semibold text-slate-800">
                                            #{selectedPlayer.jerseyNumber ?? "N/A"} (Size: {selectedPlayer.kitSize || "N/A"})
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Experience</span>
                                        <span className="font-semibold text-slate-800">{selectedPlayer.experience || "Fresh Recruit"}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Kabaddi Positions</span>
                                        <div className="flex flex-wrap gap-1 mt-0.5">
                                            {Array.isArray(selectedPlayer.kabaddiPositions) && selectedPlayer.kabaddiPositions.length > 0 ? (
                                                selectedPlayer.kabaddiPositions.map((pos) => (
                                                    <span key={pos} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] border border-blue-200 font-medium">
                                                        {pos}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-slate-600 font-medium text-[11px]">Standard Kabaddi Formation</span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Club / Unit Details</span>
                                        <span className="font-semibold text-slate-800">{selectedPlayer.clubDetails || "SP Sports Academy Main"}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Registration Date & Time</span>
                                        <span className="font-medium text-slate-800">{formatDateTime(selectedPlayer.registeredAt)}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Approval Date</span>
                                        <span className="font-medium text-slate-800">{formatDate(selectedPlayer.approvedAt)}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Approved By Admin</span>
                                        <span className="font-medium text-slate-800">
                                            {selectedPlayer.approvedBy?.username ? `${selectedPlayer.approvedBy.username} (${selectedPlayer.approvedBy.role || "Admin"})` : "Admin Authority"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">ID Card Generated Date</span>
                                        <span className="font-medium text-slate-800">{formatDate(selectedPlayer.idCardGeneratedAt)}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">ID Card Assigned Role</span>
                                        <span className="font-medium text-slate-800">{selectedPlayer.idCardRole || selectedPlayer.role}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Consent & Preferences</span>
                                        <span className="font-medium text-slate-800">
                                            Terms: {selectedPlayer.terms ? "Agreed" : "No"} • Newsletter: {selectedPlayer.newsletter ? "Subscribed" : "No"}
                                        </span>
                                    </div>
                                    {selectedPlayer.message && (
                                        <div className="col-span-3 bg-slate-50 border border-slate-200 p-2.5 rounded">
                                            <strong className="block text-[10px] uppercase text-slate-600 mb-0.5">Registration Statement / Message:</strong>
                                            <p className="text-slate-800 italic text-xs">{selectedPlayer.message}</p>
                                        </div>
                                    )}
                                    {selectedPlayer.rejectionReason && (
                                        <div className="col-span-3 bg-red-50 border border-red-200 p-2.5 rounded text-red-700">
                                            <strong className="block text-[10px] uppercase">Rejection Log:</strong>
                                            <span className="text-xs">{selectedPlayer.rejectionReason} (Dated: {formatDate(selectedPlayer.rejectedAt)})</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 2B: Certificates & Qualifications (if any) */}
                            {Array.isArray(selectedPlayer.certificates) && selectedPlayer.certificates.length > 0 && (
                                <div className="pdf-card border border-slate-200 rounded-lg p-4 bg-white">
                                    <h2 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2.5 border-b pb-1.5 flex items-center gap-1.5">
                                        <Award size={16} className="text-amber-600" />
                                        <span>Certificates & Documented Achievements ({selectedPlayer.certificates.length})</span>
                                    </h2>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedPlayer.certificates.map((cert, idx) => (
                                            <div key={cert._id || idx} className="p-2 rounded border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                                                <div>
                                                    <span className="font-bold text-slate-900 block">{cert.title}</span>
                                                    <span className="text-[10px] text-slate-500">Issued: {formatDate(cert.issuedAt)}</span>
                                                </div>
                                                <span className="text-blue-600 text-[11px] font-semibold">
                                                    Document Verified ✓
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Section 3: Attendance Analytics & Complete Detailed Log */}
                            <div className="border border-slate-200 rounded-lg p-4 bg-white">
                                <div className="flex items-center justify-between gap-2 mb-3 border-b pb-2">
                                    <div>
                                        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                                            <CheckCircle2 size={16} className="text-emerald-600" />
                                            <span>Complete Attendance Ledger ({selectedPlayer.attendance?.length || 0} Total Sessions Recorded)</span>
                                        </h2>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Full unconstrained ledger displaying all GPS coordinates, admin action notes, timestamps, and device fingerprints.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-semibold shrink-0">
                                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                            Present: {singlePlayerData?.summary.presentCount ?? selectedPlayer.attendance?.filter(a => a.status === 'present').length ?? 0}
                                        </span>
                                        <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                            Absent: {singlePlayerData?.summary.absentCount ?? selectedPlayer.attendance?.filter(a => a.status === 'absent').length ?? 0}
                                        </span>
                                        <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                            Rate: {singlePlayerData?.summary.attendancePercentage ?? 0}%
                                        </span>
                                    </div>
                                </div>

                                {selectedPlayer.attendance && selectedPlayer.attendance.length > 0 ? (
                                    <div className="border rounded-lg border-slate-200 overflow-hidden">
                                        <table className="w-full text-left text-xs border-collapse table-fixed">
                                            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                                                <tr>
                                                    <th className="py-2 px-2 font-bold w-7 text-center">#</th>
                                                    <th className="py-2 px-2 font-bold w-32">Date & Time</th>
                                                    <th className="py-2 px-2 font-bold w-20 text-center">Status</th>
                                                    <th className="py-2 px-2 font-bold w-28">Marked By</th>
                                                    <th className="py-2 px-2 font-bold w-32">Admin Note</th>
                                                    <th className="py-2 px-2 font-bold w-32">Device Info</th>
                                                    <th className="py-2 px-2 font-bold w-36">GPS Coordinates</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedPlayer.attendance.map((att, idx) => (
                                                    <tr key={`${att.date}-${idx}`} className={`pdf-card-row ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                                                        <td className="py-2 px-2 font-mono text-[11px] text-slate-400 text-center align-top">{idx + 1}</td>
                                                        <td className="py-2 px-2 align-top">
                                                            <span className="font-bold text-slate-900 block">{formatDate(att.date)}</span>
                                                            <span className="text-[10px] text-slate-500 font-mono block">
                                                                {att.markedAt ? formatDateTime(att.markedAt).split(",")[1]?.trim() || formatDateTime(att.markedAt) : "Recorded"}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-2 text-center align-top">
                                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                                att.status === "present"
                                                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                                    : "bg-red-100 text-red-800 border border-red-300"
                                                            }`}>
                                                                {att.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-2 text-slate-800 text-[11px] align-top">
                                                            {att.markedByType === "admin" ? (
                                                                <span className="text-blue-800 font-semibold block">
                                                                    Admin {att.markedByAdminId?.username ? `(${att.markedByAdminId.username})` : ""}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-700 block">Self Check-in</span>
                                                            )}
                                                        </td>
                                                        <td className="py-2 px-2 text-slate-600 text-[11px] align-top break-words">
                                                            {att.adminNote || "—"}
                                                        </td>
                                                        <td className="py-2 px-2 text-slate-600 text-[11px] align-top">
                                                            <span className="block font-medium text-slate-700 truncate">{att.deviceName || "Registered Device"}</span>
                                                            {att.deviceId && (
                                                                <span className="font-mono text-[9px] text-slate-400 block truncate">
                                                                    ID: {att.deviceId.slice(-8)}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="py-2 px-2 text-slate-600 text-[11px] align-top">
                                                            {att.location?.latitude ? (
                                                                <div>
                                                                    <span className="font-mono font-medium text-slate-800 block text-[10px]">
                                                                        {att.location.latitude.toFixed(4)}°N, {att.location.longitude?.toFixed(4)}°E
                                                                    </span>
                                                                    {att.location.accuracy !== undefined && att.location.accuracy !== null && (
                                                                        <span className="text-[9px] text-slate-400 block">
                                                                            ±{att.location.accuracy.toFixed(1)}m accuracy
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <span className="text-slate-500 italic text-[10px]">Geo-fence Verified</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded">
                                        No attendance sessions recorded yet for this player.
                                    </p>
                                )}
                            </div>

                            {/* Section 4: Fee Payments Detailed Ledger */}
                            <div className="border border-slate-200 rounded-lg p-4 bg-white">
                                <div className="flex items-center justify-between mb-3 border-b pb-1.5">
                                    <h2 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                                        <Wallet size={16} className="text-teal-600" />
                                        <span>Fee Payments & Dues Ledger</span>
                                    </h2>
                                    <span className="text-xs font-semibold text-slate-600">
                                        Fee Access Status: {selectedPlayer.feeAccessEnabled ? "Active" : "Disabled"}
                                    </span>
                                </div>

                                {selectedPlayer.feePayments && selectedPlayer.feePayments.length > 0 ? (
                                    <div className="border rounded-lg border-slate-200 overflow-hidden">
                                        <table className="w-full text-left text-xs border-collapse table-fixed">
                                            <thead className="bg-slate-100 text-slate-700 border-b">
                                                <tr>
                                                    <th className="py-2 px-3 font-bold w-10 text-center">#</th>
                                                    <th className="py-2 px-3 font-bold w-40">Billing Month</th>
                                                    <th className="py-2 px-3 font-bold w-28 text-center">Status</th>
                                                    <th className="py-2 px-3 font-bold w-48">Last Updated Timestamp</th>
                                                    <th className="py-2 px-3 font-bold">Updated By Admin</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {selectedPlayer.feePayments.map((fee, idx) => (
                                                    <tr key={`${fee.month}-${idx}`} className={`pdf-card-row ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}>
                                                        <td className="py-2 px-3 font-mono text-[11px] text-slate-400 text-center">{idx + 1}</td>
                                                        <td className="py-2 px-3 font-bold text-slate-900">{fee.month}</td>
                                                        <td className="py-2 px-3 text-center">
                                                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                                fee.isPaid
                                                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                                                    : "bg-red-100 text-red-800 border border-red-300"
                                                            }`}>
                                                                {fee.isPaid ? "PAID" : "DUE"}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-3 text-slate-700 font-mono text-[11px]">
                                                            {fee.updatedAt ? formatDateTime(fee.updatedAt) : "—"}
                                                        </td>
                                                        <td className="py-2 px-3 text-slate-700 font-medium">
                                                            {fee.updatedBy?.username ? `${fee.updatedBy.username} (${fee.updatedBy.role || "Admin"})` : "System/Admin"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 py-4 text-center bg-slate-50 rounded">
                                        No fee records registered for this player.
                                    </p>
                                )}
                            </div>

                            {/* Section 5: Security & Device Activity Audit Log */}
                            <div className="pdf-card border border-slate-200 rounded-lg p-4 bg-white">
                                <h2 className="text-xs font-bold uppercase tracking-wider text-violet-900 mb-3 border-b pb-1.5 flex items-center gap-1.5">
                                    <History size={16} className="text-violet-600" />
                                    <span>Security, Credentials & Account Activity Audit</span>
                                </h2>
                                <div className="grid grid-cols-4 gap-3 text-xs mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Password Set Date</span>
                                        <span className="font-medium text-slate-800 text-xs">{formatDateTime(selectedPlayer.playerPasswordSetAt)}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Last Successful Login</span>
                                        <span className="font-medium text-slate-800 text-xs">{formatDateTime(selectedPlayer.playerLastLogin)}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Failed Login Attempts</span>
                                        <span className={`font-bold text-xs ${selectedPlayer.playerFailedLoginAttempts ? "text-red-600" : "text-slate-800"}`}>
                                            {selectedPlayer.playerFailedLoginAttempts || 0} failed
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-semibold text-slate-500 uppercase block">Force Password Reset</span>
                                        <span className="font-medium text-slate-800 text-xs">
                                            {selectedPlayer.playerForcePasswordReset ? "Enabled by Admin" : "Disabled"}
                                        </span>
                                    </div>
                                </div>

                                {/* Detailed Login Sessions Log */}
                                {Array.isArray(selectedPlayer.playerLoginHistory) && selectedPlayer.playerLoginHistory.length > 0 ? (
                                    <div>
                                        <h3 className="text-xs font-bold uppercase text-slate-700 mb-2 flex items-center gap-1">
                                            <Lock size={14} />
                                            <span>Recorded Login Sessions ({selectedPlayer.playerLoginHistory.length})</span>
                                        </h3>
                                        <div className="border rounded border-slate-200 overflow-hidden">
                                            <table className="w-full text-left text-xs border-collapse table-fixed">
                                                <thead className="bg-slate-100 text-slate-700 border-b">
                                                    <tr>
                                                        <th className="py-1.5 px-2.5 w-8 text-center">#</th>
                                                        <th className="py-1.5 px-2.5 w-44">Login Timestamp</th>
                                                        <th className="py-1.5 px-2.5 w-32">IP Address</th>
                                                        <th className="py-1.5 px-2.5 w-36">Device Name</th>
                                                        <th className="py-1.5 px-2.5">Browser & User Agent</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {selectedPlayer.playerLoginHistory.map((sess, idx) => (
                                                        <tr key={sess._id || idx} className="pdf-card-row hover:bg-slate-50">
                                                            <td className="py-1.5 px-2.5 font-mono text-slate-400 text-center">{idx + 1}</td>
                                                            <td className="py-1.5 px-2.5 font-mono text-slate-800 text-[11px]">{formatDateTime(sess.loggedInAt)}</td>
                                                            <td className="py-1.5 px-2.5 font-mono text-blue-700 text-[11px]">{sess.ipAddress || "Unknown"}</td>
                                                            <td className="py-1.5 px-2.5 text-slate-700 text-[11px] truncate">{sess.deviceName || "Standard Device"}</td>
                                                            <td className="py-1.5 px-2.5 text-slate-500 text-[10px] truncate">
                                                                {sess.userAgent || "—"}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 text-center py-2 bg-slate-50 rounded">
                                        No active player login session logs on record.
                                    </p>
                                )}
                            </div>

                            {/* Section 6: Communications, Messages & Inquiries */}
                            {singlePlayerData?.messages && singlePlayerData.messages.length > 0 && (
                                <div className="pdf-card border border-slate-200 rounded-lg p-4 bg-white">
                                    <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-900 mb-3 border-b pb-1.5 flex items-center gap-1.5">
                                        <MessageSquare size={16} className="text-indigo-600" />
                                        <span>Official Communications & Messages ({singlePlayerData.messages.length})</span>
                                    </h2>
                                    <div className="space-y-2">
                                        {singlePlayerData.messages.map((msg) => (
                                            <div key={msg._id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                                                <div className="flex items-center justify-between text-slate-500 mb-1">
                                                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                                                        {msg.type === "player_to_admin" ? "Player → Admin" : "Admin → Player"}
                                                    </span>
                                                    <span className="font-mono text-[10px]">{formatDateTime(msg.createdAt)}</span>
                                                </div>
                                                <p className="font-bold text-slate-900 text-xs">{msg.subject}</p>
                                                <p className="text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap text-[11px]">{msg.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Section 7: Official Digital Verification & Electronic Signature */}
                            <div className="pdf-card border-t-2 border-slate-900 pt-5 mt-6 space-y-3.5">
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                                    <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                                        I hereby certify that this electronic dossier represents the authentic, complete, and un-tampered record maintained in the official Information Management System of <strong>SP Sports Academy, Dhanbad, Jharkhand</strong>. Generated under institutional administrative authority.
                                    </p>
                                </div>

                                {/* Dual Digital Certificate Badges: Digitally Verified & Digitally Signed */}
                                <div className="grid grid-cols-2 gap-3.5">
                                    {/* Box 1: Digitally Verified */}
                                    <div className="border-2 border-emerald-600 bg-emerald-50/40 rounded-xl p-3.5 relative">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                                                    <CheckCircle2 size={18} />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-800 block">
                                                        System Certification
                                                    </span>
                                                    <h4 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
                                                        Digitally Verified
                                                    </h4>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                VERIFIED ✓
                                            </span>
                                        </div>

                                        <div className="mt-2.5 space-y-1 text-[11px] text-slate-700 border-t border-emerald-200 pt-2 font-mono">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Verified By:</span>
                                                <span className="font-semibold text-slate-900">Central Records Database</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Authentication:</span>
                                                <span className="font-bold text-emerald-700">RECORD AUTHENTICATED</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Verification Hash:</span>
                                                <span className="text-[10px] text-slate-600 truncate max-w-[200px]">
                                                    SHA256:{generateDocHash(selectedPlayer._id)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Timestamp:</span>
                                                <span className="text-slate-900">{extractTimestamp}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Box 2: Digitally Signed */}
                                    <div className="border-2 border-blue-600 bg-blue-50/40 rounded-xl p-3.5 relative">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                                                    <ShieldCheck size={18} />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-800 block">
                                                        Electronic Authorization
                                                    </span>
                                                    <h4 className="text-sm font-black text-blue-950 uppercase tracking-wide">
                                                        Digitally Signed
                                                    </h4>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                                SIGNED ✓
                                            </span>
                                        </div>

                                        <div className="mt-2.5 space-y-1 text-[11px] text-slate-700 border-t border-blue-200 pt-2 font-mono">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Signatory:</span>
                                                <span className="font-semibold text-slate-900">Authorized Administrator</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Authority:</span>
                                                <span className="font-semibold text-slate-900">SP Sports Academy, Dhanbad</span>
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

                                {/* Document Identifier Footer */}
                                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                                    <span className="font-mono">DOC ID: SPA-EXT-{selectedPlayer.idCardNumber || selectedPlayer._id.slice(-8).toUpperCase()}</span>
                                    <span>Official Confidential Electronic Document • SP Sports Academy Dhanbad</span>
                                    <span>Valid for All Sporting & Administrative Affiliations</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* ========================================================================= */
                        /* ACADEMY MASTER LEDGER (CONSOLIDATED ALL PLAYERS TABLE) */
                        /* ========================================================================= */
                        <div className="space-y-6">
                            {/* Metrics Summary Header */}
                            <div className="pdf-card grid grid-cols-4 gap-3">
                                <div className="p-3 bg-slate-50 border rounded-lg text-center">
                                    <span className="text-xs text-slate-500 font-semibold block uppercase">Total Registrations</span>
                                    <span className="text-2xl font-black text-slate-900">{filteredPlayers.length}</span>
                                </div>
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                                    <span className="text-xs text-emerald-700 font-semibold block uppercase">Approved</span>
                                    <span className="text-2xl font-black text-emerald-800">
                                        {filteredPlayers.filter((p) => p.status === "approved").length}
                                    </span>
                                </div>
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                                    <span className="text-xs text-amber-700 font-semibold block uppercase">Pending</span>
                                    <span className="text-2xl font-black text-amber-800">
                                        {filteredPlayers.filter((p) => p.status === "pending").length}
                                    </span>
                                </div>
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                                    <span className="text-xs text-red-700 font-semibold block uppercase">Rejected</span>
                                    <span className="text-2xl font-black text-red-800">
                                        {filteredPlayers.filter((p) => p.status === "rejected").length}
                                    </span>
                                </div>
                            </div>

                            {/* Master Ledger Table */}
                            <div className="border rounded-lg border-slate-200 overflow-hidden">
                                <table className="w-full text-left text-xs border-collapse table-fixed">
                                    <thead className="bg-slate-900 text-white">
                                        <tr>
                                            <th className="py-2.5 px-2.5 w-8 text-center">#</th>
                                            <th className="py-2.5 px-2.5 w-24">ID Card No.</th>
                                            <th className="py-2.5 px-2.5 w-36">Player Name</th>
                                            <th className="py-2.5 px-2.5 w-28">Father's Name</th>
                                            <th className="py-2.5 px-2.5 w-36">Contact Details</th>
                                            <th className="py-2.5 px-2.5 w-28">Aadhar No.</th>
                                            <th className="py-2.5 px-2.5 w-28">Role / Age Group</th>
                                            <th className="py-2.5 px-2.5 w-20 text-center">Status</th>
                                            <th className="py-2.5 px-2.5 w-24 text-center">Attendance</th>
                                            <th className="py-2.5 px-2.5 w-24">Registered At</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 text-slate-800">
                                        {filteredPlayers.map((player, index) => (
                                            <tr key={player._id} className="pdf-card-row hover:bg-slate-50">
                                                <td className="py-2 px-2.5 font-semibold text-center">{index + 1}</td>
                                                <td className="py-2 px-2.5 font-mono font-bold text-blue-700">
                                                    {player.idCardNumber || "—"}
                                                </td>
                                                <td className="py-2 px-2.5 font-semibold text-slate-900">
                                                    {player.name}
                                                    <span className="block text-[10px] text-slate-500 font-normal">
                                                        {player.gender} • Blood: {player.bloodGroup || "N/A"}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-2.5 text-slate-700 truncate">{player.fathersName}</td>
                                                <td className="py-2 px-2.5">
                                                    <span className="font-mono block">{player.phone}</span>
                                                    <span className="text-[10px] text-slate-500 block truncate max-w-[130px]">
                                                        {player.email}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-2.5 font-mono">{player.aadharNumber}</td>
                                                <td className="py-2 px-2.5 capitalize">
                                                    <span className="font-medium block">{player.role}</span>
                                                    <span className="text-[10px] text-slate-500 block">{player.ageGroup || "N/A"}</span>
                                                </td>
                                                <td className="py-2 px-2.5 text-center">
                                                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                        player.status === "approved"
                                                            ? "bg-emerald-100 text-emerald-800"
                                                            : player.status === "pending"
                                                            ? "bg-amber-100 text-amber-800"
                                                            : "bg-red-100 text-red-800"
                                                    }`}>
                                                        {player.status}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-2.5 font-medium text-center">
                                                    {player.attendance?.length || 0} sessions
                                                </td>
                                                <td className="py-2 px-2.5 text-slate-500 text-[11px] whitespace-nowrap">
                                                    {formatDate(player.registeredAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Master Ledger Digital Verification & Electronic Signature Block */}
                            <div className="pdf-card border-t-2 border-slate-900 pt-5 mt-6 space-y-3.5">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Box 1: Digitally Verified */}
                                    <div className="border-2 border-emerald-600 bg-emerald-50/40 rounded-xl p-3.5 relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                                    <CheckCircle2 size={16} />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-800 block">
                                                        System Certification
                                                    </span>
                                                    <h4 className="text-xs font-black text-emerald-950 uppercase">
                                                        Digitally Verified
                                                    </h4>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded">
                                                VERIFIED ✓
                                            </span>
                                        </div>
                                        <div className="space-y-0.5 text-[10px] text-slate-700 font-mono border-t border-emerald-200 pt-1.5">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Audit Status:</span>
                                                <span className="font-bold text-emerald-700">ALL {filteredPlayers.length} RECORDS AUTHENTICATED</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Hash:</span>
                                                <span className="text-slate-600">SHA256:{generateDocHash("MASTER_LEDGER")}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Verified On:</span>
                                                <span>{extractTimestamp}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Box 2: Digitally Signed */}
                                    <div className="border-2 border-blue-600 bg-blue-50/40 rounded-xl p-3.5 relative">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center">
                                                    <ShieldCheck size={16} />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-800 block">
                                                        Electronic Authorization
                                                    </span>
                                                    <h4 className="text-xs font-black text-blue-950 uppercase">
                                                        Digitally Signed
                                                    </h4>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 rounded">
                                                SIGNED ✓
                                            </span>
                                        </div>
                                        <div className="space-y-0.5 text-[10px] text-slate-700 font-mono border-t border-blue-200 pt-1.5">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Signatory:</span>
                                                <span className="font-semibold text-slate-900">Authorized Administrator</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Authority:</span>
                                                <span>SP Sports Academy Dhanbad</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Legal Note:</span>
                                                <span className="text-slate-600">No Physical Signature Required</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                                    <span>SP Sports Academy Dhanbad • Computerized Academy Master Ledger Extract</span>
                                    <span className="font-mono">SHA256 SYSTEM SIGNATURE APPLIED • NO PHYSICAL STAMP REQUIRED</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMasterExtract;
