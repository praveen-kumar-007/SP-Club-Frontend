import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Club Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              {/* START: Changed Code */}
              {/* This div is the new white circular background */}
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <img
                  src="/Logo.png"
                  alt="SP Club Logo"
                  className="w-full h-full rounded-full object-cover" // Image fills the white circle
                />
              </div>
              {/* END: Changed Code */}
              <h3 className="text-xl font-bold">SP Club</h3>
            </div>
            <p className="text-secondary-foreground/80">
              Building champions, fostering community, and celebrating the spirit of sports in India.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/SpKGDH" className="hover:text-accent transition-colors">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/spkabaddigroup/" className="hover:text-accent transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://x.com/SPClub_Dhanbad" className="hover:text-accent transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://www.youtube.com/@SP_CLUB_Dhanbad" className="hover:text-accent transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/about" className="hover:text-accent transition-colors">About Us</a></li>
              <li><a href="/gallery" className="hover:text-accent transition-colors">Gallery</a></li>
              <li><a href="/register" className="hover:text-accent transition-colors">Membership</a></li>
              <li><a href="/contact" className="hover:text-accent transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+91 8271882034</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>spkabaddigroupdhanbad@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Dhanbad, Jharkhand, India</span>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold mb-4">Stay Updated</h4>
            <p className="text-sm text-secondary-foreground/80 mb-4">
              Get the latest news and updates from SP Club.
            </p>
            <div className="flex space-x-2">
              <Input
                placeholder="Your email"
                className="bg-secondary-foreground/10 border-secondary-foreground/20"
              />
              <Button variant="default" className="btn-champion">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-secondary-foreground/60">
            © 2017 SP Club. All rights reserved. Built with passion for sports.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;