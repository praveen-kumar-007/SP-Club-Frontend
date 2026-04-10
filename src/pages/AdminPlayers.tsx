import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { API_ENDPOINTS } from "@/config/api";
import { Search, Edit3, Save, X } from "lucide-react";
import Seo from "@/components/Seo";

interface PlayerRow {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  idCardNumber: string;
  gender: string;
  kitSize?: string;
  jerseyNumber?: number;
  clubDetails?: string;
  aadharNumber?: string;
  address?: string;
}

const AdminPlayers = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingKitSize, setEditingKitSize] = useState("");
  const [editingJerseyNumber, setEditingJerseyNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    setToken(storedToken);
    if (!storedToken) {
      navigate("/admin/login");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    if (!token) return;
    const fetchPlayers = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${API_ENDPOINTS.ADMIN_PLAYERS}?search=${encodeURIComponent(search)}&all=true`;
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "Failed to load players");
        }
        setPlayers(Array.isArray(data.players) ? data.players : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load players");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [token, search]);

  const startEdit = (player: PlayerRow) => {
    setEditingId(player._id);
    setEditingKitSize(player.kitSize || "");
    setEditingJerseyNumber(player.jerseyNumber ? String(player.jerseyNumber) : "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingKitSize("");
    setEditingJerseyNumber("");
  };

  const saveEdit = async (playerId: string) => {
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      const baseUrl = API_ENDPOINTS.ADMIN_PLAYERS.replace(/\/players$/, "");
      const response = await fetch(`${baseUrl}/registrations/${playerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          kitSize: editingKitSize || null,
          jerseyNumber: editingJerseyNumber || null,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to update player");
      }

      setPlayers((current) =>
        current.map((player) =>
          player._id === playerId
            ? {
                ...player,
                kitSize: editingKitSize || undefined,
                jerseyNumber: editingJerseyNumber ? Number(editingJerseyNumber) : undefined,
              }
            : player,
        ),
      );
      cancelEdit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <Seo
        title="Admin Players"
        description="View and manage all approved player data including kit and jersey assignments."
        url="https://spkabaddi.me/admin/players"
        keywords="admin players, SP Kabaddi, jersey search, player directory"
      />
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <CardTitle>Player Directory</CardTitle>
                <CardDescription>
                  Search and edit player kit sizes, jersey numbers, and other approved player details.
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative w-full sm:w-72">
                  <Label htmlFor="player-search">Search players</Label>
                  <Input
                    id="player-search"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, jersey, kit size, gender..."
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-9 h-4 w-4 text-slate-400" />
                </div>
                <Button variant="outline" onClick={() => setSearch("")}>Clear</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-700">
                <thead className="border-b border-slate-200 bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Gender</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Kit Size</th>
                    <th className="px-4 py-3">Jersey No.</th>
                    <th className="px-4 py-3">ID Card</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                        Loading players...
                      </td>
                    </tr>
                  ) : players.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                        No players found.
                      </td>
                    </tr>
                  ) : (
                    players.map((player) => (
                      <tr key={player._id} className="border-b border-slate-200">
                        <td className="px-4 py-3 font-medium text-slate-900">{player.name}</td>
                        <td className="px-4 py-3 capitalize">{player.gender || "N/A"}</td>
                        <td className="px-4 py-3">{player.email}</td>
                        <td className="px-4 py-3">{player.phone || "N/A"}</td>
                        <td className="px-4 py-3">
                          {editingId === player._id ? (
                            <select
                              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
                              value={editingKitSize}
                              onChange={(e) => setEditingKitSize(e.target.value)}
                            >
                              <option value="">Not selected</option>
                              <option value="XS">XS</option>
                              <option value="S">S</option>
                              <option value="M">M</option>
                              <option value="L">L</option>
                              <option value="XL">XL</option>
                              <option value="XXL">XXL</option>
                              <option value="XXXL">XXXL</option>
                            </select>
                          ) : (
                            player.kitSize || "-"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingId === player._id ? (
                            <input
                              type="number"
                              min={1}
                              max={99}
                              className="w-20 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
                              value={editingJerseyNumber}
                              onChange={(e) => setEditingJerseyNumber(e.target.value)}
                            />
                          ) : (
                            player.jerseyNumber ?? "-"
                          )}
                        </td>
                        <td className="px-4 py-3">{player.idCardNumber || "N/A"}</td>
                        <td className="px-4 py-3">
                          {player.status === 'approved' ? (
                            <Badge className="bg-green-100 text-green-800">Approved</Badge>
                          ) : player.status === 'rejected' ? (
                            <Badge className="bg-red-100 text-red-800">Rejected</Badge>
                          ) : player.status === 'pending' ? (
                            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          ) : (
                            <Badge className="bg-slate-100 text-slate-700">{player.status}</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 space-x-2">
                          {editingId === player._id ? (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => saveEdit(player._id)}
                                disabled={saving}
                              >
                                <Save className="mr-2 h-4 w-4" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={cancelEdit}>
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => startEdit(player)}>
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPlayers;
