import { Trophy, Users, Clock, Target, Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const KabaddiRules = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500/40 to-orange-500/40 rounded-2xl mb-6">
            <Trophy className="w-10 h-10 text-amber-400" />
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              SP Club Kabaddi Rules
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Official kabaddi rules and regulations followed by SP Kabaddi Club, in compliance with AKFI standards
          </p>
          <p className="text-sm text-slate-500 mt-4">Based on Amateur Kabaddi Federation of India (AKFI) Regulations</p>
        </div>

        {/* Introduction */}
        <div className="mb-12 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/30 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <Trophy className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">About Kabaddi</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                Kabaddi is a contact team sport that originated in ancient India. It combines elements of wrestling, tag, and requires both offensive and defensive skills. The game is played between two teams of seven players each, with the objective of scoring points by raiding the opponent's half and touching as many defenders as possible without getting caught.
              </p>
              <p className="text-slate-300 leading-relaxed">
                SP Kabaddi Club follows all rules and regulations established by the Amateur Kabaddi Federation of India (AKFI) to ensure fair play, sportsmanship, and standardized competition across all levels.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Court Specifications */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/40 to-cyan-500/40 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">1. Court Specifications & Measurements</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-blue-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">1.1 Court Dimensions</h3>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                <ul className="space-y-2">
                  <li><strong className="text-white">Total Length:</strong> 13 meters (for men) / 12 meters (for women and juniors)</li>
                  <li><strong className="text-white">Total Width:</strong> 10 meters</li>
                  <li><strong className="text-white">Mid Line:</strong> Divides the court into two equal halves</li>
                  <li><strong className="text-white">Baulk Line:</strong> 3.75 meters from the mid line (men) / 3 meters (women & juniors)</li>
                  <li><strong className="text-white">Bonus Line:</strong> 1 meter from the baulk line</li>
                  <li><strong className="text-white">End Line:</strong> Back boundary of each half</li>
                </ul>
              </div>
            </div>

            <div className="pl-6 border-l-2 border-blue-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">1.2 Court Markings</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>All lines must be 5 cm wide and clearly marked</li>
                <li>Lobby areas: 1 meter on both sides, 2 meters at the ends (optional but recommended)</li>
                <li>Lines are considered part of the playing area</li>
                <li>Court surface must be flat, soft, and free from any dangerous objects</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Team Composition */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500/40 to-emerald-500/40 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">2. Team Composition & Player Requirements</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-green-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">2.1 Team Structure</h3>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                <ul className="space-y-2">
                  <li><strong className="text-white">Playing Seven:</strong> 7 players on court at a time</li>
                  <li><strong className="text-white">Substitutes:</strong> Maximum 5 substitute players</li>
                  <li><strong className="text-white">Total Squad:</strong> 12 players per team</li>
                  <li><strong className="text-white">Captain:</strong> One player designated as team captain</li>
                  <li><strong className="text-white">Coach:</strong> One coach per team allowed in the designated area</li>
                </ul>
              </div>
            </div>

            <div className="pl-6 border-l-2 border-green-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">2.2 Player Positions</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Raiders:</strong> Offensive players who enter opponent's half to score points</li>
                <li><strong>Defenders/Antis:</strong> Defensive players who prevent raiders from scoring</li>
                <li><strong>All-Rounders:</strong> Players proficient in both raiding and defending</li>
                <li><strong>Left Corner:</strong> Defender positioned at left corner of court</li>
                <li><strong>Right Corner:</strong> Defender positioned at right corner of court</li>
                <li><strong>Cover Defenders:</strong> Central defensive players</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-green-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">2.3 Player Uniform Requirements</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Players must wear numbered jerseys (1-12) clearly visible front and back</li>
                <li>Shorts must be above the knee and comfortable for movement</li>
                <li>Players must play barefoot (no shoes or socks allowed)</li>
                <li>No jewelry, watches, or sharp objects permitted during play</li>
                <li>Team uniforms must be of the same color and design</li>
                <li>Numbers must be at least 10 cm in height</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 3: Game Duration */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">3. Game Duration & Time Rules</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-purple-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">3.1 Match Duration</h3>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                <ul className="space-y-3">
                  <li><strong className="text-white">Total Duration:</strong> 40 minutes (20 minutes per half)</li>
                  <li><strong className="text-white">Half-Time Break:</strong> 5 minutes</li>
                  <li><strong className="text-white">Extra Time (if required):</strong> 2 halves of 5 minutes each</li>
                  <li><strong className="text-white">Golden Raid:</strong> If still tied after extra time, golden raid determines winner</li>
                </ul>
              </div>
            </div>

            <div className="pl-6 border-l-2 border-purple-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">3.2 Time-Outs</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Each team is allowed 2 time-outs per match (1 per half)</li>
                <li>Each time-out lasts 30 seconds</li>
                <li>Time-outs can only be called when the ball is dead (between raids)</li>
                <li>Only the captain or coach can request a time-out</li>
                <li>Unused time-outs from first half cannot be carried to second half</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-purple-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">3.3 Raid Time Limits</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Raid Time:</strong> 30 seconds maximum per raid</li>
                <li>Raider must cross the baulk line within 30 seconds</li>
                <li>Failure to do so results in "Empty Raid" - no points awarded</li>
                <li>Clock stops when referee blows whistle for struggle or other stoppages</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 4: Scoring System */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500/40 to-yellow-500/40 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">4. Scoring System & Points</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-amber-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">4.1 Raid Points</h3>
              <div className="space-y-3">
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="font-semibold text-white mb-2">Touch Points:</p>
                  <ul className="space-y-1 ml-4">
                    <li>✓ 1 point for each defender touched by raider</li>
                    <li>✓ Raider must return to own half without being tackled</li>
                    <li>✓ Multiple touches in single raid = multiple points</li>
                  </ul>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="font-semibold text-white mb-2">Bonus Points:</p>
                  <ul className="space-y-1 ml-4">
                    <li>✓ 1 bonus point if raider crosses bonus line</li>
                    <li>✓ Must have minimum 6 defenders on court</li>
                    <li>✓ Must not touch any defender before crossing bonus line</li>
                    <li>✓ Both feet must cross the bonus line</li>
                  </ul>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                  <p className="font-semibold text-white mb-2">Technical Points:</p>
                  <ul className="space-y-1 ml-4">
                    <li>✓ 1 point if defending team goes out of bounds</li>
                    <li>✓ 1 point if defending team commits a foul</li>
                    <li>✓ 1 point for "do or die" raid (explained below)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pl-6 border-l-2 border-amber-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">4.2 Tackle Points</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Successful Tackle:</strong> 1 point when defenders catch/tackle the raider</li>
                <li><strong>Super Tackle:</strong> 2 points if 3 or fewer defenders tackle the raider</li>
                <li>Raider must be prevented from returning to their half</li>
                <li>Tackled raider is declared "out" and leaves the court</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-amber-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">4.3 All Out</h3>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="font-semibold text-white mb-2">When all 7 players of a team are out:</p>
                <ul className="space-y-2 ml-4">
                  <li>✓ Opposing team scores 2 additional bonus points (All Out Points)</li>
                  <li>✓ All players of the team that was "all out" return to court</li>
                  <li>✓ Game continues normally</li>
                  <li>✓ Multiple all-outs can occur in a single match</li>
                </ul>
              </div>
            </div>

            <div className="pl-6 border-l-2 border-amber-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">4.4 Revival of Players</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>When a raider scores a touch point, one out player from their team revives</li>
                <li>Players revive in the order they were declared out (first out, first in)</li>
                <li>Revived player returns to court immediately</li>
                <li>Bonus points do not revive players</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 5: Raiding Rules */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/40 to-orange-500/40 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">5. Raiding Rules & Regulations</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-red-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">5.1 Cant (Raiding Chant)</h3>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <ul className="space-y-2">
                  <li>✓ Raider must continuously chant "Kabaddi-Kabaddi" without pause</li>
                  <li>✓ Must be clearly audible to the referee</li>
                  <li>✓ Cant must be in one continuous breath</li>
                  <li>✓ If raider takes a breath (breaks cant), they are declared out</li>
                  <li>✓ Cant must start before crossing the mid-line</li>
                </ul>
              </div>
            </div>

            <div className="pl-6 border-l-2 border-red-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">5.2 Valid Raid</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Raider must cross the baulk line with at least one foot</li>
                <li>Must maintain continuous cant throughout the raid</li>
                <li>Must not go out of bounds</li>
                <li>Must return to own half within 30 seconds</li>
                <li>Only one raider can raid at a time</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-red-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">5.3 Do-or-Die Raid</h3>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                <p className="font-semibold text-white mb-2">Occurs when a team has two consecutive empty raids:</p>
                <ul className="space-y-2 ml-4">
                  <li>✓ Third raid becomes "Do-or-Die"</li>
                  <li>✓ Raider MUST score at least one point or be declared out</li>
                  <li>✓ If raider scores, normal play continues</li>
                  <li>✓ If raider fails, they are out and defending team gets 1 point</li>
                  <li>✓ Empty raid, bonus point, or technical point does NOT count as scoring</li>
                </ul>
              </div>
            </div>

            <div className="pl-6 border-l-2 border-red-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">5.4 Raider Violations</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Out of Bounds:</strong> If raider crosses side or end lines, they are out</li>
                <li><strong>Breaking Cant:</strong> Taking a breath during raid results in immediate out</li>
                <li><strong>Struggling:</strong> If raider is held and struggles for 5 seconds without escape</li>
                <li><strong>Time Out:</strong> Failing to return within 30 seconds</li>
                <li><strong>Illegal Touch:</strong> Using unfair means to touch defenders</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 6: Defending Rules */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/40 to-blue-500/40 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">6. Defending Rules & Techniques</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-cyan-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">6.1 Legal Defense Techniques</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong>Ankle Hold:</strong> Grabbing raider's ankle to prevent escape</li>
                <li><strong>Thigh Hold:</strong> Holding raider's thigh</li>
                <li><strong>Waist Hold:</strong> Gripping raider's waist</li>
                <li><strong>Block:</strong> Using body to block raider's path</li>
                <li><strong>Chain Tackle:</strong> Multiple defenders coordinating to tackle</li>
                <li><strong>Dash:</strong> Quick push to send raider out of bounds</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-cyan-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">6.2 Defender Violations</h3>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4 mb-4">
                <p className="font-semibold text-white mb-2">Defenders will be declared OUT if they:</p>
                <ul className="space-y-2 ml-4">
                  <li>✗ Step out of bounds while attempting to tackle</li>
                  <li>✗ Cross the mid-line before raider returns</li>
                  <li>✗ Hold raider before they cross the baulk line</li>
                  <li>✗ Use illegal holds (hair pulling, hitting, kicking)</li>
                  <li>✗ Commit unsportsmanlike conduct</li>
                </ul>
              </div>
            </div>

            <div className="pl-6 border-l-2 border-cyan-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">6.3 Struggling Rule</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>When raider is held, referee monitors the struggle</li>
                <li>If struggle exceeds 5 seconds with no progress, whistle is blown</li>
                <li>Referee decides which side gets the point based on advantage</li>
                <li>Usually awarded to the side with better position at whistle</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 7: Substitutions */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/40 to-purple-500/40 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">7. Substitution Rules</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-indigo-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">7.1 Substitution Procedure</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Unlimited substitutions allowed during the match</li>
                <li>Substitutions can only be made when play is stopped (dead ball)</li>
                <li>Substitute must enter from the designated substitution zone</li>
                <li>Player being substituted must leave the court before substitute enters</li>
                <li>Only captain or coach can request substitution</li>
                <li>Referee must be informed and must approve the substitution</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-indigo-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">7.2 Substitution Restrictions</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Substituted player can re-enter the game later (multiple substitutions allowed)</li>
                <li>No substitution during active play or raid</li>
                <li>Substitute must wear proper uniform with valid number</li>
                <li>Injured player can be substituted at any stoppage with referee permission</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 8: Fouls & Penalties */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/40 to-pink-500/40 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">8. Fouls, Penalties & Cards</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-red-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">8.1 Technical Fouls</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Entering court before whistle</li>
                <li>Leaving designated team area without permission</li>
                <li>Arguing with referee or showing dissent</li>
                <li>Delaying the game intentionally</li>
                <li>Using abusive language or gestures</li>
                <li>Incorrect uniform or equipment</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-red-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">8.2 Card System</h3>
              <div className="space-y-3">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="font-semibold text-green-400 mb-2">🟢 GREEN CARD (Warning)</p>
                  <ul className="space-y-1 ml-4 text-sm">
                    <li>• First offense for minor violations</li>
                    <li>• Official warning recorded</li>
                    <li>• No point penalty</li>
                  </ul>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="font-semibold text-yellow-400 mb-2">🟨 YELLOW CARD (Penalty)</p>
                  <ul className="space-y-1 ml-4 text-sm">
                    <li>• Second offense or moderate violation</li>
                    <li>• Opposing team awarded 1 penalty point</li>
                    <li>• Player can continue playing</li>
                    <li>• Further violations may lead to red card</li>
                  </ul>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="font-semibold text-red-400 mb-2">🟥 RED CARD (Expulsion)</p>
                  <ul className="space-y-1 ml-4 text-sm">
                    <li>• Serious violation or third offense</li>
                    <li>• Player expelled from the match</li>
                    <li>• Opposing team awarded 2 penalty points</li>
                    <li>• Team plays with one less player (unless substitute available)</li>
                    <li>• Player may face further disciplinary action</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="pl-6 border-l-2 border-red-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">8.3 Serious Violations</h3>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="font-semibold text-white mb-2">Immediate Red Card Offenses:</p>
                <ul className="space-y-2 ml-4">
                  <li>✗ Physical violence or fighting</li>
                  <li>✗ Deliberately injuring opponent</li>
                  <li>✗ Abusing or threatening referee</li>
                  <li>✗ Use of prohibited substances</li>
                  <li>✗ Match-fixing or corruption</li>
                  <li>✗ Extreme unsportsmanlike conduct</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Section 9: Match Officials */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500/40 to-green-500/40 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">9. Match Officials & Their Duties</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-teal-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">9.1 Referee (Center Official)</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Primary authority for all match decisions</li>
                <li>Monitors raider's cant and movements</li>
                <li>Declares players "in" or "out"</li>
                <li>Awards points and enforces rules</li>
                <li>Issues cards for violations</li>
                <li>Manages game flow and timing</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-teal-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">9.2 Umpires (2 Officials)</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Assist referee in decision making</li>
                <li>Monitor boundary lines on their side</li>
                <li>Signal when players go out of bounds</li>
                <li>Watch for fouls and violations</li>
                <li>Help maintain order on court</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-teal-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">9.3 Scorers (2 Officials)</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Maintain official score sheet</li>
                <li>Record all points, raids, and tackles</li>
                <li>Track player substitutions</li>
                <li>Record time-outs and cards</li>
                <li>Manage electronic scoreboard</li>
              </ul>
            </div>

            <div className="pl-6 border-l-2 border-teal-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">9.4 Match Commissioner</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Overall supervisor of the match</li>
                <li>Ensures compliance with regulations</li>
                <li>Resolves disputes not covered by playing rules</li>
                <li>Has final authority on administrative matters</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 10: Tie-Breakers */}
        <div className="mb-12 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500/40 to-red-500/40 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-3xl font-bold text-white">10. Tie-Breaking Procedures</h2>
          </div>

          <div className="space-y-6 text-slate-300">
            <div className="pl-6 border-l-2 border-orange-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">10.1 End of Regular Time</h3>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                <p className="font-semibold text-white mb-2">If scores are tied after 40 minutes:</p>
                <ul className="space-y-2 ml-4">
                  <li><strong>Step 1:</strong> 5-minute break</li>
                  <li><strong>Step 2:</strong> Extra time - Two halves of 5 minutes each (10 minutes total)</li>
                  <li><strong>Step 3:</strong> 1-minute break between extra time halves</li>
                  <li><strong>Step 4:</strong> Teams switch sides for second extra time half</li>
                </ul>
              </div>
            </div>

            <div className="pl-6 border-l-2 border-orange-500/50">
              <h3 className="text-xl font-semibold text-white mb-3">10.2 Golden Raid</h3>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="font-semibold text-white mb-2">If still tied after extra time:</p>
                <ul className="space-y-2 ml-4">
                  <li>✓ Toss decides which team raids first</li>
                  <li>✓ Teams alternate raids (one raid each)</li>
                  <li>✓ First team to score ANY point wins the match</li>
                  <li>✓ If first raider scores - match ends immediately</li>
                  <li>✓ If first raider doesn't score - second team gets chance</li>
                  <li>✓ Continues until one team scores</li>
                  <li>✓ Touch point, tackle point, bonus point, or technical point - all count</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* SP Club Compliance */}
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border border-amber-500/30 rounded-xl p-8">
          <div className="flex items-start gap-4">
            <Trophy className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">SP Club Commitment</h3>
              <p className="text-slate-300 leading-relaxed mb-4">
                SP Kabaddi Club strictly adheres to all rules and regulations established by the Amateur Kabaddi Federation of India (AKFI). We ensure that all our members, coaches, and officials are well-versed in these rules to maintain the highest standards of fair play and sportsmanship.
              </p>
              <p className="text-slate-300 leading-relaxed mb-4">
                All training sessions, practice matches, and tournaments organized by SP Club follow AKFI guidelines. We believe in developing players who not only excel in skills but also understand and respect the spirit of the game.
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                <Link 
                  to="/register" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-amber-500/25"
                >
                  Join SP Club
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

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>These rules are based on AKFI (Amateur Kabaddi Federation of India) regulations.</p>
          <p className="mt-2">For official AKFI documentation and updates, please visit the AKFI official website.</p>
          <p className="mt-2">© 2025 SP Kabaddi Club. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default KabaddiRules;
