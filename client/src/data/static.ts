import { type Project, type TeamMember } from "@shared/schema.js";

export const projects: Project[] = [
  {
    id: 1,
    name: "Orion",
    description: "A user interface designed to control Odyssey, built for Linux SBCs and tailored for mSLA printer control",
    features: [
      "User-friendly Interface for mSLA printers",
      "Real-time print monitoring",
      "Simplified file management",
      "Customizable print settings",
    ],
    status: "Beta - In Development",
    imageUrl: "/projects/orion.png",
    technicalDiagramUrl: "https://images.unsplash.com/photo-1620860279731-3f193cffe80f",
    githubRepo: "Open-Resin-Alliance/orion"
  },
  {
    id: 2,
    name: "Odyssey",
    description: "Engine for processing Prusa SL1 slicer files for the Apollo series of control boards.",
    features: [
      "Prusa SL1 file processing",
      "Extensive printer control",
      "Advanced configuration options",
      "High performance & reliability",
    ],
    status: "Beta - In Development",
    imageUrl: "/projects/odyssey.png",
    technicalDiagramUrl: "https://images.unsplash.com/photo-1653566031536-4d1b6a9da15e",
    githubRepo: "Open-Resin-Alliance/odyssey"
  }
];

export const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Paul Skapczyk",
    role: "Engineering",
    bio: "Mechatronics Student, developing Orion and Apollo.",
    imageUrl: "https://cdn.discordapp.com/avatars/240807504236380160/988013eaac194009c30a29ef4fb6d983?size=1024",
    email: "paul@openresin.org",
    isAdmin: true,
    isBoardMember: true
  },
  {
    id: 2,
    name: "Ada Phillips",
    role: "Sofware",
    bio: "Software Engineer, developing Odyssey and our OS.",
    imageUrl: "https://cdn.discordapp.com/avatars/250084304913301516/27f60b95a58f8a96407c3f0c97590e11?size=1024",
    email: "ada@openresin.org",
    isAdmin: false,
    isBoardMember: true
  },
  {
    id: 3,
    name: "Sam Boutin",
    role: "Hardware Engineer",
    bio: "Founder behind TheContrappostoShop and the Prometheus mSLA project.",
    imageUrl: "https://cdn.discordapp.com/avatars/217428089968263169/41a9db9b7fbff76f34f67ddcd45810b0?size=1024",
    email: "sam@openresin.org",
    isAdmin: false,
    isBoardMember: true
  },
  {
    id: 4,
    name: "Olivia van Doorn",
    role: "Artist",
    bio: "General artist and designer",
    imageUrl: "https://cdn.discordapp.com/avatars/175292904380563457/652b9e45b3b5d4fbab102f80072b224e?size=1024",
    email: "contact@openresin.org",
    isAdmin: false,
    isBoardMember: false
  },
  {
    id: 5,
    name: "autem_lux",
    role: "Artist",
    bio: "Artist behind our logo and branding.",
    imageUrl: "https://cdn.discordapp.com/avatars/618436550161858560/20380b03b6da1c7b104355e0e681b67f?size=1024",
    email: "contact@openresin.org",
    isAdmin: false,
    isBoardMember: false
  },
  {
    id: 6,
    name: "Goran Mahovlic",
    role: "Technician",
    bio: "General technician and developer and cool guy. Reverse Engineer.",
    imageUrl: "https://avatars.githubusercontent.com/u/4248736?v=4",
    email: "goran.mahovlic@openresin.org",
    isAdmin: false,
    isBoardMember: false
  },
  {
    id: 7,
    name: "Kommi",
    role: "Quality Assurance",
    bio: "Ensures the quality of our software and hardware. Professionally Incompetent.",
    imageUrl: "/media/derp.png",
    email: "kommi@openresin.org",
    isAdmin: false,
    isBoardMember: false
  }
];