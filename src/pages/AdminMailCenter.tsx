import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Mail, Paperclip, Power, Search, Send, X } from "lucide-react";
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
    email: string;
    phone: string;
    status: string;
}

const AdminMailCenter = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [token, setToken] = useState<string>("");
    const [mailEnabled, setMailEnabled] = useState<boolean>(true);
    const [loadingSettings, setLoadingSettings] = useState(false);
    const [updatingSettings, setUpdatingSettings] = useState(false);
    const [loadingPlayers, setLoadingPlayers] = useState(false);
    const [sending, setSending] = useState(false);

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

    const selectedPlayers = useMemo(
        () => approvedPlayers.filter((p) => selectedIds.includes(p._id)),
        [approvedPlayers, selectedIds]
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

    useEffect(() => {
        if (!token) return;

        fetchMailSettings(token);
        fetchApprovedPlayers(token);
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
                    cc: cc.trim() ? cc.trim() : undefined,
                    bcc: bcc.trim() ? bcc.trim() : undefined,
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Admin Mail Center</h1>
                        <p className="text-sm text-slate-600">Send branded Brevo emails to approved players.</p>
                    </div>
                    <Button className="w-full sm:w-auto" variant="outline" onClick={() => navigate("/admin/dashboard")}>
                        <ArrowLeft size={16} className="mr-2" />
                        Back
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Power size={18} />
                            Mail Delivery Toggle
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div className="text-sm text-slate-700">
                            Current status:{" "}
                            <Badge className={mailEnabled ? "bg-emerald-600" : "bg-red-600"}>
                                {mailEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                        </div>
                        <Button
                            onClick={handleToggle}
                            disabled={loadingSettings || updatingSettings}
                            className={mailEnabled ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}
                        >
                            {updatingSettings ? "Updating..." : mailEnabled ? "Turn OFF" : "Turn ON"}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail size={18} />
                            Compose Email
                        </CardTitle>
                        <p className="text-sm text-slate-600">
                            Choose All Approved Students or Select Students to send Brevo mail.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-3">
                            <Button
                                type="button"
                                variant={mode === "all" ? "default" : "outline"}
                                onClick={() => setMode("all")}
                            >
                                Send to All Approved Students ({approvedPlayers.length})
                            </Button>
                            <Button
                                type="button"
                                variant={mode === "selected" ? "default" : "outline"}
                                onClick={() => setMode("selected")}
                            >
                                Select Students ({selectedIds.length})
                            </Button>
                        </div>

                        {mode === "selected" && (
                            <div className="border rounded-md p-4 bg-white">
                                <p className="text-xs text-slate-600 mb-3">
                                    Select one or more approved students below.
                                </p>
                                <div className="relative mb-3">
                                    <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                                    <Input
                                        className="pl-9"
                                        placeholder="Search player by name, email or phone"
                                        value={playerSearch}
                                        onChange={(e) => setPlayerSearch(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <Button size="sm" variant="outline" onClick={selectAll}>Select All</Button>
                                    <Button size="sm" variant="outline" onClick={clearAll}>Clear</Button>
                                    <span className="text-xs text-slate-600">
                                        Selected: {selectedPlayers.length} | Matching: {filteredApprovedPlayers.length}
                                    </span>
                                </div>

                                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                                    {loadingPlayers ? (
                                        <p className="text-sm text-slate-500">Loading players...</p>
                                    ) : filteredApprovedPlayers.length === 0 ? (
                                        <p className="text-sm text-slate-500">No approved players with email found.</p>
                                    ) : (
                                        filteredApprovedPlayers.map((player) => {
                                            const checked = selectedIds.includes(player._id);
                                            return (
                                                <label
                                                    key={player._id}
                                                    className="flex items-center gap-3 border rounded-md p-2 hover:bg-slate-50 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={checked}
                                                        onCheckedChange={() => togglePlayerSelection(player._id)}
                                                    />
                                                    <div className="text-sm">
                                                        <p className="font-semibold text-slate-800">{player.name}</p>
                                                        <p className="text-slate-600">{player.email}</p>
                                                    </div>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="cc" className="font-semibold text-slate-700">
                                        CC (Carbon Copy)
                                    </Label>
                                    <Badge variant="outline" className="text-xs font-normal text-slate-500">
                                        Optional
                                    </Badge>
                                </div>
                                <Input
                                    id="cc"
                                    placeholder="coach@spclub.com, info@spclub.com"
                                    value={cc}
                                    onChange={(e) => setCc(e.target.value)}
                                />
                                <p className="text-xs text-slate-500">
                                    Separate multiple emails with commas
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="bcc" className="font-semibold text-slate-700">
                                        BCC (Blind Carbon Copy)
                                    </Label>
                                    <Badge variant="outline" className="text-xs font-normal text-slate-500">
                                        Optional
                                    </Badge>
                                </div>
                                <Input
                                    id="bcc"
                                    placeholder="director@spclub.com, admin@spclub.com"
                                    value={bcc}
                                    onChange={(e) => setBcc(e.target.value)}
                                />
                                <p className="text-xs text-slate-500">
                                    Separate multiple emails with commas
                                </p>
                            </div>
                        </div>

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
                                rows={10}
                                placeholder="Write your email message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>

                        {/* Attachments Section */}
                        <div className="space-y-3 pt-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <Label className="font-semibold text-slate-700 flex items-center gap-2">
                                    <Paperclip size={16} className="text-slate-500" />
                                    <span>Attachments (PDF, Docs, Images)</span>
                                    <Badge variant="outline" className="text-xs font-normal text-slate-500">
                                        Optional • Max 15 MB
                                    </Badge>
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
                                                className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 transition"
                                            >
                                                <FileText size={14} className="text-blue-600 flex-shrink-0" />
                                                <span className="font-medium max-w-[180px] sm:max-w-[260px] truncate" title={att.name}>
                                                    {att.name}
                                                </span>
                                                <span className="text-slate-500">({formatFileSize(att.size)})</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAttachment(index)}
                                                    className="text-slate-400 hover:text-red-600 ml-1"
                                                    title="Remove attachment"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Total size: {formatFileSize(attachments.reduce((sum, a) => sum + a.size, 0))} / 15 MB
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="pt-2">
                            <Button onClick={handleSend} disabled={sending} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                                <Send size={16} className="mr-2" />
                                {sending ? "Sending..." : "Send Email"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminMailCenter;
