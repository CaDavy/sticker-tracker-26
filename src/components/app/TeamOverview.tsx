import { useState, useRef } from 'react';
import { Team } from '../../types';
import { allTeams } from '../../data/teams';
import { FamilyMember } from '../../types';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { Search, ChevronRight } from 'lucide-react';

interface TeamOverviewProps {
  currentMember: FamilyMember;
  onSelectTeam: (teamId: string) => void;
}

export function TeamOverview({ currentMember, onSelectTeam }: TeamOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredTeams = allTeams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTeamProgress = (team: Team) => {
    const collected = team.stickers.filter(s => currentMember.stickers.collected.has(s.id)).length;
    const total = team.stickers.length;
    const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;
    return { collected, total, percentage };
  };

  return (
    <div className="p-4 pb-20 space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-xl font-extrabold text-foreground">Landen & Specials</h2>
        <p className="text-sm text-muted-foreground">{allTeams.length} teams, {allTeams.reduce((s, t) => s + t.stickers.length, 0)} stickers</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <label htmlFor="team-search" className="sr-only">Zoek teams</label>
        <input
          id="team-search"
          ref={searchRef}
          type="text"
          placeholder="Zoek land of code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none text-base"
        />
      </div>

      <div className="space-y-2.5">
        {filteredTeams.map((team, index) => {
          const { collected, total, percentage } = getTeamProgress(team);
          const isComplete = collected === total;
          return (
            <button
              key={team.id}
              onClick={() => onSelectTeam(team.id)}
              className="w-full text-left group"
              aria-label={`${team.name}, ${collected} van ${total} stickers verzameld`}
              style={{ animationDelay: `${index * 0.02}s` }}
            >
              <Card className={`p-3.5 transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${isComplete ? 'ring-2 ring-green-400' : ''}`}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0"
                    style={{ backgroundColor: team.color + '18' }}
                    aria-hidden="true"
                  >
                    {team.flag}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground truncate">{team.name}</span>
                        <span
                          className="text-xs font-mono font-bold px-2 py-0.5 rounded-md text-white"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.code}
                        </span>
                        {isComplete && (
                          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-sm font-bold text-foreground">{collected}/{total}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="relative">
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                </div>
              </Card>
            </button>
          );
        })}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" aria-hidden="true" />
          <p className="text-muted-foreground">Geen teams gevonden</p>
        </div>
      )}
    </div>
  );
}