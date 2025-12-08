import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import API_BASE_URL from "@/config/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface Registration {
  _id: string;
  name: string;
  fathersName: string;
  email: string;
  phone: string;
  gender: string;
  bloodGroup: string;
  role: string;
  ageGroup: string;
  dob: string;
  aadharNumber: string;
  address: string;
  clubDetails: string;
  message: string;
  photo: string;
  aadharFront: string;
  aadharBack: string;
  kabaddiPositions: string[];
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  newsletter: boolean;
  terms: boolean;
}

const RegistrationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    fetchRegistration();
  }, [id, token]);

  const fetchRegistration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/registrations/${id}`,
        {
          headers: { "Authorization": `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch registration");
      const data = await response.json();
      setRegistration(data);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/registrations/${id}/approve`,
        {
          method: "PUT",
          headers: { "Authorization": `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to approve");
      toast({
        title: "Success",
        description: "Registration approved successfully",
      });
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    setIsRejecting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/registrations/${id}/reject`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Failed to reject' }));
        throw new Error(data.message || "Failed to reject");
      }
      
      toast({
        title: "Success",
        description: "Registration rejected and stored in database",
      });
      setShowRejectDialog(false);
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (error) {
      console.error('Reject error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete this registration? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/registrations/${id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Failed to delete' }));
        throw new Error(data.message || "Failed to delete");
      }
      
      toast({
        title: "Success",
        description: "Registration deleted permanently",
      });
      setTimeout(() => navigate("/admin/dashboard"), 1500);
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!registration) {
    return <div className="flex justify-center items-center min-h-screen">Registration not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin/dashboard")}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{registration.name}</h1>
              <p className="text-gray-600">{registration.email}</p>
            </div>
          </div>
          <div>{getStatusBadge(registration.status)}</div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo */}
            {registration.photo && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Passport Size Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-6">
                    <div className="relative">
                      <img
                        src={registration.photo}
                        alt="Passport"
                        className="w-48 h-56 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow">
                        Verified
                      </div>
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-2">Photo Details</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Format:</span> JPG/PNG</p>
                          <p><span className="font-medium">Status:</span> <span className="text-green-600 font-medium">Uploaded</span></p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(registration.photo, '_blank')}
                      >
                        <Download size={18} className="mr-2" />
                        Download Photo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Aadhar Documents */}
            {(registration.aadharFront || registration.aadharBack) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Aadhar Card Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Aadhar Front */}
                    {registration.aadharFront && (
                      <div className="space-y-3 bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-bold text-blue-900">Front Side</h3>
                          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Verified</span>
                        </div>
                        <div className="relative group">
                          <img
                            src={registration.aadharFront}
                            alt="Aadhar Front"
                            className="w-full h-48 object-contain rounded-lg border-2 border-white shadow-lg bg-white hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(registration.aadharFront, '_blank')}
                          />
                          <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-semibold">Click to view full size</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-white hover:bg-blue-50 text-blue-700 border-blue-300 font-medium"
                          onClick={() => window.open(registration.aadharFront, '_blank')}
                        >
                          <Download size={16} className="mr-2" />
                          Download Front Side
                        </Button>
                      </div>
                    )}

                    {/* Aadhar Back */}
                    {registration.aadharBack && (
                      <div className="space-y-3 bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-2 border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-bold text-purple-900">Back Side</h3>
                          <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">Verified</span>
                        </div>
                        <div className="relative group">
                          <img
                            src={registration.aadharBack}
                            alt="Aadhar Back"
                            className="w-full h-48 object-contain rounded-lg border-2 border-white shadow-lg bg-white hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => window.open(registration.aadharBack, '_blank')}
                          />
                          <div className="absolute inset-0 bg-purple-600 bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-semibold">Click to view full size</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-white hover:bg-purple-50 text-purple-700 border-purple-300 font-medium"
                          onClick={() => window.open(registration.aadharBack, '_blank')}
                        >
                          <Download size={16} className="mr-2" />
                          Download Back Side
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium">{registration.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Father's Name</p>
                    <p className="font-medium">{registration.fathersName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{registration.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{registration.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium capitalize">{registration.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Blood Group</p>
                    <p className="font-medium">{registration.bloodGroup || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium">{new Date(registration.dob).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age Group</p>
                    <p className="font-medium">{registration.ageGroup || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Aadhar Number</p>
                    <p className="font-medium">{registration.aadharNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Club Details */}
            <Card>
              <CardHeader>
                <CardTitle>Club Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-medium">{registration.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Club Details</p>
                  <p className="font-medium">{registration.clubDetails}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{registration.address || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Kabaddi Positions */}
            {registration.kabaddiPositions && registration.kabaddiPositions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Kabaddi Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {registration.kabaddiPositions.map((pos) => (
                      <Badge key={pos} variant="secondary">{pos}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Message */}
            {registration.message && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{registration.message}</p>
                </CardContent>
              </Card>
            )}

            {/* Rejection Reason */}
            {registration.status === 'rejected' && registration.rejectionReason && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-700">Rejection Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{registration.rejectionReason}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Current Status</p>
                  <p className="text-lg font-bold mt-1">{getStatusBadge(registration.status)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Registered Date</p>
                  <p className="font-medium">{new Date(registration.registeredAt).toLocaleDateString()}</p>
                </div>
                {registration.approvedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Approved Date</p>
                    <p className="font-medium">{new Date(registration.approvedAt).toLocaleDateString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            {registration.status === 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                  >
                    Approve Registration
                  </Button>

                  <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Reject Registration
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Registration</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          placeholder="Enter reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="min-h-24"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleReject}
                          disabled={isRejecting}
                        >
                          {isRejecting ? "Rejecting..." : "Reject"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}

            {/* Actions for Rejected Registrations */}
            {registration.status === 'rejected' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reconsider Application</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Rejection Reason:</strong> {registration.rejectionReason}
                    </p>
                  </div>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                  >
                    Approve This Application
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Delete Action - Available for all statuses */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {registration.status === 'rejected' ? 'Permanent Deletion' : 'Delete Registration'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {registration.status === 'rejected' && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Rejected Registration:</strong> This registration is stored in rejected status. 
                      You can permanently delete it from the database if needed.
                    </p>
                    {registration.rejectionReason && (
                      <p className="text-xs text-yellow-700 mt-2">
                        <strong>Reason:</strong> {registration.rejectionReason}
                      </p>
                    )}
                  </div>
                )}
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {registration.status === 'rejected' ? 'Delete from Database Permanently' : 'Delete Permanently'}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  {registration.status === 'rejected' 
                    ? 'This will permanently remove the rejected registration from the database.' 
                    : 'This action cannot be undone.'}
                </p>
              </CardContent>
            </Card>

            {/* Engagement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Newsletter</span>
                    <Badge variant={registration.newsletter ? "default" : "outline"}>
                      {registration.newsletter ? "Subscribed" : "Not Subscribed"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Terms</span>
                    <Badge variant={registration.terms ? "default" : "outline"}>
                      {registration.terms ? "Agreed" : "Not Agreed"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDetail;
