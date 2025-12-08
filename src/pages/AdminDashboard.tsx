import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, LogOut, Search, Eye, Trash2 } from "lucide-react";
import API_BASE_URL from "@/config/api";
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
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [currentStatus, setCurrentStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [page, setPage] = useState(1);

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    const admin = localStorage.getItem("adminUser");
    if (admin) {
      setAdminUser(JSON.parse(admin));
    }
    fetchStats();
    fetchRegistrations();
  }, [token, navigate, currentStatus, page]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stats`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams({
        status: currentStatus,
        page: page.toString(),
        limit: "10",
        search: search,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/admin/registrations?${query}`,
        {
          headers: { "Authorization": `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch registrations");
      const data = await response.json();
      setRegistrations(data.registrations);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch registrations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      fetchRegistrations();
      fetchStats();
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
        description: "Registration rejected and stored in database",
      });
      fetchRegistrations();
      fetchStats();
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
      fetchRegistrations();
      fetchStats();
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
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
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

  const StatCard = ({ icon: Icon, title, value, color }: any) => (
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Welcome, {adminUser?.username} ({adminUser?.role})</p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
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
            <Tabs value={currentStatus} onValueChange={(value: any) => {
              setCurrentStatus(value);
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
                  <div className="text-center py-8">Loading...</div>
                ) : registrations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No registrations found
                  </div>
                ) : (
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
                              <p className="text-sm">{reg.phone || 'N/A'}</p>
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
