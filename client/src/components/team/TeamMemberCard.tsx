import { Card, CardContent, CardHeader } from "@/components/ui/card.js";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar.js";
import { Badge } from "@/components/ui/badge.js";
import { Shield, Mail } from "lucide-react";
import { cn } from "@/lib/utils.js";
import type { TeamMember } from "@shared/schema.js";
import { ImageWithLoading } from "@/components/ui/image-with-loading";

interface TeamMemberCardProps {
  member: TeamMember;
}

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  const isBoardMember = member.isBoardMember;
  const gradientText = "bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent";

  return (
    <Card 
      className="group bg-background/20 backdrop-blur-sm border-border/40 shadow-2xl hover:bg-background/30 transition-colors"
      style={{
        transform: 'translateZ(0)', // Force GPU acceleration
        willChange: 'transform, opacity'
      }}
    >
      <CardHeader className="text-center relative pb-12 pt-5 flex-shrink-0">
        {member.isAdmin && (
          <div className="absolute top-2.5 right-2.5">
            <Badge variant="admin">
              <Shield className="w-3 h-3 mr-1.5 opacity-90" />
              Admin
            </Badge>
          </div>
        )}
        <Avatar className="w-32 h-32 mx-auto border-2 border-border/30 group-hover:border-border/50 transition-colors overflow-hidden">
          <ImageWithLoading 
            src={member.imageUrl} 
            alt={member.name}
            className="h-full w-full object-cover transform-gpu transition-transform duration-300 will-change-transform group-hover:scale-105"
            fetchPriority="high"
          />
          <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="space-y-2 translate-y-4">
          <h3 className={cn(
            "text-xl font-semibold",
            isBoardMember ? "text-foreground" : "text-foreground/90"
          )}>{member.name}</h3>
          <p className={cn(
            "font-medium",
            isBoardMember ? gradientText : "text-muted-foreground"
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
                "inline-flex items-center text-sm transition-colors gap-1.5 px-3 py-1.5 rounded-md transform-gpu",
                isBoardMember 
                  ? "bg-gradient-to-r from-purple-600/10 via-pink-500/10 to-orange-400/10 hover:from-purple-600/20 hover:via-pink-500/20 hover:to-orange-400/20 text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-background/20"
              )}
              style={{
                willChange: 'transform, opacity',
                transform: 'translateZ(0)'
              }}
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
