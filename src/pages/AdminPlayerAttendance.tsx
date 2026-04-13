import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import AttendanceCalendar, { AttendanceEntry } from "@/components/AttendanceCalendar";
import { ArrowLeft, ChevronLeft, ChevronRight, Loader2, Search, ShieldCheck } from "lucide-react";

interface PlayerItem {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    idCardNumber: string;
    attendanceCount: number;
}

interface AttendanceRecord {
    date: string;
    status: "present" | "absent";
    deviceId?: string | null;
    deviceName?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    language?: string | null;
    platform?: string | null;
    timezone?: string | null;
    screenResolution?: string | null;
    viewport?: string | null;
    networkType?: string | null;
    effectiveType?: string | null;
    markedByType?: "player" | "admin";
    markedByAdminId?: string | { _id?: string } | null;
    adminNote?: string | null;
    location?: {
        latitude: number;
        longitude: number;
        accuracy?: number;
        address?: string;
    };
    markedAt?: string;
}

const currentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const changeMonth = (value: string, delta: number) => {
    const [yearStr, monthStr] = value.split("-");
    const date = new Date(Number(yearStr), Number(monthStr) - 1 + delta, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const MAX_ALLOWED_ACCURACY_METERS = 100;

const getLiveLocation = () => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
            return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0,
        });
    });
};

const hasValidCoordinates = (latitude: number, longitude: number) => {
    const validRange = Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
    const notZeroPair = !(Math.abs(latitude) < 0.000001 && Math.abs(longitude) < 0.000001);
    return validRange && notZeroPair;
};

const normalizeSearchText = (value: string) => value.toLowerCase().trim().replace(/\s+/g, " ");

const matchesRelatedSearch = (fields: Array<string | undefined>, query: string) => {
    const normalizedQuery = normalizeSearchText(query);
    if (!normalizedQuery) return true;

    const queryTokens = normalizedQuery.split(" ").filter(Boolean);
    const normalizedFields = fields.map((field) => normalizeSearchText(field || ""));
    const joinedFields = normalizedFields.join(" ");
    const compactFields = joinedFields.replace(/[^a-z0-9]/g, "");

    return queryTokens.every((token) => {
        const compactToken = token.replace(/[^a-z0-9]/g, "");
        return joinedFields.includes(token) || (compactToken ? compactFields.includes(compactToken) : false);
    });
};

