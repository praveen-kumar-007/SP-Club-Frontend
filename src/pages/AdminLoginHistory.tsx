import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History, Loader2, Monitor, Search, Shield, User } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface LoginHistoryItem {
    ipAddress?: string;
    deviceName?: string;
    userAgent?: string;
    loggedInAt?: string;
}

interface AdminLoginUser {
    _id: string;
    username: string;
    email: string;
    role: string;
    lastLogin: string | null;
    loginHistory: LoginHistoryItem[];
}

interface PlayerLoginUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    idCardNumber?: string | null;
    lastLogin: string | null;
    loginHistory: LoginHistoryItem[];
}

const formatDate = (value?: string | null) => {
    if (!value) return "Never";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleString();
};

const LoginHistoryPreview = ({ logs }: { logs: LoginHistoryItem[] }) => {
    if (!logs.length) {
        return <p className="text-sm text-slate-500">No login history available.</p>;
    }

    return (
        <div className="grid gap-2 sm:grid-cols-2">
            {logs.map((log, index) => (
                <div key={`${log.loggedInAt || "na"}-${index}`} className="rounded-md border bg-slate-50 p-3">
                    <p className="text-xs font-semibold text-slate-700">Login #{index + 1}</p>
                    <p className="text-xs text-slate-600 mt-1">Time: {formatDate(log.loggedInAt)}</p>
                    <p className="text-xs text-slate-600">IP: {log.ipAddress || "unknown"}</p>
                    <p className="text-xs text-slate-600">Device: {log.deviceName || "Web Browser"}</p>
                </div>
            ))}
        </div>
    );
};

const AdminLoginHistory = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [admins, setAdmins] = useState<AdminLoginUser[]>([]);
    const [players, setPlayers] = useState<PlayerLoginUser[]>([]);
    const [search, setSearch] = useState("");

    const token = localStorage.getItem("adminToken");

    const filteredAdmins = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return admins;

        return admins.filter((admin) => {
            const username = admin.username?.toLowerCase() || "";
            const email = admin.email?.toLowerCase() || "";
            return username.includes(term) || email.includes(term);
        });
    }, [admins, search]);

    const filteredPlayers = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return players;

        return players.filter((player) => {
            const name = player.name?.toLowerCase() || "";
            const email = player.email?.toLowerCase() || "";
            const idCard = player.idCardNumber?.toLowerCase() || "";
            return name.includes(term) || email.includes(term) || idCard.includes(term);
        });
    }, [players, search]);

    const fetchLoginHistory = async () => {
        if (!token) return;

        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN_LOGIN_HISTORY, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to load login history");
            }

            setAdmins(Array.isArray(data.admins) ? data.admins : []);
            setPlayers(Array.isArray(data.players) ? data.players : []);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Unable to fetch login history",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/admin/login");
            return;
        }

        localStorage.setItem("adminSeenLoginHistoryAt", String(Date.now()));

        fetchLoginHistory();
    }, [token]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Login History</h1>
                        <p className="text-sm text-slate-600">Shows only latest 2 login logs per admin and per approved player.</p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <Button className="w-full sm:w-auto" variant="outline" onClick={fetchLoginHistory} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <History className="mr-2 h-4 w-4" />}
                            Refresh
                        </Button>
                        <Button className="w-full sm:w-auto" variant="outline" onClick={() => navigate("/admin/dashboard")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                className="pl-9"
                                placeholder="Search by admin/player name, email or ID card"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-emerald-700" />
                                Admins ({filteredAdmins.length})
                            </CardTitle>
                            <CardDescription>Latest 2 login logs with IP for each admin.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {filteredAdmins.map((admin) => (
                                <div key={admin._id} className="rounded-md border p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="font-semibold text-slate-900">{admin.username}</p>
                                            <p className="text-xs text-slate-600">{admin.email}</p>
                                        </div>
                                        <Badge className="bg-emerald-700">{admin.role}</Badge>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-600">Last login: {formatDate(admin.lastLogin)}</p>
                                    <div className="mt-3">
                                        <LoginHistoryPreview logs={admin.loginHistory} />
                                    </div>
                                </div>
                            ))}
                            {!filteredAdmins.length && <p className="text-sm text-slate-500">No admins found for this search.</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-blue-700" />
                                Players ({filteredPlayers.length})
                            </CardTitle>
                            <CardDescription>Latest 2 login logs with IP for each approved player.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {filteredPlayers.map((player) => (
                                <div key={player._id} className="rounded-md border p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <p className="font-semibold text-slate-900">{player.name}</p>
                                            <p className="text-xs text-slate-600">{player.email}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="outline" className="capitalize">{player.role || "player"}</Badge>
                                            <Badge className="bg-blue-700">{player.idCardNumber || "No ID"}</Badge>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-slate-600">Last login: {formatDate(player.lastLogin)}</p>
                                    <div className="mt-3">
                                        <LoginHistoryPreview logs={player.loginHistory} />
                                    </div>
                                </div>
                            ))}
                            {!filteredPlayers.length && <p className="text-sm text-slate-500">No players found for this search.</p>}
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-slate-200">
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center">
                            <Monitor className="h-4 w-4 text-slate-500" />
                            Login history captures user IP from request headers and keeps only latest 2 records per account.
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminLoginHistory;
