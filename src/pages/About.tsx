import { Target, Users, Award, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const About = () => {
  const teamMembers = [
    {
      name: "Rajesh Kumar",
      role: "Founder & Head Coach",
      experience: "15+ years",
      specialty: "Cricket & Football",
    },
    {
      name: "Priya Sharma",
      role: "Sports Director",
      experience: "12+ years",
      specialty: "Athletics & Swimming",
    },
    {
      name: "Amit Singh",
      role: "Youth Development",
      experience: "8+ years",
      specialty: "Basketball & Volleyball",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary to-blue-700 text-secondary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              About <span className="text-accent">SP Club</span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary-foreground/90 animate-fade-in-up">
              Building champions, fostering community, celebrating excellence since 2010
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-6 text-gradient-hero">Our Mission</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To create a vibrant sports community that nurtures talent, builds character,
                  and promotes the values of teamwork, discipline, and excellence. We believe
                  every individual has the potential to be a champion, both on and off the field.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">500+</div>
                  <div className="text-muted-foreground">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">50+</div>
                  <div className="text-muted-foreground">Championships Won</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">15+</div>
                  <div className="text-muted-foreground">Sports Disciplines</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">14</div>
                  <div className="text-muted-foreground">Years of Excellence</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="card-athletic hover-lift">
                <CardContent className="p-6 text-center">
                  <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Excellence</h3>
                  <p className="text-sm text-muted-foreground">
                    Striving for the highest standards in everything we do
                  </p>
                </CardContent>
              </Card>

              <Card className="card-champion hover-lift">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Building lasting friendships and support networks
                  </p>
                </CardContent>
              </Card>

              <Card className="card-athletic hover-lift">
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 text-secondary mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Achievement</h3>
                  <p className="text-sm text-muted-foreground">
                    Celebrating every milestone and victory, big or small
                  </p>
                </CardContent>
              </Card>

              <Card className="card-champion hover-lift">
                <CardContent className="p-6 text-center">
                  <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Passion</h3>
                  <p className="text-sm text-muted-foreground">
                    Inspiring love for sports and healthy living
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12 text-gradient-hero">Our Journey</h2>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <Badge className="bg-primary text-primary-foreground min-w-fit">2010</Badge>
                <div>
                  <h3 className="text-xl font-bold mb-2">Foundation</h3>
                  <p className="text-muted-foreground">
                    SP Club was founded with a vision to create a premier sports facility
                    in Dhanbad, starting with just 50 members and 3 sports disciplines.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Badge className="bg-accent text-accent-foreground min-w-fit">2015</Badge>
                <div>
                  <h3 className="text-xl font-bold mb-2">Expansion</h3>
                  <p className="text-muted-foreground">
                    Expanded to include 10 sports disciplines and opened our state-of-the-art
                    training facility. Membership grew to 200+ active participants.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Badge className="bg-secondary text-secondary-foreground min-w-fit">2020</Badge>
                <div>
                  <h3 className="text-xl font-bold mb-2">Digital Transformation</h3>
                  <p className="text-muted-foreground">
                    Adapted to the digital age with online training programs and virtual
                    competitions, maintaining community spirit during challenging times.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground min-w-fit">2024</Badge>
                <div>
                  <h3 className="text-xl font-bold mb-2">Championship Era</h3>
                  <p className="text-muted-foreground">
                    Reached 500+ members and won multiple state-level championships.
                    Established youth development programs and community outreach initiatives.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gradient-hero">Meet Our Champions</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our dedicated team of professionals who make excellence possible every day
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="card-athletic hover-lift">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-primary font-semibold mb-2">{member.role}</p>
                  <p className="text-muted-foreground mb-2">{member.experience}</p>
                  <Badge variant="secondary">{member.specialty}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;