import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, LogOut, Search, Eye, Trash2, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import API_BASE_URL from "@/config/api";
import { initializeSessionManager, clearSession } from "@/utils/adminSessionManager";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Registration {
  _id: string;
  name: string;
  fathersName: string;
  email: string;
  phone: string;
  parentsPhone: string;
  gender: string;
  bloodGroup: string;
  role: string;
  aadharNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: string;
  photo: string;
  aadharFront: string;
  aadharBack: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentStatus, setCurrentStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [page, setPage] = useState(1);
  const [adminUser, setAdminUser] = useState<{username: string; role: string} | null>(null);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const token = localStorage.getItem("adminToken");

  // Debounce search input (wait 500ms after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    const admin = localStorage.getItem("adminUser");
    if (admin) {
      setAdminUser(JSON.parse(admin));
    }

    // Initialize session timeout manager
    const cleanup = initializeSessionManager(
      () => {
        clearSession();
        // Invalidate all queries to prevent 401 errors
        queryClient.clear();
        navigate("/admin/login");
      },
      () => {
        setShowTimeoutDialog(true);
        setCountdown(5);
      }
    );

    return cleanup;
  }, [token, navigate, toast, queryClient]);

  // Countdown timer for timeout dialog
  useEffect(() => {
    if (showTimeoutDialog && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showTimeoutDialog, countdown]);

  // Fetch stats with React Query
  const { data: statsData, error: statsError } = useQuery({
    queryKey: ['admin-stats', token],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(`Stats fetch failed: ${response.status} ${response.statusText} ${body.message || ''}`);
      }
      return response.json();
    },
    staleTime: 30000, // Cache for 30 seconds
    enabled: !!token,
  });

  // Fetch registrations with React Query
  const { data: registrationsData, isLoading, error: registrationsError } = useQuery({
    queryKey: ['admin-registrations', currentStatus, page, debouncedSearch, token],
    queryFn: async () => {
      const query = new URLSearchParams({
        status: currentStatus,
        page: page.toString(),
        limit: "10",
        search: debouncedSearch,
      });
      const response = await fetch(
        `${API_BASE_URL}/api/admin/registrations?${query}`,
        {
          headers: { "Authorization": `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(`Registrations fetch failed: ${response.status} ${response.statusText} ${body.message || ''}`);
      }
      return response.json();
    },
    staleTime: 20000, // Cache for 20 seconds
    enabled: !!token,
  });

  const stats = statsData?.stats ?? { total: 0, pending: 0, approved: 0, rejected: 0 };
  const registrations = registrationsData?.registrations ?? [];
  const pagination = registrationsData?.pagination ?? { total: 0, pages: 1 };

  // Memoize refetch functions to avoid unnecessary re-renders
  const refetchData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['admin-registrations'] });
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
  }, [queryClient]);

  const handleApprove = async (id: string) => {
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
      refetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to approve",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string, reason: string) => {
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/registrations/${id}/reject`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Failed to reject' }));
        throw new Error(data.message || "Failed to reject");
      }
      
      toast({
        title: "Success",
        description: "Registration rejected successfully",
      });
      refetchData();
    } catch (error) {
      console.error('Reject error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reject",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${name}'s registration? This cannot be undone.`)) {
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
      refetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/admin/login");
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

  const StatCard = ({ icon: Icon, title, value, color }: { icon: React.ComponentType<any>; title: string; value: number; color: string }) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">{value}</div>
          <Icon className={`${color}`} size={32} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Session Timeout Dialog */}
      <AlertDialog open={showTimeoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-600">
              ⏱️ Session Timeout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-3">
              <p>Your session has expired due to 15 minutes of inactivity.</p>
              <p className="font-semibold text-gray-900">
                You will be redirected to the login page in {countdown} second{countdown !== 1 ? 's' : ''}...
              </p>
              <p className="text-sm text-gray-600">Please log in again to continue.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {adminUser?.username} ({adminUser?.role})</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/admin/inquiries")}>
              <Mail size={18} className="mr-2" />
              View Inquiries
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {(statsError || registrationsError) && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {statsError && <div>Stats error: {(statsError as Error).message}</div>}
            {registrationsError && <div>Registrations error: {(registrationsError as Error).message}</div>}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={Clock}
            title="Pending"
            value={stats.pending}
            color="text-yellow-500"
          />
          <StatCard
            icon={CheckCircle}
            title="Approved"
            value={stats.approved}
            color="text-green-500"
          />
          <StatCard
            icon={XCircle}
            title="Rejected"
            value={stats.rejected}
            color="text-red-500"
          />
          <StatCard
            icon={Eye}
            title="Total"
            value={stats.total}
            color="text-blue-500"
          />
        </div>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center gap-4">
              <CardTitle>Registrations</CardTitle>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or Aadhar"
                  className="pl-10 w-64"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={currentStatus} onValueChange={(value: string) => {
              setCurrentStatus(value as 'all' | 'pending' | 'approved' | 'rejected');
              setPage(1);
            }}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>

              <TabsContent value={currentStatus} className="mt-4">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="inline-block">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                    </div>
                    <p className="mt-2">Loading registrations...</p>
                  </div>
                ) : registrations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No registrations found
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Photo</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {registrations.map((reg) => (
                            <TableRow key={reg._id} className="hover:bg-gray-50">
                              <TableCell>
                                {reg.photo ? (
                                  <img 
                                    src={reg.photo} 
                                    alt={reg.name}
                                    className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">No Photo</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <p className="font-medium">{reg.name}</p>
                              </TableCell>
                              <TableCell>
                                <p className="text-sm">{reg.email}</p>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm space-y-0.5">
                                  <p>{reg.phone || 'N/A'}</p>
                                  {reg.parentsPhone && <p className="text-gray-500">{reg.parentsPhone}</p>}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{reg.role}</Badge>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(reg.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => navigate(`/admin/registration/${reg._id}`)}
                                  >
                                    View Details
                                  </Button>
                                  {reg.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => handleApprove(reg._id)}
                                    >
                                      Approve
                                    </Button>
                                  )}
                                  {(reg.status === 'approved' || reg.status === 'rejected') && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleDelete(reg._id, reg.name)}
                                    >
                                      <Trash2 size={16} />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {/* Pagination Controls */}
                    {pagination.pages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t">
                        <div className="text-sm text-gray-600">
                          Page {pagination.currentPage} of {pagination.pages} ({pagination.total} total)
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.currentPage === 1}
                            onClick={() => setPage(Math.max(1, page - 1))}
                          >
                            <ChevronLeft size={16} className="mr-1" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={pagination.currentPage === pagination.pages}
                            onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                          >
                            Next
                            <ChevronRight size={16} className="ml-1" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
