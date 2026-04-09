import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";

const PlayerForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resetting, setResetting] = useState(false);

  const requestOtp = async () => {
    if (!email.trim()) {
      toast({ title: "Email Required", description: "Enter your approved email", variant: "destructive" });
      return;
    }

    setSendingOtp(true);
    try {
      const response = await fetch(API_ENDPOINTS.PLAYER_FORGOT_PASSWORD_REQUEST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setOtpSent(true);
      toast({
        title: "OTP Sent",
        description: data.message || "Check your email for OTP",
      });
    } catch (error) {
      toast({
        title: "Failed",
        description: error instanceof Error ? error.message : "Unable to send OTP",
        variant: "destructive",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const resetPassword = async () => {
    if (!otp.trim() || !newPassword || !confirmPassword) {
      toast({ title: "Missing Details", description: "Fill OTP and both password fields", variant: "destructive" });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: "Weak Password", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Mismatch", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    setResetting(true);
    try {
      const response = await fetch(API_ENDPOINTS.PLAYER_FORGOT_PASSWORD_RESET, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      toast({
        title: "Password Updated",
        description: data.message || "Now login with your new password",
      });
      navigate("/player/login");
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Unable to reset password",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-slate-50 to-emerald-50 p-4 flex items-center justify-center">
      <Card className="w-full max-w-lg border-cyan-200 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-slate-800 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-cyan-700" />
            Forgot Password
          </CardTitle>
          <CardDescription>Reset your account password securely via Email OTP.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Approved Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your approved email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpSent}
            />
          </div>

          {!otpSent ? (
            <Button className="w-full bg-cyan-700 hover:bg-cyan-800" onClick={requestOtp} disabled={sendingOtp}>
              <MailCheck className="h-4 w-4 mr-2" />
              {sendingOtp ? "Sending OTP..." : "Send OTP"}
            </Button>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Email OTP</Label>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit OTP"
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
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={resetPassword} disabled={resetting}>
                {resetting ? "Updating..." : "Reset Password"}
              </Button>
            </>
          )}

          <div className="pt-2 text-center">
            <Link to="/player/login" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-800">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerForgotPassword;
