import { useState } from "react"; // Kept for consistency, though formState.isSubmitting handles submission state
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Star, Shield, Calendar as CalendarIcon, Users, Trophy, Target } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number").optional().or(z.literal('')), // Make phone truly optional at Zod level, allowing empty string
  role: z.string().min(1, "Please select your role"),
  ageGroup: z.string().optional().or(z.literal('')),
  experience: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  dob: z.date({ required_error: "Please select your date of birth" }),
  aadharNumber: z.string().min(12, "Aadhar number must be 12 digits").max(12, "Aadhar number must be 12 digits").regex(/^\d{12}$/, "Aadhar number must be exactly 12 digits"), // Added regex for digits
  clubDetails: z.string().min(10, "Please provide details about why you want to join the club"),
  message: z.string().optional().or(z.literal('')),
  newsletter: z.boolean().default(true),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms and conditions"),
});

type FormData = z.infer<typeof formSchema>;

const Register = () => {
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      ageGroup: "",
      experience: "",
      address: "",
      aadharNumber: "",
      clubDetails: "",
      message: "",
      newsletter: true,
      terms: false,
    },
  });

  // Accessing isSubmitting from formState directly
  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("https://sp-club-backend.vercel.app/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Ensure dob is formatted as an ISO string for the backend
        body: JSON.stringify({
          ...data,
          dob: data.dob.toISOString(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Registration Successful! 🎉",
          description: result.message || "Welcome to SP Kabaddi Group! We'll contact you within 24 hours.",
          variant: "default", // You might define a 'success' variant in your toast setup
        });
        form.reset(); // Reset the form after successful submission
      } else {
        // Handle backend errors
        toast({
          title: "Registration Failed ❌",
          description: result.message || "An unexpected error occurred. Please try again.",
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

  const roles = [
    { value: "player", label: "Player" },
    { value: "fan", label: "Fan" },
    { value: "coach", label: "Coach" },
    { value: "official", label: "Match Official" },
    { value: "other", label: "Other" }
  ];

  const ageGroups = [
    { value: "under18", label: "Under 18" },
    { value: "18-25", label: "18-25" },
    { value: "26-35", label: "26-35" },
    { value: "36-45", label: "36-45" },
    { value: "above45", label: "Above 45" }
  ];

  const experienceLevels = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "professional", label: "Professional" },
    { value: "none", label: "No Experience" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-red-600 text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              Join <span className="text-accent">SP Kabaddi Group</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 animate-fade-in-up">
              Register as a player or fan and be part of our growing Kabaddi community
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient-hero mb-4">Registration Form</h2>
            <p className="text-lg text-muted-foreground">
              Fill out the form below to register with SP Kabaddi Group. Fields marked with <span className="text-destructive">*</span> are required.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Why Register Benefits */}
            <div className="space-y-6">
              <Card className="card-athletic">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Trophy className="w-6 h-6 mr-3 text-accent" />
                    Why Register with Us?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <Star className="w-4 h-4 mt-1 mr-2 text-primary flex-shrink-0" />
                      Get access to exclusive Kabaddi tournaments and events
                    </li>
                    <li className="flex items-start">
                      <Users className="w-4 h-4 mt-1 mr-2 text-primary flex-shrink-0" />
                      Receive regular updates about upcoming matches and training sessions
                    </li>
                    <li className="flex items-start">
                      <Target className="w-4 h-4 mt-1 mr-2 text-primary flex-shrink-0" />
                      Connect with other Kabaddi enthusiasts and players
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 mt-1 mr-2 text-primary flex-shrink-0" />
                      Opportunity to participate in our community programs
                    </li>
                    <li className="flex items-start">
                      <CalendarIcon className="w-4 h-4 mt-1 mr-2 text-primary flex-shrink-0" />
                      Access to coaching and training resources
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Testimonials */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gradient-hero">What Our Members Say</h3>

                <Card className="card-champion">
                  <CardContent className="p-4">
                    <p className="text-sm italic mb-3">
                      "Joining SP Kabaddi Group has been a game-changer for me. The coaching is excellent, and I've improved my skills significantly."
                    </p>
                    <div className="text-xs">
                      <p className="font-semibold">Rajesh Kumar</p>
                      <p className="text-muted-foreground">Player, Member since 2020</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="card-athletic">
                  <CardContent className="p-4">
                    <p className="text-sm italic mb-3">
                      "As a Kabaddi fan, I wanted to be more involved with the sport. SP Kabaddi Group organizes regular events that are always exciting!"
                    </p>
                    <div className="text-xs">
                      <p className="font-semibold">Priya Singh</p>
                      <p className="text-muted-foreground">Fan, Member since 2021</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Registration Form */}
            <div className="lg:col-span-2">
              <Card className="card-athletic">
                <CardHeader>
                  <CardTitle className="text-2xl text-gradient-hero flex items-center">
                    <UserPlus className="w-8 h-8 mr-3" />
                    Join SP Kabaddi Group
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Full Name */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email and Phone */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Enter your email address" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Role and Age Group */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Register As <span className="text-destructive">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {roles.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ageGroup"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Age Group</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select your age group" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {ageGroups.map((age) => (
                                    <SelectItem key={age.value} value={age.value}>{age.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* DOB and Aadhar */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="dob"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Date of Birth <span className="text-destructive">*</span></FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="aadharNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Aadhar Number <span className="text-destructive">*</span></FormLabel>
                              <FormControl>
                                <Input placeholder="Enter 12-digit Aadhar number" maxLength={12} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Experience */}
                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Kabaddi Experience</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your experience level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {experienceLevels.map((level) => (
                                  <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Address */}
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Club Details */}
                      <FormField
                        control={form.control}
                        name="clubDetails"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Why do you want to join SP Kabaddi Group? <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Share your motivation, goals, or what you hope to achieve by joining our club..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Additional Information */}
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Information</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Share any additional information or questions you have"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Newsletter */}
                      <FormField
                        control={form.control}
                        name="newsletter"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                Subscribe to our newsletter for updates on events, matches, and community activities
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Terms */}
                      <FormField
                        control={form.control}
                        name="terms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I agree to the <a href="#" className="text-primary underline">Terms and Conditions</a> and <a href="#" className="text-primary underline">Privacy Policy</a> <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full btn-hero text-lg py-6"
                        disabled={isSubmitting} // Use isSubmitting from form.formState
                      >
                        {isSubmitting ? "Processing..." : "Register Now"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;