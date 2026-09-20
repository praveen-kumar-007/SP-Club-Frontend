import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  initializeSessionManager,
  clearSession,
  SESSION_ACTIVE_KEY,
} from "@/utils/adminSessionManager";

const EXEMPT_ROUTES = [
  "/admin/login",
  "/admin/forgot-password",
  "/sp-auth-x7k9-admin-init-portal-2025",
];

const AdminSessionWatcher = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const isSpecialAdminRoute = location.pathname.startsWith("/admin");
    const isExempt = EXEMPT_ROUTES.some((route) =>
      location.pathname.toLowerCase().startsWith(route),
    );

    if (!isSpecialAdminRoute || isExempt) {
      return;
    }

    const token = localStorage.getItem("adminToken");
    if (!token) {
      return;
    }

    // 1. Screen / Tab Close Detection:
    // When the user previously closed the screen/browser/tab, sessionStorage was erased.
    // Opening a new screen with a stale localStorage token will immediately be logged out.
    const isSessionActive = sessionStorage.getItem(SESSION_ACTIVE_KEY);
    if (!isSessionActive) {
      clearSession();
      queryClient.clear();
      toast({
        title: "Session Closed",
        description: "You have been logged out because your previous admin window/screen was closed.",
        variant: "default",
      });
      navigate("/admin/login");
      return;
    }

    // 2. 15-Minute Inactivity Auto-Logout Watcher
    const cleanup = initializeSessionManager(() => {
      clearSession();
      queryClient.clear();
      toast({
        title: "Auto Logged Out",
        description: "You have been logged out due to 15 minutes of continuous inactivity.",
        variant: "destructive",
      });
      navigate("/admin/login");
    });

    return cleanup;
  }, [location.pathname, navigate, toast, queryClient]);

  return null;
};

export default AdminSessionWatcher;