const AdminPlayerAttendance = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [ageGroup, setAgeGroup] = useState("all");
    const [gender, setGender] = useState("all");
    const [month, setMonth] = useState(currentMonth());
    const [players, setPlayers] = useState<PlayerItem[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<PlayerItem | null>(null);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [practiceDates, setPracticeDates] = useState<string[]>([]);
    const [loadingPlayers, setLoadingPlayers] = useState(false);
    const [markingByAdmin, setMarkingByAdmin] = useState(false);
    const [markDate, setMarkDate] = useState(new Date().toISOString().split("T")[0]);
    const [markStatus, setMarkStatus] = useState<"present" | "absent">("present");
    const [adminNote, setAdminNote] = useState("");

    const token = localStorage.getItem("adminToken");

    const attendanceForCalendar: AttendanceEntry[] = useMemo(
        () => attendance.map((item) => ({ date: item.date, status: item.status })),
        [attendance]
    );

    const loadPlayers = async () => {
        if (!token) return;
        setLoadingPlayers(true);

        try {
            const url = `${API_ENDPOINTS.ADMIN_PLAYERS}?all=true&ageGroup=${encodeURIComponent(ageGroup)}&gender=${encodeURIComponent(gender)}`;
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch players");
            }

            const nextPlayers: PlayerItem[] = data.players || [];
            setPlayers(nextPlayers);
            setSelectedPlayer((prev) => {
                if (!nextPlayers.length) return null;
                if (prev && nextPlayers.some((player) => player._id === prev._id)) return prev;
                return nextPlayers[0];
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Unable to fetch players",
                variant: "destructive",
            });
        } finally {
            setLoadingPlayers(false);
        }
    };

    const filteredPlayers = useMemo(() => {
        return players.filter((player) =>
            matchesRelatedSearch(
                [player.name, player.email, player.phone, player.idCardNumber],
                search
            )
        );
    }, [players, search]);

    const saveByAdmin = async () => {
        if (!token || !selectedPlayer) return;

        if (!markDate) {
            toast({
                title: "Date Required",
                description: "Please choose a date for attendance marking.",
                variant: "destructive",
            });
            return;
        }

        setMarkingByAdmin(true);
        try {
            const position = await getLiveLocation();
            const locationAccuracy = Number(position.coords.accuracy);

            if (!hasValidCoordinates(position.coords.latitude, position.coords.longitude)) {
                throw new Error("Valid latitude and longitude are required to mark attendance.");
            }

            if (!Number.isFinite(locationAccuracy) || locationAccuracy > MAX_ALLOWED_ACCURACY_METERS) {
                throw new Error(
                    `Location is not precise enough (${Math.round(locationAccuracy)}m). Enable precise location and retry.`
                );
            }

            const response = await fetch(`${API_ENDPOINTS.ADMIN_ATTENDANCE}/${selectedPlayer._id}/mark`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    date: markDate,
                    status: markStatus,
                    note: adminNote.trim() || undefined,
                    address: "Marked by admin with live location",
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: locationAccuracy,
                }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to mark attendance by admin");
            }

            toast({
                title: "Attendance Saved",
                description: data.message || "Admin marked attendance successfully.",
            });

            await loadAttendance(selectedPlayer._id, month);
            setAdminNote("");
        } catch (error) {
            toast({
                title: "Mark Failed",
                description: error instanceof Error ? error.message : "Unable to mark attendance",
                variant: "destructive",
            });
        } finally {
            setMarkingByAdmin(false);
        }
    };

    const loadAttendance = async (playerId: string, activeMonth: string) => {
        if (!token) return;

        const response = await fetch(`${API_ENDPOINTS.ADMIN_ATTENDANCE}/${playerId}?month=${activeMonth}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || "Failed to load attendance");
        }

        setAttendance(data.attendance || []);
        setPracticeDates(Array.isArray(data.practiceDates) ? data.practiceDates : []);
    };

    useEffect(() => {
        if (!token) {
            navigate("/admin/login");
            return;
        }

        localStorage.setItem("adminSeenAttendanceAt", String(Date.now()));
    }, [token, navigate]);

    useEffect(() => {
        if (!token) return;
        loadPlayers();
    }, [token, ageGroup, gender]);

    useEffect(() => {
        if (!selectedPlayer) {
            setAttendance([]);
            setPracticeDates([]);
            return;
        }

        loadAttendance(selectedPlayer._id, month).catch((error) => {
            toast({
                title: "Attendance Error",
                description: error instanceof Error ? error.message : "Unable to fetch attendance",
                variant: "destructive",
            });
        });
    }, [selectedPlayer, month]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Player Attendance & Login</h1>
                        <p className="text-sm text-slate-600">Set player passwords and inspect per-user attendance data.</p>
                    </div>
                    <Button className="w-full sm:w-auto" variant="outline" onClick={() => navigate("/admin/dashboard")}>
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Admin Dashboard
                    </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Players</CardTitle>
                            <CardDescription>All approved players</CardDescription>
                            <div className="space-y-3">
                                <div className="relative mt-2">
                                    <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                                    <Input
                                        className="pl-9"
                                        placeholder="Search player"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex gap-2 flex-wrap">
                                        <Button size="sm" variant={ageGroup === 'all' ? 'default' : 'outline'} onClick={() => setAgeGroup('all')}>All Ages</Button>
                                        <Button size="sm" variant={ageGroup === 'Under 10' ? 'default' : 'outline'} onClick={() => setAgeGroup('Under 10')}>Under 10</Button>
                                        <Button size="sm" variant={ageGroup === '10-14' ? 'default' : 'outline'} onClick={() => setAgeGroup('10-14')}>10-14</Button>
                                        <Button size="sm" variant={ageGroup === '14-16' ? 'default' : 'outline'} onClick={() => setAgeGroup('14-16')}>14-16</Button>
                                    </div>
                                    <div className="flex gap-2 flex-wrap">
                                        <Button size="sm" variant={ageGroup === '16-19' ? 'default' : 'outline'} onClick={() => setAgeGroup('16-19')}>16-19</Button>
                                        <Button size="sm" variant={ageGroup === '19-25' ? 'default' : 'outline'} onClick={() => setAgeGroup('19-25')}>19-25</Button>
                                        <Button size="sm" variant={ageGroup === 'Over 25' ? 'default' : 'outline'} onClick={() => setAgeGroup('Over 25')}>Over 25</Button>
                                    </div>
                                    <div className="flex gap-2 flex-wrap pt-1">
                                        <Button size="sm" variant={gender === 'all' ? 'default' : 'outline'} onClick={() => setGender('all')}>All Genders</Button>
                                        <Button size="sm" variant={gender === "Boy's" ? 'default' : 'outline'} onClick={() => setGender("Boy's")}>Boy's</Button>
                                        <Button size="sm" variant={gender === "Girl's" ? 'default' : 'outline'} onClick={() => setGender("Girl's")}>Girl's</Button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">
                                {loadingPlayers ? "Searching players..." : `${filteredPlayers.length} matching player(s)`}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[65vh] overflow-auto">
                            {filteredPlayers.map((player) => (
                                <button
                                    key={player._id}
                                    type="button"
                                    className={`w-full text-left rounded-md border p-3 transition ${selectedPlayer?._id === player._id
                                        ? "border-emerald-500 bg-emerald-50"
                                        : "border-slate-200 hover:border-slate-300"
                                        }`}
                                    onClick={() => setSelectedPlayer(player)}
                                >
                                    <p className="font-semibold text-slate-800">{player.name}</p>
                                    <p className="text-xs text-slate-500">{player.idCardNumber || "ID not generated"}</p>
                                    <p className="text-xs text-slate-500 mt-1">Phone: {player.phone || "N/A"}</p>
                                </button>
                            ))}
                            {!filteredPlayers.length && <p className="text-sm text-slate-500">No player found.</p>}
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Player Login Rule</CardTitle>
                                <CardDescription>
                                    Players login using email and their current account password.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-slate-700">
                                    Selected Player: <strong>{selectedPlayer?.name || "None"}</strong>
                                </p>
                                <p className="text-sm text-slate-600">
                                    Email: <strong>{selectedPlayer?.email || "N/A"}</strong>
                                </p>
                                <p className="text-sm text-slate-600">
                                    Password help: If player forgot password, use Player Forgot Password flow.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-cyan-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-cyan-700" />
                                    Admin Attendance Marking
                                </CardTitle>
                                <CardDescription>
                                    If a player faces issues, admin can mark or update attendance with admin audit trail. Live location is required.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="adminMarkDate">Date</Label>
                                        <Input
                                            id="adminMarkDate"
                                            type="date"
                                            value={markDate}
                                            onChange={(e) => setMarkDate(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="adminMarkStatus">Status</Label>
                                        <select
                                            id="adminMarkStatus"
                                            value={markStatus}
                                            onChange={(e) => setMarkStatus(e.target.value as "present" | "absent")}
                                            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                                        >
                                            <option value="present">Present</option>
                                            <option value="absent">Absent</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="adminNote">Admin Note (optional)</Label>
                                    <Textarea
                                        id="adminNote"
                                        placeholder="Reason for admin marking (example: player network/location issue)"
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        className="min-h-[88px]"
                                    />
                                </div>

                                <Button
                                    onClick={saveByAdmin}
                                    disabled={!selectedPlayer || markingByAdmin}
                                    className="w-full sm:w-auto bg-cyan-700 hover:bg-cyan-800"
                                >
                                    {markingByAdmin ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Mark Attendance By Admin"
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <CardTitle>Attendance Calendar</CardTitle>
                                        <CardDescription>
                                            Present is green, absent is red, and Practice Not Done is deep blue after day end.
                                        </CardDescription>
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                        <input
                                            type="month"
                                            value={month}
                                            onChange={(e) => setMonth(e.target.value)}
                                            className="w-full rounded-md border border-slate-300 px-3 py-2 sm:w-auto"
                                        />
                                        <div className="grid grid-cols-2 gap-2 sm:flex">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setMonth((prev) => changeMonth(prev, -1))}
                                                className="w-full"
                                            >
                                                <ChevronLeft size={14} className="mr-1" />
                                                Previous
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setMonth((prev) => changeMonth(prev, 1))}
                                                className="w-full"
                                            >
                                                Next
                                                <ChevronRight size={14} className="ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {selectedPlayer ? (
                                    <>
                                        <AttendanceCalendar month={month} attendance={attendanceForCalendar} practiceDates={practiceDates} />

                                        <div className="hidden overflow-x-auto rounded-md border md:block">
                                            <table className="min-w-[1300px] w-full text-sm">
                                                <thead className="bg-slate-100">
                                                    <tr>
                                                        <th className="p-2 text-left">Date</th>
                                                        <th className="p-2 text-left">Status</th>
                                                        <th className="p-2 text-left">Latitude</th>
                                                        <th className="p-2 text-left">Longitude</th>
                                                        <th className="p-2 text-left">Accuracy (m)</th>
                                                        <th className="p-2 text-left">Marked By</th>
                                                        <th className="p-2 text-left">IP</th>
                                                        <th className="p-2 text-left">Device ID</th>
                                                        <th className="p-2 text-left">Device Name</th>
                                                        <th className="p-2 text-left">Context</th>
                                                        <th className="p-2 text-left">Admin ID</th>
                                                        <th className="p-2 text-left">Admin Note</th>
                                                        <th className="p-2 text-left">Marked At</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {attendance.map((record) => (
                                                        <tr key={`${record.date}-${record.markedAt || "na"}`} className="border-t">
                                                            <td className="p-2">{record.date}</td>
                                                            <td className="p-2 capitalize">{record.status}</td>
                                                            <td className="p-2">{record.location?.latitude?.toFixed(5) ?? "-"}</td>
                                                            <td className="p-2">{record.location?.longitude?.toFixed(5) ?? "-"}</td>
                                                            <td className="p-2">{record.location?.accuracy ? Math.round(record.location.accuracy) : "-"}</td>
                                                            <td className="p-2 capitalize">{record.markedByType || "player"}</td>
                                                            <td className="p-2">{record.ipAddress || "-"}</td>
                                                            <td className="p-2">{record.deviceId || "-"}</td>
                                                            <td className="p-2">{record.deviceName || "-"}</td>
                                                            <td className="p-2 max-w-[280px] truncate" title={record.location?.address || ""}>
                                                                {record.location?.address ||
                                                                    [
                                                                        record.userAgent,
                                                                        record.platform,
                                                                        record.language,
                                                                        record.timezone,
                                                                        record.screenResolution,
                                                                        record.viewport,
                                                                        record.networkType,
                                                                        record.effectiveType,
                                                                    ]
                                                                        .filter(Boolean)
                                                                        .join(" | ") ||
                                                                    "-"}
                                                            </td>
                                                            <td className="p-2">{typeof record.markedByAdminId === "string" ? record.markedByAdminId : record.markedByAdminId?._id || "-"}</td>
                                                            <td className="p-2">{record.adminNote || "-"}</td>
                                                            <td className="p-2">{record.markedAt ? new Date(record.markedAt).toLocaleString() : "-"}</td>
                                                        </tr>
                                                    ))}
                                                    {!attendance.length && (
                                                        <tr>
                                                            <td className="p-3 text-slate-500" colSpan={13}>
                                                                No attendance records found for this month.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="space-y-3 md:hidden">
                                            {attendance.map((record) => (
                                                <div key={`${record.date}-${record.markedAt || "na"}`} className="rounded-md border bg-white p-3">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="font-semibold text-slate-900">{record.date}</p>
                                                        <span className="text-xs font-medium capitalize text-slate-700">{record.status}</span>
                                                    </div>
                                                    <p className="mt-2 text-xs text-slate-600 break-all">
                                                        Lat: {record.location?.latitude?.toFixed(5) ?? "-"} | Lng: {record.location?.longitude?.toFixed(5) ?? "-"}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-600">Accuracy: {record.location?.accuracy ? Math.round(record.location.accuracy) : "-"} m</p>
                                                    <p className="mt-1 text-xs text-slate-600">IP: {record.ipAddress || "-"}</p>
                                                    <p className="mt-1 text-xs text-slate-600">Device: {record.deviceName || "-"}</p>
                                                    <p className="mt-1 text-xs text-slate-600">Marked by: {record.markedByType || "player"}</p>
                                                    <p className="mt-1 text-xs text-slate-600">Admin note: {record.adminNote || "-"}</p>
                                                    <p className="mt-1 text-xs text-slate-500">{record.markedAt ? new Date(record.markedAt).toLocaleString() : "-"}</p>
                                                </div>
                                            ))}

                                            {!attendance.length && (
                                                <p className="rounded-md border bg-white p-3 text-sm text-slate-500">
                                                    No attendance records found for this month.
                                                </p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-500">Select a player to view attendance.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPlayerAttendance;
