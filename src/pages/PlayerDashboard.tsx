import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { PLAYER_ATTENDANCE_RADIUS_METERS, SP_KABADDI_LOCATION } from "@/config/maps";
import AttendanceCalendar, { AttendanceEntry } from "@/components/AttendanceCalendar";
import Seo from "@/components/Seo";
import { getDeviceName, getOrCreatePlayerDeviceId } from "@/utils/deviceManager";
import { KIT_SIZE_OPTIONS, formatKitSizeWithRange, getKitSizeRange } from "@/utils/kitSizes";
import { AlertTriangle, Award, Bell, CalendarDays, Camera, CheckCircle2, ChevronLeft, ChevronRight, CreditCard, KeyRound, Loader2, LogOut, MapPin, Send, UserCircle2, Wallet } from "lucide-react";

interface PlayerProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    idCardNumber: string;
    phone: string;
    parentsPhone: string;
    aadharNumber: string;
    dob?: string;
    bloodGroup: string;
    gender: string;
    address: string;
    clubDetails: string;
    kitSize?: string;
    jerseyNumber?: number;
    status?: string;
    feeAccessEnabled?: boolean;
    photo: string;
    certificates: Array<{
        title: string;
        fileUrl: string;
        issuedAt?: string;
    }>;
}

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

