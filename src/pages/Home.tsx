import { Play, Users, Trophy, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-red-600 to-red-700 text-primary-foreground py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up">
              Welcome to <span className="text-accent">SP Club</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90 animate-fade-in-up">
              Where Champions Are Made and Dreams Take Flight
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in">
              <Button size="lg" className="btn-champion text-lg px-8 py-4">
                Join Our Team
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Watch Our Story
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Video Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gradient-hero">Our Championship Journey</h2>
            <p className="text-xl text-muted-foreground">
              Watch how SP Club has become a powerhouse in Indian sports
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-card rounded-xl overflow-hidden shadow-xl hover-lift">
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto hover:scale-110 transition-transform cursor-pointer">
                    <Play size={32} className="text-primary-foreground ml-1" />
                  </div>
                  <p className="text-lg font-semibold">Click to Play Championship Highlights</p>
                  <p className="text-muted-foreground">Experience the energy and passion of SP Club</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gradient-hero">Why Choose SP Club?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join India's fastest-growing sports community and unlock your potential
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="card-athletic hover-lift">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users size={32} className="text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4">Strong Community</h3>
                <p className="text-muted-foreground">
                  Join 500+ active members who share your passion for sports and excellence.
                </p>
              </CardContent>
            </Card>

            <Card className="card-champion hover-lift">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-accent to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy size={32} className="text-accent-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4">Championship Training</h3>
                <p className="text-muted-foreground">
                  Train with professional coaches and state-of-the-art facilities.
                </p>
              </CardContent>
            </Card>

            <Card className="card-athletic hover-lift">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-secondary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar size={32} className="text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-4">Regular Events</h3>
                <p className="text-muted-foreground">
                  Participate in tournaments, workshops, and community events year-round.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-red-600 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Join the Champions?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Take the first step towards achieving your sporting dreams with SP Club
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-champion text-lg px-8 py-4">
              Start Your Journey
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;