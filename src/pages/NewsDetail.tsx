import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Calendar, Globe2, ChevronLeft, ChevronRight } from "lucide-react";
import Seo from "@/components/Seo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { API_ENDPOINTS } from "@/config/api";

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

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_ENDPOINTS.NEWS}/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('News article not found');
        }
        throw new Error('Failed to fetch news article');
      }
      
      const data = await response.json();
      setArticle(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load news article');
      console.error('Error fetching news article:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const nextImage = () => {
    if (article && article.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % article.images.length);
    }
  };

  const prevImage = () => {
    if (article && article.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + article.images.length) % article.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-48 mb-8" />
          <Skeleton className="h-96 w-full mb-8 rounded-lg" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <>
        <Seo
          title="Article Not Found - SP Kabaddi Club"
          description="The requested news article could not be found."
        />
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="container mx-auto px-4 py-20">
            <Card className="bg-gray-800 border-gray-700 max-w-2xl mx-auto">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">📰</div>
                <h1 className="text-3xl font-bold text-white mb-4">Article Not Found</h1>
                <p className="text-gray-400 mb-8">{error || 'The news article you are looking for does not exist.'}</p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => navigate('/news')} className="bg-red-600 hover:bg-red-700">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to News
                  </Button>
                  <Button onClick={() => navigate('/')} variant="outline">
                    Go to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${article.title} - SP Kabaddi Club`}
        description={article.content.substring(0, 160)}
        keywords={`SP Kabaddi, news, ${article.lang === 'hindi' ? 'hindi news' : 'english news'}`}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white py-12 md:py-16 overflow-hidden">
          {/* Geometric pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)`
            }}></div>
          </div>
          
          {/* Gradient orbs */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-red-600/30 to-orange-600/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tl from-orange-600/30 to-red-600/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Animated lines */}
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-24 h-0.5 bg-gradient-to-r from-transparent via-red-500/50 to-transparent animate-pulse"></div>
            <div className="absolute top-20 right-16 w-32 h-0.5 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <Link to="/news">
              <Button variant="ghost" className="mb-4 text-white hover:bg-white/10 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105 text-sm md:text-base">
                <ChevronLeft className="mr-1 md:mr-2 h-4 w-4" />
                Back to News
              </Button>
            </Link>
          </div>
        </div>

        {/* Article Content */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Article Header */}
            <div className="mb-6 md:mb-8 animate-fade-in">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 md:mb-6 leading-tight break-words overflow-wrap-anywhere">
                {article.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3 md:gap-6 text-sm md:text-base text-gray-400 bg-gray-800/50 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-700/50">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5 text-red-500 flex-shrink-0" />
                  <span className="font-medium">{formatDate(article.createdAt)}</span>
                </div>
                <span className="hidden sm:inline text-gray-600">•</span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base flex-shrink-0">
                    {article.author.charAt(0)}
                  </div>
                  <span className="font-medium">By {article.author}</span>
                </div>
              </div>
            </div>

            {/* Content Layout - Centered single column */}
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Image Gallery Card */}
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 overflow-hidden">
                <CardContent className="p-4 md:p-6">
                  <div className="relative rounded-xl overflow-hidden shadow-2xl mb-4">
                    <img
                      src={article.images[currentImageIndex]}
                      alt={`${article.title} - Image ${currentImageIndex + 1}`}
                      className="w-full h-auto object-cover"
                      style={{ maxHeight: '600px' }}
                    />
                    
                    {article.images.length > 1 && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-red-600 border-0 p-2"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-5 w-5 text-white" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-red-600 border-0 p-2"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-5 w-5 text-white" />
                        </Button>

                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 px-3 py-1.5 rounded-full">
                          <span className="text-white text-sm font-medium">
                            {currentImageIndex + 1} / {article.images.length}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {article.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {article.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 transition-all ${
                            idx === currentImageIndex
                              ? 'border-red-500 scale-105'
                              : 'border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Article Content Card */}
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700/50">
                    <div className="h-8 w-1 bg-gradient-to-b from-red-600 to-orange-600 rounded-full"></div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">Article Details</h2>
                  </div>
                  
                  <div className="prose prose-invert prose-lg max-w-none">
                    <div className="text-base md:text-lg text-gray-300 leading-relaxed space-y-4">
                      {article.content.split('\n\n').map((paragraph, idx) => (
                        <p key={idx} className="text-gray-300 first-letter:text-2xl first-letter:font-bold first-letter:text-red-500">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="mt-8 pt-6 border-t border-gray-700/50">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {article.author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Written By</p>
                        <p className="text-lg font-semibold text-white">{article.author}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Back Button */}
            <div className="mt-8 md:mt-12 pt-8 border-t border-gray-700">
              <Link to="/news">
                <Button 
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700" 
                  size="lg"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to All News
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsDetail;