const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const shiftMonth = (value: string, delta: number) => {
    const [yearStr, monthStr] = value.split("-");
    const date = new Date(Number(yearStr), Number(monthStr) - 1 + delta, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const PlayerDashboard = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [player, setPlayer] = useState<PlayerProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [savingKitDetails, setSavingKitDetails] = useState(false);
    const [editingKitDetails, setEditingKitDetails] = useState(false);
    const [kitSize, setKitSize] = useState("");
    const [jerseyNumber, setJerseyNumber] = useState("");
    const [markingTodayAttendance, setMarkingTodayAttendance] = useState(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const [attendanceMonth, setAttendanceMonth] = useState(getCurrentMonth());
    const [attendanceEntries, setAttendanceEntries] = useState<AttendanceEntry[]>([]);
    const [practiceDates, setPracticeDates] = useState<string[]>([]);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const photoInputRef = useRef<HTMLInputElement | null>(null);
    const selectedKitRange = getKitSizeRange(kitSize);
    const attendanceMonthLabel = useMemo(() => {
        const [yearStr, monthStr] = attendanceMonth.split("-");
        const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
        return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    }, [attendanceMonth]);

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

    const fetchPlayerProfile = async (activePlayerToken: string) => {
        const profileResponse = await fetch(API_ENDPOINTS.PLAYER_ME, {
            headers: {
                Authorization: `Bearer ${activePlayerToken}`,
            },
        });

        const profileData = await profileResponse.json().catch(() => ({}));
        if (!profileResponse.ok) {
            throw new Error(profileData.message || "Session expired");
        }

        setPlayer(profileData.player);
        setKitSize(profileData.player?.kitSize || "");
        setJerseyNumber(profileData.player?.jerseyNumber ? String(profileData.player.jerseyNumber) : "");
    };

    const fetchUnreadMessageCount = async (activePlayerToken: string) => {
        const response = await fetch(API_ENDPOINTS.PLAYER_MESSAGES_UNREAD_COUNT, {
            headers: {
                Authorization: `Bearer ${activePlayerToken}`,
            },
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch unread count");
        }

        setUnreadMessageCount(Number(data.unreadCount || 0));
    };

    const fetchAttendance = async (activePlayerToken: string, month: string) => {
        setLoadingAttendance(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.PLAYER_ATTENDANCE}?month=${month}`, {
                headers: {
                    Authorization: `Bearer ${activePlayerToken}`,
                },
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to load attendance calendar");
            }

            setAttendanceEntries(Array.isArray(data.attendance) ? data.attendance : []);
            setPracticeDates(Array.isArray(data.practiceDates) ? data.practiceDates : []);
        } catch (error) {
            toast({
                title: "Attendance Calendar",
                description: error instanceof Error ? error.message : "Unable to load attendance",
                variant: "destructive",
            });
        } finally {
            setLoadingAttendance(false);
        }
    };

    useEffect(() => {
        const initialize = async () => {
            if (!playerId || !playerToken) {
                navigate("/player/login");
                return;
            }

            try {
                await fetchPlayerProfile(playerToken);
                await fetchUnreadMessageCount(playerToken);
            } catch (error) {
                localStorage.removeItem("playerToken");
                localStorage.removeItem("playerUser");
                toast({
                    title: "Session Error",
                    description: error instanceof Error ? error.message : "Please login again",
                    variant: "destructive",
                });
                navigate("/player/login");
            } finally {
                setIsLoading(false);
            }
        };

        initialize();
    }, [navigate, playerId, playerToken, toast]);

    useEffect(() => {
        if (!playerToken || isLoading) return;
        fetchAttendance(playerToken, attendanceMonth);
    }, [attendanceMonth, playerToken, isLoading]);

    useEffect(() => {
        if (!isLoading && player && player.status !== "approved") {
            localStorage.removeItem("playerToken");
            localStorage.removeItem("playerUser");
            toast({
                title: "Access Denied",
                description: "Your registration is not yet approved. Please wait for approval before using the dashboard.",
                variant: "destructive",
            });
            navigate("/player/login");
        }
    }, [isLoading, navigate, player, toast]);

    const handlePhotoSelected = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file || !playerToken) {
            return;
        }

        setUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append("photo", file);

            const response = await fetch(API_ENDPOINTS.PLAYER_ME_PHOTO, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${playerToken}`,
                },
                body: formData,
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to update profile photo");
            }

            await fetchPlayerProfile(playerToken);

            toast({
                title: "Profile Updated",
                description: "Your profile photo has been replaced successfully.",
            });
        } catch (error) {
            toast({
                title: "Photo Update Failed",
                description: error instanceof Error ? error.message : "Unable to update profile photo",
                variant: "destructive",
            });
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("playerToken");
        localStorage.removeItem("playerUser");
        navigate("/player/login");
    };

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

    const handleMarkTodayAttendance = async () => {
        if (!playerToken) {
            navigate("/player/login");
            return;
        }

        setMarkingTodayAttendance(true);
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
                    deviceId,
                    deviceName,
                }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to mark attendance");
            }

            toast({
                title: "Attendance Marked",
                description: "Today's attendance marked successfully.",
            });

            await fetchAttendance(playerToken, attendanceMonth);
        } catch (error) {
            toast({
                title: "Attendance Failed",
                description: error instanceof Error ? error.message : "Unable to mark attendance",
                variant: "destructive",
            });
        } finally {
            setMarkingTodayAttendance(false);
        }
    };

    const handleSaveKitDetails = async () => {
        if (!playerToken) {
            navigate("/player/login");
            return;
        }

        setSavingKitDetails(true);
        try {
            if (player?.status !== "approved" && jerseyNumber) {
                throw new Error(
                    "Jersey numbers can only be selected after approval."
                );
            }

            const response = await fetch(API_ENDPOINTS.PLAYER_ME_UPDATE, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${playerToken}`,
                },
                body: JSON.stringify({
                    kitSize: kitSize || null,
                    jerseyNumber: player?.status === "approved" ? jerseyNumber || null : null,
                }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to update kit details");
            }

            await fetchPlayerProfile(playerToken);
            setEditingKitDetails(false);

            toast({
                title: "Profile Updated",
                description: "Your kit size and jersey number are now saved.",
            });
        } catch (error) {
            toast({
                title: "Update Failed",
                description: error instanceof Error ? error.message : "Unable to save kit details",
                variant: "destructive",
            });
        } finally {
            setSavingKitDetails(false);
        }
    };

    const formatDate = (isoDate?: string) => {
        if (!isoDate) return "N/A";
        const date = new Date(isoDate);
        if (Number.isNaN(date.getTime())) return "N/A";
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-3 sm:p-4 md:p-8">
            <Seo
                title="Player Dashboard"
                description="Player dashboard for attendance, fee status, profile, and admin communication."
                url="https://spkabaddi.me/player/dashboard"
                keywords="player dashboard, attendance, fee status, SP Kabaddi"
            />
            <div className="max-w-6xl mx-auto space-y-6">
                <Card className="border-blue-200 shadow-sm">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="text-2xl text-slate-800">Player Dashboard</CardTitle>
                            <CardDescription>
                                Hello {player?.name}. Your ID: {player?.idCardNumber || "Not ready yet"}
                            </CardDescription>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <Button
                                variant="outline"
                                onClick={() => navigate("/player/messages")}
                                className="relative flex-1 sm:flex-none"
                                title="Notifications"
                            >
                                <Bell size={16} className="mr-2" />
                                Notifications
                                {unreadMessageCount > 0 && (
                                    <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-600 text-white text-[11px] font-semibold flex items-center justify-center">
                                        {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
                                    </span>
                                )}
                            </Button>

                            <Button variant="destructive" onClick={handleLogout} className="flex-1 sm:flex-none">
                                <LogOut size={16} className="mr-2" />
                                Logout
                            </Button>
                        </div>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-slate-800 flex items-center gap-2">
                            <UserCircle2 className="h-5 w-5 text-blue-800" />
                            Your Details
                        </CardTitle>
                        <CardDescription>This is your saved profile information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-lg border border-blue-100 bg-blue-50/40 p-4">
                            <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:items-start">
                                {player?.photo ? (
                                    <div className="h-40 w-40 shrink-0 overflow-hidden rounded-xl border-2 border-blue-200 bg-white shadow-sm sm:h-44 sm:w-44 md:h-48 md:w-48">
                                        <img
                                            src={player.photo}
                                            alt={`${player.name} profile`}
                                            className="h-full w-full object-cover object-[50%_22%]"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-40 w-40 shrink-0 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-medium border-2 border-slate-300 shadow-sm sm:h-44 sm:w-44 md:h-48 md:w-48">
                                        No Photo
                                    </div>
                                )}

                                <div className="text-center sm:text-left">
                                    <p className="font-semibold text-slate-800">Profile Photo</p>
                                    <p className="text-sm text-slate-600">Upload a new photo to replace the existing one.</p>
                                </div>
                            </div>

                            <div className="w-full md:w-auto">
                                <input
                                    ref={photoInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handlePhotoSelected}
                                />
                                <Button
                                    variant="outline"
                                    disabled={uploadingPhoto}
                                    onClick={() => photoInputRef.current?.click()}
                                    className="w-full md:w-auto"
                                >
                                    {uploadingPhoto ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Camera className="mr-2 h-4 w-4" />
                                            Change Profile Photo
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <p className="text-xs text-slate-500">Full Name</p>
                                <p className="font-medium text-slate-800">{player?.name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Email</p>
                                <p className="font-medium text-slate-800">{player?.email || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Role</p>
                                <p className="font-medium text-slate-800 capitalize">{player?.role || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Date of Birth</p>
                                <p className="font-medium text-slate-800">{formatDate(player?.dob)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Phone</p>
                                <p className="font-medium text-slate-800">{player?.phone || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Parent Phone</p>
                                <p className="font-medium text-slate-800">{player?.parentsPhone || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Aadhar Number</p>
                                <p className="font-medium text-slate-800">{player?.aadharNumber || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Blood Group</p>
                                <p className="font-medium text-slate-800">{player?.bloodGroup || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Gender</p>
                                <p className="font-medium text-slate-800 capitalize">{player?.gender || "N/A"}</p>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3">
                                <p className="text-xs text-slate-500">Address</p>
                                <p className="font-medium text-slate-800">{player?.address || "N/A"}</p>
                            </div>
                            <div className="sm:col-span-2 lg:col-span-3">
                                <p className="text-xs text-slate-500">Club Details</p>
                                <p className="font-medium text-slate-800">{player?.clubDetails || "N/A"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-emerald-200 bg-emerald-50/50">
                    <CardHeader>
                        <CardTitle className="text-slate-800 text-lg">Quick Guide</CardTitle>
                        <CardDescription>Recommended daily order.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-slate-700">
                        <p>1. Mark attendance.</p>
                        <p>2. Review fee status.</p>
                        <p>3. Message admin if support is needed.</p>
                    </CardContent>
                </Card>

                <Card className="border-orange-200 bg-orange-50/60">
                    <CardHeader>
                        <CardTitle className="text-slate-800 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-orange-700" />
                            Daily Quick Action
                        </CardTitle>
                        <CardDescription>Mark attendance once daily after reaching the ground.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full bg-orange-600 py-6 text-base font-bold hover:bg-orange-700"
                            disabled={markingTodayAttendance}
                            onClick={handleMarkTodayAttendance}
                        >
                            {markingTodayAttendance ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Marking Attendance...
                                </>
                            ) : (
                                <>
                                    <MapPin className="mr-2 h-5 w-5" />
                                    Mark Attendance
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-slate-800 flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-blue-800" />
                            Attendance Calendar
                        </CardTitle>
                        <CardDescription>Green means present. Red means absent.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setAttendanceMonth((prev) => shiftMonth(prev, -1))}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                                {attendanceMonthLabel}
                            </div>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setAttendanceMonth((prev) => shiftMonth(prev, 1))}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="ml-auto"
                                onClick={() => navigate("/player/attendance")}
                            >
                                See Full Attendance
                            </Button>
                        </div>

                        {loadingAttendance ? (
                            <div className="flex items-center py-6 text-sm text-slate-600">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading attendance calendar...
                            </div>
                        ) : (
                            <AttendanceCalendar
                                month={attendanceMonth}
                                attendance={attendanceEntries}
                                practiceDates={practiceDates}
                            />
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-slate-800 flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-800" />
                            Kit and Jersey
                        </CardTitle>
                        <CardDescription>
                            Choose your kit size. Jersey number is available after approval.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 items-end">
                            <div>
                                <p className="text-xs text-slate-500">Kit Size</p>
                                <p className="font-medium text-slate-800">{formatKitSizeWithRange(player?.kitSize)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Jersey Number</p>
                                <p className="font-medium text-slate-800">{player?.jerseyNumber ?? "Not assigned"}</p>
                            </div>
                            <div className="sm:col-span-2">
                                {editingKitDetails ? (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div>
                                            <div className="flex items-center justify-between gap-2 whitespace-nowrap">
                                                <p className="text-xs text-slate-500">Kit Size</p>
                                                <p className="text-[11px] text-slate-500 sm:text-xs">
                                                    {selectedKitRange
                                                        ? `Size ${kitSize} (${selectedKitRange})`
                                                        : "Auto size range"}
                                                </p>
                                            </div>
                                            <select
                                                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
                                                value={kitSize}
                                                onChange={(e) => setKitSize(e.target.value)}
                                            >
                                                <option value="">Not selected</option>
                                                {KIT_SIZE_OPTIONS.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.value} ({option.range})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Jersey Number</p>
                                            {player?.status === "approved" ? (
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={99}
                                                    className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
                                                    placeholder="1-99"
                                                    value={jerseyNumber}
                                                    onChange={(e) => setJerseyNumber(e.target.value)}
                                                />
                                            ) : (
                                                <div className="mt-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                                    Jersey number assignment becomes available once your registration is approved.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                            {editingKitDetails ? (
                                <>
                                    <Button
                                        className="bg-blue-800 hover:bg-blue-900"
                                        disabled={savingKitDetails}
                                        onClick={handleSaveKitDetails}
                                    >
                                        {savingKitDetails ? "Saving..." : "Save Kit Details"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setEditingKitDetails(false);
                                            setKitSize(player?.kitSize || "");
                                            setJerseyNumber(player?.jerseyNumber ? String(player.jerseyNumber) : "");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button className="bg-blue-800 hover:bg-blue-900" onClick={() => setEditingKitDetails(true)}>
                                    Edit Kit and Jersey
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-slate-800 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-blue-800" />
                                Your ID Card
                            </CardTitle>
                            <CardDescription>See your player ID details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-slate-600">
                                ID Card Number: <span className="font-semibold text-slate-800">{player?.idCardNumber || "Not generated"}</span>
                            </p>
                            <Button
                                variant="outline"
                                className="w-full sm:w-auto"
                                disabled={!player?.id}
                                onClick={() => window.open(`/id-card/${player?.id}`, "_blank", "noopener,noreferrer")}
                            >
                                View ID Card
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-slate-800 flex items-center gap-2">
                                <Award className="h-5 w-5 text-blue-800" />
                                Your Certificates
                            </CardTitle>
                            <CardDescription>All your certificate files are here.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {player?.certificates?.length ? (
                                player.certificates.map((cert, index) => (
                                    <div key={`${cert.title}-${index}`} className="rounded-md border border-slate-200 p-3 flex items-center justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{cert.title}</p>
                                            <p className="text-xs text-slate-500">
                                                {cert.issuedAt ? `Issued: ${new Date(cert.issuedAt).toLocaleDateString("en-IN")}` : "Issued date not available"}
                                            </p>
                                        </div>
                                        <a
                                            href={cert.fileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm font-medium text-blue-800 hover:text-blue-900"
                                        >
                                            View
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">No certificates available yet.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-slate-800 flex items-center gap-2">
                                <KeyRound className="h-5 w-5 text-blue-800" />
                                Change Login Password
                            </CardTitle>
                            <CardDescription>Update your password anytime for safety.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700" onClick={() => navigate("/player/change-password")}>
                                Change Password
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-slate-800 flex items-center gap-2">
                                <Send className="h-5 w-5 text-blue-800" />
                                Message Admin
                            </CardTitle>
                            <CardDescription>Send a message and see old replies.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full sm:w-auto bg-blue-800 hover:bg-blue-900" onClick={() => navigate("/player/messages")}>
                                Open Messages
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-slate-800 flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-blue-800" />
                                Fee Status
                            </CardTitle>
                            <CardDescription>
                                {player?.feeAccessEnabled
                                    ? "See if your monthly payment is done or pending."
                                    : "Fee section is not enabled for your account yet."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {player?.feeAccessEnabled ? (
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-emerald-800">
                                            <CheckCircle2 className="h-4 w-4" /> Paid
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-red-800">
                                            <AlertTriangle className="h-4 w-4" /> Pending
                                        </span>
                                    </div>
                                    <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate("/player/fees")}>
                                        See Fee History
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-600">
                                    Ask admin to add your name in fee list.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default PlayerDashboard;
