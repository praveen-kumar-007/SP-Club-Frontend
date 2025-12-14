import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Calendar, Globe2, ChevronLeft, ChevronRight, Share2, Copy, Check } from "lucide-react";
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

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

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

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Article link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    if (!article) return;
    
    const url = window.location.href;
    const text = article.title;
    
    const shareUrls: { [key: string]: string } = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
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

  if (!article) return null;

  const shareImage = article.images[0]?.startsWith('http') 
    ? article.images[0] 
    : `https://spkabaddi.me${article.images[0]}`;
  
  const shareUrl = `https://spkabaddi.me/news/${article._id}`;

  return (
    <>
      <Seo
        title={`${article.title} - SP Kabaddi Club`}
        description={article.content.substring(0, 160)}
        keywords={`SP Kabaddi, news, ${article.lang === 'hindi' ? 'hindi news' : 'english news'}`}
        image={shareImage}
        url={shareUrl}
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

                  {/* Share Section */}
                  <div className="mt-8 pt-6 border-t border-gray-700/50">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-400 font-medium">Share this article:</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-600 hover:bg-green-700 border-0 text-white"
                          onClick={() => handleShare('whatsapp')}
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          WhatsApp
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-blue-600 hover:bg-blue-700 border-0 text-white"
                          onClick={() => handleShare('facebook')}
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                          Facebook
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-sky-500 hover:bg-sky-600 border-0 text-white"
                          onClick={() => handleShare('twitter')}
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                          </svg>
                          Twitter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-blue-700 hover:bg-blue-800 border-0 text-white"
                          onClick={() => handleShare('linkedin')}
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          LinkedIn
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-gray-700 hover:bg-gray-600 border-0 text-white"
                          onClick={handleCopyLink}
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              Copy Link
                            </>
                          )}
                        </Button>
                      </div>
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
