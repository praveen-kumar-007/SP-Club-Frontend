import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CheckCircle, Trash2, LogOut, Search, Mail, Phone } from "lucide-react";
import API_BASE_URL from "@/config/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'completed';
  type: 'contact' | 'newsletter';
  createdAt?: string;
  subscribedAt?: string;
}

const AdminInquiries = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Inquiry[]>([]);
  const [newsletters, setNewsletters] = useState<Inquiry[]>([]);
  const [search, setSearch] = useState("");
  const [currentTab, setCurrentTab] = useState<'contacts' | 'newsletters'>('contacts');
  const [currentStatus, setCurrentStatus] = useState<'all' | 'new' | 'completed'>('new');
  const [isLoading, setIsLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

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
    fetchInquiries();
  }, [token, navigate]);

  const fetchInquiries = async () => {
    setIsLoading(true);
    try {
      // Fetch contacts
      const contactsResponse = await fetch(
        `${API_BASE_URL}/api/contact/admin`,
        {
          headers: { "Authorization": `Bearer ${token}` },
        }
      );
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        setContacts(contactsData.contacts || []);
      }

      // Fetch newsletters
      const newslettersResponse = await fetch(
        `${API_BASE_URL}/api/newsletter/admin`,
        {
          headers: { "Authorization": `Bearer ${token}` },
        }
      );
      if (newslettersResponse.ok) {
        const newslettersData = await newslettersResponse.json();
        setNewsletters(newslettersData.newsletters || []);
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inquiries",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkComplete = async (id: string, type: 'contact' | 'newsletter') => {
    try {
      const endpoint = type === 'contact' ? '/api/contact/admin' : '/api/newsletter/admin';
      const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to mark as completed");

      toast({
        title: "Success",
        description: "Marked as completed",
      });
      fetchInquiries();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, type: 'contact' | 'newsletter', name?: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    try {
      const endpoint = type === 'contact' ? '/api/contact/admin' : '/api/newsletter/admin';
      const response = await fetch(`${API_BASE_URL}${endpoint}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete");

      toast({
        title: "Success",
        description: `${type} deleted successfully`,
      });
      fetchInquiries();
    } catch (error) {
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
    return status === 'completed' 
      ? <Badge className="bg-green-500">Completed</Badge>
      : <Badge className="bg-yellow-500">New</Badge>;
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(search.toLowerCase()) ||
      contact.email.toLowerCase().includes(search.toLowerCase()) ||
      contact.phone.includes(search);
    const matchesStatus = currentStatus === 'all' || contact.status === currentStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredNewsletters = newsletters.filter((newsletter) => {
    const matchesSearch = newsletter.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = currentStatus === 'all' || newsletter.status === currentStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Inquiries & Submissions</h1>
            <p className="text-sm text-gray-600">Welcome, {adminUser?.username} ({adminUser?.role})</p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut size={18} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center gap-4">
              <CardTitle>Filter & Search</CardTitle>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or phone"
                  className="pl-10 w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Card>
          <CardContent>
            <Tabs value={currentTab} onValueChange={(value: any) => {
              setCurrentTab(value);
              setCurrentStatus('new');
            }}>
              <TabsList>
                <TabsTrigger value="contacts">Contact Forms</TabsTrigger>
                <TabsTrigger value="newsletters">Newsletter Subscriptions</TabsTrigger>
              </TabsList>

              {/* Contact Forms Tab */}
              <TabsContent value="contacts" className="mt-4">
                <div className="space-y-4 mb-4">
                  <div className="flex gap-2">
                    <Button 
                      variant={currentStatus === 'all' ? 'default' : 'outline'}
                      onClick={() => setCurrentStatus('all')}
                    >
                      All
                    </Button>
                    <Button 
                      variant={currentStatus === 'new' ? 'default' : 'outline'}
                      onClick={() => setCurrentStatus('new')}
                    >
                      New
                    </Button>
                    <Button 
                      variant={currentStatus === 'completed' ? 'default' : 'outline'}
                      onClick={() => setCurrentStatus('completed')}
                    >
                      Completed
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : filteredContacts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No contact forms found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredContacts.map((contact) => (
                          <TableRow key={contact._id} className="hover:bg-gray-50">
                            <TableCell>
                              <p className="font-medium">{contact.name}</p>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail size={16} className="text-gray-400" />
                                <p className="text-sm">{contact.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Phone size={16} className="text-gray-400" />
                                <p className="text-sm">{contact.phone}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{contact.subject}</p>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(contact.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                {contact.status === 'new' && (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleMarkComplete(contact._id, 'contact')}
                                  >
                                    <CheckCircle size={16} />
                                  </Button>
                                )}
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(contact._id, 'contact', contact.name)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>

              {/* Newsletter Tab */}
              <TabsContent value="newsletters" className="mt-4">
                <div className="space-y-4 mb-4">
                  <div className="flex gap-2">
                    <Button 
                      variant={currentStatus === 'all' ? 'default' : 'outline'}
                      onClick={() => setCurrentStatus('all')}
                    >
                      All
                    </Button>
                    <Button 
                      variant={currentStatus === 'new' ? 'default' : 'outline'}
                      onClick={() => setCurrentStatus('new')}
                    >
                      New
                    </Button>
                    <Button 
                      variant={currentStatus === 'completed' ? 'default' : 'outline'}
                      onClick={() => setCurrentStatus('completed')}
                    >
                      Completed
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="text-center py-8">Loading...</div>
                ) : filteredNewsletters.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No newsletter subscriptions found
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Subscribed Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredNewsletters.map((newsletter) => (
                          <TableRow key={newsletter._id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail size={16} className="text-gray-400" />
                                <p className="text-sm">{newsletter.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(newsletter.status)}
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">
                                {newsletter.subscribedAt ? new Date(newsletter.subscribedAt).toLocaleDateString() : 'N/A'}
                              </p>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                {newsletter.status === 'new' && (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleMarkComplete(newsletter._id, 'newsletter')}
                                  >
                                    <CheckCircle size={16} />
                                  </Button>
                                )}
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDelete(newsletter._id, 'newsletter')}
                                >
                                  <Trash2 size={16} />
                                </Button>
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

export default AdminInquiries;
