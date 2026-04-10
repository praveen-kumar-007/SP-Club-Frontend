import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Loader2, RefreshCcw, Search } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface AttendanceItem {
    date: string;
    status: "present" | "absent";
    markedAt?: string;
}

interface PlayerItem {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    idCardNumber?: string;
    attendance?: AttendanceItem[];
}

const todayLocalDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const AdminDateAttendance = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [date, setDate] = useState(todayLocalDate());
    const [search, setSearch] = useState("");
    const [players, setPlayers] = useState<PlayerItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [savingPlayerId, setSavingPlayerId] = useState<string | null>(null);

    const token = localStorage.getItem("adminToken");

    const fetchPlayers = async () => {
        if (!token) return;

        setLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN_PLAYERS, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch players");
            }

            setPlayers(Array.isArray(data.players) ? data.players : []);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Unable to load players",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const updateAttendance = async (playerId: string, checked: boolean) => {
        if (!token) return;

        setSavingPlayerId(playerId);
        try {
            const response = await fetch(`${API_ENDPOINTS.ADMIN_ATTENDANCE}/${playerId}/mark`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    date,
                    status: checked ? "present" : "absent",
                    note: "Updated from Admin Date Attendance page",
                    address: "Marked by admin from date-wise toggle",
                }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to update attendance");
            }

            setPlayers((prev) =>
                prev.map((player) => {
                    if (player._id !== playerId) return player;

                    const existing = Array.isArray(player.attendance) ? player.attendance : [];
                    const others = existing.filter((entry) => entry.date !== date);

                    return {
                        ...player,
                        attendance: [
                            ...others,
                            {
                                date,
                                status: checked ? "present" : "absent",
                                markedAt: new Date().toISOString(),
                            },
                        ],
                    };
                })
            );

            toast({
                title: "Attendance Updated",
                description: checked ? "Marked Present" : "Marked Absent",
            });
        } catch (error) {
            toast({
                title: "Update Failed",
                description: error instanceof Error ? error.message : "Unable to update attendance",
                variant: "destructive",
            });
        } finally {
            setSavingPlayerId(null);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/admin/login");
            return;
        }

        localStorage.setItem("adminSeenAttendanceAt", String(Date.now()));
        fetchPlayers();
    }, [token]);

    const filteredPlayers = useMemo(() => {
        const term = search.trim().toLowerCase();

        const withStatus = players.map((player) => {
            const record = (player.attendance || []).find((entry) => entry.date === date);
            const status = record?.status || "not_marked";
            return {
                ...player,
                selectedDateStatus: status,
            };
        });

        if (!term) return withStatus;

        return withStatus.filter((player) => {
            const name = player.name?.toLowerCase() || "";
            const email = player.email?.toLowerCase() || "";
            const phone = player.phone?.toLowerCase() || "";
            const idCard = player.idCardNumber?.toLowerCase() || "";
            return (
                name.includes(term) ||
                email.includes(term) ||
                phone.includes(term) ||
                idCard.includes(term)
            );
        });
    }, [players, search, date]);

    const presentCount = filteredPlayers.filter((p) => p.selectedDateStatus === "present").length;
    const absentCount = filteredPlayers.filter((p) => p.selectedDateStatus === "absent").length;
    const notMarkedCount = filteredPlayers.filter((p) => p.selectedDateStatus === "not_marked").length;

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Date Wise Attendance</h1>
                        <p className="text-sm text-slate-600">View and update attendance for every player using Present/Absent toggle.</p>
                    </div>
                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <Button variant="outline" onClick={fetchPlayers} disabled={loading} className="w-full sm:w-auto">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                            Refresh
                        </Button>
                        <Button variant="outline" onClick={() => navigate("/admin/dashboard")} className="w-full sm:w-auto">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="grid gap-3 md:grid-cols-[260px_1fr]">
                            <div className="space-y-2">
                                <Label htmlFor="attendance-date" className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4" />
                                    Attendance Date
                                </Label>
                                <Input
                                    id="attendance-date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="attendance-search">Search Player</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="attendance-search"
                                        className="pl-9"
                                        placeholder="Search by name, email, phone or ID card"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-3 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Present</CardDescription>
                            <CardTitle className="text-2xl text-emerald-700">{presentCount}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Absent</CardDescription>
                            <CardTitle className="text-2xl text-rose-700">{absentCount}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Not Marked</CardDescription>
                            <CardTitle className="text-2xl text-amber-700">{notMarkedCount}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Players ({filteredPlayers.length})</CardTitle>
                        <CardDescription>Toggle ON = Present, OFF = Absent for selected date.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {filteredPlayers.map((player) => {
                            const status = player.selectedDateStatus;
                            const isPresent = status === "present";
                            const isSaving = savingPlayerId === player._id;

                            return (
                                <div key={player._id} className="rounded-md border bg-white p-3">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-900">{player.name}</p>
                                            <p className="truncate text-xs text-slate-600">{player.email}</p>
                                            <p className="text-xs text-slate-500">{player.idCardNumber || "No ID"}</p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <Badge
                                                className={
                                                    status === "present"
                                                        ? "bg-emerald-600"
                                                        : status === "absent"
                                                            ? "bg-rose-600"
                                                            : "bg-amber-600"
                                                }
                                            >
                                                {status === "present" ? "Present" : status === "absent" ? "Absent" : "Not Marked"}
                                            </Badge>

                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-600">Absent</span>
                                                <Switch
                                                    checked={isPresent}
                                                    onCheckedChange={(checked) => updateAttendance(player._id, checked)}
                                                    disabled={isSaving}
                                                    aria-label={`Toggle attendance for ${player.name}`}
                                                />
                                                <span className="text-xs text-slate-600">Present</span>
                                            </div>

                                            {isSaving && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {!filteredPlayers.length && (
                            <p className="rounded-md border p-3 text-sm text-slate-500">No players found for this filter.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDateAttendance;
