// ...existing code...
import { Play, Users, Trophy, Calendar, ArrowRight } from "lucide-react";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Home = () => {
  // #################################################################
  // #############  PASTE YOUR VIDEO AND PHOTO LINKS HERE  #############
  // #################################################################

  // 1. Hero Section Background Video
  const heroVideoUrl = "/home_assets/main.mp4";

  // 2. "Our Story" Section Video (any YouTube URL — will be converted to embed)
  const storyVideoUrl = "https://youtu.be/Xh0fFo3rsG4?si=SRhJWgB1U1zgBRqC";

  // convert common YouTube URL formats to embed URL
  const toEmbedUrl = (url: string) => {
    try {
      // try to extract 11-char video id with regex (works for most formats)
      const idMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:\b|$)/);
      if (idMatch && idMatch[1]) return `https://www.youtube.com/embed/${idMatch[1]}`;

      // fallback for youtu.be short link
      const shortMatch = url.match(/youtu\.be\/([0-9A-Za-z_-]{11})/);
      if (shortMatch && shortMatch[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;

      // if already an embed URL or unknown, return as-is
      return url;
    } catch {
      return url;
    }
  };

  const embedStoryUrl = toEmbedUrl(storyVideoUrl);

  // 3. "Hall of Fame" Photo Gallery
  const galleryImages = [
    {
      id: 1,
      src: "/home_assets/win_bihar_state.jpg",
      alt: "Celebrating a hard-earned victory.",
    },
    {
      id: 2,
      src: "/home_assets/girls_state2nd.jpg",
      alt: "Celebrating Girl's Team State Runner-Up.",
    },
    {
      id: 3,
      src: "/home_assets/win_holi.jpg",
      alt: "The First Team of SP Kabaddi Group Dhanbad.",
    },
    {
      id: 4,
      src: "/home_assets/celebrate_birthday_coach.jpg",
      alt: "Celebrating Birthday of Head Coach.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Seo
        title="Home"
        description="SP Kabaddi Group Dhanbad — training champions since 2010. Join our programs, events, and community."
        url="https://spkabaddi.me/"
        keywords="SP Kabaddi Group Dhanbad, kabaddi Dhanbad, sports club Dhanbad, spkg"
      />
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          src={heroVideoUrl}
          poster="/home_assets/poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight animate-fade-in-up shadow-text">
            Welcome to <span className="text-amber-400">SP Kabaddi Group Dhanbad</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-gray-200 animate-fade-in-up delay-200 max-w-3xl mx-auto">
            Where Champions Are Forged and Legacies Are Built
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in delay-400">
            <Link to="/Register">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg px-8 py-4 transform hover:scale-105 transition-transform shadow-lg">
                Become a Champion
              </Button>
            </Link>
            <Link to="/Gallery">
              <Button size="lg" variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900 font-bold transform hover:scale-105 transition-transform">
                Our Legacy
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Video Section - "Our Story" */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-800 leading-tight">Our Championship Journey</h2>
              <p className="text-lg text-gray-600 mb-8">
                Discover the passion, dedication, and triumphs that have defined SP Kabaddi Group Dhanbad as a powerhouse in Indian sports.
              </p>
              <Button variant="link" className="text-amber-600 font-bold text-lg p-0 hover:text-amber-700 transition-colors">
                Explore Our History <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* embed responsive YouTube iframe instead of <video> */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
              <div className="w-full h-0 pb-[56.25%] relative"> {/* 16:9 box */}
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={embedStoryUrl}
                  title="SP Kabaddi Group Dhanbad Story"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hall of Fame - Photo Gallery Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Hall of Fame</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Celebrating the moments and the members who make SP Kabaddi Group Dhanbad exceptional.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={image.id}
                className="relative rounded-lg overflow-hidden shadow-lg group transform hover:-translate-y-2 transition-transform duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img src={image.src} alt={image.alt} className="w-full h-96 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-5">
                  <p className="font-bold text-lg transform group-hover:translate-y-0 translate-y-2 transition-transform duration-300">{image.alt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-800">Why Choose SP Kabaddi Group Dhanbad?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join India's most ambitious sports community and unlock your true potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-amber-500">
              <CardContent className="p-10">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users size={40} className="text-slate-800" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Elite Community</h3>
                <p className="text-gray-600">
                  Connect with over 500 active members who share your drive for excellence.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-amber-500">
              <CardContent className="p-10">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy size={40} className="text-slate-800" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Championship Training</h3>
                <p className="text-gray-600">
                  Train with professional coaches using state-of-the-art facilities.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-amber-500">
              <CardContent className="p-10">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar size={40} className="text-slate-800" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">Exclusive Events</h3>
                <p className="text-gray-600">
                  Compete in prestigious tournaments and attend exclusive workshops year-round.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Join the Elite?</h2>
          <p className="text-xl mb-10 max-w-3xl mx-auto text-slate-300">
            Take the first step towards achieving your sporting dreams with SP Kabaddi Group Dhanbad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/Register">
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-lg px-8 py-4 transform hover:scale-105 transition-transform shadow-lg">
                Start Your Journey
              </Button>
            </Link>
            <Link to="/About">
              <Button size="lg" variant="outline" className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-slate-900 font-bold transform hover:scale-105 transition-transform">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
// ...existing code...