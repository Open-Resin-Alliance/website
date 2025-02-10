import TeamMemberCard from "@/components/team/TeamMemberCard.js";
import { type TeamMember } from "@shared/schema.js";
import { teamMembers } from "@/data/static.js";

function BalancedGrid({ members, isBoardSection }: { members: TeamMember[]; isBoardSection?: boolean }) {
  // For 1-2 members (typically board members), center them in the layout
  if (members.length <= 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 max-w-4xl mx-auto">
        {members.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    );
  }

  // For 3 members, use three columns
  if (members.length === 3) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {members.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    );
  }

  // For 4 members, use 2x2 grid
  if (members.length === 4) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-10 lg:max-w-4xl mx-auto">
        {members.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    );
  }

  // For 5 members, use 3-2 split
  if (members.length === 5) {
    return (
      <div className="space-y-8 lg:space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {members.slice(0, 3).map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 lg:max-w-4xl mx-auto">
          {members.slice(3).map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </div>
    );
  }

  // For 6 or more members, use 3-column grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
      {members.map((member) => (
        <TeamMemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}

export default function About() {
  const boardMembers = teamMembers.filter(member => member.isBoardMember);
  const otherMembers = teamMembers.filter(member => !member.isBoardMember);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-20">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">Our Team</h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
          Meet the dedicated professionals working to advance open source resin 3D printing technology.
        </p>
      </div>
      <div className="space-y-24">
        <div>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">Board Members</h2>
          </div>
          <BalancedGrid members={boardMembers} isBoardSection />
        </div>
        <div>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-foreground/90">Team Members</h2>
          </div>
          <BalancedGrid members={otherMembers} />
        </div>
      </div>
    </div>
  );
}
