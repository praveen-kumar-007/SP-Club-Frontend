import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { ArrowLeft, Bell, Loader2, Send } from "lucide-react";

interface PlayerMessageItem {
    _id: string;
    type: "player_to_admin" | "admin_to_player";
    subject: string;
    message: string;
    status: "new" | "completed";
    createdAt: string;
    sentByAdminName?: string;
    replyToMessageId?: string | null;
}

const PlayerMessages = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<PlayerMessageItem[]>([]);
    const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");

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

    const fetchMessages = async (activePlayerToken: string) => {
        const response = await fetch(API_ENDPOINTS.PLAYER_MESSAGES, {
            headers: {
                Authorization: `Bearer ${activePlayerToken}`,
            },
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || "Failed to fetch messages");
        }

        setHistory(data.items || []);
    };

    const markAllNotificationsRead = async (activePlayerToken: string) => {
        const response = await fetch(API_ENDPOINTS.PLAYER_MESSAGES_READ_ALL, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${activePlayerToken}`,
            },
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || "Failed to mark notifications as read");
        }
    };

    useEffect(() => {
        const init = async () => {
            if (!playerId || !playerToken) {
                navigate("/player/login");
                return;
            }

            try {
                await markAllNotificationsRead(playerToken);
                await fetchMessages(playerToken);
            } catch (error) {
                toast({
                    title: "Error",
                    description: error instanceof Error ? error.message : "Unable to fetch messages",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [playerId, playerToken, navigate, toast]);

    const handleSend = async () => {
        if (!playerToken) {
            navigate("/player/login");
            return;
        }

        if (!subject.trim() || !message.trim()) {
            toast({
                title: "Missing Details",
                description: "Subject and message are required.",
                variant: "destructive",
            });
            return;
        }

        setSending(true);
        try {
            const response = await fetch(API_ENDPOINTS.PLAYER_MESSAGES, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${playerToken}`,
                },
                body: JSON.stringify({
                    subject: subject.trim(),
                    message: message.trim(),
                }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to send message");
            }

            setSubject("");
            setMessage("");
            await fetchMessages(playerToken);

            toast({
                title: "Message Sent",
                description: "Your notice has been sent to admin.",
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

    const inboxMessages = history.filter((item) => item.type === "admin_to_player");
    const sentMessages = history.filter((item) => item.type === "player_to_admin");

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-3 sm:p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <Card className="border-blue-200 shadow-sm">
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <CardTitle className="text-2xl text-slate-800">Send Message To Admin</CardTitle>
                            <CardDescription>Submit notice/letter with subject and message.</CardDescription>
                        </div>
                        <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate("/player/dashboard")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back To Dashboard
                        </Button>
                    </CardHeader>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Create New Message</CardTitle>
                        <CardDescription>Send your letter/notice to admin clearly with subject and message.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Subject</label>
                            <Input
                                placeholder="Write subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                maxLength={200}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Message</label>
                            <Textarea
                                placeholder="Write your message to admin"
                                className="min-h-[140px]"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                maxLength={3000}
                            />
                        </div>

                        <Button className="w-full sm:w-auto bg-blue-800 hover:bg-blue-900" disabled={sending} onClick={handleSend}>
                            {sending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="mr-2 h-4 w-4" />
                                    Send To Admin
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-blue-800" />
                            Message Center
                        </CardTitle>
                        <CardDescription>Read admin notifications and track your sent messages separately.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-800" />
                            </div>
                        ) : (
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "inbox" | "sent")}>
                                <TabsList className="h-auto w-full flex-wrap justify-start gap-2">
                                    <TabsTrigger value="inbox">Inbox ({inboxMessages.length})</TabsTrigger>
                                    <TabsTrigger value="sent">Sent ({sentMessages.length})</TabsTrigger>
                                </TabsList>

                                <TabsContent value="inbox" className="mt-4">
                                    {inboxMessages.length ? (
                                        <div className="divide-y rounded-lg border border-slate-200">
                                            {inboxMessages.map((item) => (
                                                <div key={item._id} className="p-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">{item.subject}</p>
                                                            <p className="text-xs text-slate-500 mt-0.5">
                                                                From Admin{item.sentByAdminName ? ` (${item.sentByAdminName})` : ""}
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${item.status === "completed" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-700"}`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">{new Date(item.createdAt).toLocaleString("en-IN")}</p>
                                                    <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{item.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">No admin notifications.</p>
                                    )}
                                </TabsContent>

                                <TabsContent value="sent" className="mt-4">
                                    {sentMessages.length ? (
                                        <div className="divide-y rounded-lg border border-slate-200">
                                            {sentMessages.map((item) => (
                                                <div key={item._id} className="p-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800">{item.subject}</p>
                                                            <p className="text-xs text-slate-500 mt-0.5">From You</p>
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${item.status === "completed" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-700"}`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">{new Date(item.createdAt).toLocaleString("en-IN")}</p>
                                                    <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{item.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">No sent messages yet.</p>
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

export default PlayerMessages;
