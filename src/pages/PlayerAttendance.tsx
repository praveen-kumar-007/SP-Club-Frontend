import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import AttendanceCalendar, { AttendanceEntry } from "@/components/AttendanceCalendar";
import { ArrowLeft, Eye, Loader2, MapPin } from "lucide-react";

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

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

      const response = await fetch(`${API_ENDPOINTS.PLAYER_ATTENDANCE}/mark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${playerToken}`,
        },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
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
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50 p-3 sm:p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="border-emerald-200 shadow-sm">
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
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 sm:w-auto"
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
              Location access is mandatory. If permission is denied, attendance cannot be marked.
            </p>

            <p className="text-sm font-medium text-emerald-700">Today's Marking Date: {todayMarkDateLabel}</p>

            {!isCurrentMonthSelected && (
              <p className="text-xs text-amber-700">
                Mark Attendance is enabled only for the current month because students can mark only today's attendance.
              </p>
            )}

            <p className="text-sm text-slate-600">Selected Month: {monthLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Calendar</CardTitle>
            <CardDescription>Present days are green and absent days are red.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAttendance ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
              </div>
            ) : attendanceLoaded ? (
              <AttendanceCalendar month={month} attendance={attendance} />
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
