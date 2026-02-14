import { useState, useEffect, useCallback } from "react";
import { X, ArrowLeft, ArrowRight, Camera } from "lucide-react";
import Seo from "@/components/Seo";
import OptimizedImage from "@/components/OptimizedImage";

// --- DUMMY DATA ---
// In a real-world app, you'd fetch this from a CMS or API.
// Images are from Pexels.com



const galleryItems = [
  // Championships (grouped)
  {
    id: 1,
    title: "State Championship Victory",
    category: "championships",
    description: "Celebrating success! Our girls' Kabaddi team after winning the State Championship.",
    image: "/home_assets/girls_state2nd.jpg",
    thumbnail: "/home_assets/girls_state2nd.jpg"
  },
  {
    id: 2,
    title: "Champion Boys Team",
    category: "championships",
    description: "Proud champions! Our boys' Kabaddi team celebrating their Tournaments.",
    image: "/home_assets/win_bihar_state.jpg",
    thumbnail: "/home_assets/win_bihar_state.jpg"
  },
  {
    id: 3,
    title: "Winning 1st SP Kabaddi Group Dhanbad Kabaddi Team ",
    category: "championships",
    description: "Victory pose! Our Kabaddi team after clinching the championship title.",
    image: "/home_assets/win_holi.jpg",
    thumbnail: "/home_assets/win_holi.jpg"
  },

  // Training
  {
    id: 4,
    title: "Training Session",
    category: "training",
    description: "Lion Jump Drills in action. Our athletes pushing their limits during an intense training session.",
    image: "/home_assets/jump_lion.jpg",
    thumbnail: "/home_assets/jump_lion.jpg"
  },
  {
    id: 5,
    title: "Hard Practice of Kabaddi by Junior Team",
    category: "training",
    description: "Focused and determined. Our junior Kabaddi team honing their skills during a rigorous practice session.",
    image: "/home_assets/practice_session.jpg",
    thumbnail: "/home_assets/practice_session.jpg"
  },
  {
    id: 6,
    title: "Senior Kabaddi Boys Team",
    category: "training",
    description: "Our senior Kabaddi team heading to the Jharkhand Senior State Championship.",
    image: "/home_assets/boys_senior.jpg",
    thumbnail: "/home_assets/boys_senior.jpg"
  },
  {
    id: 7,
    title: "Senior Kabaddi Girls Team",
    category: "training",
    description: "Our senior Kabaddi girls team heading to the Jharkhand Senior State Championship.",
    image: "/home_assets/girls_senior.jpg",
    thumbnail: "/home_assets/girls_senior.jpg"
  },

  // Matches
  {
    id: 8,
    title: "Dhanbad Districs Kabaddi Trial Final",
    category: "matches",
    description: "Intense moments from the Dhanbad Districts Kabaddi Trial Final, showcasing skill and determination on the field.",
    image: "/home_assets/trial.jpg",
    thumbnail: "/home_assets/trial.jpg"
  },
  {
    id: 9,
    title: "Kabaddi is Going to be played",
    category: "matches",
    description: "Exciting moment as the Kabaddi match is about to begin, with players ready to showcase their skills and agility.",
    image: "/home_assets/team_stand_g.jpg",
    thumbnail: "/home_assets/team_stand_g.jpg"
  },

  // Events
  {
    id: 10,
    title: "Diwali Sports Festival",
    category: "events",
    description: "Celebrating Diwali with sports and camaraderie. Our club members enjoying various games and activities during the festival.",
    image: "/home_assets/diwali.jpg",
    thumbnail: "/home_assets/diwali.jpg"
  },
  {
    id: 11,
    title: "Holi Sports Event",
    category: "events",
    description: "Colorful moments from our Holi Sports Event, where fun and fitness come together in a vibrant celebration.",
    image: "/home_assets/win_holi.jpg",
    thumbnail: "/home_assets/win_holi.jpg"
  },
  {
    id: 12,
    title: "Worship of Kabaddi Court",
    category: "events",
    description: "Blessings for the game! Our club members performing a traditional worship ceremony for the Kabaddi court before the season begins.",
    image: "/home_assets/worship_court.jpg",
    thumbnail: "/home_assets/worship_court.jpg"
  }
];

