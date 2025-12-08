import { useState } from "react";
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
import { UserPlus, Star, Shield, Calendar as CalendarIcon, Users, Trophy, Target, X } from "lucide-react";
import Seo from "@/components/Seo";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { API_ENDPOINTS } from "@/config/api";

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  fathersName: z.string().min(2, "Please enter father's name"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number").optional().or(z.literal('')),
  gender: z.string().min(1, "Please select your gender"),
  bloodGroup: z.string().min(1, "Please select your blood group"),
  dob: z.date({ required_error: "Please select your date of birth" }),
  aadharNumber: z.string().min(12, "Aadhar number must be 12 digits").max(12, "Aadhar number must be 12 digits").regex(/^\d{12}$/, "Aadhar number must be exactly 12 digits"),
  role: z.string().min(1, "Please select your role"),
  ageGroup: z.string().optional().or(z.literal('')),
  experience: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  clubDetails: z.string().min(10, "Please provide details about why you want to join the club"),
  message: z.string().optional().or(z.literal('')),
  photo: z.any().refine((file) => file instanceof File || (typeof file === 'string' && file.length > 0), "Passport photo is required"),
  kabaddiPositions: z.array(z.string()).optional(),
  newsletter: z.boolean().default(true),
  terms: z.boolean().refine(val => val === true, "You must agree to the terms and conditions"),
});

type FormData = z.infer<typeof formSchema>;

