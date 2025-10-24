import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Newsletter Section */}
        <div className="bg-slate-800 rounded-lg p-8 md:p-12 mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h3 className="text-3xl font-bold mb-2">Stay Ahead of the Game</h3>
            <p className="text-slate-400">Subscribe to our newsletter for the latest updates, news, and offers from SP Club.</p>
          </div>
          <div className="flex w-full max-w-md space-x-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 flex-grow"
            />
            <Button variant="default" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold">
              <Send size={20} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Club Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1">
                <img
                  src="/Logo.png"
                  alt="SP Club Logo"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-amber-400">SP Club</h3>
            </div>
            <p className="text-slate-400">
              Building champions, fostering community, and celebrating the spirit of sports in India.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://www.facebook.com/SpKGDH" className="text-slate-400 hover:text-amber-400 transition-colors duration-300 transform hover:scale-110">
                <Facebook size={24} />
              </a>
              <a href="https://www.instagram.com/spkabaddigroup/" className="text-slate-400 hover:text-amber-400 transition-colors duration-300 transform hover:scale-110">
                <Instagram size={24} />
              </a>
              <a href="https://x.com/SPClub_Dhanbad" className="text-slate-400 hover:text-amber-400 transition-colors duration-300 transform hover:scale-110">
                <Twitter size={24} />
              </a>
              <a href="https://www.youtube.com/@SP_CLUB_Dhanbad" className="text-slate-400 hover:text-amber-400 transition-colors duration-300 transform hover:scale-110">
                <Youtube size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-xl mb-4 text-amber-400">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="/about" className="hover:text-amber-400 transition-colors duration-300">About Us</a></li>
              <li><a href="/gallery" className="hover:text-amber-400 transition-colors duration-300">Gallery</a></li>
              <li><a href="/register" className="hover:text-amber-400 transition-colors duration-300">Membership</a></li>
              <li><a href="/contact" className="hover:text-amber-400 transition-colors duration-300">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-xl mb-4 text-amber-400">Contact</h4>
            <ul className="space-y-4 text-slate-300">
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-amber-400" />
                <span>+91 8271882034</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-amber-400" />
                <span>spkabaddigroupdhanbad@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin size={18} className="text-amber-400" />
                <span>Dhanbad, Jharkhand, India</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-xl mb-4 text-amber-400">Legal</h4>
            <ul className="space-y-3">
              <li><a href="/privacy-policy" className="hover:text-amber-400 transition-colors duration-300">Privacy Policy</a></li>
              <li><a href="/terms-of-service" className="hover:text-amber-400 transition-colors duration-300">Terms of Service</a></li>
              <li><a href="/sitemap" className="hover:text-amber-400 transition-colors duration-300">Sitemap</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-10 pt-8 text-center">
          <p className="text-slate-500">
            © {new Date().getFullYear()} SP Club. All rights reserved. Built with passion for sports.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;