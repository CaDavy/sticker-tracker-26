import { useMemo } from 'react';
import { FamilyMember, ChangeLogEntry } from '../../types';
import { getTotalStickersCount, getStickerById } from '../../data/teams';
import { Progress } from '../ui/progress';
import { Card } from '../ui/card';
import { Image, Repeat2, Search, TrendingUp, Users } from 'lucide-react';

interface DashboardProps {
  collected: number;
  doubles: number;
  percentage: number;
  familyStats: Array<{ id: string; name: string; color: string; collected: number; doubles: number }>;
  totalFamilyCollected: number;
  familyPercentage: number;
  currentMember: FamilyMember;
  lastChanges: ChangeLogEntry[];
}

export function Dashboard({ collected, doubles, percentage, familyStats, totalFamilyCollected, familyPercentage, currentMember, lastChanges }: DashboardProps) {
  const total = getTotalStickersCount();

  const getActionText = (action: ChangeLogEntry['action']) => {
    switch (action) {
      case 'collected': return 'toegevoegd';
      case 'removed': return 'verwijderd';
      case 'double_added': return 'dubbel toegevoegd';
      case 'double_removed': return 'dubbel verwijderd';
    }
  };

  const getActionColor = (action: ChangeLogEntry['action']) => {
    switch (action) {
      case 'collected': return 'text-green-600';
      case 'removed': return 'text-red-500';
      case 'double_added': return 'text-orange-500';
      case 'double_removed': return 'text-blue-500';
    }
  };

  const getStickerDisplay = (change: ChangeLogEntry) => {
    const info = getStickerById(change.stickerId);
    if (!info) return `#${change.stickerNumber}`;
    return `${info.team.code} ${change.stickerNumber}`;
  };

  const missing = total - collected;

  const recentChanges = useMemo(() => {
    return lastChanges.slice(0, 8);
  }, [lastChanges]);

  return (
    <div className="p-4 space-y-4 pb-6">
      {/* Header */}
      <div className="text-center mb-2 animate-slide-up">
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="text-3xl">🏆</span>
        </div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Sticker Tracker 26</h1>
        <p className="text-sm text-muted-foreground">Verzamel, ruil, voltooi!</p>
      </div>

      {/* Progress Card */}
      <Card className="p-5 overflow-hidden relative animate-slide-up" style={{ animationDelay: '0.05s' }}>
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: currentMember.color }} />
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
            style={{ backgroundColor: currentMember.color }}
            aria-hidden="true"
          >
            {currentMember.name[0]}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Verzamelaar</p>
            <p className="font-bold text-foreground">{currentMember.name}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-extrabold" style={{ color: currentMember.color }}>{percentage}%</p>
          </div>
        </div>
        <div className="space-y-3">
          <Progress value={percentage} className="h-3.5" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{collected} verzameld</span>
            <span className="text-muted-foreground">{missing} ontbrekend</span>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <Card className="p-4 text-center border-l-4 border-l-green-500">
          <Image className="w-6 h-6 mx-auto mb-2 text-green-600" aria-hidden="true" />
          <p className="text-2xl font-extrabold text-foreground">{collected}</p>
          <p className="text-xs text-muted-foreground">Verzameld</p>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-orange-500">
          <Repeat2 className="w-6 h-6 mx-auto mb-2 text-orange-500" aria-hidden="true" />
          <p className="text-2xl font-extrabold text-foreground">{doubles}</p>
          <p className="text-xs text-muted-foreground">Dubbels</p>
        </Card>
        <Card className="p-4 text-center border-l-4 border-l-blue-500">
          <Search className="w-6 h-6 mx-auto mb-2 text-blue-500" aria-hidden="true" />
          <p className="text-2xl font-extrabold text-foreground">{missing}</p>
          <p className="text-xs text-muted-foreground">Ontbrekend</p>
        </Card>
      </div>

      {/* Family Progress */}
      {familyStats.length > 1 && (
        <Card className="p-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="font-bold text-foreground">Gezamenlijke Voortgang</h2>
          </div>
          <div className="mb-2">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Unieke stickers</span>
              <span className="font-bold text-foreground">{familyPercentage}%</span>
            </div>
            <Progress value={familyPercentage} className="h-2.5" />
            <p className="text-xs text-muted-foreground mt-1">{totalFamilyCollected} unieke stickers in totaal</p>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {familyStats.map(stat => (
              <span
                key={stat.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: stat.color }}
              >
                {stat.name}: {stat.collected}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Recent Activity */}
      {recentChanges.length > 0 && (
        <Card className="p-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="font-bold text-foreground">Recente Wijzigingen</h2>
          </div>
          <ul className="space-y-2" aria-label="Recente sticker wijzigingen">
            {recentChanges.map((change, idx) => (
              <li key={`${change.stickerId}-${change.timestamp}-${idx}`} className="flex items-center justify-between text-sm py-1.5 border-b border-border/50 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground min-w-[4.5rem]">{getStickerDisplay(change)}</span>
                  <span className={`text-xs ${getActionColor(change.action)}`}>{getActionText(change.action)}</span>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(change.timestamp).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