const categories = [
  { id: "all", name: "All Photos" }, { id: "matches", name: "Matches" },
  { id: "training", name: "Training" }, { id: "events", name: "Events" },
  { id: "championships", name: "Championships" },
];

const ITEMS_PER_PAGE = 9;

// --- Lightbox Component ---
const Lightbox = ({ item, onClose, onNext, onPrev }: { item: {id: number; image: string; title: string; description: string}; onClose: () => void; onNext: () => void; onPrev: () => void }) => {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center animate-fade-in" onClick={onClose}>
      <div className="relative w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-amber-400 z-50 transition-colors">
          <X size={32} />
        </button>
        {/* Previous Button */}
        <button onClick={onPrev} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full hover:bg-amber-500/50 z-50 transition-colors">
          <ArrowLeft size={28} />
        </button>
        {/* Next Button */}
        <button onClick={onNext} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/30 p-2 rounded-full hover:bg-amber-500/50 z-50 transition-colors">
          <ArrowRight size={28} />
        </button>

        {/* Image and Content */}
        <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center animate-scale-in">
          <OptimizedImage src={item.image} alt={item.title} className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" />
          <div className="text-center text-white mt-4 p-4 bg-black/50 rounded-b-lg">
            <h3 className="text-2xl font-bold">{item.title}</h3>
            <p className="text-slate-300 mt-1 max-w-2xl">{item.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- Main Gallery Page Component ---
const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredItems = activeCategory === "all"
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory);

  const itemsToShow = filteredItems.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + ITEMS_PER_PAGE);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const handleNext = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  }, [lightboxIndex, filteredItems.length]);

  const handlePrev = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  }, [lightboxIndex, filteredItems.length]);

  // Reset visible count when category changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeCategory]);


  return (
    <div className="bg-slate-900 min-h-screen text-white">
      <Seo
        title="Gallery"
        description="Gallery — Photos from SP Kabaddi Group Dhanbad showcasing training, matches, championships, and events."
        url="https://spkabaddi.me/gallery"
        keywords="SP Kabaddi Group Dhanbad gallery, spkg gallery"
      />
      {/* Hero Section */}
      <section className="relative py-32 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('https://images.pexels.com/photos/220201/pexels-photo-220201.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight">
            Our <span className="text-amber-400">Gallery</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Moments of triumph, dedication, and community spirit captured forever.
          </p>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-16">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-sm md:text-base font-semibold rounded-full transition-colors duration-300
                  ${activeCategory === cat.id ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Gallery Masonry Grid */}
          <div className="masonry-grid">
            {itemsToShow.map((item, index) => (
              <div
                key={item.id}
                className="masonry-item group relative overflow-hidden rounded-lg cursor-pointer shadow-lg"
                onClick={() => openLightbox(index)}
                style={{ animationDelay: `${(index % ITEMS_PER_PAGE) * 100}ms` }}
              >
                <OptimizedImage src={item.thumbnail} alt={item.title} className="w-full h-auto block transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-amber-300">{categories.find(c => c.id === item.category)?.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredItems.length && (
            <div className="text-center mt-16">
              <button onClick={handleLoadMore} className="bg-amber-500 text-slate-900 font-bold px-8 py-3 rounded-full hover:bg-amber-400 transition-all duration-300 hover:scale-105">
                Load More Photos
              </button>
            </div>
          )}
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox
          item={filteredItems[lightboxIndex]}
          onClose={closeLightbox}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      )}

      {/* CSS for Masonry Grid and Animations */}
      <style>{`
        @keyframes fadeInScaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .masonry-grid {
          column-count: 1;
          column-gap: 1.5rem;
        }
        @media (min-width: 768px) { .masonry-grid { column-count: 2; } }
        @media (min-width: 1024px) { .masonry-grid { column-count: 3; } }
        .masonry-item {
          display: inline-block;
          width: 100%;
          margin-bottom: 1.5rem;
          animation: fadeInScaleUp 0.6s both;
        }
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes scale-in { 0% { transform: scale(0.9); } 100% { transform: scale(1); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Gallery;