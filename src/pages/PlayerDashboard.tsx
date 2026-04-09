import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { getDeviceName, getOrCreatePlayerDeviceId } from "@/utils/deviceManager";
import { Award, Bell, CalendarDays, Camera, CreditCard, KeyRound, Loader2, LogOut, MapPin, Send, UserCircle2 } from "lucide-react";

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
    photo: string;
    certificates: Array<{
        title: string;
        fileUrl: string;
        issuedAt?: string;
    }>;
}

const MAX_ALLOWED_ACCURACY_METERS = 100;

const PlayerDashboard = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [player, setPlayer] = useState<PlayerProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [markingTodayAttendance, setMarkingTodayAttendance] = useState(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const photoInputRef = useRef<HTMLInputElement | null>(null);

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

            if (!Number.isFinite(locationAccuracy) || locationAccuracy > MAX_ALLOWED_ACCURACY_METERS) {
                throw new Error(
                    `Location is not precise enough (${Math.round(locationAccuracy)}m). Enable precise location and retry.`
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
            <div className="max-w-6xl mx-auto space-y-6">
                <Card className="border-blue-200 shadow-sm">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="text-2xl text-slate-800">Student Dashboard</CardTitle>
                            <CardDescription>
                                Welcome {player?.name} ({player?.idCardNumber || "ID not generated"})
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
                            Profile Details
                        </CardTitle>
                        <CardDescription>All your registration details are visible here in read-only format.</CardDescription>
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

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-slate-800 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-blue-800" />
                                ID Card
                            </CardTitle>
                            <CardDescription>Your player ID card details.</CardDescription>
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
                                Certificates
                            </CardTitle>
                            <CardDescription>Your uploaded/issued certificates.</CardDescription>
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
                                Change Password
                            </CardTitle>
                            <CardDescription>Keep your account secure by updating your password regularly.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700" onClick={() => navigate("/player/change-password")}>
                                Open Change Password
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-slate-800 flex items-center gap-2">
                                <CalendarDays className="h-5 w-5 text-blue-800" />
                                Full Attendance
                            </CardTitle>
                            <CardDescription>Open dedicated attendance page to view complete attendance details.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full sm:w-auto bg-blue-800 hover:bg-blue-900" onClick={() => navigate("/player/attendance")}>
                                Open Full Attendance Page
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-slate-800 flex items-center gap-2">
                                <Send className="h-5 w-5 text-blue-800" />
                                Send Message To Admin
                            </CardTitle>
                            <CardDescription>Open dedicated page to send letter/notice and view your message history.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full sm:w-auto bg-blue-800 hover:bg-blue-900" onClick={() => navigate("/player/messages")}>
                                Open Message Page
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-slate-800 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-800" />
                            Mark Today's Attendance
                        </CardTitle>
                        <CardDescription>This quick action marks only today's attendance from dashboard bottom.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700"
                            disabled={markingTodayAttendance}
                            onClick={handleMarkTodayAttendance}
                        >
                            {markingTodayAttendance ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Capturing Location...
                                </>
                            ) : (
                                <>
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Mark Attendance For Today
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PlayerDashboard;
