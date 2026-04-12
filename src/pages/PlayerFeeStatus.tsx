import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Seo from "@/components/Seo";
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Loader2, Wallet } from "lucide-react";

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

const PlayerFeeStatus = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [month, setMonth] = useState(getCurrentMonth());
  const [history, setHistory] = useState<FeeHistoryItem[]>([]);
  const [selectedMonthPaid, setSelectedMonthPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feeAccessEnabled, setFeeAccessEnabled] = useState(true);
  const [accessMessage, setAccessMessage] = useState("");

  const playerToken = localStorage.getItem("playerToken") || undefined;

  const monthLabel = useMemo(() => formatMonthLabel(month), [month]);

  const loadFeeData = async (activeMonth: string) => {
    if (!playerToken) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_ENDPOINTS.PLAYER_FEES}?month=${activeMonth}&months=12`, {
        headers: {
          Authorization: `Bearer ${playerToken}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 403) {
        setFeeAccessEnabled(false);
        setAccessMessage(data.message || "Fee details are not enabled for your account yet.");
        setHistory([]);
        setSelectedMonthPaid(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch fee status");
      }

      setFeeAccessEnabled(Boolean(data.feeAccessEnabled));
      setAccessMessage("");

      const nextHistory: FeeHistoryItem[] = Array.isArray(data.history) ? data.history : [];
      setHistory(nextHistory);
      setSelectedMonthPaid(Boolean(data.selectedMonthStatus?.isPaid));
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unable to fetch fee status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!playerToken) {
      navigate("/player/login");
      return;
    }

    loadFeeData(month);
  }, [month, playerToken, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Seo
        title="Player Fee Status"
        description="View monthly fee payment status and history for your account."
        url="https://spkabaddi.me/player/fees"
        keywords="player fee status, monthly payment, SP Kabaddi"
      />
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Fee Payment Status</h1>
            <p className="text-sm text-slate-600">Check if your monthly fee is paid or pending.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/player/dashboard")}> 
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-700" />
              Selected Month
            </CardTitle>
            <CardDescription>Green = paid, Red = pending.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="icon" onClick={() => setMonth((prev) => shiftMonth(prev, -1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="rounded-md border border-slate-200 px-4 py-2 font-medium text-slate-700">
                {monthLabel}
              </div>
              <Button variant="outline" size="icon" onClick={() => setMonth((prev) => shiftMonth(prev, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center text-sm text-slate-600">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading payment status...
              </div>
            ) : !feeAccessEnabled ? (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {accessMessage || "Fee module is not enabled for your account yet. Please contact admin."}
              </div>
            ) : selectedMonthPaid ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                <Badge className="bg-emerald-600 text-white">
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Payment Done
                </Badge>
                <p className="mt-2 text-sm text-emerald-800">Your payment is completed for {monthLabel}.</p>
              </div>
            ) : (
              <div className="rounded-md border border-red-200 bg-red-50 p-4">
                <Badge className="bg-red-600 text-white">
                  <AlertTriangle className="mr-1 h-4 w-4" /> Payment Pending
                </Badge>
                <p className="mt-2 text-sm text-red-800">Your payment is pending for {monthLabel}.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Month-wise History</CardTitle>
            <CardDescription>Shows 12 months history from selected month.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center text-sm text-slate-600">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading history...
              </div>
            ) : !feeAccessEnabled ? (
              <p className="text-sm text-slate-500">History is visible after admin enables this feature for your account.</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-500">No month-wise data found.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.month}
                    className={`flex items-center justify-between rounded-md border px-4 py-3 ${
                      item.isPaid ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{formatMonthLabel(item.month)}</p>
                      <p className="text-xs text-slate-500">
                        {item.updatedAt
                          ? `Updated: ${new Date(item.updatedAt).toLocaleString("en-IN")}`
                          : "No update from admin"}
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
      </div>
    </div>
  );
};

export default PlayerFeeStatus;
