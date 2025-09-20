import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Photos" },
    { id: "matches", name: "Matches" },
    { id: "training", name: "Training" },
    { id: "events", name: "Events" },
    { id: "championships", name: "Championships" },
  ];

  const galleryItems = [
    {
      id: 1,
      title: "State Championship Victory",
      category: "championships",
      description: "Our cricket team celebrating their state championship win",
      imageAlt: "Cricket team celebrating with trophy after winning state championship"
    },
    {
      id: 2,
      title: "Morning Training Session",
      category: "training",
      description: "Early morning fitness training at our facility",
      imageAlt: "Athletes doing morning fitness training exercises outdoors"
    },
    {
      id: 3,
      title: "Community Sports Festival",
      category: "events",
      description: "Annual sports festival bringing families together",
      imageAlt: "Families participating in community sports festival activities"
    },
    {
      id: 4,
      title: "Inter-Club Football Match",
      category: "matches",
      description: "Intense football match against rival club",
      imageAlt: "Football players in action during competitive match"
    },
    {
      id: 5,
      title: "Swimming Championship",
      category: "championships",
      description: "Regional swimming championship hosted at SP Club",
      imageAlt: "Swimmers diving into pool at start of championship race"
    },
    {
      id: 6,
      title: "Youth Basketball Training",
      category: "training",
      description: "Young athletes learning basketball fundamentals",
      imageAlt: "Youth basketball players practicing dribbling skills with coach"
    },
    {
      id: 7,
      title: "Annual Awards Ceremony",
      category: "events",
      description: "Celebrating our athletes' achievements",
      imageAlt: "Athletes receiving awards and trophies at annual ceremony"
    },
    {
      id: 8,
      title: "Cricket Practice Session",
      category: "training",
      description: "Professional cricket coaching in action",
      imageAlt: "Cricket players practicing batting techniques with professional coach"
    },
    {
      id: 9,
      title: "Volleyball Tournament",
      category: "matches",
      description: "Exciting volleyball tournament finals",
      imageAlt: "Volleyball players jumping to spike ball during tournament match"
    },
  ];

  const filteredItems = activeCategory === "all" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-accent to-yellow-600 text-accent-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              SP Club <span className="text-white">Gallery</span>
            </h1>
            <p className="text-xl md:text-2xl text-accent-foreground/90 animate-fade-in-up">
              Capturing moments of triumph, teamwork, and athletic excellence
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className={activeCategory === category.id ? "btn-hero" : ""}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <Card key={item.id} className="card-athletic hover-lift overflow-hidden group">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                  {/* Placeholder for actual images */}
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
                    <div className="text-center text-primary-foreground p-6">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📸</span>
                      </div>
                      <p className="text-sm font-medium">{item.imageAlt}</p>
                    </div>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-card text-card-foreground">
                      {categories.find(c => c.id === item.category)?.name}
                    </Badge>
                  </div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                      View Details
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="hover:bg-primary hover:text-primary-foreground">
              Load More Photos
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gradient-hero">Memories in Numbers</h2>
            <p className="text-xl text-muted-foreground">
              Every photo tells a story of dedication and achievement
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">2000+</div>
              <div className="text-muted-foreground">Photos Captured</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">150+</div>
              <div className="text-muted-foreground">Events Documented</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-secondary mb-2">50+</div>
              <div className="text-muted-foreground">Championships</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Athletes Featured</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;