import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/api";
import { Lock, Mail } from "lucide-react";

const playerLoginSchema = z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password is required"),
});

type PlayerLoginForm = z.infer<typeof playerLoginSchema>;

const PlayerLogin = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<PlayerLoginForm>({
        resolver: zodResolver(playerLoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (values: PlayerLoginForm) => {
        setIsLoading(true);
        try {
            const response = await fetch(API_ENDPOINTS.PLAYER_LOGIN, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.message || "Player login failed");
            }

            if (!data.token) {
                throw new Error("Login token missing from server response");
            }

            localStorage.setItem("playerToken", data.token);
            localStorage.setItem("playerUser", JSON.stringify(data.player));

            toast({
                title: "Login Successful",
                description: `Welcome ${data.player?.name || "Player"}`,
            });

            navigate("/player/dashboard");
        } catch (error) {
            toast({
                title: "Login Failed",
                description: error instanceof Error ? error.message : "Unable to login",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-blue-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-blue-200">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-3 h-16 w-16 rounded-xl overflow-hidden border border-blue-200 bg-white shadow-sm">
                        <img
                            src="/Logo.png"
                            alt="SP Kabaddi Group Dhanbad"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <CardTitle className="text-2xl text-slate-800">Player Login</CardTitle>
                    <CardDescription>Login with your email and password</CardDescription>
                </CardHeader>

                <CardContent>
                    <Form {...form}>
                        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                                                <Input type="email" className="pl-9" placeholder="Enter your email" {...field} disabled={isLoading} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                                                <Input type="password" className="pl-9" placeholder="Enter your password" {...field} disabled={isLoading} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="text-right">
                                <Link to="/player/forgot-password" className="text-sm text-blue-800 hover:text-blue-900 font-medium">
                                    Forgot Password?
                                </Link>
                            </div>

                            <Button type="submit" className="w-full bg-blue-800 hover:bg-blue-900" disabled={isLoading}>
                                {isLoading ? "Logging in..." : "Login"}
                            </Button>
                        </form>
                    </Form>

                    <p className="mt-4 text-xs text-slate-500 text-center">
                        After approval, default password is your registered phone number. Change it after first login.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default PlayerLogin;
