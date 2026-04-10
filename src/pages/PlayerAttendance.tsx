import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { PLAYER_ATTENDANCE_RADIUS_METERS, SP_KABADDI_LOCATION } from "@/config/maps";
import AttendanceCalendar, { AttendanceEntry } from "@/components/AttendanceCalendar";
import { getDeviceName, getOrCreatePlayerDeviceId } from "@/utils/deviceManager";
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, Loader2, MapPin } from "lucide-react";

const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const shiftMonth = (value: string, delta: number) => {
    const [yearStr, monthStr] = value.split("-");
    const date = new Date(Number(yearStr), Number(monthStr) - 1 + delta, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const MAX_ALLOWED_ACCURACY_METERS = 100;

const hasValidCoordinates = (latitude: number, longitude: number) => {
    const validRange = Number.isFinite(latitude) && Number.isFinite(longitude) && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
    const notZeroPair = !(Math.abs(latitude) < 0.000001 && Math.abs(longitude) < 0.000001);
    return validRange && notZeroPair;
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const calculateDistanceMeters = (
    sourceLatitude: number,
    sourceLongitude: number,
    destinationLatitude: number,
    destinationLongitude: number
) => {
    const earthRadiusMeters = 6371000;
    const dLatitude = toRadians(destinationLatitude - sourceLatitude);
    const dLongitude = toRadians(destinationLongitude - sourceLongitude);

    const latitude1 = toRadians(sourceLatitude);
    const latitude2 = toRadians(destinationLatitude);

    const haversine =
        Math.sin(dLatitude / 2) * Math.sin(dLatitude / 2) +
        Math.sin(dLongitude / 2) * Math.sin(dLongitude / 2) * Math.cos(latitude1) * Math.cos(latitude2);

    const arc = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    return earthRadiusMeters * arc;
};

const formatDistanceAway = (distanceMeters: number) => {
    const safeDistance = Math.max(0, Math.round(distanceMeters));
    const kilometers = Math.floor(safeDistance / 1000);
    const meters = safeDistance % 1000;
    return `${kilometers} km and ${meters} meter`;
};

interface ClientContext {
    ipAddress: string | null;
    userAgent: string;
    language: string;
    platform: string;
    timezone: string;
    screenResolution: string;
    viewport: string;
    networkType: string | null;
    effectiveType: string | null;
}

const PlayerAttendance = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [month, setMonth] = useState(getCurrentMonth());
    const [attendance, setAttendance] = useState<AttendanceEntry[]>([]);
    const [loadingPage, setLoadingPage] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [markingAttendance, setMarkingAttendance] = useState(false);
    const [attendanceLoaded, setAttendanceLoaded] = useState(false);

    const storedPlayer = localStorage.getItem("playerUser");
    const parsedPlayer = (() => {
        if (!storedPlayer) return null;
        try {
            return JSON.parse(storedPlayer);
        } catch {
            return null;
        }
    })();

    const playerId = parsedPlayer?.id as string | undefined;
    const playerToken = localStorage.getItem("playerToken") || undefined;

    const monthLabel = useMemo(() => {
        const [yearStr, monthStr] = month.split("-");
        const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
        return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    }, [month]);

    const todayMarkDateLabel = useMemo(() => {
        return new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            weekday: "long",
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(new Date());
    }, []);

    const isCurrentMonthSelected = month === getCurrentMonth();

    const fetchAttendance = async (activeMonth: string, activePlayerToken: string) => {
        setLoadingAttendance(true);
        const response = await fetch(`${API_ENDPOINTS.PLAYER_ATTENDANCE}?month=${activeMonth}`, {
            headers: {
                Authorization: `Bearer ${activePlayerToken}`,
            },
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || "Failed to load attendance");
        }

        setAttendance(data.attendance || []);
        setAttendanceLoaded(true);
        setLoadingAttendance(false);
    };

    useEffect(() => {
        const init = async () => {
            if (!playerId || !playerToken) {
                navigate("/player/login");
                return;
            }

            setLoadingPage(false);
        };

        init();
    }, [navigate, playerId]);

    useEffect(() => {
        const loadOnMonthChange = async () => {
            if (!playerToken || !attendanceLoaded) return;
            try {
                await fetchAttendance(month, playerToken);
            } catch (error) {
                setLoadingAttendance(false);
                toast({
                    title: "Fetch Failed",
                    description: error instanceof Error ? error.message : "Unable to fetch attendance",
                    variant: "destructive",
                });
            }
        };

        loadOnMonthChange();
    }, [month, playerToken, attendanceLoaded, toast]);

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

    const getClientContext = async (): Promise<ClientContext> => {
        const connection = (navigator as Navigator & {
            connection?: { type?: string; effectiveType?: string };
        }).connection;

        let ipAddress: string | null = null;
        try {
            const response = await fetch("https://api64.ipify.org?format=json");
            const ipData = await response.json().catch(() => ({}));
            ipAddress = typeof ipData.ip === "string" ? ipData.ip : null;
        } catch {
            ipAddress = null;
        }

        return {
            ipAddress,
            userAgent: navigator.userAgent || "unknown",
            language: navigator.language || "unknown",
            platform: navigator.platform || "unknown",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            networkType: connection?.type || null,
            effectiveType: connection?.effectiveType || null,
        };
    };

    const handleViewAttendance = async () => {
        if (!playerToken) {
            navigate("/player/login");
            return;
        }

        try {
            await fetchAttendance(month, playerToken);
        } catch (error) {
            setLoadingAttendance(false);
            toast({
                title: "Fetch Failed",
                description: error instanceof Error ? error.message : "Unable to fetch attendance",
                variant: "destructive",
            });
        }
    };

    const handleMarkAttendance = async () => {
        if (!playerToken) {
            navigate("/player/login");
            return;
        }

        if (!isCurrentMonthSelected) {
            toast({
                title: "Current Month Required",
                description: "You can mark attendance only for today. Please switch to current month.",
                variant: "destructive",
            });
            setMonth(getCurrentMonth());
            return;
        }

        setMarkingAttendance(true);
        try {
            const position = await getLiveLocation();
            const clientContext = await getClientContext();
            const locationAccuracy = Number(position.coords.accuracy);

            if (!hasValidCoordinates(position.coords.latitude, position.coords.longitude)) {
                throw new Error("Valid latitude and longitude are required to mark attendance.");
            }

            if (!Number.isFinite(locationAccuracy) || locationAccuracy > MAX_ALLOWED_ACCURACY_METERS) {
                throw new Error(
                    `Location is not precise enough (${Math.round(locationAccuracy)}m). Enable precise location and retry.`
                );
            }

            const distanceFromClubMeters = calculateDistanceMeters(
                position.coords.latitude,
                position.coords.longitude,
                SP_KABADDI_LOCATION.latitude,
                SP_KABADDI_LOCATION.longitude
            );

            if (distanceFromClubMeters > PLAYER_ATTENDANCE_RADIUS_METERS) {
                throw new Error(
                    `You are ${formatDistanceAway(distanceFromClubMeters)} away from the club location. Attendance can be marked only within ${PLAYER_ATTENDANCE_RADIUS_METERS} meter radius.`
                );
            }

            const deviceId = getOrCreatePlayerDeviceId();
            const deviceName = getDeviceName();

            const response = await fetch(`${API_ENDPOINTS.PLAYER_ATTENDANCE}/mark`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${playerToken}`,
                },
                body: JSON.stringify({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: locationAccuracy,
                    address: [
                        clientContext.ipAddress ? `IP: ${clientContext.ipAddress}` : "IP: unavailable",
                        `TZ: ${clientContext.timezone}`,
                        `Lang: ${clientContext.language}`,
                        `Platform: ${clientContext.platform}`,
                        `Screen: ${clientContext.screenResolution}`,
                        `Viewport: ${clientContext.viewport}`,
                        clientContext.networkType ? `Network: ${clientContext.networkType}` : null,
                        clientContext.effectiveType ? `Effective: ${clientContext.effectiveType}` : null,
                    ]
                        .filter(Boolean)
                        .join(" | "),
                    deviceId,
                    deviceName,
                    ipAddress: clientContext.ipAddress,
                    userAgent: clientContext.userAgent,
                    language: clientContext.language,
                    platform: clientContext.platform,
                    timezone: clientContext.timezone,
                    screenResolution: clientContext.screenResolution,
                    viewport: clientContext.viewport,
                    networkType: clientContext.networkType,
                    effectiveType: clientContext.effectiveType,
                }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to mark attendance");
            }

            toast({
                title: "Attendance Marked",
                description: "Your attendance for today has been marked.",
            });

            await fetchAttendance(month, playerToken);
        } catch (error) {
            setLoadingAttendance(false);
            toast({
                title: "Attendance Failed",
                description: error instanceof Error ? error.message : "Location permission is required",
                variant: "destructive",
            });
        } finally {
            setMarkingAttendance(false);
        }
    };

    if (loadingPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-3 sm:p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <Card className="border-blue-200 shadow-sm">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="text-2xl text-slate-800">Attendance</CardTitle>
                            <CardDescription>Mark and view your attendance records.</CardDescription>
                        </div>
                        <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate("/player/dashboard")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back To Dashboard
                        </Button>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Actions</CardTitle>
                        <CardDescription>Only today's attendance can be marked.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] items-end">
                            <div className="sm:col-span-2 lg:col-span-1">
                                <label className="text-sm font-medium text-slate-700">Attendance Month</label>
                                <input
                                    type="month"
                                    value={month}
                                    onChange={(e) => {
                                        setMonth(e.target.value);
                                        setAttendanceLoaded(false);
                                    }}
                                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                                />
                                <div className="mt-2 grid grid-cols-1 gap-2 sm:flex">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full sm:w-auto"
                                        onClick={() => {
                                            setMonth((prev) => shiftMonth(prev, -1));
                                            setAttendanceLoaded(false);
                                        }}
                                    >
                                        <ChevronLeft size={16} className="mr-1" />
                                        Previous
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full sm:w-auto"
                                        onClick={() => {
                                            setMonth((prev) => shiftMonth(prev, 1));
                                            setAttendanceLoaded(false);
                                        }}
                                    >
                                        Next
                                        <ChevronRight size={16} className="ml-1" />
                                    </Button>
                                </div>
                            </div>

                            <Button
                                className="w-full bg-blue-800 hover:bg-blue-900 sm:w-auto"
                                disabled={markingAttendance || !isCurrentMonthSelected}
                                onClick={handleMarkAttendance}
                            >
                                {markingAttendance ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Capturing Location...
                                    </>
                                ) : (
                                    <>
                                        <MapPin size={16} className="mr-2" />
                                        Mark Attendance
                                    </>
                                )}
                            </Button>

                            <Button variant="outline" onClick={handleViewAttendance} className="w-full sm:w-auto">
                                <Eye size={16} className="mr-2" />
                                View Attendance
                            </Button>
                        </div>

                        <p className="text-xs text-slate-500">
                            Location access is mandatory. Attendance can be marked only within 250 meter radius of club ground.
                        </p>

                        <p className="text-sm font-medium text-blue-800">Today's Marking Date: {todayMarkDateLabel}</p>

                        {!isCurrentMonthSelected && (
                            <p className="text-xs text-amber-700">
                                You can navigate to previous and next months, but marking attendance is allowed only for today.
                            </p>
                        )}

                        <p className="text-sm text-slate-600">Selected Month: {monthLabel}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Attendance Calendar</CardTitle>
                        <CardDescription>Present days are deep blue and absent days are orange.</CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-hidden">
                        {loadingAttendance ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-800" />
                            </div>
                        ) : attendanceLoaded ? (
                            <div className="w-full max-w-full">
                                <AttendanceCalendar month={month} attendance={attendance} />
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">Click View Attendance to load records.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PlayerAttendance;
