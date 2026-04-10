import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import API_BASE_URL from "@/config/api";
import { GOOGLE_MAPS_EMBED_URL, GOOGLE_MAPS_LINK, SP_KABADDI_LOCATION } from "@/config/maps";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Secret footer logo clicks -> open admin login after 7 clicks
  const navigate = useNavigate();
  const clickRef = useRef(0);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

  const handleLogoClick = () => {
    clickRef.current += 1;
    const c = clickRef.current;

    // show short feedback
    toast({ title: `${c}/7 — admin unlock` });

    // reset counter after 2s of inactivity
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(() => {
      clickRef.current = 0;
    }, 2000);

    if (c >= 7) {
      clickRef.current = 0;
      toast({ title: "Opening admin login", description: "Redirecting..." });
      navigate('/admin/login');
    }
  };

  const handleNewsletterSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Submitting to:', `${API_BASE_URL}/api/newsletter/subscribe`);
      const response = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Response:', response.status, data);

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Failed to subscribe",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Successfully subscribed to newsletter!",
      });
      setEmail("");
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="container mx-auto px-4 py-12 sm:px-6">
        {/* Newsletter Section */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 rounded-3xl border border-amber-500/20 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:p-12">
          <div>
            <h3 className="mb-3 text-3xl font-extrabold tracking-tight text-amber-300 sm:text-4xl">Stay Ahead of the Game</h3>
            <p className="max-w-xl text-slate-300">Subscribe to our newsletter for the latest updates, news, and offers from SP Kabaddi Group Dhanbad.</p>
          </div>
          <div className="flex w-full max-w-lg flex-col gap-3 rounded-2xl bg-slate-950/90 p-4 shadow-inner shadow-slate-900/40 sm:flex-row sm:items-center">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="bg-slate-800 border-slate-700 text-white placeholder-slate-400 flex-grow"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
              variant="default"
              className="w-full bg-amber-500 font-bold text-slate-900 hover:bg-amber-600 sm:w-auto"
              onClick={handleNewsletterSubmit}
              disabled={isLoading}
            >
              <Send size={20} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-12">
          {/* Club Info */}
          <div className="xl:col-span-4 rounded-3xl border border-amber-400/10 bg-slate-900/80 p-8 shadow-2xl shadow-amber-500/5">
            <div className="flex flex-col items-center gap-5 text-center sm:items-start sm:text-left">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                <img
                  src="/Logo.png"
                  alt="SP Kabaddi Group Dhanbad Logo"
                  className="h-20 w-20 rounded-full border-2 border-amber-300/30 object-cover shadow-lg transition-transform duration-300 hover:scale-105 sm:h-24 sm:w-24"
                  draggable={false}
                />
                <div className="min-w-0">
                  <h3 className="text-3xl font-extrabold tracking-tight text-amber-300 sm:text-4xl">SP Kabaddi Group Dhanbad</h3>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Team spirit. Pride. Passion.</p>
                </div>
              </div>

              <p className="text-slate-300 leading-7">
                Building champions, fostering community, and celebrating the spirit of sports in India.
              </p>

              <div className="flex flex-wrap items-center gap-3 text-slate-300">
                <a href="https://www.facebook.com/SpKGDH" className="rounded-full border border-slate-700/70 p-2 text-slate-300 transition-all duration-300 hover:border-amber-400 hover:text-amber-300 hover:shadow-[0_0_10px_rgba(251,191,36,0.25)]">
                  <Facebook size={20} />
                </a>
                <a href="https://www.instagram.com/spkabaddigroup/" className="rounded-full border border-slate-700/70 p-2 text-slate-300 transition-all duration-300 hover:border-amber-400 hover:text-amber-300 hover:shadow-[0_0_10px_rgba(251,191,36,0.25)]">
                  <Instagram size={20} />
                </a>
                <a href="https://x.com/SPClub_Dhanbad" className="rounded-full border border-slate-700/70 p-2 text-slate-300 transition-all duration-300 hover:border-amber-400 hover:text-amber-300 hover:shadow-[0_0_10px_rgba(251,191,36,0.25)]">
                  <Twitter size={20} />
                </a>
                <a href="https://www.youtube.com/@SP_CLUB_Dhanbad" className="rounded-full border border-slate-700/70 p-2 text-slate-300 transition-all duration-300 hover:border-amber-400 hover:text-amber-300 hover:shadow-[0_0_10px_rgba(251,191,36,0.25)]">
                  <Youtube size={20} />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="xl:col-span-2">
            <h4 className="font-semibold text-xl mb-4 text-amber-400">Quick Links</h4>
            <ul className="space-y-3 text-slate-200">
              <li><a href="/" className="hover:text-amber-300 transition-colors duration-300">Home</a></li>
              <li><a href="/about" className="hover:text-amber-300 transition-colors duration-300">About Us</a></li>
              <li><a href="/gallery" className="hover:text-amber-300 transition-colors duration-300">Gallery</a></li>
              <li><a href="/news" className="hover:text-amber-300 transition-colors duration-300">News & Updates</a></li>
              <li><a href="/register" className="hover:text-amber-300 transition-colors duration-300">Membership</a></li>
              <li><a href="/contact" className="hover:text-amber-300 transition-colors duration-300">Contact Us</a></li>
              <li><a href="/terms-conditions" className="hover:text-amber-300 transition-colors duration-300">Terms & Conditions</a></li>
              <li><a href="/privacy-policy" className="hover:text-amber-300 transition-colors duration-300">Privacy Policy</a></li>
              <li><a href="/kabaddi-rules" className="hover:text-amber-300 transition-colors duration-300">Kabaddi Rules</a></li>
            </ul>
            <div className="mt-6">
              <a href="/admin/login" className="inline-flex items-center justify-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 transition-all duration-300 hover:bg-amber-400">
                Admin Login
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="xl:col-span-2">
            <h4 className="font-semibold text-xl mb-4 text-amber-400">Contact</h4>
            <ul className="space-y-4 text-slate-300">
              <li className="flex items-start gap-3">
                <Phone size={18} className="mt-1 text-amber-400" />
                <span className="break-words">+91 9504904499, +91 8271882034</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="mt-1 text-amber-400" />
                <span className="break-words">spkabaddigroupdhanbad@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-1 text-amber-400" />
                <span>Dhanbad, Jharkhand, India</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="xl:col-span-2">
            <h4 className="font-semibold text-xl mb-4 text-amber-400">Legal</h4>
            <ul className="space-y-3 text-slate-200">
              <li><a href="/terms-conditions" className="hover:text-amber-300 transition-colors duration-300">Terms & Conditions</a></li>
              <li><a href="/privacy-policy" className="hover:text-amber-300 transition-colors duration-300">Privacy Policy</a></li>
              <li><a href="/kabaddi-rules" className="hover:text-amber-300 transition-colors duration-300">Kabaddi Rules</a></li>
            </ul>
          </div>

          {/* Map Card */}
          <div className="md:col-span-2 xl:col-span-2">
            <h4 className="font-semibold text-xl mb-4 text-amber-400">Find Us</h4>
            <div className="rounded-lg border border-slate-700 bg-slate-800 overflow-hidden">
              <div className="aspect-video">
                <iframe
                  title="SP Kabaddi Group Dhanbad Location"
                  src={GOOGLE_MAPS_EMBED_URL}
                  className="w-full h-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <div className="p-4 space-y-3">
                <p className="text-sm text-slate-300">{SP_KABADDI_LOCATION.address}</p>
                <a
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Open full map
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700/50 mt-10 pt-8 text-center">
          <p className="text-slate-400">
            © {new Date().getFullYear()} SP Kabaddi Group Dhanbad. All rights reserved. Built with passion for sports.
          </p>
          <p className="mt-2 text-sm text-slate-500">Experience stronger branding with bold visuals and polished footer layout.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;