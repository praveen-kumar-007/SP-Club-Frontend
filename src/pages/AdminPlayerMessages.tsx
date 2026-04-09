import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { ArrowLeft, CheckCircle, Loader2, Reply, Send, Trash2, Users } from "lucide-react";

interface PlayerOption {
    _id: string;
    name: string;
    email: string;
    idCardNumber?: string;
}

interface AdminMessageItem {
    _id: string;
    playerId: string;
    playerName: string;
    playerEmail: string;
    idCardNumber?: string;
    type: "player_to_admin" | "admin_to_player";
    subject: string;
    message: string;
    status: "new" | "completed";
    createdAt: string;
    sentByAdminName?: string;
}

const AdminPlayerMessages = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const token = localStorage.getItem("adminToken");

    const [players, setPlayers] = useState<PlayerOption[]>([]);
    const [messages, setMessages] = useState<AdminMessageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
    const [playerSearch, setPlayerSearch] = useState("");
    const [debouncedPlayerSearch, setDebouncedPlayerSearch] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
    const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
    const [replyingMessageId, setReplyingMessageId] = useState<string | null>(null);

    const fetchPlayers = async () => {
        if (!token) return;

        const response = await fetch(API_ENDPOINTS.ADMIN_PLAYERS, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch players");
        }

        setPlayers(data.players || []);
    };

    const fetchMessages = async () => {
        if (!token) return;

        const response = await fetch(API_ENDPOINTS.ADMIN_PLAYER_MESSAGES, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch messages");
        }

        setMessages(data.items || []);
    };

    useEffect(() => {
        const init = async () => {
            if (!token) {
                navigate("/admin/login");
                return;
            }

            try {
                await Promise.all([fetchPlayers(), fetchMessages()]);
            } catch (error) {
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Unable to load admin messages",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [token, navigate, toast]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedPlayerSearch(playerSearch);
        }, 250);

        return () => clearTimeout(timer);
    }, [playerSearch]);

    const filteredPlayers = useMemo(() => {
        const term = debouncedPlayerSearch.toLowerCase().trim();
        if (!term) return players;

        return players.filter((player) => {
            const name = player.name?.toLowerCase() || "";
            const email = player.email?.toLowerCase() || "";
            const idCard = player.idCardNumber?.toLowerCase() || "";
            return name.includes(term) || email.includes(term) || idCard.includes(term);
        });
    }, [players, debouncedPlayerSearch]);

    const selectedPlayerSet = useMemo(() => new Set(selectedPlayerIds), [selectedPlayerIds]);

    const allFilteredSelected = filteredPlayers.length > 0 && filteredPlayers.every((p) => selectedPlayerSet.has(p._id));

    const togglePlayerSelection = (playerId: string, checked: boolean) => {
        setSelectedPlayerIds((prev) => {
            if (checked) {
                if (prev.includes(playerId)) return prev;
                return [...prev, playerId];
            }
            return prev.filter((id) => id !== playerId);
        });
    };

    const handleSelectAllFiltered = () => {
        if (!filteredPlayers.length) return;

        if (allFilteredSelected) {
            const filteredIds = new Set(filteredPlayers.map((p) => p._id));
            setSelectedPlayerIds((prev) => prev.filter((id) => !filteredIds.has(id)));
            return;
        }

        setSelectedPlayerIds((prev) => {
            const merged = new Set(prev);
            filteredPlayers.forEach((p) => merged.add(p._id));
            return Array.from(merged);
        });
    };

    const handleSend = async () => {
        if (!token) {
            navigate("/admin/login");
            return;
        }

        if (!selectedPlayerIds.length || !subject.trim() || !body.trim()) {
            toast({
                title: "Missing Details",
                description: "Select at least one player, then add subject and message.",
                variant: "destructive",
            });
            return;
        }

        setSending(true);
        try {
            const sendPromises = selectedPlayerIds.map((playerId) =>
                fetch(`${API_ENDPOINTS.ADMIN_PLAYER_MESSAGES}/send`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        playerId,
                        subject: subject.trim(),
                        message: body.trim(),
                    }),
                }).then(async (response) => {
                    const data = await response.json().catch(() => ({}));
                    if (!response.ok) {
                        throw new Error(data.message || "Failed to send message");
                    }
                    return data;
                })
            );

            const results = await Promise.allSettled(sendPromises);
            const successCount = results.filter((r) => r.status === "fulfilled").length;
            const failedCount = results.length - successCount;

            if (successCount === 0) {
                throw new Error("Failed to send message to selected players");
            }

            setSubject("");
            setBody("");
            setSelectedPlayerIds([]);
            await fetchMessages();

            toast({
                title: "Message Sent",
                description: failedCount > 0
                    ? `Sent to ${successCount} player(s), failed for ${failedCount}.`
                    : `Message sent to ${successCount} player(s).`,
            });
        } catch (error) {
            toast({
                title: "Send Failed",
                description: error instanceof Error ? error.message : "Unable to send message",
                variant: "destructive",
            });
        } finally {
            setSending(false);
        }
    };

    const handleReply = async (item: AdminMessageItem) => {
        if (!token) {
            navigate("/admin/login");
            return;
        }

        const replyText = (replyDrafts[item._id] || "").trim();
        if (!replyText) {
            toast({
                title: "Reply Required",
                description: "Write a reply message first.",
                variant: "destructive",
            });
            return;
        }

        setReplyingMessageId(item._id);
        try {
            const response = await fetch(`${API_ENDPOINTS.ADMIN_PLAYER_MESSAGES}/${item._id}/reply`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message: replyText }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to send reply");
            }

            await fetchMessages();
            setReplyDrafts((prev) => ({ ...prev, [item._id]: "" }));
            toast({
                title: "Reply Sent",
                description: "Reply has been sent to player.",
            });
        } catch (error) {
            toast({
                title: "Reply Failed",
                description: error instanceof Error ? error.message : "Unable to send reply",
                variant: "destructive",
            });
        } finally {
            setReplyingMessageId(null);
        }
    };

    const handleComplete = async (id: string) => {
        if (!token) return;

        try {
            const response = await fetch(`${API_ENDPOINTS.ADMIN_PLAYER_MESSAGES}/${id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to mark completed");
            }

            await fetchMessages();
        } catch (error) {
            toast({
                title: "Update Failed",
                description: error instanceof Error ? error.message : "Unable to update message",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (!token) return;

        if (!window.confirm("Delete this message?")) {
            return;
        }

        try {
            const response = await fetch(`${API_ENDPOINTS.ADMIN_PLAYER_MESSAGES}/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to delete message");
            }

            await fetchMessages();
        } catch (error) {
            toast({
                title: "Delete Failed",
                description: error instanceof Error ? error.message : "Unable to delete message",
                variant: "destructive",
            });
        }
    };

    const filteredMessages = useMemo(() => {
        const term = search.toLowerCase().trim();
        if (!term) return messages;

        return messages.filter((item) => {
            const playerName = item.playerName?.toLowerCase() || "";
            const email = item.playerEmail?.toLowerCase() || "";
            const subjectText = item.subject?.toLowerCase() || "";
            return playerName.includes(term) || email.includes(term) || subjectText.includes(term);
        });
    }, [messages, search]);

    const inboxMessages = useMemo(
        () => filteredMessages.filter((m) => m.type === "player_to_admin"),
        [filteredMessages]
    );

    const sentMessages = useMemo(
        () => filteredMessages.filter((m) => m.type === "admin_to_player"),
        [filteredMessages]
    );

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Admin Player Messages</h1>
                        <p className="text-sm text-slate-600">Send messages to players and reply to player notices.</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate("/admin/dashboard")}>
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Dashboard
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-emerald-600" />
                            Compose Message
                        </CardTitle>
                        <CardDescription>Select players, write a clear subject and message, then send in one click.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <label className="text-sm font-medium text-slate-700">Select Players</label>
                                <div className="flex gap-2">
                                    <Button type="button" size="sm" variant="outline" onClick={handleSelectAllFiltered}>
                                        {allFilteredSelected ? "Unselect All" : "Select All"}
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedPlayerIds([])}
                                        disabled={!selectedPlayerIds.length}
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>

                            <Input
                                placeholder="Search player by name, email, ID"
                                value={playerSearch}
                                onChange={(e) => setPlayerSearch(e.target.value)}
                            />

                            <div className="max-h-52 overflow-auto rounded-md border border-slate-200 divide-y">
                                {filteredPlayers.map((player) => {
                                    const checked = selectedPlayerSet.has(player._id);
                                    return (
                                        <label key={player._id} className="flex items-start gap-3 p-3 cursor-pointer hover:bg-slate-50">
                                            <Checkbox
                                                checked={checked}
                                                onCheckedChange={(value) => togglePlayerSelection(player._id, Boolean(value))}
                                            />
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">{player.name}</p>
                                                <p className="text-xs text-slate-500">{player.email}</p>
                                                <p className="text-xs text-slate-500">{player.idCardNumber || "No ID"}</p>
                                            </div>
                                        </label>
                                    );
                                })}

                                {!filteredPlayers.length && (
                                    <p className="p-3 text-sm text-slate-500">No players found.</p>
                                )}
                            </div>

                            <p className="text-xs text-slate-600">Selected players: {selectedPlayerIds.length}</p>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Subject</label>
                                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Write subject" maxLength={200} className="mt-1" />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-slate-700">Message</label>
                            <Textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder="Write message for player"
                                className="mt-1 min-h-[120px]"
                                maxLength={3000}
                            />
                        </div>

                        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSend} disabled={sending}>
                            {sending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Message
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Message Center</CardTitle>
                        <CardDescription>View incoming player notices and sent admin messages in separate tabs.</CardDescription>
                        <Input
                            placeholder="Search by player, email, subject"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full sm:max-w-md"
                        />
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                            </div>
                        ) : (
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "inbox" | "sent")}>
                                <TabsList className="h-auto w-full flex-wrap justify-start gap-2">
                                    <TabsTrigger value="inbox">Inbox ({inboxMessages.length})</TabsTrigger>
                                    <TabsTrigger value="sent">Sent ({sentMessages.length})</TabsTrigger>
                                </TabsList>

                                <TabsContent value="inbox" className="mt-4">
                                    {!inboxMessages.length ? (
                                        <p className="text-sm text-slate-500">No incoming player messages.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {inboxMessages.map((item) => (
                                                <div key={item._id} className="rounded-md border border-slate-200 p-4">
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{item.subject}</p>
                                                            <p className="text-xs text-slate-500 mt-1">{item.playerName} ({item.playerEmail})</p>
                                                            <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("en-IN")}</p>
                                                        </div>

                                                        <span className={`text-xs px-2 py-1 rounded-full ${item.status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                                            {item.status}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-slate-700 mt-3 whitespace-pre-wrap">{item.message}</p>

                                                    <div className="mt-4 space-y-2">
                                                        <Textarea
                                                            placeholder="Write reply to player"
                                                            value={replyDrafts[item._id] || ""}
                                                            onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [item._id]: e.target.value }))}
                                                            className="min-h-[90px]"
                                                        />

                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleReply(item)}
                                                                disabled={replyingMessageId === item._id}
                                                            >
                                                                {replyingMessageId === item._id ? (
                                                                    <>
                                                                        <Loader2 size={14} className="mr-1 animate-spin" />
                                                                        Sending...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Reply size={14} className="mr-1" />
                                                                        Send Reply
                                                                    </>
                                                                )}
                                                            </Button>

                                                            {item.status === "new" && (
                                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleComplete(item._id)}>
                                                                    <CheckCircle size={14} className="mr-1" />
                                                                    Mark Complete
                                                                </Button>
                                                            )}

                                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(item._id)}>
                                                                <Trash2 size={14} className="mr-1" />
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="sent" className="mt-4">
                                    {!sentMessages.length ? (
                                        <p className="text-sm text-slate-500">No admin-sent messages yet.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {sentMessages.map((item) => (
                                                <div key={item._id} className="rounded-md border border-slate-200 p-4">
                                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                                        <div>
                                                            <p className="font-semibold text-slate-800">{item.subject}</p>
                                                            <p className="text-xs text-slate-500 mt-1">To: {item.playerName} ({item.playerEmail})</p>
                                                            <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("en-IN")}</p>
                                                        </div>

                                                        <span className={`text-xs px-2 py-1 rounded-full ${item.status === "completed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                                                            {item.status}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-slate-700 mt-3 whitespace-pre-wrap">{item.message}</p>

                                                    <div className="flex flex-wrap items-center gap-2 mt-4">
                                                        {item.status === "new" && (
                                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleComplete(item._id)}>
                                                                <CheckCircle size={14} className="mr-1" />
                                                                Mark Complete
                                                            </Button>
                                                        )}

                                                        <Button size="sm" variant="destructive" onClick={() => handleDelete(item._id)}>
                                                            <Trash2 size={14} className="mr-1" />
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminPlayerMessages;
