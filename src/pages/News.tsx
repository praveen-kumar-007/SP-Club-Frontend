import { useEffect, useState } from "react";
import { Calendar, Globe2, ChevronLeft, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { API_ENDPOINTS } from "@/config/api";
import { useToast } from "@/hooks/use-toast";

interface NewsArticle {
  _id: string;
  title: string;
  content: string;
  lang: 'english' | 'hindi';
  images: string[];
  author: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const News = () => {
  const { toast } = useToast();
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(API_ENDPOINTS.NEWS);
      
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      
      const data = await response.json();
      setNewsArticles(data);
    } catch (err) {
      setError('Failed to load news articles. Please try again later.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = (article: NewsArticle, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}/news/${article._id}`;
    const text = article.title;
    
    // Check if Web Share API is available (mobile devices)
    if (navigator.share) {
      navigator.share({
        title: text,
        url: url,
      }).catch((error) => {
        // User cancelled or error occurred
        console.log('Error sharing:', error);
      });
    } else {
      // Fallback: copy link to clipboard
      navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: "Article link copied to clipboard",
      });
    }
  };

  return (
    <>
      <Seo
        title="News & Updates - SP Kabaddi Club"
        description="Stay updated with the latest news, announcements, and updates from SP Kabaddi Club."
        keywords="SP Kabaddi, news, updates, announcements, sports news"
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white py-16 md:py-24 overflow-hidden">
          {/* Geometric pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)`
            }}></div>
          </div>
          
          {/* Gradient orbs */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-red-600/30 to-orange-600/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-orange-600/30 to-red-600/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-red-600/20 via-orange-600/20 to-amber-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Animated lines */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-10 w-32 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent animate-pulse"></div>
            <div className="absolute top-40 right-20 w-48 h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute bottom-32 left-1/4 w-40 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <Link to="/">
              <Button variant="ghost" className="mb-4 md:mb-6 text-white hover:bg-white/10 backdrop-blur-sm border border-white/20 text-sm md:text-base transition-all duration-300 hover:scale-105">
                <ChevronLeft className="mr-1 md:mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 animate-fade-in">
                <span className="text-4xl md:text-6xl animate-bounce">📰</span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-orange-200 to-red-300">
                  News & Updates
                </h1>
              </div>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 font-light leading-relaxed max-w-3xl">
                Stay informed with the latest news, achievements, and announcements from SP Kabaddi Club
              </p>
            </div>
          </div>
        </div>

        {/* News Articles Section */}
        <div className="container mx-auto px-4 py-8 md:py-12 pb-20">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-gray-800 border-gray-700">
                  <Skeleton className="h-64 w-full rounded-t-lg" />
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="text-red-500 text-xl mb-4">⚠️ {error}</div>
              <Button onClick={fetchNews} className="bg-red-600 hover:bg-red-700">
                Try Again
              </Button>
            </div>
          ) : newsArticles.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 text-xl mb-4">
                📭 No news articles available at the moment.
              </div>
              <p className="text-gray-500">Check back later for updates!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {newsArticles.map((article, index) => (
                <Card 
                  key={article._id} 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-red-500 transition-all duration-500 hover:shadow-2xl hover:shadow-red-600/30 overflow-hidden group relative hover:-translate-y-1 md:hover:-translate-y-2"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
                  
                  {/* Image Carousel */}
                  <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                    <img
                      src={article.images[0]}
                      alt={article.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 md:group-hover:scale-125 group-hover:rotate-1 md:group-hover:rotate-2"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    
                    {article.images.length > 1 && (
                      <Badge className="absolute top-3 right-3 md:top-4 md:right-4 bg-black/80 backdrop-blur-sm text-white border-0 shadow-lg text-xs md:text-sm">
                        📷 +{article.images.length - 1}
                      </Badge>
                    )}

                  </div>

                  <CardContent className="p-4 md:p-6 relative z-20">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-400 group-hover:to-orange-400 transition-all duration-300 line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-sm md:text-base text-gray-400 mb-3 md:mb-4 line-clamp-2 md:line-clamp-3 leading-relaxed">
                      {article.content}
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs md:text-sm text-gray-500 mb-3 md:mb-4 pb-3 md:pb-4 border-b border-gray-700 gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 md:h-4 md:w-4 text-red-500 flex-shrink-0" />
                        <span className="truncate">{formatDate(article.createdAt)}</span>
                      </div>
                      <span className="text-gray-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
                        <span className="truncate">{article.author}</span>
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/news/${article._id}`} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg hover:shadow-red-500/50 transition-all duration-300 group-hover:scale-105 text-sm md:text-base py-2 md:py-3">
                          <span className="mr-2">Read Full Article</span>
                          <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-white flex-shrink-0"
                        onClick={(e) => handleShare(article, e)}
                        title="Share article"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default News;
