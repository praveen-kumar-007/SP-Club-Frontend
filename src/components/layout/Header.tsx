import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  // State for managing the mobile menu's open/close status
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // State to track if the user has scrolled down the page
  const [hasScrolled, setHasScrolled] = useState(false);
  // State to store the position and size of the active link indicator
  const [activeLinkRect, setActiveLinkRect] = useState<{ left: number; width: number } | null>(null);

  const location = useLocation();
  const navContainerRef = useRef<HTMLDivElement | null>(null);
  // *** FIX: Changed ref type from HTMLAnchorElement to HTMLSpanElement ***
  const linkRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Gallery", path: "/gallery" },
    { name: "Register", path: "/register" },
    { name: "Contact", path: "/contact" },
  ];

  // Effect to handle scroll detection for header background change
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect to close the mobile menu whenever the route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Effect to calculate and set the position of the sliding pill indicator
  useEffect(() => {
    const activeLinkIndex = navLinks.findIndex(link => link.path === location.pathname);
    const activeLinkEl = linkRefs.current[activeLinkIndex];
    const navContainerEl = navContainerRef.current;

    if (activeLinkEl && navContainerEl) {
      const navRect = navContainerEl.getBoundingClientRect();
      const linkRect = activeLinkEl.getBoundingClientRect();
      setActiveLinkRect({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
      });
    } else {
      setActiveLinkRect(null);
    }
  }, [location.pathname]);

  // Handler for mouse enter on a navigation link
  const handleLinkHover = (index: number) => {
    const hoveredLinkEl = linkRefs.current[index];
    const navContainerEl = navContainerRef.current;
    if (hoveredLinkEl && navContainerEl) {
      const navRect = navContainerEl.getBoundingClientRect();
      const linkRect = hoveredLinkEl.getBoundingClientRect();
      setActiveLinkRect({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
      });
    }
  };

  // Handler for mouse leave from the navigation area
  const handleNavMouseLeave = () => {
    const activeLinkIndex = navLinks.findIndex(link => link.path === location.pathname);
    const activeLinkEl = linkRefs.current[activeLinkIndex];
    const navContainerEl = navContainerRef.current;
    if (activeLinkEl && navContainerEl) {
      const navRect = navContainerEl.getBoundingClientRect();
      const linkRect = activeLinkEl.getBoundingClientRect();
      setActiveLinkRect({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
      });
    } else {
      setActiveLinkRect(null);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ease-in-out 
          bg-gradient-to-b from-black/60 to-transparent ${hasScrolled ? "bg-slate-900/80 backdrop-blur-xl shadow-2xl" : ""
          }`}
      >
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="group flex items-center space-x-3">
              <div className="relative">
                <img
                  src="/Logo.png"
                  alt="SP Club Logo"
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-500 transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 rounded-full transition-all duration-500 opacity-0 group-hover:opacity-100 
                  bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400/50 to-amber-400/0 scale-150">
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-amber-400 transition-colors duration-300 group-hover:text-amber-300">SP Club</h1>
                <p className="text-xs text-slate-400">Sports Excellence</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <div
                ref={navContainerRef}
                onMouseLeave={handleNavMouseLeave}
                className="relative flex items-center space-x-6 px-4"
              >
                {navLinks.map((link, index) => (
                  // *** FIX: Wrapped the link text in a span and moved the ref to the span ***
                  <Link
                    key={link.path}
                    to={link.path}
                    className="z-10 text-white"
                    onMouseEnter={() => handleLinkHover(index)}
                  >
                    <span
                      ref={(el) => {
                        // *** FIX: Corrected typo 'cunpont' to 'current' ***
                        if (linkRefs.current) {
                          linkRefs.current[index] = el;
                        }
                      }}
                      className="block py-2 px-1 font-medium transition-colors duration-300"
                    >
                      {link.name}
                    </span>
                  </Link>
                ))}
                {activeLinkRect && (
                  <div
                    className="absolute z-0 h-10 top-1/2 -translate-y-1/2 rounded-md bg-amber-500/20 transition-all duration-300 ease-in-out"
                    style={{
                      left: `${activeLinkRect.left}px`,
                      width: `${activeLinkRect.width}px`,
                    }}
                  />
                )}
              </div>
              <Button className="font-bold text-slate-900 bg-amber-500 transition-all duration-300
               hover:bg-amber-400 hover:scale-105 hover:shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                Join Now
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              aria-label="Toggle Menu"
              className="md:hidden p-2 text-white z-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-2xl transform transition-opacity duration-500 ease-in-out md:hidden ${isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
      >
        <div className="flex flex-col items-center justify-center h-full space-y-10">
          {navLinks.map((link, index) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-4xl font-bold transition-all duration-300 ${location.pathname === link.path ? "text-amber-400" : "text-white"
                }`}
              style={{
                opacity: isMenuOpen ? 1 : 0,
                transform: isMenuOpen ? 'translateY(0)' : 'translateY(25px)',
                transitionDelay: `${index * 120 + 200}ms`,
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div
            style={{
              opacity: isMenuOpen ? 1 : 0,
              transform: isMenuOpen ? 'translateY(0)' : 'translateY(25px)',
              transitionDelay: `${navLinks.length * 120 + 200}ms`,
            }}
          >
            <Button
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xl px-10 py-5 mt-10"
              onClick={() => setIsMenuOpen(false)}
            >
              Join Now
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;