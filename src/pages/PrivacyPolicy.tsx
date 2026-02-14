import { Shield, Lock, Eye, Database, UserCheck, FileText, AlertTriangle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500/40 to-emerald-500/40 rounded-2xl mb-6">
            <Shield className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            SP Kabaddi Club is committed to protecting your personal information and privacy
          </p>
          <p className="text-sm text-slate-500 mt-4">Last Updated: December 8, 2025</p>
        </div>

        {/* Introduction */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="text-slate-300 space-y-4">
            <p className="text-lg leading-relaxed">
              This Privacy Policy describes how SP Kabaddi Club ("we", "us", or "our") collects, uses, stores, and protects your personal information when you register as a member, use our facilities, or interact with our services.
            </p>
            <p className="leading-relaxed">
              By registering with SP Kabaddi Club, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with any part of this policy, please do not register or use our services.
            </p>
          </div>
        </div>

        {/* Section 1: Information We Collect */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/40 to-cyan-500/40 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">1. Information We Collect</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-blue-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">1.1 Personal Information</h3>
              <p className="mb-3">We collect the following personal information during registration and membership:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Identity Information:</strong> Full name, father's name, date of birth, gender, photograph</li>
                <li><strong>Contact Information:</strong> Email address, phone number, residential address (city, state, PIN code)</li>
                <li><strong>Physical Information:</strong> Height, weight, blood group</li>
                <li><strong>Educational Information:</strong> School/college name and details</li>
                <li><strong>Emergency Contact:</strong> Guardian's name and contact number</li>
                <li><strong>Financial Information:</strong> Payment records, fee transaction details</li>
                <li><strong>Sports Information:</strong> Kabaddi position, previous playing experience, tournament participation</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-blue-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">1.2 Automatically Collected Information</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Training attendance records and performance data</li>
                <li>Facility usage logs and access times</li>
                <li>Communication records (emails, messages with club officials)</li>
                <li>Website usage data (IP address, browser type, device information)</li>
                <li>Video/photo recordings during training sessions and tournaments</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-blue-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">1.3 Sensitive Personal Data</h3>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p>We collect blood group information for emergency medical purposes only. This data is stored securely and accessed only when necessary for member safety.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: How We Use Your Information */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">2. How We Use Your Information</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-purple-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">2.1 Primary Uses</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Membership Management:</strong> Processing registrations, renewals, and maintaining member records</li>
                <li><strong>Training Services:</strong> Scheduling training sessions, tracking attendance, evaluating performance</li>
                <li><strong>Tournament Participation:</strong> Registering members for local, state, and national competitions</li>
                <li><strong>Communication:</strong> Sending important updates, training schedules, event notifications, and club announcements</li>
                <li><strong>Financial Management:</strong> Processing membership fees, training fees, and maintaining payment records</li>
                <li><strong>Emergency Response:</strong> Contacting guardians and using medical information in case of injuries or emergencies</li>
                <li><strong>Facility Management:</strong> Managing access to training facilities and equipment</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-purple-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">2.2 Secondary Uses</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Improving training programs and coaching methodologies</li>
                <li>Creating promotional content (with explicit consent for photos/videos)</li>
                <li>Statistical analysis for club performance and growth</li>
                <li>Compliance with legal and regulatory requirements</li>
                <li>Resolving disputes and enforcing club policies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: Information Sharing and Disclosure */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/40 to-orange-500/40 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">3. Information Sharing and Disclosure</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-amber-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">3.1 When We Share Information</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Tournament Organizers:</strong> Information required for tournament registration and participation</li>
                <li><strong>Insurance Providers:</strong> Medical and personal information for sports insurance coverage (with consent)</li>
                <li><strong>Legal Authorities:</strong> When required by law, court orders, or government regulations</li>
                <li><strong>Emergency Services:</strong> Medical and contact information during health emergencies</li>
                <li><strong>Service Providers:</strong> Third-party vendors who assist in club operations (payment processors, website hosting) under strict confidentiality agreements</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-amber-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">3.2 What We Don't Share</h3>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="font-semibold text-white mb-2">We will NEVER:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Sell or rent your personal information to third parties</li>
                  <li>Share your contact information with advertisers</li>
                  <li>Disclose sensitive medical information without consent (except emergencies)</li>
                  <li>Use your photograph for commercial purposes without explicit permission</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Data Security */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500/40 to-emerald-500/40 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">4. Data Security</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-green-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">4.1 Security Measures</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Digital Security:</strong> SSL encryption for website data transmission, secure cloud storage for member records</li>
                <li><strong>Access Control:</strong> Restricted access to personal information, only authorized club officials can view member data</li>
                <li><strong>Physical Security:</strong> Paper records stored in locked cabinets at club premises</li>
                <li><strong>Regular Audits:</strong> Periodic review of security practices and data handling procedures</li>
                <li><strong>Staff Training:</strong> All club staff trained on data privacy and confidentiality</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-green-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">4.2 Data Retention</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Active member data is retained for the duration of membership plus 3 years for compliance</li>
                <li>Financial records maintained for 7 years as per legal requirements</li>
                <li>Medical emergency information retained as long as member is active</li>
                <li>Former member data archived securely and deleted after statutory retention period</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-green-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">4.3 Data Breach Protocol</h3>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p>In the unlikely event of a data breach, we will notify affected members within 72 hours via email and take immediate corrective action to secure the data.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Your Rights and Choices */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/40 to-blue-500/40 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">5. Your Rights and Choices</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-cyan-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">5.1 Member Rights</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Right to Access:</strong> Request a copy of your personal information held by the club</li>
                <li><strong>Right to Correction:</strong> Update or correct inaccurate personal information</li>
                <li><strong>Right to Deletion:</strong> Request deletion of your data (subject to legal retention requirements)</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your information in certain circumstances</li>
                <li><strong>Right to Object:</strong> Opt-out of promotional communications and non-essential data processing</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured, machine-readable format</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-cyan-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">5.2 How to Exercise Your Rights</h3>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <p className="mb-3">To exercise any of these rights, please contact us at:</p>
                <div className="space-y-2">
                  <p><strong>Email:</strong> spkabaddigroupdhanbad@gmail.com</p>
                  <p><strong>In Person:</strong> Visit club premises during office hours</p>
                  <p className="text-sm text-slate-400 mt-3">*We will respond to your request within 30 days</p>
                </div>
              </div>
            </div>

            <div className="pl-6 border-l-2 border-cyan-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">5.3 Parental/Guardian Rights (For Minors)</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Parents/guardians have the right to access and control their child's information</li>
                <li>Can request correction, deletion, or restriction of minor's data</li>
                <li>Must provide consent for any promotional use of minor's photos/videos</li>
                <li>Can withdraw consent at any time</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 6: Cookies */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/40 to-purple-500/40 rounded-lg flex items-center justify-center">
              <Database className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">6. Cookies</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-indigo-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">6.1 Cookie Usage</h3>
              <p className="mb-3">Our website uses minimal cookies to enhance user experience:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Essential Cookies:</strong> Required for website functionality and security</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              </ul>
              <p className="mt-3 text-sm">We do not use tracking cookies, analytics cookies, or third-party cookies. You can disable cookies through your browser settings, but some website features may not function properly.</p>
            </div>
          </div>
        </div>

        {/* Section 7: Children's Privacy */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500/40 to-rose-500/40 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-pink-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">7. Children's Privacy</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-pink-500/50">
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4 mb-4">
                <p className="font-semibold text-white">We take special care to protect the privacy of members under 18 years of age.</p>
              </div>
              <ul className="space-y-2 list-disc list-inside">
                <li>Parental/guardian consent is mandatory for registration of minors</li>
                <li>Parents/guardians must provide emergency contact information</li>
                <li>We collect only information necessary for training and safety purposes</li>
                <li>Photos/videos of minors require explicit parental consent before publication</li>
                <li>Parents/guardians have full control over their child's data and can request deletion at any time</li>
                <li>Direct marketing communications are not sent to minors without parental consent</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 8: Changes to Privacy Policy */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500/40 to-red-500/40 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">8. Changes to Privacy Policy</h2>
          </div>

          <div className="space-y-4 text-slate-300">
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.</p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Members will be notified of significant changes via email or website announcement</li>
              <li>Updated policy will display the "Last Updated" date at the top</li>
              <li>Continued membership after policy updates constitutes acceptance of new terms</li>
              <li>Material changes requiring explicit consent will be communicated separately</li>
            </ul>
          </div>
        </div>

        {/* Section 9: Contact Information */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500/40 to-green-500/40 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">9. Contact Information</h2>
          </div>

          <div className="space-y-4 text-slate-300">
            <p>For questions, concerns, or requests regarding this Privacy Policy or your personal information:</p>
            <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">SP Kabaddi Club - Privacy Officer</h3>
              <div className="space-y-2">
                <p><strong>Email:</strong> spkabaddigroupdhanbad@gmail.com</p>
                <p><strong>Phone:</strong> [Club Contact Number]</p>
                <p><strong>Address:</strong> Dhanbad, Jharkhand, India</p>
                <p className="text-sm text-slate-400 mt-4">Office Hours: Monday to Saturday, 5:00 AM - 9:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acceptance Statement */}
        <div className="bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-teal-500/20 border border-green-500/30 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <Shield className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">Your Privacy Matters</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                By registering with SP Kabaddi Club, you acknowledge that you have read, understood, and agree to this Privacy Policy. We are committed to protecting your personal information and maintaining your trust.
              </p>
              <p className="text-slate-300 leading-relaxed mb-6">
                If you have any questions or concerns about how we handle your data, please don't hesitate to contact us.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/register" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                >
                  Register Now
                </Link>
                <Link 
                  to="/terms-conditions" 
                  className="inline-flex items-center px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all duration-300"
                >
                  View Terms & Conditions
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>This Privacy Policy is governed by the laws of India and complies with the Information Technology Act, 2000 and rules thereunder.</p>
          <p className="mt-2">© 2025 SP Kabaddi Club. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
