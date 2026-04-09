import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Mail, Power, Send } from "lucide-react";
import API_BASE_URL, { API_ENDPOINTS } from "@/config/api";

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
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

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
    setSelectedIds(approvedPlayers.map((p) => p._id));
  };

  const clearAll = () => {
    setSelectedIds([]);
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
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Admin Mail Center</h1>
            <p className="text-sm text-slate-600">Send branded Brevo emails to approved players.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
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
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid md:grid-cols-2 gap-3">
              <Button
                type="button"
                variant={mode === "all" ? "default" : "outline"}
                onClick={() => setMode("all")}
              >
                Send to All Approved ({approvedPlayers.length})
              </Button>
              <Button
                type="button"
                variant={mode === "selected" ? "default" : "outline"}
                onClick={() => setMode("selected")}
              >
                Send to Selected ({selectedIds.length})
              </Button>
            </div>

            {mode === "selected" && (
              <div className="border rounded-md p-4 bg-white">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Button size="sm" variant="outline" onClick={selectAll}>Select All</Button>
                  <Button size="sm" variant="outline" onClick={clearAll}>Clear</Button>
                  <span className="text-xs text-slate-600">Selected: {selectedPlayers.length}</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {loadingPlayers ? (
                    <p className="text-sm text-slate-500">Loading players...</p>
                  ) : approvedPlayers.length === 0 ? (
                    <p className="text-sm text-slate-500">No approved players with email found.</p>
                  ) : (
                    approvedPlayers.map((player) => {
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

            <div className="pt-2">
              <Button onClick={handleSend} disabled={sending} className="bg-blue-600 hover:bg-blue-700">
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
