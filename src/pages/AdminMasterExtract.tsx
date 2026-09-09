import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    CheckCircle2,
    Database,
    Download,
    FileSpreadsheet,
    History,
    MessageSquare,
    Printer,
    Search,
    Shield,
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
    adminNote?: string;
    markedAt?: string;
}

interface FeePaymentRecord {
    month: string;
    isPaid: boolean;
    updatedAt?: string;
}

interface PlayerLoginHistory {
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
    status: "pending" | "approved" | "rejected";
    registeredAt: string;
    approvedAt?: string;
    approvedBy?: { username?: string; email?: string; role?: string };
    rejectedAt?: string;
    rejectionReason?: string;
    idCardNumber?: string;
    idCardGeneratedAt?: string;
    idCardRole?: string;
    playerPasswordSetAt?: string;
    playerLastLogin?: string;
    playerFailedLoginAttempts?: number;
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
        });
    };

    // Standardized cross-device PDF export via html2pdf.js
    const handleDownloadPdf = async () => {
        if (!documentRef.current) return;

        setDownloadingPdf(true);
        toast({
            title: "Generating PDF Dossier",
            description: "Compiling vector document layout. Download will start automatically...",
        });

        try {
            const element = documentRef.current;
            const filename = viewMode === "single" && selectedPlayer
                ? `SP_Sports_Academy_Dossier_${selectedPlayer.name.replace(/[^a-zA-Z0-9]/g, "_")}_${selectedPlayer.idCardNumber || selectedPlayer._id.slice(-6)}.pdf`
                : `SP_Sports_Academy_Master_Extraction_${new Date().toISOString().split("T")[0]}.pdf`;

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
                    scrollX: 0,
                    scrollY: 0,
                },
                jsPDF: {
                    unit: "mm",
                    format: "a4",
                    orientation: viewMode === "single" ? "portrait" : "landscape",
                },
                pagebreak: { mode: ["avoid-all", "css", "legacy"] },
            };

            await html2pdf().set(opt).from(element).save();

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
            setDownloadingPdf(false);
        }
    };

    const handlePrint = () => {
        window.print();
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
                            Extract every minute registration, attendance, fee, communication, and credential detail.
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
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                            className="h-9 bg-slate-50 hover:bg-slate-100"
                        >
                            <Printer size={16} className="mr-1.5 text-slate-600" />
                            Print
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleDownloadPdf}
                            disabled={downloadingPdf || loading}
                            className="h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
                        >
                            <Download size={16} className="mr-1.5" />
                            {downloadingPdf ? "Generating..." : "Download Official PDF"}
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
            <div
                id="master-extract-document"
                ref={documentRef}
                className="max-w-[1000px] mx-auto bg-white p-6 sm:p-10 shadow-xl border border-slate-200 rounded-xl text-slate-900 font-sans print:shadow-none print:border-none print:p-0 print:m-0"
                style={{ minHeight: "1100px" }}
            >
                {/* Official Academy Header */}
                <div className="border-b-2 border-slate-900 pb-5 mb-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <img
                                src="/Logo.png"
                                alt="SP Sports Academy"
                                className="w-20 h-20 object-contain rounded-lg p-1 border border-slate-200 shadow-sm"
                            />
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-slate-900 uppercase">
                                    SP SPORTS ACADEMY
                                </h1>
                                <p className="text-xs sm:text-sm font-bold tracking-wide text-blue-800 uppercase">
                                    Official Player Dossier & Master Record Extraction Ledger
                                </p>
                                <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
                                    Shakti Mandir Path, Dhanbad, Jharkhand 826007 • Compliant with AKFI Standards
                                </p>
                                <p className="text-[10px] sm:text-[11px] text-slate-500">
                                    Email: spkabaddigroupdhanbad@gmail.com • Web: https://spkabaddi.me • Phone: +91 8271882034
                                </p>
                            </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                            <div className="border border-slate-300 rounded px-2.5 py-1 bg-slate-50 text-[11px] font-mono font-semibold">
                                <span className="text-slate-500">REF:</span> SP-EXT-{selectedPlayer?._id.slice(-8).toUpperCase() || "MASTER"}
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
                    <div className="space-y-6 text-xs sm:text-sm">
                        {/* Section 1: Identification & Profile Overview */}
                        <div className="grid sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50/80 border border-slate-200">
                            {/* Player Photo */}
                            <div className="flex flex-col items-center justify-center sm:border-r border-slate-200 pr-2">
                                {selectedPlayer.photo ? (
                                    <img
                                        src={selectedPlayer.photo}
                                        alt={selectedPlayer.name}
                                        crossOrigin="anonymous"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLElement).style.display = "none";
                                        }}
                                        className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-lg border-2 border-slate-300 shadow-sm"
                                    />
                                ) : (
                                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 font-semibold text-xs">
                                        No Photo
                                    </div>
                                )}
                                <div className="mt-2 text-center">
                                    <Badge
                                        className={
                                            selectedPlayer.status === "approved"
                                                ? "bg-emerald-600"
                                                : selectedPlayer.status === "pending"
                                                ? "bg-amber-500"
                                                : "bg-red-600"
                                        }
                                    >
                                        {selectedPlayer.status.toUpperCase()}
                                    </Badge>
                                </div>
                            </div>

                            {/* Core Identity Attributes */}
                            <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Full Name</span>
                                    <span className="font-bold text-slate-900 text-sm">{selectedPlayer.name}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Father's Name</span>
                                    <span className="font-medium text-slate-800">{selectedPlayer.fathersName || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">ID Card Number</span>
                                    <span className="font-bold text-blue-700 font-mono">{selectedPlayer.idCardNumber || "NOT ISSUED"}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Gender</span>
                                    <span className="font-medium text-slate-800 capitalize">{selectedPlayer.gender}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Date of Birth / Age</span>
                                    <span className="font-medium text-slate-800">
                                        {formatDate(selectedPlayer.dob)} ({calculateAge(selectedPlayer.dob)})
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Blood Group</span>
                                    <span className="font-bold text-red-600">{selectedPlayer.bloodGroup || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Primary Contact</span>
                                    <span className="font-medium text-slate-800 font-mono">{selectedPlayer.phone || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Parents Contact</span>
                                    <span className="font-medium text-slate-800 font-mono">{selectedPlayer.parentsPhone || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Registered Email</span>
                                    <span className="font-medium text-slate-800 break-all">{selectedPlayer.email || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Aadhar Number</span>
                                    <span className="font-medium font-mono text-slate-800">{selectedPlayer.aadharNumber || "N/A"}</span>
                                    {(selectedPlayer.aadharFront || selectedPlayer.aadharBack) && (
                                        <div className="flex items-center gap-2 mt-1">
                                            {selectedPlayer.aadharFront && (
                                                <a href={selectedPlayer.aadharFront} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline">
                                                    [Aadhar Front]
                                                </a>
                                            )}
                                            {selectedPlayer.aadharBack && (
                                                <a href={selectedPlayer.aadharBack} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline">
                                                    [Aadhar Back]
                                                </a>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="sm:col-span-2">
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Residential Address</span>
                                    <span className="font-medium text-slate-800">{selectedPlayer.address || "N/A"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Sports, Academy & Administrative Record */}
                        <div className="border border-slate-200 rounded-lg p-4 bg-white">
                            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-900 mb-3 border-b pb-1.5 flex items-center gap-1.5">
                                <Shield size={16} className="text-blue-600" />
                                <span>Athletic & Administrative Record</span>
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Playing Role</span>
                                    <span className="font-semibold text-slate-800">{selectedPlayer.role}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Age Group</span>
                                    <span className="font-semibold text-slate-800">{selectedPlayer.ageGroup || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Jersey No. / Kit</span>
                                    <span className="font-semibold text-slate-800">
                                        #{selectedPlayer.jerseyNumber ?? "N/A"} (Size: {selectedPlayer.kitSize || "N/A"})
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Experience</span>
                                    <span className="font-semibold text-slate-800">{selectedPlayer.experience || "Fresh Recruit"}</span>
                                </div>
                                <div className="sm:col-span-2">
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Kabaddi Positions</span>
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                        {Array.isArray(selectedPlayer.kabaddiPositions) && selectedPlayer.kabaddiPositions.length > 0 ? (
                                            selectedPlayer.kabaddiPositions.map((pos) => (
                                                <span key={pos} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] border border-blue-200">
                                                    {pos}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-600 font-medium">Standard Kabaddi Formation</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Club / Unit Details</span>
                                    <span className="font-semibold text-slate-800">{selectedPlayer.clubDetails || "SP Sports Academy Main"}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Registration Date</span>
                                    <span className="font-medium text-slate-800">{formatDateTime(selectedPlayer.registeredAt)}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Approval Date</span>
                                    <span className="font-medium text-slate-800">{formatDate(selectedPlayer.approvedAt)}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Approved By Admin</span>
                                    <span className="font-medium text-slate-800">{selectedPlayer.approvedBy?.username || "Admin Authority"}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">ID Card Generated</span>
                                    <span className="font-medium text-slate-800">{formatDate(selectedPlayer.idCardGeneratedAt)}</span>
                                </div>
                                {selectedPlayer.rejectionReason && (
                                    <div className="sm:col-span-4 bg-red-50 border border-red-200 p-2 rounded text-red-700">
                                        <strong className="block text-xs uppercase">Rejection Reason:</strong>
                                        <span>{selectedPlayer.rejectionReason} (Dated: {formatDate(selectedPlayer.rejectedAt)})</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Section 3: Attendance Analytics & Detailed Log */}
                        <div className="border border-slate-200 rounded-lg p-4 bg-white">
                            <div className="flex items-center justify-between mb-3 border-b pb-1.5">
                                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                                    <CheckCircle2 size={16} className="text-emerald-600" />
                                    <span>Complete Attendance Ledger ({selectedPlayer.attendance?.length || 0} Sessions)</span>
                                </h2>
                                <div className="flex items-center gap-2 text-xs font-semibold">
                                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        Present: {singlePlayerData?.summary.presentCount ?? selectedPlayer.attendance?.filter(a => a.status === 'present').length ?? 0}
                                    </span>
                                    <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                                        Absent: {singlePlayerData?.summary.absentCount ?? selectedPlayer.attendance?.filter(a => a.status === 'absent').length ?? 0}
                                    </span>
                                    <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                        Ratio: {singlePlayerData?.summary.attendancePercentage ?? 0}%
                                    </span>
                                </div>
                            </div>

                            {selectedPlayer.attendance && selectedPlayer.attendance.length > 0 ? (
                                <div className="max-h-72 overflow-y-auto border rounded border-slate-200">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead className="bg-slate-100 text-slate-700 sticky top-0">
                                            <tr className="border-b">
                                                <th className="py-1.5 px-2">Date</th>
                                                <th className="py-1.5 px-2">Status</th>
                                                <th className="py-1.5 px-2">Marked Time</th>
                                                <th className="py-1.5 px-2">Marked By</th>
                                                <th className="py-1.5 px-2">Device / Identity</th>
                                                <th className="py-1.5 px-2">GPS Location</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedPlayer.attendance.map((att, idx) => (
                                                <tr key={`${att.date}-${idx}`} className="hover:bg-slate-50">
                                                    <td className="py-1.5 px-2 font-semibold text-slate-800">{att.date}</td>
                                                    <td className="py-1.5 px-2">
                                                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                            att.status === "present"
                                                                ? "bg-emerald-100 text-emerald-800"
                                                                : "bg-red-100 text-red-800"
                                                        }`}>
                                                            {att.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-1.5 px-2 text-slate-600 font-mono text-[11px]">
                                                        {formatDateTime(att.markedAt)}
                                                    </td>
                                                    <td className="py-1.5 px-2 capitalize text-slate-700 font-medium">
                                                        {att.markedByType || "player"}
                                                    </td>
                                                    <td className="py-1.5 px-2 text-slate-600 text-[11px] truncate max-w-[140px]">
                                                        {att.deviceName || att.deviceId || "Registered Device"}
                                                    </td>
                                                    <td className="py-1.5 px-2 text-slate-600 text-[11px]">
                                                        {att.location?.latitude ? (
                                                            <span>
                                                                {att.location.latitude.toFixed(4)}, {att.location.longitude?.toFixed(4)}
                                                                {att.location.address ? ` (${att.location.address})` : ""}
                                                            </span>
                                                        ) : (
                                                            "Academy Geo-fence"
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 py-3 text-center bg-slate-50 rounded">
                                    No attendance sessions recorded yet for this player.
                                </p>
                            )}
                        </div>

                        {/* Section 4: Fee Payments Ledger */}
                        <div className="border border-slate-200 rounded-lg p-4 bg-white">
                            <div className="flex items-center justify-between mb-3 border-b pb-1.5">
                                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                                    <Wallet size={16} className="text-teal-600" />
                                    <span>Fee Payments & Dues Status</span>
                                </h2>
                                <span className="text-xs font-semibold text-slate-600">
                                    Fee Access: {selectedPlayer.feeAccessEnabled ? "Active" : "Disabled"}
                                </span>
                            </div>

                            {selectedPlayer.feePayments && selectedPlayer.feePayments.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {selectedPlayer.feePayments.map((fee, idx) => (
                                        <div
                                            key={`${fee.month}-${idx}`}
                                            className={`p-2 rounded border text-xs flex items-center justify-between ${
                                                fee.isPaid
                                                    ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                                                    : "bg-red-50 border-red-200 text-red-900"
                                            }`}
                                        >
                                            <span className="font-semibold">{fee.month}</span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-white shadow-xs">
                                                {fee.isPaid ? "PAID" : "DUE"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 py-3 text-center bg-slate-50 rounded">
                                    No fee records registered for this player.
                                </p>
                            )}
                        </div>

                        {/* Section 5: Communications, Messages & Inquiries */}
                        {singlePlayerData?.messages && singlePlayerData.messages.length > 0 && (
                            <div className="border border-slate-200 rounded-lg p-4 bg-white">
                                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-900 mb-3 border-b pb-1.5 flex items-center gap-1.5">
                                    <MessageSquare size={16} className="text-indigo-600" />
                                    <span>Communications & Messages ({singlePlayerData.messages.length})</span>
                                </h2>
                                <div className="space-y-2 max-h-56 overflow-y-auto">
                                    {singlePlayerData.messages.map((msg) => (
                                        <div key={msg._id} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                                            <div className="flex items-center justify-between text-slate-500 mb-1">
                                                <span className="font-bold text-slate-800 capitalize">
                                                    {msg.type === "player_to_admin" ? "Player → Admin" : "Admin → Player"}
                                                </span>
                                                <span className="font-mono text-[11px]">{formatDateTime(msg.createdAt)}</span>
                                            </div>
                                            <p className="font-semibold text-slate-800">{msg.subject}</p>
                                            <p className="text-slate-600 mt-0.5 leading-relaxed">{msg.message}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section 6: Security & Device Activity */}
                        <div className="border border-slate-200 rounded-lg p-4 bg-white">
                            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-violet-900 mb-3 border-b pb-1.5 flex items-center gap-1.5">
                                <History size={16} className="text-violet-600" />
                                <span>Security & Account Activity Audit</span>
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Password Set Date</span>
                                    <span className="font-medium text-slate-800">{formatDateTime(selectedPlayer.playerPasswordSetAt)}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Last Login Timestamp</span>
                                    <span className="font-medium text-slate-800">{formatDateTime(selectedPlayer.playerLastLogin)}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Failed Login Attempts</span>
                                    <span className="font-medium text-slate-800">{selectedPlayer.playerFailedLoginAttempts || 0}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-500 uppercase block">Login History Count</span>
                                    <span className="font-medium text-slate-800">{selectedPlayer.playerLoginHistory?.length || 0} sessions</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 7: Official Attestation & Seal */}
                        <div className="border-t-2 border-slate-900 pt-6 mt-8">
                            <p className="text-[11px] text-slate-600 italic leading-relaxed text-center mb-8">
                                I hereby certify that the above extract represents the authentic and complete records stored in the official information management system of SP Sports Academy, Dhanbad, Jharkhand.
                            </p>
                            <div className="grid grid-cols-3 gap-6 text-center text-xs">
                                <div>
                                    <div className="h-14 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center pb-1">
                                        <span className="font-mono text-[11px] text-slate-400">DIGITALLY VERIFIED</span>
                                    </div>
                                    <span className="font-bold text-slate-800 block">Record In-Charge</span>
                                    <span className="text-[10px] text-slate-500">SP Sports Academy</span>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 rounded-full border-2 border-double border-blue-900 flex items-center justify-center text-[9px] font-bold text-blue-900 uppercase tracking-tighter text-center p-1">
                                        SP SPORTS ACADEMY DHANBAD
                                    </div>
                                    <span className="text-[9px] text-slate-400 mt-1 font-semibold">OFFICIAL SEAL</span>
                                </div>
                                <div>
                                    <div className="h-14 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center pb-1">
                                        <span className="font-mono text-[11px] text-slate-400">AUTHORIZED</span>
                                    </div>
                                    <span className="font-bold text-slate-800 block">Secretary / Management</span>
                                    <span className="text-[10px] text-slate-500">SP Sports Academy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* ========================================================================= */
                    /* ACADEMY MASTER LEDGER (CONSOLIDATED ALL PLAYERS TABLE) */
                    /* ========================================================================= */
                    <div className="space-y-6">
                        {/* Metrics Summary Header */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                        <div className="overflow-x-auto border rounded-lg border-slate-200">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="bg-slate-900 text-white">
                                    <tr>
                                        <th className="py-2.5 px-3">#</th>
                                        <th className="py-2.5 px-3">ID Card No.</th>
                                        <th className="py-2.5 px-3">Player Name</th>
                                        <th className="py-2.5 px-3">Father's Name</th>
                                        <th className="py-2.5 px-3">Contact Details</th>
                                        <th className="py-2.5 px-3">Aadhar No.</th>
                                        <th className="py-2.5 px-3">Role / Age Group</th>
                                        <th className="py-2.5 px-3">Status</th>
                                        <th className="py-2.5 px-3">Attendance</th>
                                        <th className="py-2.5 px-3">Registered At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 text-slate-800">
                                    {filteredPlayers.map((player, index) => (
                                        <tr key={player._id} className="hover:bg-slate-50">
                                            <td className="py-2 px-3 font-semibold">{index + 1}</td>
                                            <td className="py-2 px-3 font-mono font-bold text-blue-700">
                                                {player.idCardNumber || "—"}
                                            </td>
                                            <td className="py-2 px-3 font-semibold text-slate-900">
                                                {player.name}
                                                <span className="block text-[10px] text-slate-500 font-normal">
                                                    {player.gender} • Blood: {player.bloodGroup || "N/A"}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-slate-700">{player.fathersName}</td>
                                            <td className="py-2 px-3">
                                                <span className="font-mono block">{player.phone}</span>
                                                <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                                                    {player.email}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 font-mono">{player.aadharNumber}</td>
                                            <td className="py-2 px-3 capitalize">
                                                <span className="font-medium block">{player.role}</span>
                                                <span className="text-[10px] text-slate-500 block">{player.ageGroup || "N/A"}</span>
                                            </td>
                                            <td className="py-2 px-3">
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
                                            <td className="py-2 px-3 font-medium">
                                                {player.attendance?.length || 0} sessions
                                            </td>
                                            <td className="py-2 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                                                {formatDate(player.registeredAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Attestation Block */}
                        <div className="border-t-2 border-slate-900 pt-6 mt-8 flex items-center justify-between text-xs text-slate-600">
                            <div>
                                <p className="font-bold text-slate-900">SP SPORTS ACADEMY DHANBAD</p>
                                <p className="text-[11px]">Computerized Academy Ledger Extract • Page 1 of 1</p>
                            </div>
                            <div className="text-right">
                                <span className="font-bold block text-slate-900">Authorized Signatory</span>
                                <span className="text-[11px] text-slate-500">Official Academy Seal Affixed</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMasterExtract;
