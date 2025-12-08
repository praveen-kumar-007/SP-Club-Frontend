import { Target, Users, Award, Heart, Linkedin, Twitter, MapPin, Zap, Shield, Trophy } from "lucide-react";

// You can create this component in a separate file or directly here
// This is a simple hook for scroll animations
import { useEffect, useState, useRef } from 'react';

const useOnScreen = (options: IntersectionObserverInit) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return [ref, isVisible] as const;
};


// Animated Counter for statistics
const AnimatedCounter = ({ endValue }: { endValue: number }) => {
  const [count, setCount] = useState(0);
  const [ref, isVisible] = useOnScreen({ threshold: 0.5 });

  useEffect(() => {
    if (isVisible) {
      let start = 0;
      const duration = 2000; // 2 seconds
      const increment = endValue / (duration / 16); // 60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= endValue) {
          setCount(endValue);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [endValue, isVisible]);

  return <div ref={ref} className="text-5xl md:text-6xl font-bold text-amber-400 animate-pulse">{count}+</div>;
};


import Seo from "@/components/Seo";

const About = () => {
  // Data for the team members - easy to update
  const teamMembers = [
    {
      name: "Pappu Kumar Yadav",
      role: "Founder & Head Coach",
      bio: "With over 15 years of experience, Pappu founded SP Club to create a new generation of champions.",
      image: "/pappu_yadav.png",
      social: {
        linkedin: "#",
        twitter: "#",
      },
    },
    {
      name: "Sunny Ray",
      role: "Treasurer & Operations Manager",
      bio: "Sunny ensures the smooth operation of SP Club, managing finances and logistics with precision.",
      image: "/about_assets/sunny.jpg.jpg",
      social: {
        linkedin: "#",
        twitter: "#",
      },
    },
    {
      name: "Deepak Kumar",
      role: "Senior Player & Mentor",
      bio: "A seasoned athlete, Deepak mentors our young talents, sharing his wealth of experience.",
      image: "/about_assets/deepak.jpg.jpg",
      social: {
        linkedin: "#",
        twitter: "#",
      },
    },
    {
      name: "Praveen Kumar",
      role: "Senior Player & Digital Architect",
      bio: "Praveen leads on the mat as a senior player and off it as the digital architect behind this platform.",
      image: "/about_assets/praveen.png",
      social: {
        linkedin: "https://www.linkedin.com/in/praveen-kumar-307697221",
        twitter: "",
      },
    },
  ];

  // Data for the timeline - easy to update
  const historyMilestones = [
    {
      year: "2010",
      title: "The Foundation",
      description: "SP Club was founded with a vision to create a premier sports facility in Dhanbad, starting with just 50 members and 3 sports."
    },
    {
      year: "2015",
      title: "State-of-the-Art Expansion",
      description: "We expanded to include 10 sports and opened our cutting-edge training facility, growing our membership to over 200 athletes."
    },
    {
      year: "2020",
      title: "Digital Transformation",
      description: "Adapted to the new era with online training and virtual competitions, keeping our community connected and engaged."
    },
    {
      year: "2024",
      title: "The Championship Era",
      description: "Reached 500+ members, secured multiple state-level championships, and established our celebrated youth development programs."
    },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-900 via-[#0f172a] to-slate-900 text-white">
      <Seo
        title="About"
        description="Learn about SP Club (SP Kabaddi Group Dhanbad) — our mission, history, and core team dedicated to building champions."
        url="https://spkabaddi.me/about"
        image="https://spkabaddi.me/Logo.png"
        keywords="about SP Club, SP Kabaddi Group Dhanbad, sports history Dhanbad, spkg"
      />
      
      {/* Hero Section */}
      <section className="relative py-40 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/about.png')" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/70"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="mb-6 inline-block">
            <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-400">
              <Trophy className="w-4 h-4 mr-2" />
              Welcome to Excellence
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">SP Club</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
            Building champions, forging character, and creating a community where excellence meets passion
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-28 bg-gradient-to-b from-slate-800 to-slate-900 relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold mb-4">OUR MISSION</span>
                <h2 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  More Than Just a Game
                </h2>
              </div>
              <p className="text-lg text-slate-400 leading-relaxed">
                Our mission is to cultivate a vibrant and inclusive sports community that nurtures raw talent, forges strong character, and instills the timeless values of teamwork, discipline, and the relentless pursuit of excellence.
              </p>
              <p className="text-lg text-slate-400 leading-relaxed">
                We believe that every individual holds the potential to become a champion, both on and off the field. Through dedicated coaching, state-of-the-art facilities, and an unwavering commitment to our athletes, we transform dreams into reality.
              </p>
              <div className="flex items-center space-x-3 text-amber-400 pt-4">
                <Zap className="w-6 h-6" />
                <span className="text-lg font-semibold">Inspiring Excellence Since 2010</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-2xl border border-amber-500/30 hover:border-amber-400/60 transition-all duration-300 transform hover:scale-105">
                <div className="text-5xl font-bold text-amber-400 mb-2">500+</div>
                <p className="text-slate-300 font-semibold">Active Members</p>
                <p className="text-sm text-slate-400 mt-2">Growing community of champions</p>
              </div>
              <div className="p-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-blue-500/30 hover:border-blue-400/60 transition-all duration-300 transform hover:scale-105">
                <div className="text-5xl font-bold text-blue-400 mb-2">50+</div>
                <p className="text-slate-300 font-semibold">Championships</p>
                <p className="text-sm text-slate-400 mt-2">State & regional victories</p>
              </div>
              <div className="p-8 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-2xl border border-green-500/30 hover:border-green-400/60 transition-all duration-300 transform hover:scale-105">
                <div className="text-5xl font-bold text-green-400 mb-2">15+</div>
                <p className="text-slate-300 font-semibold">Sports Disciplines</p>
                <p className="text-sm text-slate-400 mt-2">Diverse athletic programs</p>
              </div>
              <div className="p-8 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl border border-pink-500/30 hover:border-pink-400/60 transition-all duration-300 transform hover:scale-105">
                <div className="text-5xl font-bold text-pink-400 mb-2">14+</div>
                <p className="text-slate-300 font-semibold">Years Strong</p>
                <p className="text-sm text-slate-400 mt-2">Founded in 2010</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey (Timeline) */}
      <section className="py-28 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold mb-4">OUR JOURNEY</span>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Milestones Through Time
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Follow the key moments that shaped SP Club into the powerhouse it is today</p>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-1/2 top-0 h-full w-1 bg-gradient-to-b from-amber-500 to-orange-500 -translate-x-1/2"></div>
            {historyMilestones.map((item, index) => (
              <div key={index} className="relative mb-16 flex items-center group">
                <div className={`w-1/2 px-8 ${index % 2 === 0 ? 'text-right pr-12' : 'text-left pl-12 ml-auto'}`}>
                  <div className="p-6 bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl hover:border-amber-500/50 transition-all duration-300">
                    <h3 className="text-2xl md:text-3xl font-bold text-amber-400 mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed">{item.description}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 border-4 border-slate-900 flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-125 transition-transform duration-300">
                  {item.year}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet The Team Section */}
      <section className="py-28 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold mb-4">OUR TEAM</span>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Meet The Visionaries
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">The dedicated leaders who drive SP Club's mission and inspire excellence every single day</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="group relative h-full">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative overflow-hidden rounded-2xl shadow-xl h-full border border-slate-700 hover:border-amber-500/50 transition-all duration-300 flex flex-col">
                  <div className="relative h-96 overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125 group-hover:brightness-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                  </div>
                  <div className="flex-grow p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                      <p className="text-amber-400 font-semibold text-sm mb-4">{member.role}</p>
                      <p className="text-slate-400 text-sm leading-relaxed hidden group-hover:block transition-all duration-300">
                        {member.bio}
                      </p>
                    </div>
                    <div className="flex justify-start space-x-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {member.social.linkedin && <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-600/20 rounded-lg hover:bg-blue-600/40 transition-colors"><Linkedin size={18} className="text-blue-400" /></a>}
                      {member.social.twitter && <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-sky-600/20 rounded-lg hover:bg-sky-600/40 transition-colors"><Twitter size={18} className="text-sky-400" /></a>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Core Values Section */}
      <section className="py-28 bg-slate-900 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold mb-4">WHAT DRIVES US</span>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Core Values
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">The principles that guide every decision and action we take</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl transform hover:-translate-y-4 transition-all duration-300 hover:border-amber-400/60">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500/40 to-orange-500/40 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Excellence</h3>
              <p className="text-slate-400 leading-relaxed">Striving for the highest standards in every action we take and every goal we pursue.</p>
            </div>
            <div className="group p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl transform hover:-translate-y-4 transition-all duration-300 hover:border-blue-400/60">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/40 to-purple-500/40 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Community</h3>
              <p className="text-slate-400 leading-relaxed">Building lasting friendships and creating support networks that last a lifetime.</p>
            </div>
            <div className="group p-8 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl transform hover:-translate-y-4 transition-all duration-300 hover:border-green-400/60">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500/40 to-emerald-500/40 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Achievement</h3>
              <p className="text-slate-400 leading-relaxed">Celebrating every milestone and victory, recognizing that big dreams start small.</p>
            </div>
            <div className="group p-8 bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/30 rounded-2xl transform hover:-translate-y-4 transition-all duration-300 hover:border-pink-400/60">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500/40 to-rose-500/40 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-7 h-7 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Passion</h3>
              <p className="text-slate-400 leading-relaxed">Inspiring a profound love for sports and a commitment to healthy, active living.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-red-500/20"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Ready to Join Our Family?</h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Become part of a community that transforms talent into champions. Let's write your success story together.
          </p>
          <a href="/register" className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105">
            Join SP Club Today
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;