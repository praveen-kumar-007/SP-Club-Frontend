import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, LogOut, Search, Eye, Trash2, Edit, Plus, 
  ChevronLeft, Upload, X, Globe2, Image as ImageIcon 
} from "lucide-react";
import API_BASE_URL, { API_ENDPOINTS } from "@/config/api";
import { initializeSessionManager, clearSession } from "@/utils/adminSessionManager";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

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

const AdminNews = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  // Create/Edit Dialog State
  const [showDialog, setShowDialog] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    lang: "english" as 'english' | 'hindi',
    author: "Admin",
    published: true
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog State
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingArticle, setDeletingArticle] = useState<NewsArticle | null>(null);

  // View Dialog State
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewingArticle, setViewingArticle] = useState<NewsArticle | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    // Initialize session timeout manager
    const cleanup = initializeSessionManager(
      () => {
        clearSession();
        navigate("/admin/login");
      },
      () => {
        setShowTimeoutDialog(true);
      }
    );

    fetchNews();

    return cleanup;
  }, [token, navigate]);

  // Session time display
  useEffect(() => {
    const updateSessionTime = () => {
      const sessionStart = localStorage.getItem('adminSessionStart');
      if (!sessionStart) return;

      const SESSION_TIMEOUT = 15 * 60 * 1000;
      const timeElapsedSinceStart = Date.now() - parseInt(sessionStart);
      const remainingMs = SESSION_TIMEOUT - timeElapsedSinceStart;
      const remainingMinutes = Math.max(0, Math.floor(remainingMs / 60000));
      
      setSessionTimeRemaining(remainingMinutes);
    };

    updateSessionTime();
    const interval = setInterval(updateSessionTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timeout countdown
  useEffect(() => {
    if (showTimeoutDialog && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showTimeoutDialog && countdown === 0) {
      handleLogout();
    }
  }, [showTimeoutDialog, countdown]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.NEWS}/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      setNewsArticles(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      toast({
        title: "Error",
        description: "Failed to load news articles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/admin/login");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 10) {
      toast({
        title: "Too Many Images",
        description: "You can upload a maximum of 10 images",
        variant: "destructive"
      });
      return;
    }

    setSelectedImages([...selectedImages, ...files]);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...previews]);
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    const newPreviews = [...previewImages];
    
    // Revoke the URL to free memory
    URL.revokeObjectURL(newPreviews[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setSelectedImages(newImages);
    setPreviewImages(newPreviews);
  };

  const openCreateDialog = () => {
    setEditingArticle(null);
    setFormData({
      title: "",
      content: "",
      lang: "english",
      author: "Admin",
      published: true
    });
    setSelectedImages([]);
    setPreviewImages([]);
    setShowDialog(true);
  };

  const openEditDialog = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      lang: article.lang,
      author: article.author,
      published: article.published
    });
    setSelectedImages([]);
    setPreviewImages(article.images);
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!editingArticle && selectedImages.length === 0) {
      toast({
        title: "Missing Images",
        description: "Please upload at least one image",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('lang', formData.lang);
      formDataToSend.append('author', formData.author);
      formDataToSend.append('published', formData.published.toString());

      selectedImages.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const url = editingArticle 
        ? `${API_ENDPOINTS.NEWS}/${editingArticle._id}`
        : API_ENDPOINTS.NEWS;
      
      const method = editingArticle ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to save news article');
      }

      toast({
        title: "Success",
        description: `News article ${editingArticle ? 'updated' : 'created'} successfully`,
      });

      setShowDialog(false);
      fetchNews();
    } catch (error) {
      console.error('Error saving news:', error);
      toast({
        title: "Error",
        description: "Failed to save news article",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingArticle) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.NEWS}/${deletingArticle._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete news article');
      }

      toast({
        title: "Success",
        description: "News article deleted successfully",
      });

      setShowDeleteDialog(false);
      setDeletingArticle(null);
      fetchNews();
    } catch (error) {
      console.error('Error deleting news:', error);
      toast({
        title: "Error",
        description: "Failed to delete news article",
        variant: "destructive"
      });
    }
  };

  const togglePublish = async (article: NewsArticle) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.NEWS}/${article._id}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update publish status');
      }

      toast({
        title: "Success",
        description: `News article ${article.published ? 'unpublished' : 'published'} successfully`,
      });

      fetchNews();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast({
        title: "Error",
        description: "Failed to update publish status",
        variant: "destructive"
      });
    }
  };

  const filteredArticles = newsArticles.filter(article =>
    article.title.toLowerCase().includes(search.toLowerCase()) ||
    article.content.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📰 News Management</h1>
            <p className="text-gray-400">Create, edit, and manage news articles</p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {sessionTimeRemaining !== null && (
              <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                <Clock className="mr-2 h-4 w-4" />
                {sessionTimeRemaining}m
              </Badge>
            )}
            <Button
              onClick={() => navigate("/admin/dashboard")}
              variant="outline"
              className="border-gray-700 hover:bg-gray-800"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search news articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <Button
            onClick={openCreateDialog}
            className="bg-red-600 hover:bg-red-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create News Article
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{newsArticles.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {newsArticles.filter(a => a.published).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">
                {newsArticles.filter(a => !a.published).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* News Articles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-gray-800 border-gray-700">
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ImageIcon className="h-16 w-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg mb-2">No news articles found</p>
              <p className="text-gray-500 text-sm">Create your first article to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Card key={article._id} className="bg-gray-800 border-gray-700 hover:border-red-600 transition-all">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={article.images[0]}
                    alt={article.title}
                    className="w-full h-full object-cover object-top"
                  />
                  {article.images.length > 1 && (
                    <Badge className="absolute top-2 right-2 bg-black/60 border-0">
                      +{article.images.length - 1}
                    </Badge>
                  )}
                  <Badge 
                    className={`absolute bottom-2 left-2 ${
                      article.published ? 'bg-green-600' : 'bg-yellow-600'
                    } border-0`}
                  >
                    {article.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {article.content}
                  </p>
                  <div className="text-xs text-gray-500 mb-4">
                    {formatDate(article.createdAt)}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setViewingArticle(article);
                        setCurrentImageIndex(0);
                        setShowViewDialog(true);
                      }}
                      className="flex-1"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(article)}
                      className="flex-1"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={article.published ? "secondary" : "default"}
                      onClick={() => togglePublish(article)}
                      className="flex-1"
                    >
                      {article.published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setDeletingArticle(article);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingArticle ? 'Edit News Article' : 'Create News Article'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingArticle ? 'Update the news article details' : 'Fill in the details to create a new news article'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="Enter news title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="bg-gray-700 border-gray-600 min-h-[200px]"
                placeholder="Enter news content"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
                className="bg-gray-700 border-gray-600"
                placeholder="Author name"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({...formData, published: e.target.checked})}
                className="h-4 w-4"
              />
              <Label htmlFor="published" className="cursor-pointer">
                Publish immediately
              </Label>
            </div>

            <div className="space-y-2">
              <Label>Images * (Max 10)</Label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-red-600 transition-colors">
                <input
                  type="file"
                  id="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <label htmlFor="images" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-400">Click to upload images</p>
                  <p className="text-sm text-gray-500 mt-1">PNG, JPG, JPEG up to 10MB each</p>
                </label>
              </div>

              {/* Image Previews */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover object-top rounded-lg"
                      />
                      {!editingArticle && (
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-600 hover:bg-red-700"
                disabled={submitting}
              >
                {submitting ? 'Saving...' : editingArticle ? 'Update Article' : 'Create Article'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700 text-white">
          {viewingArticle && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={viewingArticle.published ? 'bg-green-600' : 'bg-yellow-600'}>
                    {viewingArticle.published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <DialogTitle className="text-3xl">{viewingArticle.title}</DialogTitle>
                <DialogDescription className="text-gray-400">
                  By {viewingArticle.author} • {formatDate(viewingArticle.createdAt)}
                </DialogDescription>
              </DialogHeader>

              {/* Image Carousel */}
              <div className="relative">
                <img
                  src={viewingArticle.images[currentImageIndex]}
                  alt={`Image ${currentImageIndex + 1}`}
                  className="w-full h-96 object-cover object-top rounded-lg"
                />
                {viewingArticle.images.length > 1 && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute left-2 top-1/2 -translate-y-1/2"
                      onClick={() => setCurrentImageIndex((currentImageIndex - 1 + viewingArticle.images.length) % viewingArticle.images.length)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setCurrentImageIndex((currentImageIndex + 1) % viewingArticle.images.length)}
                    >
                      <ChevronLeft className="h-4 w-4 rotate-180" />
                    </Button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full">
                      <span className="text-white text-sm">
                        {currentImageIndex + 1} / {viewingArticle.images.length}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap">{viewingArticle.content}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete News Article?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{deletingArticle?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Session Timeout Dialog */}
      <AlertDialog open={showTimeoutDialog} onOpenChange={setShowTimeoutDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              ⏱️ Session Timeout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Your session has expired due to inactivity. You will be logged out in {countdown} seconds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminNews;
