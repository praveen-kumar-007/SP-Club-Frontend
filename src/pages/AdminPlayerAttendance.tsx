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
import { ArrowLeft, Loader2, Search, ShieldCheck } from "lucide-react";

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

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const AdminPlayerAttendance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(getCurrentMonth());
  const [players, setPlayers] = useState<PlayerItem[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerItem | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
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

  const fetchPlayers = async (query = "") => {
    if (!token) return;
    setLoadingPlayers(true);

    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN_PLAYERS}?search=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch players");
      }

      setPlayers(data.players || []);

      if (!selectedPlayer && data.players?.length) {
        setSelectedPlayer(data.players[0]);
      }
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

  const handleAdminMarkAttendance = async () => {
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
          address: "Marked by admin due to player issue",
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

      await fetchAttendance(selectedPlayer._id, month);
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

  const fetchAttendance = async (playerId: string, activeMonth: string) => {
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
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchPlayers();
  }, [token, navigate]);

  useEffect(() => {
    if (!selectedPlayer) {
      setAttendance([]);
      return;
    }

    fetchAttendance(selectedPlayer._id, month).catch((error) => {
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Player Attendance & Login</h1>
            <p className="text-sm text-slate-600">Set player passwords and inspect per-user attendance data.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Admin Dashboard
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Players</CardTitle>
              <CardDescription>All approved players</CardDescription>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="Search player"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      fetchPlayers(search);
                    }
                  }}
                />
              </div>
              <Button variant="secondary" onClick={() => fetchPlayers(search)} disabled={loadingPlayers}>
                {loadingPlayers ? "Loading..." : "Search"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[65vh] overflow-auto">
              {players.map((player) => (
                <button
                  key={player._id}
                  type="button"
                  className={`w-full text-left rounded-md border p-3 transition ${
                    selectedPlayer?._id === player._id
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
              {!players.length && <p className="text-sm text-slate-500">No player found.</p>}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Player Login Rule</CardTitle>
                <CardDescription>
                  Players login using email and password. Default password is phone number until changed.
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
                  Default password (phone): <strong>{selectedPlayer?.phone || "N/A"}</strong>
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
                  If a player faces issues, admin can mark or update attendance with admin audit trail.
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
                  onClick={handleAdminMarkAttendance}
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
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <CardTitle>Attendance Calendar</CardTitle>
                    <CardDescription>
                      Present is green and absent is red. Admin can only view this data.
                    </CardDescription>
                  </div>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="rounded-md border border-slate-300 px-3 py-2"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPlayer ? (
                  <>
                    <AttendanceCalendar month={month} attendance={attendanceForCalendar} />

                    <div className="overflow-auto rounded-md border">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="p-2 text-left">Date</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Latitude</th>
                            <th className="p-2 text-left">Longitude</th>
                            <th className="p-2 text-left">Marked By</th>
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
                              <td className="p-2 capitalize">{record.markedByType || "player"}</td>
                              <td className="p-2">{typeof record.markedByAdminId === "string" ? record.markedByAdminId : record.markedByAdminId?._id || "-"}</td>
                              <td className="p-2">{record.adminNote || "-"}</td>
                              <td className="p-2">{record.markedAt ? new Date(record.markedAt).toLocaleString() : "-"}</td>
                            </tr>
                          ))}
                          {!attendance.length && (
                            <tr>
                              <td className="p-3 text-slate-500" colSpan={8}>
                                No attendance records found for this month.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
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
