import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Seo from "@/components/Seo";

interface GalleryImage {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  createdAt: string;
}

const CATEGORIES = ["Tournaments", "Rewards", "News", "Training", "Events", "Matches", "Others"];

const AdminGallery = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Others");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchGallery();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.GALLERY);
      if (!response.ok) throw new Error("Failed to fetch gallery");
      const data = await response.json();
      setImages(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load gallery images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      toast({ title: "Validation Error", description: "Image and title are required.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);

    try {
      const response = await fetch(API_ENDPOINTS.GALLERY, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      toast({ title: "Success", description: "Image uploaded successfully!" });
      
      // Reset form
      setFile(null);
      setPreview(null);
      setTitle("");
      setDescription("");
      setCategory("Others");
      
      // Refresh gallery
      fetchGallery();
    } catch (error) {
      toast({ title: "Upload failed", description: "Could not upload image.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`${API_ENDPOINTS.GALLERY}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete image");

      toast({ title: "Success", description: "Image deleted successfully!" });
      setImages((prev) => prev.filter((img) => img._id !== id));
    } catch (error) {
      toast({ title: "Delete failed", description: "Could not delete image.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Seo title="Admin - Gallery Manager" description="Manage gallery images." url="https://spkabaddi.me/admin/gallery" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Button variant="ghost" className="mb-2" onClick={() => navigate("/admin/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gallery Manager</h1>
            <p className="text-slate-500 mt-1">Upload and manage images for the public gallery.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Image</CardTitle>
                <CardDescription>Add an image to the gallery.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-upload">Select Image</Label>
                    <div className="flex items-center gap-4">
                      <Button type="button" variant="outline" className="w-full relative overflow-hidden" onClick={() => document.getElementById("image-upload")?.click()}>
                        {file ? "Change Image" : (
                          <>
                            <Upload className="w-4 h-4 mr-2" /> Upload
                          </>
                        )}
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </Button>
                    </div>
                  </div>

                  {preview && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                      <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input placeholder="e.g., State Championship" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea placeholder="Write a short description..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                      </>
                    ) : (
                      "Upload to Gallery"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Image Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Existing Images</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : images.length === 0 ? (
                  <div className="text-center p-8 text-slate-500 flex flex-col items-center">
                    <ImageIcon className="w-12 h-12 mb-4 text-slate-300" />
                    <p>No images in the gallery yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {images.map((img) => (
                      <div key={img._id} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square">
                        <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                          <div>
                            <span className="text-xs font-medium bg-blue-600 text-white px-2 py-1 rounded-full">{img.category}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium line-clamp-1">{img.title}</p>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="w-full mt-2" 
                              onClick={() => handleDelete(img._id)}
                              disabled={deletingId === img._id}
                            >
                              {deletingId === img._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminGallery;
