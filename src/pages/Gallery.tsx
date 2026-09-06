import { useState, useEffect, useCallback, useRef } from "react";
import { X, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Seo from "@/components/Seo";
import OptimizedImage from "@/components/OptimizedImage";
import { API_ENDPOINTS } from "@/config/api";

interface GalleryImage {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  createdAt: string;
}

const CATEGORIES = [
  { id: "All", name: "All" },
  { id: "Tournaments", name: "Tournaments" },
  { id: "Rewards", name: "Rewards" },
  { id: "News", name: "News" },
  { id: "Training", name: "Training" },
  { id: "Events", name: "Events" },
  { id: "Matches", name: "Matches" },
  { id: "Others", name: "Others" },
];

const AutoScrollCategories = ({ activeCategory, setActiveCategory }: { activeCategory: string, setActiveCategory: (c: string) => void }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const direction = useRef<1 | -1>(1); // 1 = right, -1 = left
  
  // Create 12 copies to ensure plenty of scroll space for the dial
  const multiCategories = Array(12).fill(CATEGORIES).flat();

  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    const speed = 1.0; // pixels per frame

    if (scrollRef.current) {
      // Start near the middle
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth / 2;
    }

    const scroll = (time: number) => {
      const container = scrollRef.current;
      if (container) {
        const maxScroll = container.scrollWidth;
        const segment = maxScroll / 12;
        
        // Re-center silently if we drift too close to the edges
        if (container.scrollLeft >= segment * 9) {
          container.scrollLeft -= segment * 4;
        } else if (container.scrollLeft <= segment * 3) {
          container.scrollLeft += segment * 4;
        }

        if (!isInteracting) {
          const dt = time - lastTime;
          const move = (speed * dt) / 16;
          container.scrollLeft += move * direction.current;
        }
      }
      lastTime = time;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isInteracting]);

  let lastScrollX = useRef(0);
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollX = e.currentTarget.scrollLeft;
    if (isInteracting) {
       const delta = currentScrollX - lastScrollX.current;
       if (Math.abs(delta) > 2) {
          direction.current = delta > 0 ? 1 : -1;
       }
    }
    lastScrollX.current = currentScrollX;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaX !== 0 || e.deltaY !== 0) {
       direction.current = (e.deltaX > 0 || e.deltaY > 0) ? 1 : -1;
    }
  };

  return (
    <section className="relative z-20 -mt-12 px-4 md:px-8 max-w-[1400px] mx-auto overflow-hidden group">
      {/* Edge Gradients for Dial Effect */}
      <div className="absolute left-4 md:left-8 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none rounded-l-2xl"></div>
      <div className="absolute right-4 md:right-8 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none rounded-r-2xl"></div>

      <div 
        ref={scrollRef}
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
        onTouchStart={() => setIsInteracting(true)}
        onTouchEnd={() => setIsInteracting(false)}
        onScroll={handleScroll}
        onWheel={handleWheel}
        className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 p-2 md:p-3 rounded-2xl shadow-2xl flex overflow-x-auto hide-scrollbar gap-2 lg:gap-3 items-center cursor-grab active:cursor-grabbing"
        style={{ scrollBehavior: 'auto', WebkitOverflowScrolling: 'touch' }}
      >
        {multiCategories.map((cat, index) => (
          <button
            key={`${cat.id}-${index}`}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-6 py-3 text-sm md:text-base font-bold rounded-xl transition-all duration-300 transform flex-shrink-0
              ${activeCategory === cat.id 
                ? 'bg-gradient-to-r from-amber-500 to-orange-400 text-slate-900 shadow-lg shadow-amber-500/30 scale-105' 
                : 'bg-transparent text-slate-300 hover:bg-slate-700 hover:text-white'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </section>
  );
};

const ITEMS_PER_PAGE = 12;

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [galleryItems, setGalleryItems] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.GALLERY);
        if (response.ok) {
          const data = await response.json();
          setGalleryItems(data);
        }
      } catch (error) {
        console.error("Failed to load gallery items", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const filteredItems = activeCategory === "All"
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory);

  const itemsToShow = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const loadMore = () => setVisibleCount(prev => prev + ITEMS_PER_PAGE);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const showNext = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  }, [lightboxIndex, filteredItems.length]);

  const showPrev = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  }, [lightboxIndex, filteredItems.length]);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [activeCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, showNext, showPrev]);

  return (
    <div className="bg-slate-900 min-h-screen text-white pb-20">
      <Seo
        title="Gallery"
        description="Gallery — Photos from SP Sports Academy showcasing training, matches, championships, and events."
        url="https://spkabaddi.me/gallery"
        image={galleryItems[0]?.imageUrl}
        keywords="SP Sports Academy gallery, sp sports academy gallery, sports gallery"
      />
      
      {/* Hero Section */}
      <section className="relative py-32 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/home_assets/hero-bg.jpg')" }}>
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight">
            Our <span className="text-amber-400">Gallery</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Moments of triumph, dedication, and community spirit captured forever.
          </p>
        </div>
      </section>

      {/* Category Filter - Premium auto-scroll dial */}
      <AutoScrollCategories activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

      {/* Gallery Content */}
      <section className="pt-16 pb-20 px-4 md:px-8 max-w-[1400px] mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
              <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-32 text-slate-400 bg-slate-800/30 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
            <div className="w-24 h-24 mx-auto mb-6 opacity-50 bg-slate-700 rounded-full flex items-center justify-center">
               <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
            </div>
            <p className="text-2xl font-light text-slate-300">No images found in this category.</p>
          </div>
        ) : (
          <>
            {/* Grid Layout - 1 col on mobile, 2 on sm/md, 3 on lg, 4 on xl */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {itemsToShow.map((item, index) => (
                <div
                  key={item._id}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-xl bg-slate-800 border border-slate-700/60 transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20 aspect-[4/5]"
                  onClick={() => openLightbox(index)}
                >
                  <OptimizedImage 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                  
                  <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="inline-block px-3 py-1 bg-amber-500/90 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-lg w-max mb-3 backdrop-blur-md shadow-sm">
                      {item.category}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight drop-shadow-md">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-slate-300 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 font-light">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-16">
                <button
                  onClick={loadMore}
                  className="group relative px-8 py-3.5 bg-slate-800 text-white font-bold tracking-wide rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-700/50"
                >
                  <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                  <span className="relative flex items-center gap-2">
                    Load More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Lightbox - Premium Modal */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 flex items-center justify-center p-4 backdrop-blur-xl transition-opacity duration-300">
          <button 
            onClick={closeLightbox} 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-all z-[110] bg-white/5 hover:bg-white/20 p-3 rounded-full hover:scale-110 hover:rotate-90"
          >
            <X size={24} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); showPrev(); }} 
            className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all bg-white/5 hover:bg-white/20 p-3 md:p-4 rounded-full z-[110] hover:scale-110 hover:-translate-x-1"
          >
            <ArrowLeft className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); showNext(); }} 
            className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all bg-white/5 hover:bg-white/20 p-3 md:p-4 rounded-full z-[110] hover:scale-110 hover:translate-x-1"
          >
            <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
          </button>
          
          <div className="max-w-6xl w-full max-h-[90vh] relative flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full flex justify-center items-center overflow-hidden rounded-2xl shadow-2xl border border-slate-800/50 bg-slate-900/50">
              <img
                src={filteredItems[lightboxIndex].imageUrl}
                alt={filteredItems[lightboxIndex].title}
                className="max-w-full max-h-[70vh] object-contain rounded-2xl drop-shadow-2xl"
              />
            </div>
            
            <div className="w-full text-center mt-6 md:mt-8 px-4">
              <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-400 text-slate-900 text-xs font-black uppercase tracking-widest rounded-full mb-4 shadow-lg shadow-amber-500/20">
                {filteredItems[lightboxIndex].category}
              </span>
              <h3 className="text-2xl md:text-4xl font-extrabold text-white mb-3 drop-shadow-md">{filteredItems[lightboxIndex].title}</h3>
              {filteredItems[lightboxIndex].description && (
                <p className="text-slate-300 max-w-3xl mx-auto text-sm md:text-base lg:text-lg font-light leading-relaxed">
                  {filteredItems[lightboxIndex].description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;