import { useState } from "react";
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
import Seo from "@/components/Seo";
import { API_ENDPOINTS } from "@/config/api";

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
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
      phone: "",
      subject: "",
      message: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(API_ENDPOINTS.CONTACT, {
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
          variant: "default",
        });
        form.reset();
      } else {
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
  const mapAddress = "SP Club, Shakti Mandir Path, Dhanbad, Jharkhand 826007";

  return (
    <div className="min-h-screen bg-[#0a192f] text-white">
      <Seo
        title="Contact"
        description="Contact SP Club (SP Kabaddi Group Dhanbad) — get in touch to join, enquire about coaching, events, or membership."
        url="https://spkabaddi.me/contact"
        image="https://spkabaddi.me/Logo.png"
        keywords="contact SP Club, SP Kabaddi Group Dhanbad contact, spkg contact"
      />
      {/* Hero Section */}
      <div className="relative">
        {/* START: Background Element */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* 
            ============================================================
            == PASTE YOUR IMAGE OR VIDEO TAG HERE                       ==
            == Example: <img src="/images/your-contact-bg.jpg" alt="Background" className="w-full h-full object-cover" /> ==
            ============================================================
          */}
          <div className="absolute inset-0 bg-black opacity-60"></div>
        </div>
        {/* END: Background Element */}

        <section className="relative z-10 bg-transparent text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                Contact <span className="text-[#facc15]">SP Club</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 animate-fade-in-up">
                Get in touch with us - we're here to help you succeed
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Get in Touch</h2>
                <p className="text-gray-400 text-lg">
                  Ready to start your sporting journey? Have questions about our programs?
                  We'd love to hear from you!
                </p>
              </div>

              <div className="space-y-6">
                <Card className="bg-[#1e3a5f] border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-[#facc15] rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-[#0a192f]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Visit Us</h3>
                        <p className="text-gray-300">
                          {mapAddress.split(', ').map((line, index) => (
                            <span key={index}>{line}<br /></span>
                          ))}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1e3a5f] border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-[#facc15] rounded-lg flex items-center justify-center">
                        <Phone className="w-6 h-6 text-[#0a192f]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Call Us</h3>
                        <p className="text-gray-300">
                          Main Office: +91 9876543210<br />
                          Membership: +91 9876543211
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1e3a5f] border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-[#facc15] rounded-lg flex items-center justify-center">
                        <Mail className="w-6 h-6 text-[#0a192f]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Email Us</h3>
                        <p className="text-gray-300">
                          General: info@spclub.in<br />
                          Membership: join@spclub.in<br />
                          Coaching: coaches@spclub.in
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1e3a5f] border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-[#facc15] rounded-lg flex items-center justify-center">
                        <Clock className="w-6 h-6 text-[#0a192f]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg mb-2">Operating Hours</h3>
                        <p className="text-gray-300">
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
              <Card className="bg-[#1e3a5f] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-white flex items-center">
                    <Send className="w-8 h-8 mr-3 text-[#facc15]" />
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
                              <FormLabel className="text-gray-300">Full Name <span className="text-red-400">*</span></FormLabel>
                              <FormControl>
                                <Input className="bg-[#0a192f] border-gray-600 text-white placeholder-gray-400" placeholder="Enter your full name" required {...field} />
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
                              <FormLabel className="text-gray-300">Email Address <span className="text-red-400">*</span></FormLabel>
                              <FormControl>
                                <Input className="bg-[#0a192f] border-gray-600 text-white placeholder-gray-400" type="email" placeholder="your.email@example.com" required {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Phone Number <span className="text-red-400">*</span></FormLabel>
                            <FormControl>
                              <Input className="bg-[#0a192f] border-gray-600 text-white placeholder-gray-400" type="tel" placeholder="Enter your phone number" required {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Subject <span className="text-red-400">*</span></FormLabel>
                            <FormControl>
                              <Input className="bg-[#0a192f] border-gray-600 text-white placeholder-gray-400" placeholder="What is your message about?" required {...field} />
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
                            <FormLabel className="text-gray-300">Message <span className="text-red-400">*</span></FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell us more about your inquiry..."
                                className="min-h-[120px] bg-[#0a192f] border-gray-600 text-white placeholder-gray-400"
                                required
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
                        className="w-full bg-[#facc15] text-[#0a192f] hover:bg-yellow-400 text-lg py-6"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              {/* Map Section */}
              <Card className="bg-[#1e3a5f] border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-white">Find Us on Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-[#0a192f] rounded-lg flex items-center justify-center p-4">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-[#facc15] mx-auto mb-4" />
                      <h3 className="text-xl font-bold mb-2">SP Club Sports Complex</h3>
                      <p className="text-gray-300 mb-4">
                        {mapAddress.split(', ').map((line, index) => (
                          <span key={index}>{line}<br /></span>
                        ))}
                      </p>
                      <Button asChild className="bg-transparent border border-[#facc15] text-[#facc15] hover:bg-[#facc15] hover:text-[#0a192f]">
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
      <section className="py-16 bg-[#071425]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-400">
              Quick answers to common questions about SP Club
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="bg-[#1e3a5f] border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3 text-white">What sports do you offer?</h3>
                <p className="text-gray-300">
                  We offer training in Cricket, Football, Basketball, Swimming, Tennis, Badminton,
                  Athletics, Boxing, Wrestling, and Volleyball.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1e3a5f] border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3 text-white">What are the membership fees?</h3>
                <p className="text-gray-300">
                  Our memberships start from ₹2,000/month for basic access. Premium and Elite
                  memberships offer additional benefits and personalized training.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1e3a5f] border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3 text-white">Do you provide equipment?</h3>
                <p className="text-gray-300">
                  Basic equipment is available for use. Elite members get complimentary
                  equipment. Personal gear can be purchased through our pro shop.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1e3a5f] border-gray-700">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3 text-white">Are trial sessions available?</h3>
                <p className="text-gray-300">
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