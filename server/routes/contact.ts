import { Router } from "express";
import { z } from "zod";
import nodemailer from "nodemailer";

const router = Router();

const contactFormSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  topic: z.enum(["Partnerships", "Sponsorships", "Media Inquiry", "Privacy", "Support", "General Inquiries"]),
  message: z.string().min(10),
});

// Configure email transport with Mailcow settings
const transporter = nodemailer.createTransport({
  host: "mail.openresin.org",
  port: 587,
  secure: false,
  auth: {
    user: "contact@openresin.org",
    pass: "99,_,atHRaU",
  },
  tls: {
    rejectUnauthorized: false
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, topic, message } = contactFormSchema.parse(req.body);
    
    await transporter.sendMail({
      from: "contact@openresin.org",
      to: "contact@openresin.org",
      subject: `[${topic}] Contact Form - ${name}`,
      text: `From: ${name} <${email}>\nTopic: ${topic}\n\n${message}`,
      replyTo: email,
    });
    
    return res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(400).json({ 
      message: error instanceof z.ZodError 
        ? "Invalid form data" 
        : "Failed to send message" 
    });
  }
});

export default router;