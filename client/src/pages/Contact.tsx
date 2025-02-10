import { Github, MessageSquare, AtSign, SendHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Textarea } from "@/components/ui/textarea.js";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Label } from "@/components/ui/label.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.js";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast.js";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  topic: z.enum(["Partnerships", "Sponsorships", "Media Inquiry", "Privacy", "Support", "General Inquiries"], {
    required_error: "Please select a topic",
  }),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type FormData = z.infer<typeof formSchema>;

const communityLinks = [
  {
    title: "GitHub",
    description: "Check out our open source projects and contribute to development",
    icon: Github,
    href: "https://github.com/Open-Resin-Alliance",
  },
  {
    title: "Discord",
    description: "Join our community chat to discuss projects and get help",
    icon: MessageSquare,
    href: "https://discord.com/invite/beFeTaPH6v",
  },
  {
    title: "Bluesky",
    description: "Follow us for updates and announcements",
    icon: AtSign,
    href: "https://bsky.app/profile/openresin.org",
  },
];

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || "Failed to send message");

      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 space-y-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter">Contact Us</h1>
        <p className="text-muted-foreground">Get in touch with the Open Resin Alliance community</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {communityLinks.map((link) => (
          <a
            key={link.title}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="h-full bg-background/20 backdrop-blur-sm border-border/40 shadow-lg hover:bg-background/30 transition-colors">
              <CardHeader>
                <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 w-10 h-10 rounded-lg flex items-center justify-center mb-2">
                  <link.icon className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-xl">{link.title}</CardTitle>
                <CardDescription>{link.description}</CardDescription>
              </CardHeader>
            </Card>
          </a>
        ))}
      </div>

      <Card className="bg-background/20 backdrop-blur-sm border-border/40">
        <CardHeader>
          <CardTitle>Send us a Message</CardTitle>
          <CardDescription>
            We'll get back to you as soon as possible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                {...register("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Select 
                onValueChange={(value: FormData["topic"]) => setValue("topic", value)} 
                defaultValue="General Inquiries"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Partnerships">Partnerships</SelectItem>
                  <SelectItem value="Sponsorships">Sponsorships</SelectItem>
                  <SelectItem value="Media Inquiry">Media Inquiry</SelectItem>
                  <SelectItem value="Privacy">Privacy</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                  <SelectItem value="General Inquiries">General Inquiries</SelectItem>
                </SelectContent>
              </Select>
              {errors.topic && (
                <p className="text-sm text-destructive">{errors.topic.message}</p>
              )}
            </div>
            {watch("topic") === "Support" ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-border/40 bg-background/20 p-4 sm:p-5">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Need Help?</h3>
                  <p className="text-base text-muted-foreground mb-4 sm:mb-6">
                    For technical support and help with our projects, please use our community channels:
                  </p>
                  <div className="space-y-4">
                    <a
                      href="https://github.com/Open-Resin-Alliance"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2.5 sm:space-x-3 text-base p-2.5 sm:p-3 rounded-md hover:bg-background/40 transition-colors group relative"
                    >
                      <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Open an issue on GitHub</span>
                      <div className="absolute inset-0 border border-border/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                    <a
                      href="https://discord.com/invite/beFeTaPH6v"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2.5 sm:space-x-3 text-base p-2.5 sm:p-3 rounded-md hover:bg-background/40 transition-colors group relative"
                    >
                      <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span>Get help on our Discord server</span>
                      <div className="absolute inset-0 border border-border/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Type your message here"
                  className="min-h-[150px]"
                  {...register("message")}
                  aria-invalid={!!errors.message}
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message.message}</p>
                )}
              </div>
            )}
            {watch("topic") !== "Support" && (
              <Button 
                type="submit" 
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 text-white" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <SendHorizontal className="w-4 h-4 mr-2" />
                    <span>Send Message</span>
                  </div>
                )}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}