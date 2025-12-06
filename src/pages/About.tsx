import { Target, Users, Award, Heart, Linkedin, Twitter } from "lucide-react";

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
        // Optional: unobserve after it's visible so animation doesn't re-trigger
        // observer.unobserve(entry.target);
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

  return <div ref={ref} className="text-5xl font-bold text-amber-400">{count}+</div>;
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
      role: "Tresurer & Operations Manager",
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
      role: "Senior Player & Mentor | Digital Architect",
      bio: "Praveen leads on the mat as a senior player and off it as the digital architect behind this platform, blending strategy, mentorship, and product craft for SP Club.",
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
    <div className="bg-slate-900 text-white">
      <Seo
        title="About"
        description="Learn about SP Club (SP Kabaddi Group Dhanbad) — our mission, history, and core team dedicated to building champions."
        url="https://spkabaddi.me/about"
        image="https://spkabaddi.me/Logo.png"
        keywords="about SP Club, SP Kabaddi Group Dhanbad, sports history Dhanbad, spkg"
      />
      {/* Hero Section */}
      <section className="relative py-32 bg-cover bg-center" style={{ backgroundImage: "url('/about.png')" }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight">About <span className="text-amber-400">SP Club</span></h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Forging champions, building community, and celebrating the spirit of sports since 2010.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-white text-slate-800">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">Our Story: More Than Just a Game</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Our mission is to cultivate a vibrant and inclusive sports community that nurtures raw talent, forges strong character, and instills the timeless values of teamwork, discipline, and the relentless pursuit of excellence. We are driven by the belief that every individual holds the potential to become a champion, both on and off the field.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 text-center">
              <div>
                <AnimatedCounter endValue={500} />
                <p className="text-slate-500 mt-2">Active Members</p>
              </div>
              <div>
                <AnimatedCounter endValue={50} />
                <p className="text-slate-500 mt-2">Championships Won</p>
              </div>
              <div>
                <AnimatedCounter endValue={15} />
                <p className="text-slate-500 mt-2">Sports Disciplines</p>
              </div>
              <div>
                <AnimatedCounter endValue={14} />
                <p className="text-slate-500 mt-2">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey (Timeline) */}
      <section className="py-24 bg-slate-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Journey Through Time</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">Follow the key milestones that have shaped SP Club into the powerhouse it is today.</p>
          </div>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-1/2 top-0 h-full w-0.5 bg-slate-700"></div>
            {historyMilestones.map((item, index) => (
              <div key={index} className="relative mb-12 flex items-center" style={{ flexDirection: index % 2 === 0 ? 'row' : 'row-reverse' }}>
                <div className="w-1/2 px-6">
                  <div className={`text-right ${index % 2 !== 0 ? 'lg:text-left' : ''}`}>
                    <h3 className="text-2xl font-bold text-amber-400">{item.title}</h3>
                    <p className="text-slate-400 mt-2">{item.description}</p>
                  </div>
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-500 border-4 border-slate-900 flex items-center justify-center font-bold">
                  {item.year}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Meet The Team Section */}
      <section className="py-24 bg-white text-slate-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Meet our Managing Team</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">The dedicated professionals who embody our spirit of excellence and drive our mission forward.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="group relative overflow-hidden rounded-lg shadow-xl text-center">
                <img src={member.image} alt={member.name} className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 w-full p-6 text-white">
                  <h3 className="text-2xl font-bold">{member.name}</h3>
                  <p className="text-amber-400 font-semibold">{member.role}</p>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-sm text-slate-300 mb-4">{member.bio}</p>
                    <div className="flex justify-center space-x-4">
                      <a href={member.social.linkedin} className="hover:text-amber-400"><Linkedin size={20} /></a>
                      <a href={member.social.twitter} className="hover:text-amber-400"><Twitter size={20} /></a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Core Values Section */}
      <section className="py-24 bg-slate-900">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 bg-slate-800 rounded-lg transform hover:-translate-y-2 transition-transform duration-300">
              <Target className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Excellence</h3>
              <p className="text-slate-400">Striving for the highest standards in every action we take.</p>
            </div>
            <div className="p-8 bg-slate-800 rounded-lg transform hover:-translate-y-2 transition-transform duration-300">
              <Users className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p className="text-slate-400">Building lasting friendships and unwavering support networks.</p>
            </div>
            <div className="p-8 bg-slate-800 rounded-lg transform hover:-translate-y-2 transition-transform duration-300">
              <Award className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Achievement</h3>
              <p className="text-slate-400">Celebrating every milestone and victory, big or small.</p>
            </div>
            <div className="p-8 bg-slate-800 rounded-lg transform hover:-translate-y-2 transition-transform duration-300">
              <Heart className="w-12 h-12 text-amber-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Passion</h3>
              <p className="text-slate-400">Inspiring a profound love for sports and healthy living.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;