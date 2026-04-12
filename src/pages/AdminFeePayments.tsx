import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import Seo from "@/components/Seo";
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Loader2, Search, Users, Wallet } from "lucide-react";

interface FeePlayer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  idCardNumber: string;
  feeAccessEnabled: boolean;
  currentMonthPaid: boolean;
}

interface FeeHistoryItem {
  month: string;
  isPaid: boolean;
  updatedAt: string | null;
}

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const shiftMonth = (value: string, delta: number) => {
  const [yearStr, monthStr] = value.split("-");
  const date = new Date(Number(yearStr), Number(monthStr) - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonthLabel = (month: string) => {
  const [yearStr, monthStr] = month.split("-");
  const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

const AdminFeePayments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<FeePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<FeePlayer | null>(null);
  const [month, setMonth] = useState(getCurrentMonth());
  const [selectedMonthPaid, setSelectedMonthPaid] = useState(false);
  const [history, setHistory] = useState<FeeHistoryItem[]>([]);
  const [historyPlayer, setHistoryPlayer] = useState<FeePlayer | null>(null);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [updatingFeeAccessFor, setUpdatingFeeAccessFor] = useState<string | null>(null);
  const [isPlayerListOpen, setIsPlayerListOpen] = useState(false);

  const token = localStorage.getItem("adminToken");

  const filteredPlayers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return players;

    return players.filter((player) => {
      const text = `${player.name} ${player.email} ${player.phone} ${player.idCardNumber}`.toLowerCase();
      return text.includes(q);
    });
  }, [players, search]);

  const enabledPlayers = useMemo(
    () => players.filter((player) => player.feeAccessEnabled),
    [players],
  );

  const selectedMonthLabel = useMemo(() => formatMonthLabel(month), [month]);

  const loadPlayers = async () => {
    if (!token) return;

    setLoadingPlayers(true);
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_FEE_PLAYERS, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch payment players");
      }

      const nextPlayers: FeePlayer[] = Array.isArray(data.players) ? data.players : [];
      setPlayers(nextPlayers);

      setSelectedPlayer((prev) => {
        if (!nextPlayers.length) return null;
        if (prev && nextPlayers.some((item) => item._id === prev._id)) {
          return nextPlayers.find((item) => item._id === prev._id) || null;
        }
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

  const loadFeeHistory = async (playerId: string, activeMonth: string) => {
    if (!token) return;

    setLoadingHistory(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN_FEE_PLAYER_STATUS}/${playerId}?month=${activeMonth}&months=12`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to load fee history");
      }

      const nextHistory: FeeHistoryItem[] = Array.isArray(data.history) ? data.history : [];
      setHistory(nextHistory);
      setSelectedMonthPaid(Boolean(data.selectedMonthStatus?.isPaid));

      if (data.player) {
        setPlayers((current) =>
          current.map((item) =>
            item._id === playerId
              ? {
                  ...item,
                  feeAccessEnabled: Boolean(data.player.feeAccessEnabled),
                }
              : item,
          ),
        );
      }
    } catch (error) {
      toast({
        title: "History Error",
        description: error instanceof Error ? error.message : "Unable to fetch payment history",
        variant: "destructive",
      });
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadSelectedMonthStatus = async (playerId: string, activeMonth: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${API_ENDPOINTS.ADMIN_FEE_PLAYER_STATUS}/${playerId}?month=${activeMonth}&months=1`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to load selected month status");
      }

      setSelectedMonthPaid(Boolean(data.selectedMonthStatus?.isPaid));
    } catch {
      setSelectedMonthPaid(false);
    }
  };

  const togglePlayerFeeAccess = async (player: FeePlayer, enabled: boolean) => {
    if (!token) return;

    setUpdatingFeeAccessFor(player._id);
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN_FEE_PLAYERS}/${player._id}/access`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to update payment list access");
      }

      setPlayers((current) =>
        current.map((item) =>
          item._id === player._id
            ? {
                ...item,
                feeAccessEnabled: enabled,
              }
            : item,
        ),
      );

      const updatedSelectedPlayer = {
        ...player,
        feeAccessEnabled: enabled,
      };

      setSelectedPlayer(updatedSelectedPlayer);

      if (!enabled) {
        setSelectedMonthPaid(false);
        setHistory([]);
        if (historyPlayer?._id === player._id) {
          setHistoryPlayer(null);
        }
      } else {
        await loadFeeHistory(player._id, month);
      }

      toast({
        title: enabled ? "Added To Fee List" : "Removed From Fee List",
        description: data.message || "Fee list updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Unable to update fee list",
        variant: "destructive",
      });
    } finally {
      setUpdatingFeeAccessFor(null);
    }
  };

  const handleViewHistory = async (player: FeePlayer) => {
    setSelectedPlayer(player);
    setHistoryPlayer(player);

    if (!player.feeAccessEnabled) {
      setHistory([]);
      toast({
        title: "Player Not Enabled",
        description: "Enable this player in fee module before opening history.",
        variant: "destructive",
      });
      return;
    }

    await loadFeeHistory(player._id, month);
  };

  const toggleMonthlyPayment = async (checked: boolean) => {
    if (!token || !selectedPlayer) return;

    if (!selectedPlayer.feeAccessEnabled) {
      toast({
        title: "Not In Fee List",
        description: "Enable this participant in fee list before updating payment status.",
        variant: "destructive",
      });
      return;
    }

    setSavingPayment(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.ADMIN_FEE_PLAYER_STATUS}/${selectedPlayer._id}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ month, isPaid: checked }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to update payment status");
      }

      setSelectedMonthPaid(checked);
      if (historyPlayer?._id === selectedPlayer._id) {
        await loadFeeHistory(selectedPlayer._id, month);
      }

      toast({
        title: checked ? "Payment Marked Paid" : "Payment Marked Pending",
        description: data.message || "Monthly payment status saved.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Unable to update payment",
        variant: "destructive",
      });
    } finally {
      setSavingPayment(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    loadPlayers();
  }, [token, navigate]);

  useEffect(() => {
    if (!selectedPlayer) {
      setSelectedMonthPaid(false);
      return;
    }

    if (!selectedPlayer.feeAccessEnabled) {
      setSelectedMonthPaid(false);
      return;
    }

    loadSelectedMonthStatus(selectedPlayer._id, month);
  }, [selectedPlayer, month]);

  useEffect(() => {
    if (!historyPlayer) return;
    if (!historyPlayer.feeAccessEnabled) return;

    loadFeeHistory(historyPlayer._id, month);
  }, [historyPlayer, month]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Seo
        title="Admin Fee Payments"
        description="Admin panel for fee participant access and month-wise paid or pending updates."
        url="https://spkabaddi.me/admin/fees"
        keywords="admin fee management, payment status, SP Kabaddi"
      />
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Fee Payment Control</h1>
            <p className="text-sm text-slate-600">Step 1: select player. Step 2: enable fee list access. Step 3: mark month as paid or pending.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/dashboard")}> 
            <ArrowLeft size={16} className="mr-2" />
            Back to Admin Dashboard
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Approved Players
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlayerListOpen((prev) => !prev)}
                >
                  {isPlayerListOpen ? (
                    <>
                      <ChevronUp className="mr-1 h-4 w-4" /> Close List
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-1 h-4 w-4" /> Open List
                    </>
                  )}
                </Button>
              </div>
              <CardDescription>Turn switch ON to include player in fee module.</CardDescription>
              {isPlayerListOpen ? (
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  <Input
                    className="pl-9"
                    placeholder="Search by name, phone, email"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
              ) : null}
            </CardHeader>
            <CardContent className="max-h-[70vh] space-y-2 overflow-auto">
              {!isPlayerListOpen ? (
                <p className="text-sm text-slate-500">Click Open List to view approved players.</p>
              ) : loadingPlayers ? (
                <div className="flex items-center justify-center py-8 text-sm text-slate-600">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading participants...
                </div>
              ) : filteredPlayers.length === 0 ? (
                <p className="text-sm text-slate-500">No participant found.</p>
              ) : (
                filteredPlayers.map((player) => {
                  const isSelected = selectedPlayer?._id === player._id;
                  const isUpdating = updatingFeeAccessFor === player._id;

                  return (
                    <button
                      key={player._id}
                      type="button"
                      className={`w-full rounded-md border p-3 text-left transition ${
                        isSelected ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                      onClick={() => setSelectedPlayer(player)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-800">{player.name}</p>
                          <p className="text-xs text-slate-500">{player.idCardNumber || "ID not generated"}</p>
                          <p className="text-xs text-slate-500">{player.phone || "No phone"}</p>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                          <Switch
                            checked={player.feeAccessEnabled}
                            disabled={isUpdating}
                            onCheckedChange={(checked) => togglePlayerFeeAccess(player, checked)}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-700" />
                  Monthly Payment Toggle
                </CardTitle>
                <CardDescription>
                  {selectedPlayer
                    ? `Player: ${selectedPlayer.name}`
                    : "Please select a player first."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="outline" size="icon" onClick={() => setMonth((prev) => shiftMonth(prev, -1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="rounded-md border border-slate-200 px-4 py-2 font-medium text-slate-700">
                    {selectedMonthLabel}
                  </div>
                  <Button variant="outline" size="icon" onClick={() => setMonth((prev) => shiftMonth(prev, 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {!selectedPlayer ? (
                  <p className="text-sm text-slate-500">Choose a participant from the left panel.</p>
                ) : !selectedPlayer.feeAccessEnabled ? (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    This player is not in fee list. Turn on the list switch to enable monthly payment tracking.
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <Label htmlFor="payment-toggle" className="text-base font-semibold text-slate-800">
                          Payment Received For {selectedMonthLabel}
                        </Label>
                        <p className="mt-1 text-sm text-slate-600">
                          ON = Paid, OFF = Pending.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {savingPayment && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
                        <Switch
                          id="payment-toggle"
                          checked={selectedMonthPaid}
                          disabled={savingPayment || loadingHistory}
                          onCheckedChange={toggleMonthlyPayment}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      {selectedMonthPaid ? (
                        <Badge className="bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="mr-1 h-4 w-4" /> Payment Done
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">
                          <AlertTriangle className="mr-1 h-4 w-4" /> Payment Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Month-wise Payment History</CardTitle>
                <CardDescription>
                  Full history appears only after clicking View History for a dedicated player.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="flex items-center py-6 text-sm text-slate-600">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading fee history...
                  </div>
                ) : !historyPlayer ? (
                  <p className="text-sm text-slate-500">Click View History on any enabled player to open full payment history.</p>
                ) : !historyPlayer.feeAccessEnabled ? (
                  <p className="text-sm text-slate-500">Selected history player is not enabled in fee list.</p>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                      Showing history for: {historyPlayer.name}
                    </div>
                    {history.map((item) => (
                      <div
                        key={item.month}
                        className={`flex items-center justify-between rounded-md border px-4 py-3 ${
                          item.isPaid
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{formatMonthLabel(item.month)}</p>
                          <p className="text-xs text-slate-500">
                            {item.updatedAt
                              ? `Updated: ${new Date(item.updatedAt).toLocaleString("en-IN")}`
                              : "No update yet"}
                          </p>
                        </div>
                        {item.isPaid ? (
                          <Badge className="bg-emerald-600 text-white">
                            <CheckCircle2 className="mr-1 h-4 w-4" /> Paid
                          </Badge>
                        ) : (
                          <Badge className="bg-red-600 text-white">
                            <AlertTriangle className="mr-1 h-4 w-4" /> Pending
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Players Enabled For Fee Module</CardTitle>
                <CardDescription>
                  These players can view fee status in player login.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enabledPlayers.length === 0 ? (
                  <p className="text-sm text-slate-500">No player is enabled yet.</p>
                ) : (
                  <div className="space-y-2">
                    {enabledPlayers.map((player) => (
                      <div
                        key={player._id}
                        className={`w-full rounded-md border p-3 text-left transition ${
                          selectedPlayer?._id === player._id
                            ? "border-emerald-500 bg-emerald-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-800">{player.name}</p>
                            <p className="text-xs text-slate-500">
                              {player.idCardNumber || "ID not generated"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-emerald-600 text-white">
                              <CheckCircle2 className="mr-1 h-4 w-4" /> Enabled
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedPlayer(player)}
                            >
                              Select
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleViewHistory(player)}
                            >
                              View History
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFeePayments;
