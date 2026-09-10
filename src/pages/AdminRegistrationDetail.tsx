import { useState, useEffect, useMemo, useCallback, type ChangeEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Trash2, CreditCard, ExternalLink, Edit3, Save, X, FileCheck, Clock, ShieldCheck, Award, Mail } from "lucide-react";
import API_BASE_URL, { API_ENDPOINTS } from "@/config/api";
import { initializeSessionManager, clearSession } from "@/utils/adminSessionManager";
import { KIT_SIZE_OPTIONS, formatKitSizeWithRange } from "@/utils/kitSizes";
import NocCountdownBanner from "@/components/NocCountdownBanner";
import NocCertificateModal, { NocCertificateData, downloadNocPdfFromData } from "@/components/NocCertificateModal";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

// Function to calculate age group from DOB
const calculateAgeGroup = (dob: string): string => {
  if (!dob) return 'N/A';
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 10) return 'Under 10';
  if (age < 14) return '10-14';
  if (age < 16) return '14-16';
  if (age < 19) return '16-19';
  if (age < 25) return '19-25';
  return 'Over 25';
};

const formatDisplayDate = (dateStr?: string | Date | null): string => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime())
    ? "N/A"
    : d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

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
  idCardNumber?: string;
  idCardGeneratedAt?: string;
  kitSize?: string;
  kitSizeSelectedAt?: string;
  jerseyNumber?: number | null;
  jerseyAssignedAt?: string;
  noc?: {
    status?: 'none' | 'applied' | 'approved' | 'relieved';
    appliedAt?: string;
    coolingEndsAt?: string;
    generatedAt?: string;
    expiresAt?: string;
    nocNumber?: string;
    reason?: string;
    destinationClub?: string;
    appliedByAdmin?: string;
    generatedByAdmin?: string;
    isBypassed?: boolean;
    bypassedBy?: string;
    digitalSignatureHash?: string;
    downloadCount?: number;
    lastDownloadedAt?: string;
  };
}

interface EditRegistrationForm {
  name: string;
  fathersName: string;
  email: string;
  phone: string;
  parentsPhone: string;
  gender: string;
  bloodGroup: string;
  role: string;
  dob: string;
  aadharNumber: string;
  address: string;
  clubDetails: string;
  message: string;
  kitSize: string;
  jerseyNumber: string;
  kabaddiPositions: string;
  newsletter: boolean;
  terms: boolean;
}

const toEditForm = (registration: Registration): EditRegistrationForm => ({
  name: registration.name || "",
  fathersName: registration.fathersName || "",
  email: registration.email || "",
  phone: registration.phone || "",
  parentsPhone: registration.parentsPhone || "",
  gender: registration.gender || "",
  bloodGroup: registration.bloodGroup || "",
  role: registration.role || "",
  dob: registration.dob ? new Date(registration.dob).toISOString().split("T")[0] : "",
  aadharNumber: registration.aadharNumber || "",
  address: registration.address || "",
  clubDetails: registration.clubDetails || "",
  message: registration.message || "",
  kitSize: registration.kitSize || "",
  jerseyNumber: registration.jerseyNumber ? String(registration.jerseyNumber) : "",
  kabaddiPositions: Array.isArray(registration.kabaddiPositions)
    ? registration.kabaddiPositions.join(", ")
    : "",
  newsletter: Boolean(registration.newsletter),
  terms: Boolean(registration.terms),
});

const RegistrationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [editForm, setEditForm] = useState<EditRegistrationForm | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [aadharFrontFile, setAadharFrontFile] = useState<File | null>(null);
  const [aadharBackFile, setAadharBackFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [aadharFrontPreview, setAadharFrontPreview] = useState<string>("");
  const [aadharBackPreview, setAadharBackPreview] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(false);
  const [customIdNumber, setCustomIdNumber] = useState("");
  const [showIdDialog, setShowIdDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [isSavingRoleEdit, setIsSavingRoleEdit] = useState(false);
  const [roleSelection, setRoleSelection] = useState("");
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [editableIdNumber, setEditableIdNumber] = useState("");
  const [adminUser, setAdminUser] = useState<{ username?: string; role?: string } | null>(null);
  // Role selection for ID card
  const [idCardRole, setIdCardRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  // Default role options (can be extended)
  const defaultRoles = [
    "Player",
    "Coach",
    "Team Manager",
    "Fan",
    "Manager",
    "Referee",
    "Captain",
    "Member",
    "Physio",
    "Analyst",
    "Other"
  ];

  const token = localStorage.getItem("adminToken");
  const isSuperAdmin = useMemo(() => {
    const role = (adminUser?.role || "").toLowerCase().trim();
    return role === "super admin" || role === "superadmin" || role === "super_admin";
  }, [adminUser]);

  const [showNocApplyDialog, setShowNocApplyDialog] = useState(false);
  const [nocReason, setNocReason] = useState("");
  const [nocDestinationClub, setNocDestinationClub] = useState("");
  const [isApplyingNoc, setIsApplyingNoc] = useState(false);
  const [isBypassingNoc, setIsBypassingNoc] = useState(false);
  const [isCancellingNoc, setIsCancellingNoc] = useState(false);
  const [showNocCertModal, setShowNocCertModal] = useState(false);
  const [nocCertData, setNocCertData] = useState<NocCertificateData | null>(null);
  const [isLoadingNocCert, setIsLoadingNocCert] = useState(false);

  const handleApplyNoc = async () => {
    if (!token || !id) return;
    setIsApplyingNoc(true);
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_NOC_APPLY(id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: nocReason.trim(),
          destinationClub: nocDestinationClub.trim(),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to initiate NOC");
      }
      toast({
        title: "NOC Initiated",
        description: "14-day cooling countdown has started. Official notice email sent to the member.",
      });
      setShowNocApplyDialog(false);
      setNocReason("");
      setNocDestinationClub("");
      await fetchRegistration();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not initiate NOC",
        variant: "destructive",
      });
    } finally {
      setIsApplyingNoc(false);
    }
  };

  const handleBypassNoc = async () => {
    if (!token || !id) return;
    const confirmBypass = window.confirm(
      "⚡ Super Admin Bypass:\n\nAre you sure you want to immediately bypass the 14-day cooling period and generate the official NOC certificate right now?"
    );
    if (!confirmBypass) return;

    setIsBypassingNoc(true);
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_NOC_BYPASS(id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to bypass NOC");
      }
      toast({
        title: "NOC Certificate Generated!",
        description: `Certificate ${data.noc?.nocNumber || ""} generated instantly via Super Admin bypass. Email sent to member.`,
      });
      await fetchRegistration();
    } catch (err: unknown) {
      toast({
        title: "Bypass Error",
        description: err instanceof Error ? err.message : "Could not bypass cooling period",
        variant: "destructive",
      });
    } finally {
      setIsBypassingNoc(false);
    }
  };

  const handleCancelNoc = async () => {
    if (!token || !id) return;
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this pending NOC request? The countdown will stop and the member will return to normal active standing."
    );
    if (!confirmCancel) return;

    setIsCancellingNoc(true);
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_NOC_CANCEL(id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel NOC");
      }
      toast({
        title: "NOC Cancelled",
        description: "The NOC request has been withdrawn.",
      });
      await fetchRegistration();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not cancel NOC",
        variant: "destructive",
      });
    } finally {
      setIsCancellingNoc(false);
    }
  };

  const [isResendingNocEmail, setIsResendingNocEmail] = useState(false);

  const handleResendNocEmail = async () => {
    if (!token || !id) return;
    setIsResendingNocEmail(true);
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_NOC_RESEND_EMAIL(id), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to resend NOC email");
      }
      toast({
        title: "NOC Email Sent",
        description: data.message || "Official notice email has been resent to member and CC/BCC recipients.",
      });
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not resend NOC email",
        variant: "destructive",
      });
    } finally {
      setIsResendingNocEmail(false);
    }
  };

  const handleDirectDownloadNoc = async () => {
    if (!token || !id) return;
    setIsLoadingNocCert(true);
    toast({
      title: "Preparing Official NOC",
      description: "Compiling 1-page institutional letterhead certificate...",
    });
    try {
      let certData = nocCertData;
      if (!certData) {
        const response = await fetch(API_ENDPOINTS.ADMIN_NOC_CERTIFICATE(id), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch NOC certificate");
        }
        certData = data;
        setNocCertData(data);
      }
      await downloadNocPdfFromData(certData);
      await fetchRegistration();
      toast({
        title: "Download Complete",
        description: "Official 1-page NOC certificate downloaded successfully.",
      });
    } catch (err: unknown) {
      toast({
        title: "Download Error",
        description: err instanceof Error ? err.message : "Failed to generate certificate",
        variant: "destructive",
      });
    } finally {
      setIsLoadingNocCert(false);
    }
  };

  const handleViewNocCertificate = async () => {
    if (!token || !id) return;
    setIsLoadingNocCert(true);
    try {
      const response = await fetch(API_ENDPOINTS.ADMIN_NOC_CERTIFICATE(id), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch NOC certificate");
      }
      setNocCertData(data);
      setShowNocCertModal(true);
    } catch (err: unknown) {
      toast({
        title: "Certificate Error",
        description: err instanceof Error ? err.message : "Failed to load certificate",
        variant: "destructive",
      });
    } finally {
      setIsLoadingNocCert(false);
    }
  };

  const fetchRegistration = useCallback(async () => {
    if (!token || !id) return;
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
  }, [id, token, toast]);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const admin = localStorage.getItem("adminUser");
    if (admin) {
      setAdminUser(JSON.parse(admin));
    }

    fetchRegistration();

    // Initialize session timeout manager
    const cleanup = initializeSessionManager(
      () => {
        clearSession();
        // Clear registration data to prevent stale API calls
        setRegistration(null);
        navigate("/admin/login");
      },
      () => {
        setShowTimeoutDialog(true);
        setCountdown(5);
      }
    );

    return cleanup;
  }, [token, navigate, fetchRegistration]);

  // Countdown timer for timeout dialog
  useEffect(() => {
    if (showTimeoutDialog && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showTimeoutDialog, countdown]);

  useEffect(() => {
    if (!registration) return;
    setEditForm(toEditForm(registration));
    setPhotoPreview(registration.photo || "");
    setAadharFrontPreview(registration.aadharFront || "");
    setAadharBackPreview(registration.aadharBack || "");
  }, [registration]);

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
        description: "Registration rejected successfully",
      });
      setShowRejectDialog(false);
      setRejectionReason("");
      fetchRegistration();
    } catch (error) {
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
    if (!isSuperAdmin) {
      toast({
        title: "Permission Denied",
        description: "Only super admins can delete player registrations.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to permanently delete this registration? This cannot be undone.")) {
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
      setTimeout(() => navigate("/admin/dashboard"), 1200);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    field: "photo" | "aadharFront" | "aadharBack",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file (JPG, PNG, WEBP).",
        variant: "destructive",
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (field === "photo") {
      setPhotoFile(file);
      setPhotoPreview(previewUrl);
      return;
    }

    if (field === "aadharFront") {
      setAadharFrontFile(file);
      setAadharFrontPreview(previewUrl);
      return;
    }

    setAadharBackFile(file);
    setAadharBackPreview(previewUrl);
  };

  const startEditing = () => {
    if (!registration) return;
    setEditForm(toEditForm(registration));
    setPhotoFile(null);
    setAadharFrontFile(null);
    setAadharBackFile(null);
    setPhotoPreview(registration.photo || "");
    setAadharFrontPreview(registration.aadharFront || "");
    setAadharBackPreview(registration.aadharBack || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (!registration) return;
    setEditForm(toEditForm(registration));
    setPhotoFile(null);
    setAadharFrontFile(null);
    setAadharBackFile(null);
    setPhotoPreview(registration.photo || "");
    setAadharFrontPreview(registration.aadharFront || "");
    setAadharBackPreview(registration.aadharBack || "");
    setIsEditing(false);
  };

  const openRoleDialog = () => {
    const currentRole = (registration?.role || "").trim();
    const matchingRole = defaultRoles.find(
      (role) => role.toLowerCase() === currentRole.toLowerCase(),
    );

    if (matchingRole && matchingRole !== "Other") {
      setRoleSelection(matchingRole);
      setCustomRoleInput("");
    } else {
      setRoleSelection("Other");
      setCustomRoleInput(currentRole);
    }

    setEditableIdNumber(registration?.idCardNumber || "");
    setShowRoleDialog(true);
  };

  const handleSaveRoleAndId = async () => {
    if (!token || !id) return;

    const finalRole =
      roleSelection === "Other" ? customRoleInput.trim() : roleSelection.trim();

    if (!finalRole) {
      toast({
        title: "Validation error",
        description: "Please select or enter a valid role.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingRoleEdit(true);
    try {
      const payload = new FormData();
      payload.append("role", finalRole);

      if (registration?.status === "approved") {
        payload.append("idCardRole", finalRole);
        payload.append("idCardNumber", editableIdNumber.trim());
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/registrations/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to update role details");
      }

      toast({
        title: "Success",
        description: "Role details updated successfully.",
      });

      setShowRoleDialog(false);
      await fetchRegistration();
    } catch (error) {
      toast({
        title: "Update failed",
        description:
          error instanceof Error ? error.message : "Failed to update role details",
        variant: "destructive",
      });
    } finally {
      setIsSavingRoleEdit(false);
    }
  };

  const saveEdit = async () => {
    if (!token || !id || !editForm) return;

    setIsSavingEdit(true);
    try {
      const payload = new FormData();
      payload.append("name", editForm.name.trim());
      payload.append("fathersName", editForm.fathersName.trim());
      payload.append("email", editForm.email.trim());
      payload.append("phone", editForm.phone.trim());
      payload.append("parentsPhone", editForm.parentsPhone.trim());
      payload.append("gender", editForm.gender);
      payload.append("bloodGroup", editForm.bloodGroup);
      payload.append("role", editForm.role.trim());
      payload.append("dob", editForm.dob);
      payload.append("aadharNumber", editForm.aadharNumber.trim());
      payload.append("address", editForm.address.trim());
      payload.append("clubDetails", editForm.clubDetails.trim());
      payload.append("message", editForm.message.trim());
      payload.append("kitSize", editForm.kitSize);
      payload.append("jerseyNumber", editForm.jerseyNumber.trim());
      payload.append("newsletter", String(editForm.newsletter));
      payload.append("terms", String(editForm.terms));

      const positions = editForm.kabaddiPositions
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      payload.append("kabaddiPositions", JSON.stringify(positions));

      if (photoFile) {
        payload.append("photo", photoFile);
        payload.append("oldPhoto", registration?.photo || "");
      }
      if (aadharFrontFile) {
        payload.append("aadharFront", aadharFrontFile);
        payload.append("oldAadharFront", registration?.aadharFront || "");
      }
      if (aadharBackFile) {
        payload.append("aadharBack", aadharBackFile);
        payload.append("oldAadharBack", registration?.aadharBack || "");
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/registrations/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to update registration");
      }

      await fetchRegistration();
      setIsEditing(false);
      setPhotoFile(null);
      setAadharFrontFile(null);
      setAadharBackFile(null);

      toast({
        title: "Success",
        description: "Registration updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not update registration. Ensure backend supports full edit and Cloudinary replacement.",
        variant: "destructive",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleGenerateId = async () => {
    setIsGeneratingId(true);
    try {
      // Determine final role to send
      let finalRole = idCardRole === 'custom' ? customRole.trim() : idCardRole;
      if (!finalRole) finalRole = registration?.role || "Member";
      const response = await fetch(
        `${API_BASE_URL}/api/admin/registrations/${id}/generate-id`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customIdNumber: customIdNumber.trim() || null,
            idCardRole: finalRole
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Failed to generate ID' }));
        throw new Error(data.message || "Failed to generate ID");
      }

      const data = await response.json();
      toast({
        title: "Success",
        description: `ID Card generated successfully: ${data.idCardNumber} (${data.type === 'custom' ? 'Custom' : 'Random'})`,
      });
      setShowIdDialog(false);
      setCustomIdNumber("");
      setIdCardRole("");
      setCustomRole("");
      // Refresh registration data
      fetchRegistration();
    } catch (error) {
      console.error('Generate ID error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate ID",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingId(false);
    }
  };

  const handleDeleteId = async () => {
    if (!confirm('Delete ID card for this member? This will remove the ID number permanently.')) {
      return;
    }

    setIsDeletingId(true);
    try {
      console.log('Deleting ID for registration:', id);
      const response = await fetch(
        `${API_BASE_URL}/api/admin/registrations/${id}/delete-id`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log('Delete ID response status:', response.status);

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Failed to delete ID' }));
        console.error('Delete ID error response:', data);
        throw new Error(data.message || "Failed to delete ID");
      }

      const data = await response.json();
      console.log('Delete ID success:', data);

      toast({
        title: "Success",
        description: `ID Card deleted successfully: ${data.deletedIdCardNumber}`,
      });

      // Refresh registration data
      fetchRegistration();
    } catch (error) {
      console.error('Delete ID error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete ID",
        variant: "destructive",
      });
    } finally {
      setIsDeletingId(false);
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
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")} className="shrink-0 h-9 w-9 p-0">
              <ArrowLeft size={20} />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold break-words text-slate-900 leading-tight">{registration.name}</h1>
              <p className="text-gray-500 text-xs sm:text-sm truncate">{registration.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
            {registration.noc?.status && registration.noc.status !== "none" && (
              <Button
                variant="outline"
                size="sm"
                className="border-indigo-300 bg-indigo-50/50 text-indigo-800 hover:bg-indigo-100 font-semibold text-xs h-8"
                onClick={handleResendNocEmail}
                disabled={isResendingNocEmail}
                title="Resend NOC email with CC and BCC integration"
              >
                <Mail className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                {isResendingNocEmail ? "Sending Notice..." : "Resend NOC Mail"}
              </Button>
            )}
            {getStatusBadge(registration.status)}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 min-w-0">
            {/* Photo */}
            {(registration.photo || isEditing) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Passport Size Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {photoPreview ? (
                      <div className="relative mx-auto sm:mx-0">
                        <img
                          src={photoPreview}
                          alt="Passport"
                          className="w-40 h-48 sm:w-48 sm:h-56 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow">
                          {photoFile ? "Updated" : "Uploaded"}
                        </div>
                      </div>
                    ) : (
                      <div className="w-40 h-48 sm:w-48 sm:h-56 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500">
                        No photo
                      </div>
                    )}

                    <div className="flex-1 space-y-3">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-700 mb-2">Photo Details</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><span className="font-medium">Format:</span> JPG/PNG/WEBP</p>
                          <p><span className="font-medium">Storage:</span> Cloudinary</p>
                        </div>
                      </div>
                      {photoPreview && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(photoPreview, "_blank")}
                        >
                          <Download size={18} className="mr-2" />
                          Download Photo
                        </Button>
                      )}
                      {isEditing && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Replace photo</label>
                          <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "photo")} />
                          <p className="text-xs text-gray-500">Upload a new file to replace the existing Cloudinary photo.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Aadhar Documents */}
            {(registration.aadharFront || registration.aadharBack || isEditing) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Aadhar Card Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3 bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-blue-900">Front Side</h3>
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                          {aadharFrontFile ? "Updated" : "Uploaded"}
                        </span>
                      </div>
                      {aadharFrontPreview ? (
                        <img
                          src={aadharFrontPreview}
                          alt="Aadhar Front"
                          className="w-full h-48 object-contain rounded-lg border-2 border-white shadow-lg bg-white"
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center rounded-lg border-2 border-dashed border-blue-300 bg-white text-sm text-blue-700">
                          No front side uploaded
                        </div>
                      )}
                      {aadharFrontPreview && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-white hover:bg-blue-50 text-blue-700 border-blue-300 font-medium"
                          onClick={() => window.open(aadharFrontPreview, "_blank")}
                        >
                          <Download size={16} className="mr-2" />
                          Download Front Side
                        </Button>
                      )}
                      {isEditing && (
                        <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "aadharFront")} />
                      )}
                    </div>

                    <div className="space-y-3 bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-2 border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-purple-900">Back Side</h3>
                        <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                          {aadharBackFile ? "Updated" : "Uploaded"}
                        </span>
                      </div>
                      {aadharBackPreview ? (
                        <img
                          src={aadharBackPreview}
                          alt="Aadhar Back"
                          className="w-full h-48 object-contain rounded-lg border-2 border-white shadow-lg bg-white"
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center rounded-lg border-2 border-dashed border-purple-300 bg-white text-sm text-purple-700">
                          No back side uploaded
                        </div>
                      )}
                      {aadharBackPreview && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full bg-white hover:bg-purple-50 text-purple-700 border-purple-300 font-medium"
                          onClick={() => window.open(aadharBackPreview, "_blank")}
                        >
                          <Download size={16} className="mr-2" />
                          Download Back Side
                        </Button>
                      )}
                      {isEditing && (
                        <Input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "aadharBack")} />
                      )}
                    </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    {isEditing ? (
                      <Input
                        value={editForm?.name || ""}
                        onChange={(e) => setEditForm((prev) => prev ? { ...prev, name: e.target.value } : prev)}
                      />
                    ) : (
                      <p className="font-medium">{registration.name}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Father's Name</p>
                    {isEditing ? (
                      <Input
                        value={editForm?.fathersName || ""}
                        onChange={(e) => setEditForm((prev) => prev ? { ...prev, fathersName: e.target.value } : prev)}
                      />
                    ) : (
                      <p className="font-medium">{registration.fathersName || "N/A"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editForm?.email || ""}
                        onChange={(e) => setEditForm((prev) => prev ? { ...prev, email: e.target.value } : prev)}
                      />
                    ) : (
                      <p className="font-medium">{registration.email}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    {isEditing ? (
                      <Input
                        value={editForm?.phone || ""}
                        onChange={(e) => setEditForm((prev) => prev ? { ...prev, phone: e.target.value } : prev)}
                      />
                    ) : (
                      <p className="font-medium">{registration.phone || "N/A"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Parents Phone</p>
                    {isEditing ? (
                      <Input
                        value={editForm?.parentsPhone || ""}
                        onChange={(e) => setEditForm((prev) => prev ? { ...prev, parentsPhone: e.target.value } : prev)}
                      />
                    ) : (
                      <p className="font-medium">{registration.parentsPhone || "N/A"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    {isEditing ? (
                      <select
                        className="w-full border rounded-md px-3 py-2"
                        value={editForm?.gender || ""}
                        onChange={(e) => setEditForm((prev) => prev ? { ...prev, gender: e.target.value } : prev)}
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="font-medium capitalize">{registration.gender || "N/A"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Blood Group</p>
                    {isEditing ? (
                      <Input
                        value={editForm?.bloodGroup || ""}
                        onChange={(e) => setEditForm((prev) => prev ? { ...prev, bloodGroup: e.target.value } : prev)}
                      />
                    ) : (
                      <p className="font-medium">{registration.bloodGroup || "N/A"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    {isEditing ? (
                      <Input
                        type="date"
                        value={editForm?.dob || ""}
                        onChange={(e) => setEditForm((prev) => prev ? { ...prev, dob: e.target.value } : prev)}
                      />
                    ) : (
                      <p className="font-medium">{new Date(registration.dob).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age Group</p>
                    <p className="font-medium">{calculateAgeGroup(isEditing ? editForm?.dob || registration.dob : registration.dob)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Aadhar Number</p>
                    {isEditing ? (
                      <Input
                        value={editForm?.aadharNumber || ""}
                        onChange={(e) => setEditForm((prev) => prev ? { ...prev, aadharNumber: e.target.value } : prev)}
                      />
                    ) : (
                      <p className="font-medium">{registration.aadharNumber}</p>
                    )}
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
                  {isEditing ? (
                    <Input
                      value={editForm?.role || ""}
                      onChange={(e) => setEditForm((prev) => prev ? { ...prev, role: e.target.value } : prev)}
                    />
                  ) : (
                    <p className="font-medium">{registration.role}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kit Size</p>
                  {isEditing ? (
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={editForm?.kitSize || ""}
                      onChange={(e) => setEditForm((prev) => prev ? { ...prev, kitSize: e.target.value } : prev)}
                    >
                      <option value="">Not selected</option>
                      {KIT_SIZE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.value} ({option.range})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <p className="font-medium">{formatKitSizeWithRange(registration.kitSize)}</p>
                      {registration.kitSize ? (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Selected Date: {formatDisplayDate(registration.kitSizeSelectedAt || registration.registeredAt)}
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jersey Number</p>
                  {isEditing ? (
                    <Input
                      type="number"
                      min={1}
                      max={99}
                      value={editForm?.jerseyNumber || ""}
                      onChange={(e) => setEditForm((prev) => prev ? { ...prev, jerseyNumber: e.target.value } : prev)}
                    />
                  ) : (
                    <>
                      <p className="font-medium">{registration.jerseyNumber ?? "Not assigned"}</p>
                      {registration.jerseyNumber != null ? (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Assigned Date: {formatDisplayDate(registration.jerseyAssignedAt || registration.registeredAt)}
                        </p>
                      ) : null}
                    </>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Club Details</p>
                  {isEditing ? (
                    <Textarea
                      value={editForm?.clubDetails || ""}
                      onChange={(e) => setEditForm((prev) => prev ? { ...prev, clubDetails: e.target.value } : prev)}
                    />
                  ) : (
                    <p className="font-medium">{registration.clubDetails}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  {isEditing ? (
                    <Textarea
                      value={editForm?.address || ""}
                      onChange={(e) => setEditForm((prev) => prev ? { ...prev, address: e.target.value } : prev)}
                    />
                  ) : (
                    <p className="font-medium">{registration.address || "N/A"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kabaddi Positions</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editForm?.kabaddiPositions || ""}
                    onChange={(e) => setEditForm((prev) => prev ? { ...prev, kabaddiPositions: e.target.value } : prev)}
                    placeholder="Raider, Left Corner, Right Cover"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {(registration.kabaddiPositions || []).length > 0 ? (
                      registration.kabaddiPositions.map((pos) => (
                        <Badge key={pos} variant="secondary">{pos}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No positions selected</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Message</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editForm?.message || ""}
                    onChange={(e) => setEditForm((prev) => prev ? { ...prev, message: e.target.value } : prev)}
                  />
                ) : (
                  <p>{registration.message || "No message provided"}</p>
                )}
              </CardContent>
            </Card>

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
          <div className="lg:col-span-5 xl:col-span-4 space-y-6 min-w-0">
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

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Edit Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isEditing ? (
                  <>
                    <Button className="w-full" variant="outline" onClick={startEditing}>
                      <Edit3 size={16} className="mr-2" />
                      Edit All Details
                    </Button>
                    <Button className="w-full" variant="outline" onClick={openRoleDialog}>
                      <Edit3 size={16} className="mr-2" />
                      Edit Role & ID
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={saveEdit}
                      disabled={isSavingEdit}
                    >
                      <Save size={16} className="mr-2" />
                      {isSavingEdit ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button className="w-full" variant="outline" onClick={cancelEditing} disabled={isSavingEdit}>
                      <X size={16} className="mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
                <p className="text-xs text-gray-500">
                  Edit profile, documents, Aadhaar details, club information, and engagement settings.
                </p>
              </CardContent>
            </Card>

            <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
              <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Role & ID Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Player Role</label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={roleSelection}
                      onChange={(e) => setRoleSelection(e.target.value)}
                    >
                      <option value="">Select role</option>
                      {defaultRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {roleSelection === "Other" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Custom Role</label>
                      <Input
                        value={customRoleInput}
                        onChange={(e) => setCustomRoleInput(e.target.value)}
                        placeholder="Enter custom role"
                      />
                    </div>
                  )}

                  {registration?.status === "approved" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">ID Card Number</label>
                      <Input
                        value={editableIdNumber}
                        onChange={(e) => setEditableIdNumber(e.target.value)}
                        placeholder="e.g., SPKG-1234"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        You can update ID card number for approved registrations.
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveRoleAndId} disabled={isSavingRoleEdit}>
                    {isSavingRoleEdit ? "Saving..." : "Save"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {registration.status !== "approved" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Approval Action</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleApprove}
                  >
                    {registration.status === "pending" ? "Approve Registration" : "Approve This Application"}
                  </Button>
                  <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Reject Registration
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
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

            {registration.status === 'approved' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Approval Review</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Reject This Approval
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Reject Approved Registration</DialogTitle>
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

            {isSuperAdmin && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Delete Registration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="destructive" className="w-full" onClick={handleDelete}>
                    <Trash2 size={16} className="mr-2" />
                    Delete Permanently
                  </Button>
                  <p className="text-xs text-gray-500">Only super admin can do this. This action cannot be undone.</p>
                </CardContent>
              </Card>
            )}

            {/* Actions for Approved Registrations */}
            {registration.status === 'approved' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">ID Card Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {registration.idCardNumber ? (
                      <>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-green-800">ID Card Generated</p>
                            <Badge className="bg-green-600">Active</Badge>
                          </div>
                          <p className="text-lg font-bold text-green-900">{registration.idCardNumber}</p>
                          <p className="text-xs text-green-700">
                            Generated: {formatDisplayDate(registration.idCardGeneratedAt || registration.registeredAt)}
                          </p>
                        </div>
                        <Link to={`/id-card/${registration._id}`} target="_blank">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            <ExternalLink size={18} className="mr-2" />
                            View ID Card
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          className="w-full mt-2"
                          onClick={handleDeleteId}
                          disabled={isDeletingId}
                        >
                          <Trash2 size={18} className="mr-2" />
                          {isDeletingId ? "Deleting..." : "Delete ID Card"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                          <p className="text-sm text-amber-800">
                            <strong>Note:</strong> Generate a unique ID card number for this approved member.
                            You can provide a custom ID or leave it blank for a random 4-digit ID (e.g., SPKG-1234).
                          </p>
                        </div>
                        <Dialog open={showIdDialog} onOpenChange={setShowIdDialog}>
                          <DialogTrigger asChild>
                            <Button className="w-full bg-amber-600 hover:bg-amber-700">
                              <CreditCard size={18} className="mr-2" />
                              Generate ID Card
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Generate ID Card</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Custom ID Number (Optional)
                                </label>
                                <Input
                                  placeholder="e.g., SPKG-0001 or leave blank for random"
                                  value={customIdNumber}
                                  onChange={(e) => setCustomIdNumber(e.target.value)}
                                  className="w-full"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Leave blank to generate a random 4-digit ID like SPKG-4567
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-2 block">
                                  Role on ID Card
                                </label>
                                <select
                                  className="w-full border rounded px-2 py-1 text-sm"
                                  value={idCardRole || registration?.role || ""}
                                  onChange={e => setIdCardRole(e.target.value)}
                                >
                                  <option value="">(Use registration role: {registration?.role || 'Member'})</option>
                                  {defaultRoles.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                  ))}
                                  <option value="custom">Other (Custom)</option>
                                </select>
                                {idCardRole === 'custom' && (
                                  <Input
                                    className="mt-2"
                                    placeholder="Enter custom role (e.g., Organizer)"
                                    value={customRole}
                                    onChange={e => setCustomRole(e.target.value)}
                                  />
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Select a role for this member's ID card. You can add a custom role if needed.
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowIdDialog(false);
                                  setCustomIdNumber("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleGenerateId}
                                disabled={isGeneratingId}
                                className="bg-amber-600 hover:bg-amber-700"
                              >
                                {isGeneratingId ? "Generating..." : "Generate"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* No Objection Certificate (NOC) Card */}
                <Card className="border-indigo-200 overflow-hidden shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-3.5 px-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <CardTitle className="text-base font-bold flex items-center gap-2 text-white min-w-0">
                        <FileCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="truncate">No Objection Certificate (NOC)</span>
                      </CardTitle>
                      {registration.noc?.status === "applied" && (
                        <Badge className="bg-amber-500 hover:bg-amber-500 text-slate-950 font-bold text-[11px] animate-pulse shrink-0">
                          14-Day Cooling
                        </Badge>
                      )}
                      {registration.noc?.status === "approved" && (
                        <Badge className="bg-emerald-500 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] shrink-0">
                          Issued
                        </Badge>
                      )}
                      {registration.noc?.status === "relieved" && (
                        <Badge className="bg-slate-600 text-white text-[11px] shrink-0">
                          Relieved
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 space-y-3">
                    {(!registration.noc || registration.noc.status === "none") && (
                      <div className="space-y-3">
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Initiate clearance for this member. A <strong>mandatory 14-day cooling period</strong> will begin immediately with automated real-time countdown on both sides.
                        </p>
                        <Button
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                          onClick={() => setShowNocApplyDialog(true)}
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Initiate 14-Day NOC Clearance
                        </Button>
                      </div>
                    )}

                    {registration.noc?.status === "applied" && (
                      <div className="space-y-3 min-w-0 w-full overflow-hidden">
                        <NocCountdownBanner
                          noc={registration.noc}
                          playerName={registration.name}
                          isAdmin={true}
                          isSuperAdmin={isSuperAdmin}
                          onBypassClick={handleBypassNoc}
                          onCancelClick={handleCancelNoc}
                          onComplete={fetchRegistration}
                        />

                        {/* Direct Resend NOC Notice Email Section */}
                        <div className="bg-indigo-50/80 border border-indigo-200 rounded-lg p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-indigo-600" />
                              NOC Notice Email
                            </span>
                            <span className="text-[10px] bg-indigo-200/80 text-indigo-900 font-semibold px-2 py-0.5 rounded-full">
                              CC & BCC Integrated
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            Resend the official 14-day institutional cooling notification directly to player and administrative archives:
                          </p>
                          <div className="text-[10px] text-slate-600 bg-white/90 rounded p-2 border border-indigo-100 font-mono space-y-0.5">
                            <div><strong className="text-slate-800">To:</strong> {registration.email}</div>
                            <div><strong className="text-slate-800">CC:</strong> pappukrpappu.1234@gmail.com, spkabaddigroupdhanbad@gmail.com</div>
                            <div><strong className="text-slate-800">BCC:</strong> praveen.pr105@gmail.com</div>
                          </div>
                          <Button
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs"
                            onClick={handleResendNocEmail}
                            disabled={isResendingNocEmail}
                          >
                            <Mail className="w-3.5 h-3.5 mr-1.5" />
                            {isResendingNocEmail ? "Resending Notice Email..." : "Resend NOC Notice Email"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {registration.noc?.status === "approved" && (
                      <div className="space-y-3">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-800">Certificate Status</span>
                            <span className="text-xs font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                              {registration.noc.isBypassed ? "Generated (Bypassed)" : "Generated (Full Cooling)"}
                            </span>
                          </div>
                          <p className="text-sm font-mono font-bold text-emerald-950">
                            {registration.noc.nocNumber}
                          </p>
                          <div className="text-[11px] text-emerald-700 space-y-0.5 pt-1 border-t border-emerald-200/60">
                            <p>Issued: {registration.noc.generatedAt ? new Date(registration.noc.generatedAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" }) : "N/A"}</p>
                            {registration.noc.expiresAt && (
                              <p className="text-amber-800 font-medium">
                                Archival Deadline: {new Date(registration.noc.expiresAt).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" })}
                              </p>
                            )}
                            <p>Downloads: {registration.noc.downloadCount || 0} times</p>
                          </div>
                        </div>
                        <Button
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                          onClick={handleDirectDownloadNoc}
                          disabled={isLoadingNocCert}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {isLoadingNocCert ? "Downloading 1-Page NOC..." : "Download Official NOC (PDF)"}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full border-emerald-300 text-emerald-800 hover:bg-emerald-50 font-medium"
                          onClick={handleResendNocEmail}
                          disabled={isResendingNocEmail}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          {isResendingNocEmail ? "Resending Email..." : "Resend NOC Issuance Email"}
                        </Button>
                      </div>
                    )}

                    {registration.noc?.status === "relieved" && (
                      <div className="bg-slate-100 border border-slate-300 rounded-lg p-3 text-xs text-slate-700 space-y-1">
                        <p className="font-semibold text-slate-800">Member Relieved</p>
                        <p>This player has completed the NOC archival period and is no longer an active trainee.</p>
                        <p className="font-mono text-[11px] text-slate-600">NOC: {registration.noc.nocNumber}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Apply NOC Dialog */}
                <Dialog open={showNocApplyDialog} onOpenChange={setShowNocApplyDialog}>
                  <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-indigo-600" />
                        Initiate 14-Day NOC Process
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-900 leading-relaxed">
                        <strong>Mandatory 14-Day Notice:</strong> Once initiated, an automatic 14-day cooling period begins. The member will be notified by official email with a real-time countdown timer. Academy equipment, kits, and dues must be audited during this window.
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Reason for Leaving / Transfer
                        </label>
                        <Textarea
                          placeholder="e.g., Relocating to hometown / Joining university kabaddi squad / Personal reasons"
                          value={nocReason}
                          onChange={(e) => setNocReason(e.target.value)}
                          className="min-h-20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Destination Club / Academy / Institution (Optional)
                        </label>
                        <Input
                          placeholder="e.g., Delhi State Kabaddi Association / University Team"
                          value={nocDestinationClub}
                          onChange={(e) => setNocDestinationClub(e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowNocApplyDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                        onClick={handleApplyNoc}
                        disabled={isApplyingNoc}
                      >
                        {isApplyingNoc ? "Initiating..." : "Start 14-Day Cooling Timer"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {/* Engagement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Newsletter</span>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={Boolean(editForm?.newsletter)}
                        onChange={(e) =>
                          setEditForm((prev) => prev ? { ...prev, newsletter: e.target.checked } : prev)
                        }
                      />
                    ) : (
                      <Badge variant={registration.newsletter ? "default" : "outline"}>
                        {registration.newsletter ? "Subscribed" : "Not Subscribed"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Terms</span>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={Boolean(editForm?.terms)}
                        onChange={(e) =>
                          setEditForm((prev) => prev ? { ...prev, terms: e.target.checked } : prev)
                        }
                      />
                    ) : (
                      <Badge variant={registration.terms ? "default" : "outline"}>
                        {registration.terms ? "Agreed" : "Not Agreed"}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <NocCertificateModal
        open={showNocCertModal}
        onOpenChange={setShowNocCertModal}
        data={nocCertData}
        onDownloaded={fetchRegistration}
      />
    </div>
  );
};

export default RegistrationDetail;
