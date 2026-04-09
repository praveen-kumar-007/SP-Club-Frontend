import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { ArrowLeft, KeyRound } from "lucide-react";

const PlayerChangePassword = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const stored = localStorage.getItem("playerUser");
    const player = stored ? JSON.parse(stored) : null;
    const playerId = player?.id as string | undefined;
    const playerToken = localStorage.getItem("playerToken") || undefined;

    const handleSubmit = async () => {
        if (!playerId || !playerToken) {
            navigate("/player/login");
            return;
        }

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast({ title: "Missing Details", description: "Fill all fields", variant: "destructive" });
            return;
        }

        if (newPassword.length < 6) {
            toast({ title: "Weak Password", description: "Password must be at least 6 characters", variant: "destructive" });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({ title: "Mismatch", description: "New passwords do not match", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(API_ENDPOINTS.PLAYER_CHANGE_PASSWORD, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${playerToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to update password");
            }

            toast({
                title: "Password Changed",
                description: data.message || "Password updated successfully",
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            navigate("/player/dashboard");
        } catch (error) {
            toast({
                title: "Change Failed",
                description: error instanceof Error ? error.message : "Unable to change password",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 p-4 flex items-center justify-center">
            <Card className="w-full max-w-lg border-blue-200 shadow-md">
                <CardHeader>
                    <CardTitle className="text-slate-800 flex items-center gap-2">
                        <KeyRound className="h-5 w-5 text-blue-800" />
                        Change Password
                    </CardTitle>
                    <CardDescription>Update your player account password securely.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate("/player/dashboard")} className="flex-1">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-orange-600 hover:bg-orange-700">
                            {isSubmitting ? "Updating..." : "Update Password"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PlayerChangePassword;
