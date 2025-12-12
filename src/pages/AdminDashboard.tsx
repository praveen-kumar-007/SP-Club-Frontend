import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, LogOut, Search, Eye, Trash2, Mail, ChevronLeft, ChevronRight, 
  AlertCircle, CheckCircle, XCircle, Download, BarChart3, Filter 
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  dob: string;
  bloodGroup: string;
  address: string;
  role: string;
  ageGroup?: string;
  experience?: string;
  kabaddiPositions?: string[];
  clubDetails: string;
  message?: string;
  aadharNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  registeredAt: string;
  photo: string;
  aadharFront: string;
  aadharBack: string;
  newsletter?: boolean;
}

interface Stats {
  summary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    approvalRate: number;
  };
  monthlyRegistrations: Array<{
    _id: { year: number; month: number };
    count: number;
    approved: number;
    rejected: number;
    pending: number;
  }>;
  popularPositions: Array<{ position: string; count: number }>;
  ageGroups: Array<{ ageGroup: string; count: number }>;
  roles: Array<{ role: string; count: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentStatus, setCurrentStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [page, setPage] = useState(1);
  const [adminUser, setAdminUser] = useState<{username: string; role: string} | null>(null);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);
  const [sessionSecondsRemaining, setSessionSecondsRemaining] = useState<number | null>(null);
  
  // Bulk operations state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Advanced filters state
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("all");
  const [showStats, setShowStats] = useState(false);

  const token = localStorage.getItem("adminToken");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Session management
  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }
    const admin = localStorage.getItem("adminUser");
    if (admin) {
      setAdminUser(JSON.parse(admin));
    }

    const cleanup = initializeSessionManager(
      () => {
        clearSession();
        queryClient.clear();
        navigate("/admin/login");
      },
      () => {
        setShowTimeoutDialog(true);
        setCountdown(5);
      }
    );

    return cleanup;
  }, [token, navigate, queryClient]);

  // Timeout countdown
  useEffect(() => {
    if (showTimeoutDialog && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showTimeoutDialog, countdown]);

  // Session time remaining tracker
  useEffect(() => {
    const updateSessionTime = () => {
      const sessionStart = localStorage.getItem('adminSessionStart');
      if (!sessionStart) return;

      const SESSION_TIMEOUT = 5 * 60 * 1000;
      const timeElapsedSinceStart = Date.now() - parseInt(sessionStart);
      const remainingMs = SESSION_TIMEOUT - timeElapsedSinceStart;
      const remainingMinutes = Math.max(0, Math.floor(remainingMs / 60000));
      const remainingSeconds = Math.max(0, Math.floor((remainingMs % 60000) / 1000));
      
      setSessionTimeRemaining(remainingMinutes);
      setSessionSecondsRemaining(remainingSeconds);
    };

    updateSessionTime();
    const interval = setInterval(updateSessionTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch registrations
  const { data: registrationsData, refetch: refetchRegistrations } = useQuery({
    queryKey: ['registrations', currentStatus, page, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        status: currentStatus,
        page: page.toString(),
        limit: '10',
        ...(debouncedSearch && { search: debouncedSearch })
      });

      const response = await fetch(
        `${API_BASE_URL}/api/admin/registrations?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    enabled: !!token,
  });

  // Fetch statistics
  const { data: statsData } = useQuery<Stats>({
    queryKey: ['statistics'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/admin/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return response.json();
    },
    enabled: !!token && showStats,
  });

  const registrations = registrationsData?.registrations || [];
  const pagination = registrationsData?.pagination || { total: 0, pages: 1, currentPage: 1 };

  // Filter registrations by advanced filters
  const filteredRegistrations = registrations.filter((reg: Registration) => {
    if (ageGroupFilter !== "all" && reg.ageGroup !== ageGroupFilter) return false;
    if (roleFilter !== "all" && reg.role !== roleFilter) return false;
    if (experienceFilter !== "all" && reg.experience !== experienceFilter) return false;
    return true;
  });

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRegistrations.map(r => r._id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(newSelected.size === filteredRegistrations.length);
  };

  // Bulk approve/reject
  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedIds.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select registrations first",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/registrations/bulk-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Bulk action failed');
      }

      toast({
        title: "Success",
        description: result.message,
      });

      setSelectedIds(new Set());
      setSelectAll(false);
      refetchRegistrations();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Bulk action failed",
        variant: "destructive",
      });
    }
  };

  // Export to CSV - fetch ALL data with current filters
  const exportToCSV = async () => {
    try {
      toast({
        title: "Exporting...",
        description: "Fetching all data for export",
      });

      // Build query params with all current filters
      const params = new URLSearchParams({
        status: currentStatus,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(ageGroupFilter !== 'all' && { ageGroup: ageGroupFilter }),
        ...(roleFilter !== 'all' && { role: roleFilter }),
        ...(experienceFilter !== 'all' && { experience: experienceFilter }),
      });

      const response = await fetch(
        `${API_BASE_URL}/api/admin/registrations/export?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Export failed');
      
      const data = await response.json();
      const allRegistrations = data.registrations || [];

      // All CSV headers
      const headers = [
        'Registration ID',
        'Name',
        'Father\'s Name',
        'Email',
        'Phone',
        'Parent Phone',
        'Gender',
        'Date of Birth',
        'Age Group',
        'Blood Group',
        'Address',
        'Aadhar Number',
        'Role',
        'Experience Level',
        'Kabaddi Positions',
        'Club Details',
        'Message',
        'Newsletter Subscribed',
        'Status',
        'Registered Date',
        'Photo URL',
        'Aadhar Front URL',
        'Aadhar Back URL'
      ];

      const rows = allRegistrations.map((reg: Registration) => [
        reg._id,
        reg.name,
        reg.fathersName,
        reg.email,
        reg.phone || 'N/A',
        reg.parentsPhone || 'N/A',
        reg.gender,
        reg.dob ? new Date(reg.dob).toLocaleDateString() : 'N/A',
        reg.ageGroup || 'N/A',
        reg.bloodGroup,
        reg.address || 'N/A',
        reg.aadharNumber,
        reg.role,
        reg.experience || 'N/A',
        reg.kabaddiPositions ? reg.kabaddiPositions.join('; ') : 'N/A',
        reg.clubDetails || 'N/A',
        reg.message || 'N/A',
        reg.newsletter ? 'Yes' : 'No',
        reg.status,
        new Date(reg.registeredAt).toLocaleString(),
        reg.photo,
        reg.aadharFront,
        reg.aadharBack
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `SP_Kabaddi_Registrations_${currentStatus}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: `Exported ${allRegistrations.length} registrations with all fields`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this registration permanently?')) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/registrations/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
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
      refetchRegistrations();
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

  // Monthly data formatting
  const monthlyChartData = statsData?.monthlyRegistrations.map(m => ({
    name: `${m._id.month}/${m._id.year}`,
    Total: m.count,
    Approved: m.approved,
    Pending: m.pending,
    Rejected: m.rejected,
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Session Timer Banner */}
      {sessionTimeRemaining !== null && (
        <div className={`sticky top-0 z-50 px-4 py-3 ${
          sessionTimeRemaining === 0 && sessionSecondsRemaining! <= 30 
            ? 'bg-red-500' 
            : sessionTimeRemaining <= 1 
            ? 'bg-yellow-500' 
            : 'bg-blue-500'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="text-white" size={20} />
              <span className="text-white font-semibold">
                Session expires in {sessionTimeRemaining}:{String(sessionSecondsRemaining).padStart(2, '0')} 
              </span>
            </div>
            <span className="text-white text-sm opacity-90">Stay active to keep your session alive</span>
          </div>
        </div>
      )}

      {/* Session Timeout Dialog */}
      <AlertDialog open={showTimeoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-red-600">
              ⏱️ Session Timeout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-3">
              <p>Your session has expired due to inactivity.</p>
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
            <Button 
              variant={showStats ? "default" : "outline"} 
              onClick={() => setShowStats(!showStats)}
            >
              <BarChart3 size={18} className="mr-2" />
              {showStats ? 'Hide' : 'Show'} Statistics
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Statistics Dashboard */}
        {showStats && statsData && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData.summary.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-yellow-600">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData.summary.pending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-green-600">Approved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData.summary.approved}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-red-600">Rejected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData.summary.rejected}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-blue-600">Approval Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statsData.summary.approvalRate}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Registrations Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="Approved" stroke="#10b981" />
                      <Line type="monotone" dataKey="Pending" stroke="#f59e0b" />
                      <Line type="monotone" dataKey="Rejected" stroke="#ef4444" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Popular Positions Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Popular Kabaddi Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statsData.popularPositions.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="position" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Age Group Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Age Group Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statsData.ageGroups}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ ageGroup, count }) => `${ageGroup}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {statsData.ageGroups.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Role Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Role Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statsData.roles}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ role, count }) => `${role}: ${count}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {statsData.roles.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter size={20} />
              Advanced Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Age Group</label>
                <Select value={ageGroupFilter} onValueChange={setAgeGroupFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All age groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Age Groups</SelectItem>
                    <SelectItem value="Under 14">Under 14</SelectItem>
                    <SelectItem value="Under 17">Under 17</SelectItem>
                    <SelectItem value="Under 21">Under 21</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Role</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="player">Player</SelectItem>
                    <SelectItem value="coach">Coach</SelectItem>
                    <SelectItem value="referee">Referee</SelectItem>
                    <SelectItem value="supporter">Supporter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Experience</label>
                <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Experience</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setAgeGroupFilter("all");
                    setRoleFilter("all");
                    setExperienceFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registrations List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Registrations</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download size={16} className="mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search & Tabs */}
            <div className="space-y-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <Input
                  placeholder="Search by name, email, phone, or Aadhar number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
                {debouncedSearch && (
                  <div className="absolute right-3 top-3 text-xs text-gray-500">
                    Searching...
                  </div>
                )}
              </div>

              <Tabs value={currentStatus} onValueChange={(value: any) => {
                setCurrentStatus(value);
                setPage(1);
                setSelectedIds(new Set());
                setSelectAll(false);
              }}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Bulk Actions */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium">{selectedIds.size} selected</span>
                  <div className="flex gap-2 ml-auto">
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => handleBulkAction('approve')}
                    >
                      <CheckCircle size={16} className="mr-2" />
                      Approve Selected
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleBulkAction('reject')}
                    >
                      <XCircle size={16} className="mr-2" />
                      Reject Selected
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedIds(new Set());
                        setSelectAll(false);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No registrations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((registration: Registration) => (
                      <TableRow key={registration._id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedIds.has(registration._id)}
                            onCheckedChange={() => handleSelectOne(registration._id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{registration.name}</TableCell>
                        <TableCell>{registration.email}</TableCell>
                        <TableCell>{registration.phone}</TableCell>
                        <TableCell className="capitalize">{registration.role}</TableCell>
                        <TableCell>{registration.bloodGroup}</TableCell>
                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                        <TableCell>{new Date(registration.registeredAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/registration/${registration._id}`)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(registration._id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">
                  Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.total)} of {pagination.total} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <span className="px-3 py-2 text-sm">
                    Page {pagination.currentPage} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                    disabled={page === pagination.pages}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
