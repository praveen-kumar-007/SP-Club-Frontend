import { useState, useEffect, useCallback } from "react";
import { X, ArrowLeft, ArrowRight, Camera } from "lucide-react";

// --- DUMMY DATA ---
// In a real-world app, you'd fetch this from a CMS or API.
// Images are from Pexels.com
const galleryItems = [
  { id: 1, title: "State Championship Victory", category: "championships", description: "The unforgettable moment our cricket team lifted the state championship trophy after a hard-fought final.", image: "https://images.pexels.com/photos/2444852/pexels-photo-2444852.jpeg", thumbnail: "https://images.pexels.com/photos/2444852/pexels-photo-2444852.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 2, title: "Morning Training Session", category: "training", description: "Early morning dedication. Our athletes pushing their limits during a high-intensity fitness session.", image: "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg", thumbnail: "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 3, title: "Community Sports Festival", category: "events", description: "Bringing the community together through the power of sports at our annual family-friendly festival.", image: "https://images.pexels.com/photos/1571739/pexels-photo-1571739.jpeg", thumbnail: "https://images.pexels.com/photos/1571739/pexels-photo-1571739.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 4, title: "Inter-Club Football Match", category: "matches", description: "Action from the thrilling inter-club football final, where teamwork and strategy were on full display.", image: "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg", thumbnail: "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 5, title: "Swimming Championship Heats", category: "championships", description: "Our swimmers showcasing their power and grace at the regional swimming championships hosted at our club.", image: "https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg", thumbnail: "https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 6, title: "Youth Basketball Clinic", category: "training", description: "Nurturing the next generation. Young athletes learning the fundamentals of basketball from our expert coaches.", image: "https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg", thumbnail: "https://images.pexels.com/photos/163452/basketball-dunk-blue-game-163452.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 7, title: "Annual Awards Gala", category: "events", description: "A night of celebration. Honoring the hard work and outstanding achievements of our athletes at the annual awards ceremony.", image: "https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg", thumbnail: "https://images.pexels.com/photos/3171837/pexels-photo-3171837.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 8, title: "Cricket Net Practice", category: "training", description: "Perfecting technique. A focused net practice session for our senior cricket team ahead of the new season.", image: "https://images.pexels.com/photos/1604730/pexels-photo-1604730.jpeg", thumbnail: "https://images.pexels.com/photos/1604730/pexels-photo-1604730.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 9, title: "Volleyball Tournament Finals", category: "matches", description: "The final, breathtaking point of the inter-club volleyball tournament.", image: "https://images.pexels.com/photos/6203520/pexels-photo-6203520.jpeg", thumbnail: "https://images.pexels.com/photos/6203520/pexels-photo-6203520.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 10, title: "Victory Parade", category: "championships", description: "Celebrating our national hockey title with the entire community during a memorable victory parade.", image: "https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg", thumbnail: "https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 11, title: "Athlete of the Year", category: "events", description: "Presenting the 'Athlete of the Year' award to our most outstanding performer.", image: "https://images.pexels.com/photos/716281/pexels-photo-716281.jpeg", thumbnail: "https://images.pexels.com/photos/716281/pexels-photo-716281.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: 12, title: "Dawn Runners Club", category: "training", description: "The dedicated members of our running club hitting the track as the sun rises.", image: "https://images.pexels.com/photos/11552553/pexels-photo-11552553.jpeg", thumbnail: "https://images.pexels.com/photos/11552553/pexels-photo-11552553.jpeg?auto=compress&cs=tinysrgb&w=600" },
];

const categories = [
  { id: "all", name: "All Photos" }, { id: "matches", name: "Matches" },
  { id: "training", name: "Training" }, { id: "events", name: "Events" },
  { id: "championships", name: "Championships" },
];

const ITEMS_PER_PAGE = 9;

// --- Lightbox Component ---
const Lightbox = ({ item, onClose, onNext, onPrev }: { item: any, onClose: () => void, onNext: () => void, onPrev: () => void }) => {
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
          <img src={item.image} alt={item.title} className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl" />
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
                <img src={item.thumbnail} alt={item.title} className="w-full h-auto block transition-transform duration-500 group-hover:scale-110" />
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