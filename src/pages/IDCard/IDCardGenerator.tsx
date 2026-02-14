import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import API_BASE_URL from "@/config/api";

interface MemberData {
  _id: string;
  name: string;
  idCardNumber: string;
  dob: string;
  bloodGroup: string;
  phone: string;
  address: string;
  fathersName: string;
  photo: string;
  idCardGeneratedAt: string;
  idCardRole?: string;
  role?: string;
}

const IDCardGenerator = () => {
  const { id } = useParams();
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchMemberData();
    }
  }, [id]);

  const fetchMemberData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/id-card-data/${id}`);
      
      if (!response.ok) {
        throw new Error('ID card not found');
      }

      const data = await response.json();
      setMemberData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ID card');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatValidDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (isLoading) {
    return (
      <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: "#e0e0e0", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 10px" }}>
        <div style={{ textAlign: "center", color: "#003366" }}>
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>Loading ID Card...</div>
          <div style={{ fontSize: "14px", opacity: 0.7 }}>Please wait</div>
        </div>
      </div>
    );
  }

  if (error || !memberData) {
    return (
      <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: "#e0e0e0", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 10px" }}>
        <div style={{ textAlign: "center", color: "#C62828" }}>
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>⚠️ Error</div>
          <div style={{ fontSize: "14px" }}>{error || 'ID card not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: "#e0e0e0", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "20px 10px" }}>
      <Seo
        title="ID Card Generator"
        description="SP Kabaddi Group Dhanbad Member ID Card"
        url="https://spkabaddi.me/id-card"
        keywords="SP Kabaddi Group Dhanbad ID card, member card"
      />
      
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>
        {/* ================= ID Card Front ================= */}
        <div style={{
          width: "210px",
          height: "330px",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 25px rgba(0, 20, 40, 0.12)",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          position: "relative"
        }}>
          {/* Card Top Section */}
          <div style={{
            background: "linear-gradient(135deg, #00579B, #003366)",
            padding: "9px 11px",
            display: "flex",
            alignItems: "center",
            position: "relative",
            zIndex: 1
          }}>
            <img src="/Logo.png" alt="Logo" style={{
              width: "30px",
              height: "30px",
              objectFit: "contain",
              marginRight: "7px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.05)",
              padding: "1.5px"
            }} />
            <h1 style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#FFFFFF",
              margin: 0,
              lineHeight: 1.2
            }}>SP Kabaddi Group</h1>
          </div>

          {/* Card Photo Section */}
          <div style={{
            marginTop: "-8px",
            textAlign: "center",
            position: "relative",
            zIndex: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}>
            <img src={memberData.photo} alt="Profile" style={{
              width: "89px",
              height: "102px",
              objectFit: "cover",
              border: "3px solid #ffffff",
              borderRadius: "50%",
              boxShadow: "0 3px 9px rgba(0, 0, 0, 0.1)",
              backgroundColor: "#e0e0e0",
              display: "block",
              margin: "0 auto"
            }} />
          </div>

          {/* Card Details Section */}
          <div style={{
            padding: "7px 15px 9px 15px", // Increased side padding slightly
            textAlign: "center",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start" 
          }}>
            <h2 style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#003366",
              marginBottom: "1px",
              marginTop: "5px"
            }}>{memberData.name}</h2>
            <p style={{
              fontSize: "8.5px",
              fontWeight: 500,
              color: "#FF6F00",
              marginBottom: "5px", 
              textTransform: "uppercase",
              letterSpacing: "0.3px"
            }}>{(memberData.idCardRole || memberData.role || 'Member').toUpperCase()}</p>
            
            {/* --- ADDED ID NUMBER HERE --- */}
            <div style={{ marginBottom: "10px", background: "#f5f5f5", display: "inline-block", padding: "2px 8px", borderRadius: "4px", alignSelf: "center" }}>
               <span style={{ fontSize: "9px", fontWeight: 700, color: "#555" }}>ID: </span>
               <span style={{ fontSize: "11px", fontWeight: 800, color: "#003366" }}>{memberData.idCardNumber}</span>
            </div>

            {/* Grid Container for Info Fields */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "35px 1fr", // Fixed width for labels, rest for content
              gap: "4px 0",
              textAlign: "left",
              alignItems: "baseline" // Aligns text nicely
            }}>
              <span style={{ fontWeight: 600, color: "#333", fontSize: "8px" }}>DOB:</span>
              <span style={{ fontWeight: 500, color: "#111", wordWrap: "break-word", fontSize: "8.5px" }}>{formatDate(memberData.dob)}</span>

              <span style={{ fontWeight: 600, color: "#333", fontSize: "8px" }}>Blood:</span>
              <span style={{ fontWeight: 700, color: "#C62828", wordWrap: "break-word", fontSize: "8.5px" }}>{memberData.bloodGroup}</span>

              <span style={{ fontWeight: 600, color: "#333", fontSize: "8px" }}>Phone:</span>
              <span style={{ fontWeight: 500, color: "#111", wordWrap: "break-word", fontSize: "8.5px" }}>{memberData.phone}</span>

              {/* Address takes full width or uses grid to wrap */}
              <span style={{ fontWeight: 600, color: "#333", fontSize: "8px", alignSelf: "start" }}>Address:</span>
              <span style={{ fontWeight: 500, color: "#111", wordWrap: "break-word", fontSize: "8px", lineHeight: 1.2 }}>{memberData.address}</span>

              <span style={{ fontWeight: 600, color: "#333", fontSize: "8px", alignSelf: "start" }}>Father:</span>
              <span style={{ fontWeight: 500, color: "#111", wordWrap: "break-word", fontSize: "8px" }}>{memberData.fathersName}</span>
            </div>
          </div>
          
          {/* Card Bottom Bar */}
          <div style={{
            height: "5px",
            background: "linear-gradient(135deg, #FF8F00, #FF6F00)",
            marginTop: "auto"
          }}></div>
        </div>

        {/* ================= ID Card Back ================= */}
        <div style={{
          width: "210px",
          height: "330px",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 25px rgba(0, 20, 40, 0.12)",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          position: "relative"
        }}>
          {/* Back Top Section */}
          <div style={{
            background: "linear-gradient(135deg, #00579B, #003366)",
            color: "#ffffff",
            textAlign: "center",
            padding: "7px 9px"
          }}>
            <h3 style={{
              fontSize: "11.5px",
              fontWeight: 600,
              marginBottom: "1px"
            }}>SP Kabaddi Group</h3>
            <p style={{
              fontSize: "8px",
              fontWeight: 400,
              opacity: 0.9
            }}>Estd. 2017</p>
          </div>

          {/* Back Main Content */}
          <div style={{
            padding: "9px 11px",
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            fontSize: "8.5px",
            color: "#333",
            lineHeight: 1.25
          }}>
            <h4 style={{
              fontSize: "9.5px",
              fontWeight: 600,
              color: "#003366",
              marginBottom: "3.5px",
              textAlign: "center"
            }}>About the Club</h4>
            <p style={{
              textAlign: "center",
              marginBottom: "7px",
              fontSize: "8px",
              lineHeight: 1.2,
              color: "#444"
            }}>Dedicated to fostering Kabaddi talent. We emphasize skill, fitness, strategy, and sportsmanship.</p>

            {/* QR Section - Only appearing here now */}
            <div style={{
              textAlign: "center",
              margin: "5px 0"
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=65x65&data=ID: ${memberData.idCardNumber}%0AName: ${encodeURIComponent(memberData.name)}%0AFather: ${encodeURIComponent(memberData.fathersName)}%0ADOB: ${formatDate(memberData.dob)}%0ABlood: ${encodeURIComponent(memberData.bloodGroup)}%0APhone: ${memberData.phone}%0AAddress: ${encodeURIComponent(memberData.address)}`} 
                alt="QR Code" 
                style={{
                  width: "65px",
                  height: "65px",
                  border: "1.5px solid #004A99",
                  borderRadius: "2.5px",
                  margin: "0 auto 3.5px auto",
                  display: "block",
                  backgroundColor: "#fff"
                }} 
              />
              <p style={{
                fontSize: "8px",
                fontWeight: 500,
                color: "#003366"
              }}>Scan for Details</p>
            </div>

            {/* Issuing Info */}
            <div style={{
              fontSize: "8px",
              textAlign: "center",
              margin: "5px 0 2.5px 0",
              paddingTop: "5px",
              borderTop: "1px dashed #004A99",
              color: "#444"
            }}>
              <p><strong style={{ color: "#003366" }}>Issued By:</strong> Club Authority</p>
              <p><strong style={{ color: "#003366" }}>Valid From:</strong> {formatValidDate(memberData.idCardGeneratedAt)}</p>
            </div>
            <div style={{
              fontSize: "8px",
              textAlign: "center",
              margin: "2.5px 0 5px 0",
              color: "#444",
              wordWrap: "break-word",
              lineHeight: 1.2
            }}>
              <p><strong style={{ color: "#003366" }}>Venue:</strong> Gandhiroad Hanuman Mandir, Dhanbad - 826001</p>
            </div>

            {/* Contact Info */}
            <div style={{
              fontSize: "7.5px",
              textAlign: "center",
              color: "#555",
              marginTop: "auto",
              paddingTop: "5px",
              borderTop: "1px solid #FF8F00",
              lineHeight: 1.2,
              wordWrap: "break-word"
            }}>
              <p>If found, please return to Club Office or call: +91 8271882034</p>
              <p>spkabaddigroupdhanbad@gmail.com</p>
            </div>
          </div>
          {/* Card Bottom Bar */}
          <div style={{
            height: "4.5px",
            background: "linear-gradient(135deg, #FF8F00, #FF6F00)"
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default IDCardGenerator;