import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";

const AdminForgotPassword = () => {
    const { toast } = useToast();
    const navigate = useNavigate();

    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);
    const [resetting, setResetting] = useState(false);

    const handleRequestOtp = async () => {
        if (!usernameOrEmail.trim()) {
            toast({
                title: "Required",
                description: "Enter username or email",
                variant: "destructive",
            });
            return;
        }

        setSendingOtp(true);
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN_FORGOT_PASSWORD_REQUEST, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usernameOrEmail: usernameOrEmail.trim() }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to send OTP");
            }

            setOtpSent(true);
            toast({
                title: "OTP Sent",
                description: data.message || "Check your registered email",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to send OTP",
                variant: "destructive",
            });
        } finally {
            setSendingOtp(false);
        }
    };

    const handleReset = async () => {
        if (!otp.trim() || !newPassword || !confirmPassword) {
            toast({
                title: "Missing Fields",
                description: "OTP and password fields are required",
                variant: "destructive",
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                title: "Weak Password",
                description: "Password must be at least 6 characters",
                variant: "destructive",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: "Mismatch",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        setResetting(true);
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN_FORGOT_PASSWORD_RESET, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    usernameOrEmail: usernameOrEmail.trim(),
                    otp: otp.trim(),
                    newPassword,
                }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Failed to reset password");
            }

            toast({
                title: "Password Reset",
                description: data.message || "Please login with new password",
            });

            navigate("/admin/login");
        } catch (error) {
            toast({
                title: "Reset Failed",
                description: error instanceof Error ? error.message : "Could not reset password",
                variant: "destructive",
            });
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-blue-200">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-blue-700 text-white flex items-center justify-center">
                        <KeyRound size={24} />
                    </div>
                    <CardTitle className="text-2xl">Admin Forgot Password</CardTitle>
                    <CardDescription>Reset admin password using secure email OTP verification.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="usernameOrEmail">Username or Email</Label>
                        <Input
                            id="usernameOrEmail"
                            placeholder="Enter username or email"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            disabled={otpSent}
                        />
                    </div>

                    {!otpSent ? (
                        <Button className="w-full bg-blue-700 hover:bg-blue-800" onClick={handleRequestOtp} disabled={sendingOtp}>
                            <MailCheck className="h-4 w-4 mr-2" />
                            {sendingOtp ? "Sending OTP..." : "Send OTP"}
                        </Button>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="otp">OTP</Label>
                                <Input
                                    id="otp"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>

                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleReset} disabled={resetting}>
                                {resetting ? "Resetting..." : "Reset Password"}
                            </Button>
                        </>
                    )}

                    <div className="text-center">
                        <Link to="/admin/login" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-800">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminForgotPassword;
