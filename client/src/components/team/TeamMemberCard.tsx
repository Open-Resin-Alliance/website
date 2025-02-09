import { Card, CardContent, CardHeader } from "@/components/ui/card.js";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar.js";
import { Badge } from "@/components/ui/badge.js";
import { Shield, Mail } from "lucide-react";
import { cn } from "@/lib/utils.js";
import type { TeamMember } from "@shared/schema.js";

interface TeamMemberCardProps {
  member: TeamMember;
}

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  const isBoardMember = member.isBoardMember;

  return (
    <Card className={cn(
      "bg-card/50 backdrop-blur-sm border-border/40",
      isBoardMember 
        ? "bg-card/50 backdrop-blur-sm border-border/40 border-primary/20" 
        : "bg-card/50 backdrop-blur-sm border-border/40"
    )}>
      <CardHeader className="text-center relative pb-12 pt-5 flex-shrink-0">
        {member.isAdmin && (
          <div className="absolute top-2.5 right-2.5">
            <Badge 
              variant="outline" 
              className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 backdrop-blur-sm border-orange-500/30 text-orange-500 font-medium text-[0.75rem] px-2.5 py-0.5 group-hover:bg-gradient-to-r group-hover:from-orange-500/20 group-hover:to-amber-500/20 group-hover:border-orange-500/40 transition-colors"
            >
              <Shield className="w-3 h-3 mr-1.5 opacity-90" />
              Admin
            </Badge>
          </div>
        )}
        <Avatar className={cn(
          "w-32 h-32 mx-auto border-2 transition-colors",
          isBoardMember 
            ? "border-primary/30 group-hover:border-primary/50" 
            : "border-border/30 group-hover:border-border/50"
        )}>
          <AvatarImage src={member.imageUrl} alt={member.name} />
          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="space-y-2 translate-y-4">
          <h3 className={cn(
            "text-xl font-semibold",
            isBoardMember ? "text-foreground" : "text-foreground/90"
          )}>{member.name}</h3>
          <p className={cn(
            "font-medium",
            isBoardMember ? "text-primary" : "text-primary/90"
          )}>{member.role}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col justify-between -translate-y-6 pb-1.5">
        <p className="text-muted-foreground text-center leading-relaxed text-[0.9375rem] px-2">
          {member.bio}
        </p>
        {member.email && (
          <div className="flex justify-center pt-1">
            <a 
              href={`mailto:${member.email}`}
              className={cn(
                "inline-flex items-center text-sm transition-colors gap-1.5 px-3 py-1.5 rounded-md",
                isBoardMember 
                  ? "text-primary/90 hover:text-primary hover:bg-primary/10" 
                  : "text-muted-foreground/90 hover:text-primary hover:bg-primary/5"
              )}
            >
              <Mail className="w-3.5 h-3.5" />
              {member.email}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
