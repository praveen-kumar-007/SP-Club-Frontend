import { Shield, AlertCircle, FileText, Users, Award, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";

const TermsConditions = () => {
  return (
    <div className="bg-gradient-to-b from-slate-900 via-[#0f172a] to-slate-900 text-white min-h-screen">
      <Seo
        title="Terms & Conditions"
        description="SP Kabaddi Group Dhanbad Terms and Conditions - Membership rules, AKFI regulations, and club policies."
        url="https://spkabaddi.me/terms-conditions"
        keywords="SP Kabaddi Group Dhanbad terms, kabaddi club rules, AKFI regulations, sports club membership"
      />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 inline-block">
              <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-400">
                <Shield className="w-4 h-4 mr-2" />
                Legal & Regulations
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Terms & Conditions
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Please read these terms and conditions carefully before joining SP Kabaddi Group Dhanbad
            </p>
            <p className="text-sm text-slate-500 mt-4">
              Last Updated: December 8, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          
          {/* Introduction */}
          <div className="mb-12 p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-amber-400 mb-2">Important Notice</h2>
                <p className="text-slate-300 leading-relaxed">
                  By registering with SP Kabaddi Group Dhanbad, you agree to comply with all terms, conditions, rules, and regulations set forth by the club and the Amateur Kabaddi Federation of India (AKFI). Violation of these terms may result in disciplinary action, including suspension or termination of membership.
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Membership Terms */}
          <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500/40 to-orange-500/40 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">1. Membership Terms</h2>
            </div>

            <div className="space-y-6 text-slate-300">
              <div className="pl-6 border-l-2 border-amber-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">1.1 Registration & Acceptance</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>All information provided during registration must be accurate and truthful.</li>
                  <li>Members must provide valid identification (Aadhar card) and contact details.</li>
                  <li>Membership is subject to approval by the club management committee.</li>
                  <li>The club reserves the right to reject any membership application without providing reasons.</li>
                </ul>
              </div>

              <div className="pl-6 border-l-2 border-amber-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">1.2 Membership Duration & Renewal</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Membership is valid for one year from the date of approval.</li>
                  <li>Members must renew their membership annually to continue participation.</li>
                  <li>Renewal fees and procedures will be communicated 30 days before expiry.</li>
                </ul>
              </div>

              <div className="pl-6 border-l-2 border-red-500/50 bg-red-500/5 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-red-400 mb-3">1.3 Notice Period for Leaving the Club</h3>
                <div className="space-y-3">
                  <p className="font-semibold text-white flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    Members must provide a minimum of 14 (fourteen) days written notice before leaving or terminating their membership with SP Kabaddi Group Dhanbad.
                  </p>
                  <ul className="space-y-2 list-disc list-inside ml-7">
                    <li>Written notice must be submitted to the club management committee via email or physical application.</li>
                    <li>Failure to provide the required 14-day notice period will be considered a breach of membership terms.</li>
                    <li>The committee reserves the right to take disciplinary action against members who leave without proper notice, including but not limited to:
                      <ul className="ml-6 mt-2 space-y-1 list-circle list-inside">
                        <li>Imposing penalty fees</li>
                        <li>Withholding participation certificates</li>
                        <li>Reporting to AKFI and affiliated federations</li>
                        <li>Barring future membership applications</li>
                      </ul>
                    </li>
                    <li>During the notice period, members are expected to fulfill all existing commitments and obligations.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: AKFI Regulations */}
          <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500/40 to-purple-500/40 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">2. AKFI (Amateur Kabaddi Federation of India) Regulations</h2>
            </div>

            <div className="space-y-6 text-slate-300">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-slate-300 leading-relaxed">
                  <strong className="text-white">Important:</strong> SP Kabaddi Group Dhanbad follows all rules and regulations established by the Amateur Kabaddi Federation of India (AKFI). While we do not directly register players with AKFI, all our training, tournaments, and activities comply with AKFI standards. Members are expected to adhere to these regulations.
                </p>
              </div>

              <div className="pl-6 border-l-2 border-blue-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">2.1 AKFI Compliance</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>All training and matches follow AKFI-approved kabaddi rules</li>
                  <li>Age verification documents must be submitted as per AKFI standards</li>
                  <li>Players must maintain amateur status as defined by AKFI regulations</li>
                  <li>Medical fitness certificates may be required for tournament participation</li>
                  <li>Players can view detailed <Link to="/kabaddi-rules" className="text-blue-400 hover:text-blue-300 underline">SP Kabaddi Group Dhanbad Kabaddi Rules</Link> (based on AKFI)</li>
                </ul>
              </div>

              <div className="pl-6 border-l-2 border-blue-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">2.2 Code of Conduct</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Players must exhibit sportsmanship, respect, and fair play at all times.</li>
                  <li>Any form of violence, abuse, or unsportsmanlike behavior will not be tolerated.</li>
                  <li>Use of performance-enhancing drugs or banned substances is strictly prohibited.</li>
                  <li>Players must respect match officials, opponents, and fellow team members.</li>
                </ul>
              </div>

              <div className="pl-6 border-l-2 border-blue-500/50 bg-blue-500/5 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">2.3 NOC (No Objection Certificate) Requirements</h3>
                <div className="space-y-3">
                  <p className="font-semibold text-white flex items-start gap-2">
                    <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    Any SP Kabaddi Group Dhanbad member wishing to play for another club or team must obtain a No Objection Certificate (NOC) from SP Kabaddi Group Dhanbad management.
                  </p>
                  <ul className="space-y-2 list-disc list-inside ml-7">
                    <li>NOC applications must be submitted in writing to the club management committee at least 21 days before the intended participation date.</li>
                    <li>The committee will review and respond to NOC requests within 7 working days.</li>
                    <li>Playing for another club/team without obtaining a proper NOC is considered a serious breach and will result in:
                      <ul className="ml-6 mt-2 space-y-1 list-circle list-inside">
                        <li>Immediate suspension from SP Kabaddi Group Dhanbad</li>
                        <li>Reporting to AKFI and state kabaddi associations</li>
                        <li>Disqualification from future SP Kabaddi Group Dhanbad tournaments and events</li>
                        <li>Legal action if necessary</li>
                      </ul>
                    </li>
                    <li>NOC may be granted subject to conditions including but not limited to:
                      <ul className="ml-6 mt-2 space-y-1 list-circle list-inside">
                        <li>No pending commitments with SP Kabaddi Group Dhanbad</li>
                        <li>Clearance of all dues and fees</li>
                        <li>No conflict with SP Kabaddi Group Dhanbad's tournament schedule</li>
                        <li>Good standing membership record</li>
                      </ul>
                    </li>
                    <li>The club reserves the right to deny NOC requests if it conflicts with club interests or AKFI regulations.</li>
                  </ul>
                </div>
              </div>

              <div className="pl-6 border-l-2 border-blue-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">2.4 Tournament & Competition Rules</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>All matches and tournaments will be conducted as per AKFI rules and regulations.</li>
                  <li>Players must wear approved uniforms and protective gear during matches.</li>
                  <li>Team selection and composition will follow AKFI guidelines.</li>
                  <li>Disciplinary actions imposed by AKFI will be binding on all SP Kabaddi Group Dhanbad members.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Training & Facility Usage */}
          <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/40 to-emerald-500/40 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">3. Training & Facility Usage</h2>
            </div>

            <div className="space-y-6 text-slate-300">
              <div className="pl-6 border-l-2 border-green-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">3.1 Training Attendance</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Members are expected to attend scheduled training sessions regularly.</li>
                  <li>Minimum attendance requirements may be set for tournament selection.</li>
                  <li>Prior notice must be given for planned absences.</li>
                  <li>Repeated unexplained absences may result in membership review.</li>
                </ul>
              </div>

              <div className="pl-6 border-l-2 border-green-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">3.2 Facility Rules</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Members must maintain cleanliness and hygiene in all club facilities.</li>
                  <li>Equipment must be used responsibly and returned properly after use.</li>
                  <li>Damage to club property must be reported immediately and may require compensation.</li>
                  <li>Club facilities are for members only; unauthorized guests are not permitted.</li>
                </ul>
              </div>

              <div className="pl-6 border-l-2 border-green-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">3.3 Safety & Insurance</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Members participate in all activities at their own risk.</li>
                  <li>The club recommends personal sports insurance coverage.</li>
                  <li>Members must disclose any medical conditions that may affect participation.</li>
                  <li>First aid facilities are available, but members should take necessary precautions.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Financial Terms */}
          <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">4. Financial Terms</h2>
            </div>

            <div className="space-y-6 text-slate-300">
              <div className="pl-6 border-l-2 border-purple-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">4.1 Membership Fees</h3>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">Annual Membership Fee:</span>
                    <span className="text-2xl font-bold text-purple-400">₹645/-</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Monthly Training Fee:</span>
                    <span className="text-2xl font-bold text-purple-400">₹200/-</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-3">*Fees are subject to change with prior notice</p>
                </div>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Membership fee of ₹645/- must be paid at the time of registration or annual renewal.</li>
                  <li>Monthly training fee of ₹200/- is to be paid by the 5th day of each month.</li>
                  <li>Fees are non-refundable except in cases of membership rejection by the club.</li>
                  <li>The club reserves the right to modify fee structure with 30 days prior written notice.</li>
                  <li>Late payment beyond the 10th of the month may result in temporary suspension of training privileges.</li>
                  <li>Members with outstanding dues for more than 2 months will have their membership suspended.</li>
                </ul>
              </div>

              <div className="pl-6 border-l-2 border-purple-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">4.2 Additional Charges</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Tournament entry fees, travel expenses, and uniform costs are separate from membership and training fees.</li>
                  <li>Members will be notified of any additional charges in advance with cost breakdown.</li>
                  <li>Payment deadlines must be strictly adhered to for event participation.</li>
                  <li>Optional facilities and services may incur additional charges as per club policy.</li>
                </ul>
              </div>

              <div className="pl-6 border-l-2 border-purple-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">4.3 Payment Methods</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Payments can be made via cash, bank transfer, UPI, or other methods specified by the club.</li>
                  <li>Payment receipts must be retained for record-keeping and verification purposes.</li>
                  <li>Any disputes regarding payments must be raised within 7 days of transaction.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 5: Disciplinary Actions */}
          <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500/40 to-orange-500/40 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">5. Disciplinary Actions & Termination</h2>
            </div>

            <div className="space-y-6 text-slate-300">
              <div className="pl-6 border-l-2 border-red-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">5.1 Grounds for Disciplinary Action</h3>
                <p className="mb-3">The club management committee may take disciplinary action against members for:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Violation of club rules and regulations</li>
                  <li>Breach of AKFI code of conduct</li>
                  <li>Disrespectful behavior towards coaches, officials, or fellow members</li>
                  <li>Leaving the club without 14-day notice period</li>
                  <li>Playing for another club without obtaining NOC</li>
                  <li>Providing false information during registration</li>
                  <li>Non-payment of dues or fees</li>
                  <li>Damage to club property or reputation</li>
                </ul>
              </div>

              <div className="pl-6 border-l-2 border-red-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">5.2 Types of Disciplinary Action</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Warning:</strong> Written warning for minor violations</li>
                  <li><strong>Suspension:</strong> Temporary suspension from training and events</li>
                  <li><strong>Fine:</strong> Monetary penalty as determined by the committee</li>
                  <li><strong>Termination:</strong> Permanent removal from club membership</li>
                  <li><strong>Reporting:</strong> Reporting serious violations to AKFI and legal authorities</li>
                </ul>
              </div>

              <div className="pl-6 border-l-2 border-red-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">5.3 Appeal Process</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Members may appeal disciplinary decisions within 7 days of notification.</li>
                  <li>Appeals must be submitted in writing to the club management committee.</li>
                  <li>The committee's decision on appeals is final and binding.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 6: General Provisions */}
          <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500/40 to-yellow-500/40 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-3xl font-bold text-white">6. General Provisions</h2>
            </div>

            <div className="space-y-6 text-slate-300">
              <div className="pl-6 border-l-2 border-amber-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">6.1 Amendments</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>SP Kabaddi Group Dhanbad reserves the right to amend these terms and conditions at any time.</li>
                  <li>Members will be notified of significant changes via email or club notice board.</li>
                  <li>Continued membership after amendments constitutes acceptance of new terms.</li>
                </ul>
              </div>

              <div className="pl-6 border-l-2 border-amber-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">6.2 Privacy & Data Protection</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Member information will be kept confidential and used only for club purposes.</li>
                  <li>Personal data may be shared with AKFI and affiliated organizations as required.</li>
                  <li>Members may request access to their personal information held by the club.</li>
                </ul>
              </div>

              <div className="pl-6 border-l-2 border-amber-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">6.3 Governing Law</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>These terms are governed by the laws of India.</li>
                  <li>Any disputes will be subject to the exclusive jurisdiction of courts in Dhanbad, Jharkhand.</li>
                  <li>Members agree to attempt amicable resolution before pursuing legal action.</li>
                </ul>
              </div>

              <div className="pl-6 border-l-2 border-amber-500/50">
                <h3 className="text-xl font-semibold text-white mb-3">6.4 Contact Information</h3>
                <p>For questions or concerns regarding these terms and conditions, please contact:</p>
                <ul className="space-y-2 mt-3">
                  <li><strong>SP Kabaddi Group Dhanbad</strong></li>
                  <li>Email: spkabaddigroupdhanbad@gmail.com</li>
                  <li>Website: https://spkabaddi.me</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Acceptance Statement */}
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-2 border-amber-500/50 rounded-xl p-8 text-center">
            <Shield className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Acceptance of Terms</h3>
            <p className="text-slate-300 leading-relaxed max-w-3xl mx-auto">
              By completing the registration process and becoming a member of SP Kabaddi Group Dhanbad, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, as well as all AKFI regulations and guidelines. You further acknowledge that violation of these terms may result in disciplinary action as outlined above.
            </p>
            <div className="mt-6">
              <a 
                href="/register" 
                className="inline-block px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105"
              >
                I Agree - Proceed to Registration
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsConditions;
