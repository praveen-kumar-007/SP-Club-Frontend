import { useState } from "react"; // Kept for consistency, though formState.isSubmitting handles submission state
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

const Contact = () => {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  // Accessing isSubmitting from formState directly
  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("https://sp-club-backend.onrender.com/api/contact", { // <--- Backend API endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Message Sent Successfully! 📧",
          description: result.message || "We'll get back to you within 24 hours.",
          variant: "default", // You might define a 'success' variant in your toast setup
        });
        form.reset(); // Reset the form after successful submission
      } else {
        // Handle backend errors
        toast({
          title: "Failed to Send Message ❌",
          description: result.message || "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Network or submission error:", error);
      toast({
        title: "Network Error 🔌",
        description: "Could not connect to the server. Please check your internet connection and try again.",
        variant: "destructive",
      });
    }
  };

  const googleMapsLink = "https://www.google.com/maps/search/?api=1&query=QCJF%2BF93+SP+Kabaddi+Group+Dhanbad%2C+Shakti+Mandir+Path%2C+Dhanbad%2C+Jharkhand+826007";
  const mapAddress = "SP Kabaddi Group Dhanbad, Shakti Mandir Path, Dhanbad, Jharkhand 826007";


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary to-blue-700 text-secondary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              Contact <span className="text-accent">SP Club</span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary-foreground/90 animate-fade-in-up">
              Get in touch with us - we're here to help you succeed
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gradient-hero mb-6">Get in Touch</h2>
                <p className="text-muted-foreground text-lg">
                  Ready to start your sporting journey? Have questions about our programs?
                  We'd love to hear from you!
                </p>
              </div>

              <div className="space-y-6">
                <Card className="card-athletic">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Visit Us</h3>
                        <p className="text-muted-foreground">
                          {mapAddress.split(', ').map((line, index) => (
                            <span key={index}>{line}<br /></span>
                          ))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-champion">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Call Us</h3>
                        <p className="text-muted-foreground">
                          Main Office: +91 9876543210<br />
                          Membership: +91 9876543211
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-athletic">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-secondary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Email Us</h3>
                        <p className="text-muted-foreground">
                          General: info@spclub.in<br />
                          Membership: join@spclub.in<br />
                          Coaching: coaches@spclub.in
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-champion">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Operating Hours</h3>
                        <p className="text-muted-foreground">
                          Monday - Friday: 6:00 AM - 10:00 PM<br />
                          Saturday - Sunday: 7:00 AM - 9:00 PM<br />
                          Public Holidays: 8:00 AM - 6:00 PM
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Contact Form and Map */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Form */}
              <Card className="card-athletic">
                <CardHeader>
                  <CardTitle className="text-2xl text-gradient-hero flex items-center">
                    <Send className="w-8 h-8 mr-3" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="your.email@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="What is your message about?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us more about your inquiry..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full btn-hero text-lg py-6"
                        disabled={isSubmitting} // Use isSubmitting from form.formState
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Map Section */}
              <Card className="card-athletic">
                <CardHeader>
                  <CardTitle className="text-2xl text-gradient-hero">Find Us on Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">SP Club Sports Complex</h3>
                      <p className="text-muted-foreground mb-4">
                        {mapAddress.split(', ').map((line, index) => (
                          <span key={index}>{line}<br /></span>
                        ))}
                      </p>
                      <Button asChild variant="outline" className="hover:bg-primary hover:text-primary-foreground">
                        <a href={googleMapsLink} target="_blank" rel="noopener noreferrer">
                          Open in Google Maps
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gradient-hero">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground">
              Quick answers to common questions about SP Club
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="card-athletic">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3">What sports do you offer?</h3>
                <p className="text-muted-foreground">
                  We offer training in Cricket, Football, Basketball, Swimming, Tennis, Badminton,
                  Athletics, Boxing, Wrestling, and Volleyball.
                </p>
              </CardContent>
            </Card>

            <Card className="card-athletic">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3">What are the membership fees?</h3>
                <p className="text-muted-foreground">
                  Our memberships start from ₹2,000/month for basic access. Premium and Elite
                  memberships offer additional benefits and personalized training.
                </p>
              </CardContent>
            </Card>

            <Card className="card-athletic">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3">Do you provide equipment?</h3>
                <p className="text-muted-foreground">
                  Basic equipment is available for use. Elite members get complimentary
                  equipment. Personal gear can be purchased through our pro shop.
                </p>
              </CardContent>
            </Card>

            <Card className="card-athletic">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3">Are trial sessions available?</h3>
                <p className="text-muted-foreground">
                  Yes! We offer free trial sessions for new members. Contact us to schedule
                  your trial and experience our facilities firsthand.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
