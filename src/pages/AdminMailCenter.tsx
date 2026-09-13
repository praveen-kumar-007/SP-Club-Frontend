import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    FileCheck2,
    FileText,
    HelpCircle,
    Info,
    Mail,
    Paperclip,
    Play,
    Plus,
    Power,
    RefreshCw,
    Search,
    Send,
    Trash2,
    User,
    UserCheck,
    X,
    AlertTriangle,
    Cake,
} from "lucide-react";
import API_BASE_URL, { API_ENDPOINTS } from "@/config/api";

interface MailAttachment {
    name: string;
    size: number;
    type: string;
    base64: string;
}

interface Player {
    _id: string;
    name: string;
    fathersName?: string;
    email: string;
    phone: string;
    status: string;
    role?: string;
    registeredAt?: string;
    idCardNumber?: string;
}

const DEFAULT_DOCUMENTS = [
    "Original Aadhaar Card (along with 1 self-attested photocopy).",
    "Original Date of Birth Proof (Birth Certificate OR Matriculation / 10th Board Certificate).",
    "Original Sports Certificates (School/District/State/National achievement or participation, if any).",
    "Two (2) Recent Passport-Size Color Photographs.",
    "Parent / Guardian ID (mandatory if applicant is under 18 years of age).",
];

const AdminMailCenter = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [token, setToken] = useState<string>("");
    const [mailEnabled, setMailEnabled] = useState<boolean>(true);
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [updatingSettings, setUpdatingSettings] = useState(false);
    const [loadingPlayers, setLoadingPlayers] = useState(false);
    const [sending, setSending] = useState(false);

    // Broadcast state
    const [players, setPlayers] = useState<Player[]>([]);
    const [mode, setMode] = useState<"all" | "selected">("all");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [playerSearch, setPlayerSearch] = useState("");
    const [debouncedPlayerSearch, setDebouncedPlayerSearch] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [cc, setCc] = useState("");
    const [bcc, setBcc] = useState("");
    const [attachments, setAttachments] = useState<MailAttachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mail Tester & Simulator state
    const [testMailType, setTestMailType] = useState<"pending_reminder" | "rejection" | "processing" | "approved" | "birthday">(
        "pending_reminder"
    );
    const [testMode, setTestMode] = useState<"custom" | "select_player">("custom");
    const [allCandidates, setAllCandidates] = useState<Player[]>([]);
    const [selectedCandidateId, setSelectedCandidateId] = useState<string>("");
    const [candidateSearch, setCandidateSearch] = useState<string>("");
    const [testRecipientEmail, setTestRecipientEmail] = useState<string>("");
    const [testCandidateName, setTestCandidateName] = useState<string>("Rahul Sharma");
    const [testFathersName, setTestFathersName] = useState<string>("Rajendra Sharma");
    const [testPhone, setTestPhone] = useState<string>("9876543210");
    const [testRole, setTestRole] = useState<string>("Kabaddi Player (Raider)");
    const [testTempRegId, setTestTempRegId] = useState<string>("TEMP-SP-DEMO89");
    const [testIsTemporary, setTestIsTemporary] = useState<boolean>(true);
    const [testDaysElapsed, setTestDaysElapsed] = useState<number>(6);
    const [testDocuments, setTestDocuments] = useState<string[]>(DEFAULT_DOCUMENTS);
    const [newDocText, setNewDocText] = useState<string>("");
    const [testCustomReason, setTestCustomReason] = useState<string>(
        "Application rejected due to not taking necessary action within the 30-day verification window (in-person document verification not completed)."
    );
    const [sendingTestMail, setSendingTestMail] = useState<boolean>(false);
    const [runningSweep, setRunningSweep] = useState<boolean>(false);

    useEffect(() => {
        const adminToken = localStorage.getItem("adminToken");
        if (!adminToken) {
            navigate("/admin/login");
            return;
        }

        setToken(adminToken);
    }, [navigate]);

    const approvedPlayers = useMemo(
        () => players.filter((p) => p.status === "approved" && Boolean(p.email)),
        [players]
    );

    const filteredApprovedPlayers = useMemo(() => {
        const term = debouncedPlayerSearch.toLowerCase().trim();
        if (!term) return approvedPlayers;

        return approvedPlayers.filter((player) => {
            const name = player.name?.toLowerCase?.() || "";
            const email = player.email?.toLowerCase?.() || "";
            const phone = player.phone?.toLowerCase?.() || "";
            return name.includes(term) || email.includes(term) || phone.includes(term);
        });
    }, [approvedPlayers, debouncedPlayerSearch]);

    const filteredCandidateList = useMemo(() => {
        const term = candidateSearch.toLowerCase().trim();
        if (!term) return allCandidates;

        return allCandidates.filter((c) => {
            const name = c.name?.toLowerCase?.() || "";
            const email = c.email?.toLowerCase?.() || "";
            const phone = c.phone?.toLowerCase?.() || "";
            const status = c.status?.toLowerCase?.() || "";
            return name.includes(term) || email.includes(term) || phone.includes(term) || status.includes(term);
        });
    }, [allCandidates, candidateSearch]);

    const fetchMailSettings = async (adminToken: string) => {
        setLoadingSettings(true);
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN_MAIL_SETTINGS, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            if (!response.ok) {
                throw new Error("Failed to load mail settings");
            }

            const data = await response.json();
            setMailEnabled(Boolean(data.enabled));
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to fetch mail settings",
                variant: "destructive",
            });
        } finally {
            setLoadingSettings(false);
        }
    };

    const fetchApprovedPlayers = async (adminToken: string) => {
        setLoadingPlayers(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/players`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            if (!response.ok) {
                throw new Error("Failed to load players");
            }

            const data = await response.json();
            setPlayers(Array.isArray(data.players) ? data.players : []);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to load players",
                variant: "destructive",
            });
        } finally {
            setLoadingPlayers(false);
        }
    };

    const fetchAllCandidates = async (adminToken: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/registrations?limit=100`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data.registrations)) {
                    setAllCandidates(data.registrations);
                }
            }
        } catch (err) {
            console.warn("Could not fetch candidate registrations list:", err);
        }
    };

    useEffect(() => {
        if (!token) return;

        fetchMailSettings(token);
        fetchApprovedPlayers(token);
        fetchAllCandidates(token);
    }, [token]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedPlayerSearch(playerSearch);
        }, 250);

        return () => clearTimeout(timer);
    }, [playerSearch]);

    const handleToggle = async () => {
        if (!token) return;

        setUpdatingSettings(true);
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN_MAIL_SETTINGS, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ enabled: !mailEnabled }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to update mail setting");
            }

            setMailEnabled(Boolean(data.enabled));
            toast({
                title: "Success",
                description: data.message || "Mail setting updated",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update setting",
                variant: "destructive",
            });
        } finally {
            setUpdatingSettings(false);
        }
    };

    const togglePlayerSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedIds(filteredApprovedPlayers.map((p) => p._id));
    };

    const clearAll = () => {
        setSelectedIds([]);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15 MB

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileList = Array.from(files);
        let currentTotalSize = attachments.reduce((sum, a) => sum + a.size, 0);

        const newAttachments: MailAttachment[] = [];

        for (const file of fileList) {
            if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
                toast({
                    title: "Attachment Size Limit",
                    description: `Adding "${file.name}" exceeds the 15 MB total attachment limit.`,
                    variant: "destructive",
                });
                continue;
            }

            try {
                const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const result = reader.result as string;
                        const cleaned = result.replace(/^data:[^;]+;base64,/, "");
                        resolve(cleaned);
                    };
                    reader.onerror = (err) => reject(err);
                    reader.readAsDataURL(file);
                });

                currentTotalSize += file.size;
                newAttachments.push({
                    name: file.name,
                    size: file.size,
                    type: file.type || "application/octet-stream",
                    base64,
                });
            } catch (err) {
                toast({
                    title: "File Read Error",
                    description: `Failed to read file "${file.name}".`,
                    variant: "destructive",
                });
            }
        }

        if (newAttachments.length > 0) {
            setAttachments((prev) => [...prev, ...newAttachments]);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeAttachment = (indexToRemove: number) => {
        setAttachments((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    // Candidate selector handler
    const handleSelectCandidate = (candidateId: string) => {
        setSelectedCandidateId(candidateId);
        const cand = allCandidates.find((c) => c._id === candidateId);
        if (cand) {
            setTestCandidateName(cand.name || "");
            setTestFathersName(cand.fathersName || "");
            setTestRecipientEmail(cand.email || "");
            setTestPhone(cand.phone || "");
            setTestRole(cand.role || "Kabaddi Player");
            if (cand.idCardNumber) {
                setTestTempRegId(testIsTemporary ? `TEMP-${cand.idCardNumber}` : cand.idCardNumber);
            } else {
                setTestTempRegId(
                    testIsTemporary
                        ? `TEMP-SP-${cand._id.slice(-6).toUpperCase()}`
                        : `SP-REG-${cand._id.slice(-6).toUpperCase()}`
                );
            }
        }
    };

    // Add document requirement item
    const handleAddDocument = () => {
        if (!newDocText.trim()) return;
        setTestDocuments((prev) => [...prev, newDocText.trim()]);
        setNewDocText("");
    };

    const handleRemoveDocument = (idx: number) => {
        setTestDocuments((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleResetDocuments = () => {
        setTestDocuments(DEFAULT_DOCUMENTS);
    };

    // Send Test Mail Handler
    const handleSendTestMail = async () => {
        if (!token) return;

        if (!testRecipientEmail.trim()) {
            toast({
                title: "Recipient Email Required",
                description: "Please enter a valid target email address to receive the test mail.",
                variant: "destructive",
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(testRecipientEmail.trim())) {
            toast({
                title: "Invalid Email",
                description: "Please provide a valid email format.",
                variant: "destructive",
            });
            return;
        }

        setSendingTestMail(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/mail/test-send`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mailType: testMailType,
                    recipientEmail: testRecipientEmail.trim(),
                    candidate: {
                        name: testCandidateName.trim() || "Candidate Name",
                        fathersName: testFathersName.trim() || "Father Name",
                        phone: testPhone.trim() || "9876543210",
                        role: testRole.trim() || "Player",
                    },
                    playerId: selectedCandidateId || undefined,
                    tempRegId: testTempRegId.trim() || "TEMP-SP-TEST",
                    isTemporary: testIsTemporary,
                    daysElapsed: Number(testDaysElapsed) || 6,
                    documents: testDocuments,
                    customReason: testCustomReason.trim(),
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Failed to dispatch test email");
            }

            toast({
                title: "Test Mail Sent Successfully! ✉️",
                description: `Sent "${testMailType}" template to ${testRecipientEmail.trim()} with Ref: ${testTempRegId}`,
            });
        } catch (error) {
            toast({
                title: "Failed to Send Test Mail",
                description: error instanceof Error ? error.message : "Error sending test mail",
                variant: "destructive",
            });
        } finally {
            setSendingTestMail(false);
        }
    };

    // Run Background Verification & Auto-Rejection Sweep
    const handleRunSweep = async () => {
        if (!token) return;

        setRunningSweep(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/process-pending-verifications`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Failed to execute sweep");
            }

            const summary = data.summary || {};
            toast({
                title: "Sweep Complete! 🎯",
                description: `Processed: ${summary.totalPending || 0} pending. Sent ${summary.remindersSent || 0} reminders, auto-rejected ${summary.autoRejected || 0} expired applications.`,
            });
        } catch (error) {
            toast({
                title: "Sweep Execution Failed",
                description: error instanceof Error ? error.message : "Error running verification sweep",
                variant: "destructive",
            });
        } finally {
            setRunningSweep(false);
        }
    };

    // Run On-Demand Birthday Check in Indian Standard Time (IST)
    const [runningBirthdayCheck, setRunningBirthdayCheck] = useState<boolean>(false);
    const handleRunBirthdayCheck = async () => {
        if (!token) return;

        setRunningBirthdayCheck(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/mail/process-birthdays`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to execute birthday check");
            }

            const summary = data.summary || {};
            if (summary.sent) {
                toast({
                    title: "Birthdays Found! 🎂",
                    description: `Found ${summary.count} player(s) with birthday today in IST. Follow-up email sent!`,
                });
            } else {
                toast({
                    title: "Birthday Check (IST)",
                    description: summary.message || "No player birthdays today according to Indian Standard Time.",
                });
            }
        } catch (error) {
            toast({
                title: "Birthday Check Failed",
                description: error instanceof Error ? error.message : "Error running birthday check",
                variant: "destructive",
            });
        } finally {
            setRunningBirthdayCheck(false);
        }
    };

    const handleSend = async () => {
        if (!token) return;

        if (!subject.trim() || !message.trim()) {
            toast({
                title: "Missing Details",
                description: "Subject and message are required",
                variant: "destructive",
            });
            return;
        }

        if (mode === "selected" && selectedIds.length === 0) {
            toast({
                title: "No Players Selected",
                description: "Select at least one approved player",
                variant: "destructive",
            });
            return;
        }

        const validateEmailString = (text: string, label: string) => {
            if (!text.trim()) return { valid: true, error: "" };
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const items = text.split(/[,;\n\r]+/).map((s) => s.trim()).filter(Boolean);
            for (const item of items) {
                if (!emailRegex.test(item)) {
                    return { valid: false, error: `Invalid ${label} email address: "${item}"` };
                }
            }
            return { valid: true, error: "" };
        };

        const ccValidation = validateEmailString(cc, "CC");
        if (!ccValidation.valid) {
            toast({
                title: "Invalid CC Email",
                description: ccValidation.error,
                variant: "destructive",
            });
            return;
        }

        const bccValidation = validateEmailString(bcc, "BCC");
        if (!bccValidation.valid) {
            toast({
                title: "Invalid BCC Email",
                description: bccValidation.error,
                variant: "destructive",
            });
            return;
        }

        setSending(true);
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN_MAIL_SEND, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mode,
                    playerIds: mode === "selected" ? selectedIds : undefined,
                    cc: cc.trim() || undefined,
                    bcc: bcc.trim() || undefined,
                    attachments: attachments.length > 0
                        ? attachments.map((att) => ({ name: att.name, content: att.base64 }))
                        : undefined,
                    subject: subject.trim(),
                    message: message.trim(),
                }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to send mail");
            }

            toast({
                title: "Mail Sent",
                description: data.message || "Email sent successfully",
            });

            setSubject("");
            setMessage("");
            setCc("");
            setBcc("");
            setAttachments([]);
            if (mode === "selected") {
                setSelectedIds([]);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to send mail",
                variant: "destructive",
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-6 px-4">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Top Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                            <Mail className="text-blue-600 w-8 h-8" />
                            Admin Mail Control Center
                        </h1>
                        <p className="text-sm text-slate-600">
                            Broadcast announcements, test and simulate formal notification templates, and trigger automated verification cycles.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            variant="outline"
                            className="bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100 gap-1.5"
                            onClick={handleRunBirthdayCheck}
                            disabled={runningBirthdayCheck}
                        >
                            <Cake size={14} className={runningBirthdayCheck ? "animate-spin" : ""} />
                            {runningBirthdayCheck ? "Checking IST..." : "🎂 Check Birthdays (IST)"}
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 gap-1.5"
                            onClick={handleRunSweep}
                            disabled={runningSweep}
                        >
                            <RefreshCw size={14} className={runningSweep ? "animate-spin" : ""} />
                            {runningSweep ? "Sweeping..." : "Run 3-Day & 30-Day Sweep"}
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
                            <ArrowLeft size={16} className="mr-2" />
                            Back
                        </Button>
                    </div>
                </div>

                {/* Master Switch Card */}
                <Card className="border border-slate-200 shadow-sm">
                    <CardHeader className="py-4">
                        <CardTitle className="flex items-center justify-between text-base">
                            <span className="flex items-center gap-2">
                                <Power size={18} className={mailEnabled ? "text-emerald-600" : "text-red-600"} />
                                Global Email Dispatch Status
                            </span>
                            <Badge className={mailEnabled ? "bg-emerald-600" : "bg-red-600"}>
                                {mailEnabled ? "Active & Sending" : "System Paused"}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-slate-600 border-t pt-3">
                        <p className="text-xs text-slate-500">
                            Master switch controls all automated crons, template testing, and broadcast emails.
                        </p>
                        <Button
                            size="sm"
                            onClick={handleToggle}
                            disabled={loadingSettings || updatingSettings}
                            className={mailEnabled ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}
                        >
                            {updatingSettings ? "Updating..." : mailEnabled ? "Disable Email Delivery" : "Enable Email Delivery"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Main Tabs */}
                <Tabs defaultValue="test_suite" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2 max-w-md bg-slate-200 p-1">
                        <TabsTrigger value="test_suite" className="font-semibold text-xs sm:text-sm">
                            🧪 Mail Testing & Simulator
                        </TabsTrigger>
                        <TabsTrigger value="broadcast" className="font-semibold text-xs sm:text-sm">
                            📢 Broadcast Compose
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB 1: MAIL TESTING & SIMULATOR SUITE */}
                    <TabsContent value="test_suite" className="space-y-6">
                        <Card className="border border-blue-200 shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-b border-blue-100">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                    <div>
                                        <CardTitle className="text-lg text-blue-950 flex items-center gap-2">
                                            <span>Email Template Testing & Manual Dispatch Suite</span>
                                            <Badge className="bg-blue-600 text-white text-[10px]">Interactive</Badge>
                                        </CardTitle>
                                        <CardDescription className="text-xs text-slate-600 mt-1">
                                            Test any system email template (Verification Reminder, 30-Day Rejection, Processing, Approval) with dummy inputs or select an existing player.
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-xs">
                                        <Clock size={14} className="text-blue-600" />
                                        <span>Academy Hours: <strong>02:00 PM – 08:00 PM everyday</strong></span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* 1. Select Mail Template */}
                                <div className="space-y-2">
                                    <Label className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                                        <span>1. Select Email Template to Test / Dispatch:</span>
                                    </Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                        <div
                                            onClick={() => setTestMailType("pending_reminder")}
                                            className={`p-3 rounded-xl border cursor-pointer transition ${testMailType === "pending_reminder" ? "bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20 shadow-xs" : "bg-white hover:bg-slate-50 border-slate-200"}`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold text-amber-900">3-Day Verification</span>
                                                <Badge className="bg-amber-600 text-[10px]">Reminder</Badge>
                                            </div>
                                            <p className="text-[11px] text-slate-600 leading-snug">
                                                Visits notice with original documents & 30-day warning. (2PM-8PM daily)
                                            </p>
                                        </div>

                                        <div
                                            onClick={() => setTestMailType("rejection")}
                                            className={`p-3 rounded-xl border cursor-pointer transition ${testMailType === "rejection" ? "bg-red-50/80 border-red-500 ring-2 ring-red-500/20 shadow-xs" : "bg-white hover:bg-slate-50 border-slate-200"}`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold text-red-900">30-Day Auto-Reject</span>
                                                <Badge className="bg-red-600 text-[10px]">Rejection</Badge>
                                            </div>
                                            <p className="text-[11px] text-slate-600 leading-snug">
                                                Inaction notice after 30 days & instructions to visit office.
                                            </p>
                                        </div>

                                        <div
                                            onClick={() => setTestMailType("processing")}
                                            className={`p-3 rounded-xl border cursor-pointer transition ${testMailType === "processing" ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs" : "bg-white hover:bg-slate-50 border-slate-200"}`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold text-blue-900">Application Received</span>
                                                <Badge className="bg-blue-600 text-[10px]">Processing</Badge>
                                            </div>
                                            <p className="text-[11px] text-slate-600 leading-snug">
                                                Initial confirmation mail upon submitting online form.
                                            </p>
                                        </div>

                                        <div
                                            onClick={() => setTestMailType("approved")}
                                            className={`p-3 rounded-xl border cursor-pointer transition ${testMailType === "approved" ? "bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs" : "bg-white hover:bg-slate-50 border-slate-200"}`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold text-emerald-900">Official Approval</span>
                                                <Badge className="bg-emerald-600 text-[10px]">Approved</Badge>
                                            </div>
                                            <p className="text-[11px] text-slate-600 leading-snug">
                                                Player acceptance confirmation with default login password.
                                            </p>
                                        </div>

                                        <div
                                            onClick={() => setTestMailType("birthday")}
                                            className={`p-3 rounded-xl border cursor-pointer transition ${testMailType === "birthday" ? "bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20 shadow-xs" : "bg-white hover:bg-slate-50 border-slate-200"}`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold text-purple-900">Birthday Followup</span>
                                                <Badge className="bg-purple-600 text-[10px]">🎂 IST Alert</Badge>
                                            </div>
                                            <p className="text-[11px] text-slate-600 leading-snug">
                                                Player birthday notification evaluated strictly in Indian Standard Time (IST).
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Input Mode: Pick existing player OR manual entry */}
                                <div className="space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                                        <Label className="font-bold text-sm text-slate-800 flex items-center gap-2">
                                            <User size={16} className="text-blue-600" />
                                            <span>2. Candidate Data Source:</span>
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={testMode === "custom" ? "default" : "outline"}
                                                onClick={() => setTestMode("custom")}
                                                className="text-xs h-7"
                                            >
                                                Manual / Dummy Entry
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant={testMode === "select_player" ? "default" : "outline"}
                                                onClick={() => setTestMode("select_player")}
                                                className="text-xs h-7"
                                            >
                                                Select From Registered Players
                                            </Button>
                                        </div>
                                    </div>

                                    {testMode === "select_player" && (
                                        <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                                            <Label className="text-xs font-semibold text-slate-700">Search & Select Candidate:</Label>
                                            <Input
                                                placeholder="Filter candidates by name, email, or phone..."
                                                value={candidateSearch}
                                                onChange={(e) => setCandidateSearch(e.target.value)}
                                                className="h-8 text-xs mb-2"
                                            />
                                            <div className="max-h-40 overflow-y-auto divide-y border rounded-md">
                                                {filteredCandidateList.length === 0 ? (
                                                    <p className="p-3 text-xs text-slate-500 text-center">No matching candidates found.</p>
                                                ) : (
                                                    filteredCandidateList.map((cand) => (
                                                        <div
                                                            key={cand._id}
                                                            onClick={() => handleSelectCandidate(cand._id)}
                                                            className={`p-2 text-xs flex items-center justify-between cursor-pointer hover:bg-blue-50 transition ${selectedCandidateId === cand._id ? "bg-blue-100 font-semibold" : ""}`}
                                                        >
                                                            <div>
                                                                <span className="font-bold text-slate-900">{cand.name}</span>
                                                                <span className="text-slate-500 ml-2">({cand.email})</span>
                                                                <span className="text-slate-400 ml-2 font-mono">{cand.phone}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-[10px] capitalize">
                                                                    {cand.status}
                                                                </Badge>
                                                                {selectedCandidateId === cand._id && (
                                                                    <CheckCircle2 size={14} className="text-blue-600" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. Target Recipient Email */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="testEmail" className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                                                <Mail size={13} className="text-blue-600" />
                                                <span>Target Test Email Address (Where to send this email): *</span>
                                            </Label>
                                            <Input
                                                id="testEmail"
                                                placeholder="e.g. your_email@gmail.com or candidate email"
                                                value={testRecipientEmail}
                                                onChange={(e) => setTestRecipientEmail(e.target.value)}
                                                className="bg-white border-blue-300 font-mono text-xs"
                                            />
                                            <p className="text-[11px] text-slate-500">
                                                You can enter your own personal email to test or the player's registered address.
                                            </p>
                                        </div>

                                        {/* Registration Number Mode */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="tempRegId" className="font-bold text-xs text-slate-700">
                                                    Application / Registration Reference Number:
                                                </Label>
                                                <div className="flex items-center gap-1.5">
                                                    <Checkbox
                                                        id="isTempCheck"
                                                        checked={testIsTemporary}
                                                        onCheckedChange={(v) => {
                                                            const isChecked = Boolean(v);
                                                            setTestIsTemporary(isChecked);
                                                            if (isChecked && !testTempRegId.startsWith("TEMP-")) {
                                                                setTestTempRegId(`TEMP-${testTempRegId}`);
                                                            } else if (!isChecked && testTempRegId.startsWith("TEMP-")) {
                                                                setTestTempRegId(testTempRegId.replace(/^TEMP-/, ""));
                                                            }
                                                        }}
                                                    />
                                                    <label htmlFor="isTempCheck" className="text-[11px] text-amber-800 font-medium cursor-pointer">
                                                        Mention as Temporary ID
                                                    </label>
                                                </div>
                                            </div>
                                            <Input
                                                id="tempRegId"
                                                value={testTempRegId}
                                                onChange={(e) => setTestTempRegId(e.target.value)}
                                                className="bg-white font-mono text-xs"
                                            />
                                        </div>
                                    </div>

                                    {/* Candidate Minor Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-600 font-medium">Candidate Name:</Label>
                                            <Input
                                                value={testCandidateName}
                                                onChange={(e) => setTestCandidateName(e.target.value)}
                                                placeholder="e.g. Rahul Sharma"
                                                className="h-8 text-xs bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-600 font-medium">Father's Name:</Label>
                                            <Input
                                                value={testFathersName}
                                                onChange={(e) => setTestFathersName(e.target.value)}
                                                placeholder="e.g. Rajendra Sharma"
                                                className="h-8 text-xs bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-600 font-medium">Mobile Number:</Label>
                                            <Input
                                                value={testPhone}
                                                onChange={(e) => setTestPhone(e.target.value)}
                                                placeholder="e.g. 9876543210"
                                                className="h-8 text-xs bg-white font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-slate-600 font-medium">Sport & Role:</Label>
                                            <Input
                                                value={testRole}
                                                onChange={(e) => setTestRole(e.target.value)}
                                                placeholder="e.g. Kabaddi - Raider"
                                                className="h-8 text-xs bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Specific Document Fields (for Pending Reminder) */}
                                {testMailType === "pending_reminder" && (
                                    <div className="space-y-4 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2">
                                            <div>
                                                <h3 className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                                                    <FileCheck2 size={16} className="text-amber-700" />
                                                    <span>Required Original Documents Checklist (Editable Fields)</span>
                                                </h3>
                                                <p className="text-[11px] text-amber-800">
                                                    Candidate will receive this exact list of original documents to bring to SP Sports Academy.
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Label htmlFor="daysElapsed" className="text-xs text-amber-900 font-bold whitespace-nowrap">
                                                    Elapsed Days:
                                                </Label>
                                                <Input
                                                    id="daysElapsed"
                                                    type="number"
                                                    min={1}
                                                    max={29}
                                                    value={testDaysElapsed}
                                                    onChange={(e) => setTestDaysElapsed(Math.max(1, parseInt(e.target.value) || 1))}
                                                    className="w-16 h-8 text-xs bg-white font-bold text-amber-900 border-amber-300"
                                                />
                                                <span className="text-[11px] text-amber-800 font-semibold whitespace-nowrap">
                                                    ({Math.max(0, 30 - testDaysElapsed)} days remaining)
                                                </span>
                                            </div>
                                        </div>

                                        {/* Documents List */}
                                        <div className="space-y-2">
                                            {testDocuments.map((doc, idx) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <Badge className="bg-amber-200 text-amber-900 hover:bg-amber-200 text-xs w-6 h-6 rounded-full p-0 flex items-center justify-center shrink-0">
                                                        {idx + 1}
                                                    </Badge>
                                                    <Input
                                                        value={doc}
                                                        onChange={(e) => {
                                                            const newDocs = [...testDocuments];
                                                            newDocs[idx] = e.target.value;
                                                            setTestDocuments(newDocs);
                                                        }}
                                                        className="h-8 text-xs bg-white border-amber-200"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveDocument(idx)}
                                                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 shrink-0"
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            ))}

                                            {/* Add New Document item */}
                                            <div className="flex items-center gap-2 pt-2">
                                                <Input
                                                    placeholder="Type custom document requirement to add..."
                                                    value={newDocText}
                                                    onChange={(e) => setNewDocText(e.target.value)}
                                                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddDocument())}
                                                    className="h-8 text-xs bg-white border-amber-200"
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={handleAddDocument}
                                                    className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white shrink-0 gap-1"
                                                >
                                                    <Plus size={14} /> Add Field
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleResetDocuments}
                                                    className="h-8 text-xs text-amber-900 border-amber-300 hover:bg-amber-100 shrink-0"
                                                >
                                                    Reset Defaults
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 5. Specific Rejection Fields (for Rejection Template) */}
                                {testMailType === "rejection" && (
                                    <div className="space-y-2 bg-red-50/50 p-4 rounded-xl border border-red-200">
                                        <Label htmlFor="customReason" className="font-bold text-xs text-red-950 flex items-center gap-1.5">
                                            <AlertTriangle size={15} className="text-red-600" />
                                            <span>Official Rejection Reason (Shown in Red Alert Box):</span>
                                        </Label>
                                        <Textarea
                                            id="customReason"
                                            rows={3}
                                            value={testCustomReason}
                                            onChange={(e) => setTestCustomReason(e.target.value)}
                                            className="bg-white border-red-200 text-xs text-red-950 font-medium"
                                        />
                                        <p className="text-[11px] text-red-700">
                                            The email will clearly instruct the candidate to visit SP Sports Academy office in person between <strong>02:00 PM – 08:00 PM everyday</strong> for further communications.
                                        </p>
                                    </div>
                                )}

                                {/* Preview Card */}
                                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                            <Info size={14} className="text-blue-600" />
                                            Live Summary of Selected Test Configuration:
                                        </span>
                                        <Badge variant="outline" className="text-[11px] font-mono">
                                            Template: {testMailType}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-700">
                                        <div><strong className="text-slate-900">To Email:</strong> {testRecipientEmail || "(Enter target email above)"}</div>
                                        <div><strong className="text-slate-900">Player:</strong> {testCandidateName}</div>
                                        <div><strong className="text-slate-900">App ID:</strong> {testTempRegId} {testIsTemporary && "(TEMP)"}</div>
                                    </div>
                                    {/* Professional Map & Location Preview Card */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-3.5 space-y-2.5">
                                        <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                                            <div className="flex items-center gap-2">
                                                <span className="text-base">📍</span>
                                                <div>
                                                    <div className="text-xs font-bold text-blue-950">SP Sports Academy — Campus & Office Location</div>
                                                    <div className="text-[11px] text-blue-700">Shakti Mandir Path, Dhanbad, Jharkhand 826001</div>
                                                </div>
                                            </div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                                                SP SPORTS ACADEMY PIN ✓
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700 bg-white/80 p-2.5 rounded-lg border border-blue-100">
                                            <div>
                                                <span className="text-slate-500 block">GPS Coordinates:</span>
                                                <span className="font-mono font-bold text-blue-900">23.7811364° N, 86.4234188° E</span>
                                                <span className="text-emerald-700 font-semibold ml-1.5">(Plus Code: QCJF+F93)</span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 block">Visiting & Verification Hours:</span>
                                                <span className="font-bold text-amber-700">02:00 PM – 08:00 PM everyday</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                            <span className="text-[11px] text-slate-600">
                                                Includes direct Google Maps directions URL & interactive coordinate pin in all emails.
                                            </span>
                                            <a
                                                href="https://www.google.com/maps/dir/?api=1&destination=23.7811364,86.4234188"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md shadow-xs transition-colors"
                                            >
                                                🧭 Open SP Sports Academy in Google Maps
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Send Test Action Button */}
                                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                                        <CheckCircle2 size={15} className="text-emerald-600" />
                                        <span>BCC `praveen.pr105@gmail.com` has been completely removed from all outgoing templates.</span>
                                    </div>

                                    <Button
                                        onClick={handleSendTestMail}
                                        disabled={sendingTestMail}
                                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 gap-2 shadow-sm"
                                    >
                                        <Send size={16} className={sendingTestMail ? "animate-pulse" : ""} />
                                        {sendingTestMail ? "Sending Test Mail..." : "Send Test Mail Now"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* TAB 2: BROADCAST & COMPOSE EMAIL */}
                    <TabsContent value="broadcast" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail size={18} />
                                    Broadcast Custom Email to Players
                                </CardTitle>
                                <CardDescription>
                                    Send announcements and custom communications to approved academy players.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Mode Selection */}
                                <div className="space-y-2">
                                    <Label className="font-semibold">Recipients</Label>
                                    <div className="flex flex-wrap gap-4">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="recipientMode"
                                                checked={mode === "all"}
                                                onChange={() => setMode("all")}
                                                className="accent-blue-600"
                                            />
                                            <span className="text-sm">
                                                All Approved Players ({approvedPlayers.length})
                                            </span>
                                        </label>
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="recipientMode"
                                                checked={mode === "selected"}
                                                onChange={() => setMode("selected")}
                                                className="accent-blue-600"
                                            />
                                            <span className="text-sm">
                                                Selected Players ({selectedIds.length})
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                {/* Player Selection (if mode === selected) */}
                                {mode === "selected" && (
                                    <div className="space-y-3 rounded-lg border border-slate-200 p-4 bg-slate-50/50">
                                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                                <Input
                                                    placeholder="Search approved players by name, email, phone..."
                                                    value={playerSearch}
                                                    onChange={(e) => setPlayerSearch(e.target.value)}
                                                    className="pl-9 bg-white"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                                                    Select All ({filteredApprovedPlayers.length})
                                                </Button>
                                                <Button type="button" variant="outline" size="sm" onClick={clearAll}>
                                                    Clear Selection
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="max-h-56 overflow-y-auto space-y-1 border rounded-md p-2 bg-white">
                                            {loadingPlayers ? (
                                                <p className="text-xs text-slate-500 p-2">Loading players...</p>
                                            ) : filteredApprovedPlayers.length === 0 ? (
                                                <p className="text-xs text-slate-500 p-2">No matching approved players found.</p>
                                            ) : (
                                                filteredApprovedPlayers.map((player) => (
                                                    <label
                                                        key={player._id}
                                                        className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer text-xs"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Checkbox
                                                                checked={selectedIds.includes(player._id)}
                                                                onCheckedChange={() => togglePlayerSelection(player._id)}
                                                            />
                                                            <span className="font-medium text-slate-800">{player.name}</span>
                                                            <span className="text-slate-500">({player.email})</span>
                                                        </div>
                                                        <span className="text-slate-400 font-mono">{player.phone}</span>
                                                    </label>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* CC / BCC */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cc" className="font-semibold text-slate-700">CC (Carbon Copy)</Label>
                                        <Input
                                            id="cc"
                                            placeholder="coach@spclub.com, admin@spclub.com"
                                            value={cc}
                                            onChange={(e) => setCc(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bcc" className="font-semibold text-slate-700">BCC (Optional)</Label>
                                        <Input
                                            id="bcc"
                                            placeholder="archive@spclub.com"
                                            value={bcc}
                                            onChange={(e) => setBcc(e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Subject & Message */}
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input
                                        id="subject"
                                        placeholder="Enter email subject"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea
                                        id="message"
                                        rows={8}
                                        placeholder="Write your email message here..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>

                                {/* Attachments */}
                                <div className="space-y-3 pt-1">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <Label className="font-semibold text-slate-700 flex items-center gap-2">
                                            <Paperclip size={16} className="text-slate-500" />
                                            <span>Attachments</span>
                                        </Label>
                                        <div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                multiple
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.png,.jpg,.jpeg,.webp"
                                                className="hidden"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1.5"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Paperclip size={14} />
                                                Attach Files
                                            </Button>
                                        </div>
                                    </div>

                                    {attachments.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="flex flex-wrap gap-2">
                                                {attachments.map((att, index) => (
                                                    <div
                                                        key={`${att.name}-${index}`}
                                                        className="flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                                                    >
                                                        <FileText size={14} className="text-blue-600" />
                                                        <span className="font-medium max-w-[180px] truncate">{att.name}</span>
                                                        <span className="text-slate-500">({formatFileSize(att.size)})</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAttachment(index)}
                                                            className="text-slate-400 hover:text-red-600 ml-1"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2">
                                    <Button onClick={handleSend} disabled={sending} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                                        <Send size={16} className="mr-2" />
                                        {sending ? "Sending Broadcast..." : "Send Broadcast Email"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminMailCenter;
