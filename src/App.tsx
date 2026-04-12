import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import ScrollToTop from "./components/ScrollToTop";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import NotFound from "./pages/NotFound";

const lazyWithPreload = <T extends React.ComponentType<any>>(
  importer: () => Promise<{ default: T }>
) => {
  const Component = lazy(importer) as React.LazyExoticComponent<T> & {
    preload?: () => Promise<{ default: T }>;
  };
  Component.preload = importer;
  return Component;
};

// Lazy load pages for better performance
const Home = lazyWithPreload(() => import("./pages/Home"));
const About = lazyWithPreload(() => import("./pages/About"));
const Gallery = lazyWithPreload(() => import("./pages/Gallery"));
const Register = lazyWithPreload(() => import("./pages/Register"));
const Contact = lazyWithPreload(() => import("./pages/Contact"));
const News = lazyWithPreload(() => import("./pages/News"));
const NewsDetail = lazyWithPreload(() => import("./pages/NewsDetail"));
const TermsConditions = lazyWithPreload(() => import("./pages/TermsConditions"));
const PrivacyPolicy = lazyWithPreload(() => import("./pages/PrivacyPolicy"));
const KabaddiRules = lazyWithPreload(() => import("./pages/KabaddiRules"));
const AdminLogin = lazyWithPreload(() => import("./pages/AdminLogin"));
const AdminForgotPassword = lazyWithPreload(() => import("./pages/AdminForgotPassword"));
const AdminSignup = lazyWithPreload(() => import("./pages/AdminSignup"));
const AdminDashboard = lazyWithPreload(() => import("./pages/AdminDashboard"));
const AdminRegistrationDetail = lazyWithPreload(() => import("./pages/AdminRegistrationDetail"));
const AdminPlayers = lazyWithPreload(() => import("./pages/AdminPlayers"));
const AdminInquiries = lazyWithPreload(() => import("./pages/AdminInquiries"));
const AdminNews = lazyWithPreload(() => import("./pages/AdminNews"));
const AdminPlayerAttendance = lazyWithPreload(() => import("./pages/AdminPlayerAttendance"));
const AdminDateAttendance = lazyWithPreload(() => import("./pages/AdminDateAttendance"));
const AdminPlayerMessages = lazyWithPreload(() => import("./pages/AdminPlayerMessages"));
const AdminMailCenter = lazyWithPreload(() => import("./pages/AdminMailCenter"));
const AdminLoginHistory = lazyWithPreload(() => import("./pages/AdminLoginHistory"));
const AdminFeePayments = lazyWithPreload(() => import("./pages/AdminFeePayments"));
const PlayerLogin = lazyWithPreload(() => import("./pages/PlayerLogin"));
const PlayerDashboard = lazyWithPreload(() => import("./pages/PlayerDashboard"));
const PlayerAttendance = lazyWithPreload(() => import("./pages/PlayerAttendance"));
const PlayerMessages = lazyWithPreload(() => import("./pages/PlayerMessages"));
const PlayerForgotPassword = lazyWithPreload(() => import("./pages/PlayerForgotPassword"));
const PlayerChangePassword = lazyWithPreload(() => import("./pages/PlayerChangePassword"));
const PlayerFeeStatus = lazyWithPreload(() => import("./pages/PlayerFeeStatus"));
const IDCardGenerator = lazyWithPreload(() => import("./pages/IDCard/IDCardGenerator"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const preloadRoutes = () => {
      [
        About,
        Gallery,
        Register,
        Contact,
        News,
        TermsConditions,
        PrivacyPolicy,
        KabaddiRules,
        PlayerLogin,
        AdminLogin,
      ].forEach((page) => page.preload?.());
    };

    const idleCallback = (window as any).requestIdleCallback as
      | ((cb: () => void) => number)
      | undefined;
    const cancelIdleCallback = (window as any).cancelIdleCallback as
      | ((id: number) => void)
      | undefined;

    if (idleCallback) {
      const id = idleCallback(preloadRoutes);
      return () => cancelIdleCallback?.(id);
    }

    const timeoutId = window.setTimeout(preloadRoutes, 1200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/About" element={<About />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/Register" element={<Register />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/news/:id" element={<NewsDetail />} />
                  <Route path="/terms-conditions" element={<TermsConditions />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/kabaddi-rules" element={<KabaddiRules />} />
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
                  <Route path="/sp-auth-x7k9-admin-init-portal-2025" element={<AdminSignup />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/player-attendance" element={<AdminPlayerAttendance />} />
                  <Route path="/admin/date-attendance" element={<AdminDateAttendance />} />
                  <Route path="/admin/messages" element={<AdminPlayerMessages />} />
                  <Route path="/admin/mail" element={<AdminMailCenter />} />
                  <Route path="/admin/login-history" element={<AdminLoginHistory />} />
                  <Route path="/admin/fees" element={<AdminFeePayments />} />
                  <Route path="/admin/registration/:id" element={<AdminRegistrationDetail />} />
                  <Route path="/admin/players" element={<AdminPlayers />} />
                  <Route path="/admin/inquiries" element={<AdminInquiries />} />
                  <Route path="/admin/news" element={<AdminNews />} />
                  <Route path="/player/login" element={<PlayerLogin />} />
                  <Route path="/player/forgot-password" element={<PlayerForgotPassword />} />
                  <Route path="/player/dashboard" element={<PlayerDashboard />} />
                  <Route path="/player/attendance" element={<PlayerAttendance />} />
                  <Route path="/player/messages" element={<PlayerMessages />} />
                  <Route path="/player/change-password" element={<PlayerChangePassword />} />
                  <Route path="/player/fees" element={<PlayerFeeStatus />} />
                  <Route path="/id-card/:id" element={<IDCardGenerator />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;