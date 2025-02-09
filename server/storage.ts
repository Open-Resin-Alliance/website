import { type User, type InsertUser, type TeamMember, initialTeamMembers, type Project, initialProjects } from "@shared/schema.js";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllTeamMembers(): Promise<TeamMember[]>;
  getAllProjects(): Promise<Project[]>;
}

export class MemStorage implements IStorage {
  private teamMembers: TeamMember[];
  private projects: Project[];
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
    this.teamMembers = initialTeamMembers.map((member, index) => ({ ...member, id: index + 1 }));
    this.projects = initialProjects.map((project, index) => ({ ...project, id: index + 1, technicalDiagramUrl: project.technicalDiagramUrl || null }));
  }

  async getAllProjects(): Promise<Project[]> {
    return this.projects;
  }

  async getAllTeamMembers(): Promise<TeamMember[]> {
    return this.teamMembers;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

export const storage = new MemStorage();
