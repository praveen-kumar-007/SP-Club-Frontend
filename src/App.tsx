import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ScrollToTop from "./components/ScrollToTop";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import NotFound from "./pages/NotFound";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Register = lazy(() => import("./pages/Register"));
const Contact = lazy(() => import("./pages/Contact"));
const News = lazy(() => import("./pages/News"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const KabaddiRules = lazy(() => import("./pages/KabaddiRules"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminForgotPassword = lazy(() => import("./pages/AdminForgotPassword"));
const AdminSignup = lazy(() => import("./pages/AdminSignup"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminRegistrationDetail = lazy(() => import("./pages/AdminRegistrationDetail"));
const AdminInquiries = lazy(() => import("./pages/AdminInquiries"));
const AdminNews = lazy(() => import("./pages/AdminNews"));
const AdminPlayerAttendance = lazy(() => import("./pages/AdminPlayerAttendance"));
const AdminPlayerMessages = lazy(() => import("./pages/AdminPlayerMessages"));
const AdminMailCenter = lazy(() => import("./pages/AdminMailCenter"));
const PlayerLogin = lazy(() => import("./pages/PlayerLogin"));
const PlayerDashboard = lazy(() => import("./pages/PlayerDashboard"));
const PlayerAttendance = lazy(() => import("./pages/PlayerAttendance"));
const PlayerMessages = lazy(() => import("./pages/PlayerMessages"));
const PlayerForgotPassword = lazy(() => import("./pages/PlayerForgotPassword"));
const PlayerChangePassword = lazy(() => import("./pages/PlayerChangePassword"));
const IDCardGenerator = lazy(() => import("./pages/IDCard/IDCardGenerator"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
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
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/register" element={<Register />} />
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
                <Route path="/admin/messages" element={<AdminPlayerMessages />} />
                <Route path="/admin/mail" element={<AdminMailCenter />} />
                <Route path="/admin/registration/:id" element={<AdminRegistrationDetail />} />
                <Route path="/admin/inquiries" element={<AdminInquiries />} />
                <Route path="/admin/news" element={<AdminNews />} />
                <Route path="/player/login" element={<PlayerLogin />} />
                <Route path="/player/forgot-password" element={<PlayerForgotPassword />} />
                <Route path="/player/dashboard" element={<PlayerDashboard />} />
                <Route path="/player/attendance" element={<PlayerAttendance />} />
                <Route path="/player/messages" element={<PlayerMessages />} />
                <Route path="/player/change-password" element={<PlayerChangePassword />} />
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

export default App;