const Register = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      fathersName: "",
      email: "",
      phone: "",
      gender: "",
      bloodGroup: "",
      role: "",
      ageGroup: "",
      experience: "",
      address: "",
      dob: undefined,
      aadharNumber: "",
      clubDetails: "",
      message: "",
      kabaddiPositions: [],
      newsletter: true,
      terms: false,
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormData) => {
    try {
      // Validate photo is uploaded
      if (!selectedFile) {
        toast({
          title: "Error",
          description: "Please upload your passport size photo",
          variant: "destructive",
        });
        return;
      }

      const formData = new FormData();
      
      // Append all text fields
      formData.append('name', data.name);
      formData.append('fathersName', data.fathersName);
      formData.append('email', data.email);
      formData.append('phone', data.phone || '');
      formData.append('gender', data.gender);
      formData.append('bloodGroup', data.bloodGroup);
      formData.append('role', data.role);
      formData.append('ageGroup', data.ageGroup || '');
      formData.append('experience', data.experience || '');
      formData.append('address', data.address || '');
      formData.append('dob', data.dob.toISOString());
      formData.append('aadharNumber', data.aadharNumber);
      formData.append('clubDetails', data.clubDetails);
      formData.append('message', data.message || '');
      formData.append('newsletter', String(data.newsletter));
      formData.append('terms', String(data.terms));
      
      // Append kabaddi positions as JSON string
      if (data.kabaddiPositions && data.kabaddiPositions.length > 0) {
        formData.append('kabaddiPositions', JSON.stringify(data.kabaddiPositions));
      }
      
      // Append photo if selected
      if (selectedFile) {
        formData.append('photo', selectedFile);
      }

      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: "POST",
        body: formData, // Don't set Content-Type header, browser will set it with boundary
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Registration Successful! 🎉",
          description: result.message || "Welcome to SP Club! We'll contact you within 24 hours.",
          variant: "default",
        });
        form.reset();
        setSelectedFile(null);
      } else {
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

  const kabaddiPositions = [
    { id: "raider", label: "Raider" },
    { id: "rightCorner", label: "Right Corner" },
    { id: "leftCorner", label: "Left Corner" },
    { id: "rightIn", label: "Right In" },
    { id: "leftIn", label: "Left In" },
    { id: "leftCover", label: "Left Cover" },
    { id: "rightCover", label: "Right Cover" },
    { id: "allRounder", label: "All-Rounder" },
  ];

  return (
    <div className="min-h-screen bg-[#0a192f]">
      <Seo
        title="Register"
        description="Register with SP Club (SP Kabaddi Group Dhanbad) to join training, events, and community programs."
        url="https://spkabaddi.me/register"
        image="https://spkabaddi.me/Logo.png"
        keywords="register SP Club, join SP Kabaddi Group Dhanbad, spkg register"
      />
      {/* Hero Section with Background Container */}
      <div className="relative">
        {/* START: Background Element */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* 
            ============================================================
            == PASTE YOUR IMAGE OR VIDEO TAG HERE                       ==
            ==                                                          ==
            == Example Image:                                           ==
            == <img src="/your-background-image.jpg" alt="Background" className="w-full h-full object-cover" /> ==
            ==                                                          ==
            == Example Video:                                           ==
            == <video                                                   ==
            ==   src="/your-background-video.mp4"                       ==
            ==   autoPlay                                               ==
            ==   loop                                                   ==
            ==   muted                                                  ==
            ==   className="w-full h-full object-cover"                 ==
            == />                                                       ==
            ============================================================
          */}

          {/* This dark overlay improves text readability over the background. Adjust opacity as needed. */}
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <img src="/register.png" alt="Background" className="w-full h-full object-cover" />
        </div>
        {/* END: Background Element */}

        {/* Hero Section Content */}
        <section className="relative z-10 bg-transparent text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                Join <span className="text-[#facc15]">SP Club</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 animate-fade-in-up">
                Register as a player or fan and be part of our growing community
              </p>
            </div>
          </div>
        </section>
      </div>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Registration Form</h2>
            <p className="text-lg text-gray-400">
              Fill out the form below to register with SP Club. Fields marked with <span className="text-red-500">*</span> are required.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Why Register Benefits */}
            <div className="space-y-6">
              <Card className="bg-[#1e3a5f] border-gray-700 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Trophy className="w-6 h-6 mr-3 text-[#facc15]" />
                    Why Register with Us?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-gray-300">
                    <li className="flex items-start">
                      <Star className="w-4 h-4 mt-1 mr-2 text-[#facc15] flex-shrink-0" />
                      Get access to exclusive tournaments and events
                    </li>
                    <li className="flex items-start">
                      <Users className="w-4 h-4 mt-1 mr-2 text-[#facc15] flex-shrink-0" />
                      Receive regular updates about upcoming matches and training sessions
                    </li>
                    <li className="flex items-start">
                      <Target className="w-4 h-4 mt-1 mr-2 text-[#facc15] flex-shrink-0" />
                      Connect with other sports enthusiasts and players
                    </li>
                    <li className="flex items-start">
                      <Shield className="w-4 h-4 mt-1 mr-2 text-[#facc15] flex-shrink-0" />
                      Opportunity to participate in our community programs
                    </li>
                    <li className="flex items-start">
                      <CalendarIcon className="w-4 h-4 mt-1 mr-2 text-[#facc15] flex-shrink-0" />
                      Access to coaching and training resources
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Testimonials */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">What Our Members Say</h3>

                <Card className="bg-[#1e3a5f] border-gray-700 text-white">
                  <CardContent className="p-4">
                    <p className="text-sm italic mb-3 text-gray-300">
                      "Joining SP Club has been a game-changer for me. The coaching is excellent, and I've improved my skills significantly."
                    </p>
                    <div className="text-xs">
                      <p className="font-semibold text-white">Rajesh Kumar</p>
                      <p className="text-gray-400">Player, Member since 2020</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1e3a5f] border-gray-700 text-white">
                  <CardContent className="p-4">
                    <p className="text-sm italic mb-3 text-gray-300">
                      "As a fan, I wanted to be more involved with the sport. SP Club organizes regular events that are always exciting!"
                    </p>
                    <div className="text-xs">
                      <p className="font-semibold text-white">Priya Singh</p>
                      <p className="text-gray-400">Fan, Member since 2021</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Registration Form */}
            <div className="lg:col-span-2">
              <Card className="bg-[#1e3a5f] border-gray-700 text-white">
                <CardHeader>
                  <CardTitle className="text-2xl text-white flex items-center">
                    <UserPlus className="w-8 h-8 mr-3 text-[#facc15]" />
                    Join SP Club
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
                            <FormLabel className="text-gray-300">Full Name <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input className="bg-[#0a192f] border-gray-600 text-white placeholder-gray-400" placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Father's Name */}
                      <FormField
                        control={form.control}
                        name="fathersName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Father's Name <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Input className="bg-[#0a192f] border-gray-600 text-white placeholder-gray-400" placeholder="Enter your father's name" {...field} />
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
                              <FormLabel className="text-gray-300">Email Address <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input className="bg-[#0a192f] border-gray-600 text-white placeholder-gray-400" type="email" placeholder="Enter your email address" {...field} />
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
                              <FormLabel className="text-gray-300">Phone Number</FormLabel>
                              <FormControl>
                                <Input className="bg-[#0a192f] border-gray-600 text-white placeholder-gray-400" placeholder="Enter your phone number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Gender and Blood Group */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Gender <span className="text-red-500">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-[#0a192f] border-gray-600 text-white">
                                    <SelectValue placeholder="Select your gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-[#1e3a5f] text-white border-gray-600">
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bloodGroup"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">Blood Group <span className="text-red-500">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-[#0a192f] border-gray-600 text-white">
                                    <SelectValue placeholder="Select your blood group" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-[#1e3a5f] text-white border-gray-600">
                                  <SelectItem value="A+">A+</SelectItem>
                                  <SelectItem value="A-">A-</SelectItem>
                                  <SelectItem value="B+">B+</SelectItem>
                                  <SelectItem value="B-">B-</SelectItem>
                                  <SelectItem value="AB+">AB+</SelectItem>
                                  <SelectItem value="AB-">AB-</SelectItem>
                                  <SelectItem value="O+">O+</SelectItem>
                                  <SelectItem value="O-">O-</SelectItem>
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
                              <FormLabel className="text-gray-300">Date of Birth <span className="text-red-500">*</span></FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "pl-3 text-left font-normal bg-[#0a192f] border-gray-600 text-white hover:bg-[#1e3a5f] hover:text-white",
                                        !field.value && "text-gray-400"
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
                                    captionLayout="dropdown-buttons"
                                    fromYear={1950}
                                    toYear={new Date().getFullYear()}
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
                              <FormLabel className="text-gray-300">Aadhar Number <span className="text-red-500">*</span></FormLabel>
                              <FormControl>
                                <Input className="bg-[#0a192f] border-gray-600 text-white placeholder-gray-400" placeholder="Enter 12-digit Aadhar number" maxLength={12} {...field} />
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
                              <FormLabel className="text-gray-300">Register As <span className="text-red-500">*</span></FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-[#0a192f] border-gray-600 text-white">
                                    <SelectValue placeholder="Select your role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-[#1e3a5f] text-white border-gray-600">
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
                              <FormLabel className="text-gray-300">Age Group</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-[#0a192f] border-gray-600 text-white">
                                    <SelectValue placeholder="Select your age group" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-[#1e3a5f] text-white border-gray-600">
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

                      {/* Experience */}
                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">Sports Experience</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-[#0a192f] border-gray-600 text-white">
                                  <SelectValue placeholder="Select your experience level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#1e3a5f] text-white border-gray-600">
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
                            <FormLabel className="text-gray-300">Address</FormLabel>
                            <FormControl>
                              <Input className="bg-[#0a192f] border-gray-600 text-white placeholder-gray-400" placeholder="Enter your address" {...field} />
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
                            <FormLabel className="text-gray-300">Why do you want to join SP Club? <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Share your motivation, goals, or what you hope to achieve by joining our club..."
                                className="min-h-[100px] bg-[#0a192f] border-gray-600 text-white placeholder-gray-400"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Passport Photo Upload */}
                      <FormField
                        control={form.control}
                        name="photo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">
                              Upload Passport Size Photo <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="space-y-4">
                                {/* File Upload Area */}
                                {!selectedFile ? (
                                  <div className="relative">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      required
                                      className="bg-[#0a192f] border-2 border-dashed border-gray-600 text-white placeholder-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#facc15] file:text-[#0a192f] hover:file:bg-yellow-400 h-32 cursor-pointer"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setSelectedFile(file);
                                          field.onChange(file);
                                        }
                                      }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-sm">
                                      <div className="text-center">
                                        <p className="font-semibold">Click to upload or drag and drop</p>
                                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (max. 5MB)</p>
                                      </div>
                                    </div>
                                  </div>
                                ) : null}

                                {/* Preview uploaded image */}
                                {selectedFile && (
                                  <div className="bg-[#1e3a5f] p-6 rounded-lg border-2 border-[#facc15]">
                                    <div className="flex items-center justify-between mb-4">
                                      <span className="text-sm font-semibold text-white">
                                        ✓ Photo Selected
                                      </span>
                                      <Button
                                        type="button"
                                        onClick={() => {
                                          setSelectedFile(null);
                                          field.onChange(null);
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="h-8 text-xs border-red-600 text-white hover:bg-red-600 hover:border-red-600 hover:text-white"
                                      >
                                        <X className="w-3 h-3 mr-1" />
                                        Change Photo
                                      </Button>
                                    </div>
                                    <div className="flex gap-4">
                                      <div className="flex-shrink-0">
                                        <img
                                          src={URL.createObjectURL(selectedFile)}
                                          alt="Photo Preview"
                                          className="h-40 w-32 object-cover rounded-lg border-2 border-[#facc15] bg-[#0a192f] p-1"
                                        />
                                      </div>
                                      <div className="flex-grow flex flex-col justify-center">
                                        <p className="text-sm text-gray-300 font-medium">File Details:</p>
                                        <p className="text-xs text-gray-400 mt-2">
                                          <span className="font-semibold">Name:</span> {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          <span className="font-semibold">Size:</span> {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          <span className="font-semibold">Type:</span> {selectedFile.type}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Kabaddi Positions */}
                      <FormField
                        control={form.control}
                        name="kabaddiPositions"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-gray-300">Kabaddi Positions (Select all that apply)</FormLabel>
                              <p className="text-xs text-gray-400 mt-1">Optional - Select if you play kabaddi</p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {kabaddiPositions.map((position) => (
                                <FormField
                                  key={position.id}
                                  control={form.control}
                                  name="kabaddiPositions"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={position.id}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(position.id)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...(field.value || []), position.id])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== position.id
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal text-gray-300">
                                          {position.label}
                                        </FormLabel>
                                      </FormItem>
                                    );
                                  }}
                                />
                              ))}
                            </div>
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
                            <FormLabel className="text-gray-300">Additional Information</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Share any additional information or questions you have"
                                className="bg-[#0a192f] border-gray-600 text-white placeholder-gray-400"
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
                              <FormLabel className="text-gray-300">
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
                              <FormLabel className="text-gray-300">
                                I agree to the <a href="#" className="text-[#facc15] underline">Terms and Conditions</a> and <a href="#" className="text-[#facc15] underline">Privacy Policy</a> <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-[#facc15] text-[#0a192f] hover:bg-yellow-400 text-lg py-6"
                        disabled={isSubmitting}
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