import { useState } from 'react';
import { FamilyMember } from '../../types';
import { getStickerById } from '../../data/teams';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { X, Copy, SortAsc, SortDesc, Search, Share2 } from 'lucide-react';

interface DoublesManagerProps {
  currentMember: FamilyMember;
  onRemoveDouble: (stickerId: string, stickerNumber: number, teamCode: string) => void;
}

type SortMode = 'number' | 'count' | 'team';

export function DoublesManager({ currentMember, onRemoveDouble }: DoublesManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('number');
  const [sortAsc, setSortAsc] = useState(true);
  const [copied, setCopied] = useState(false);

  const doubles = Object.entries(currentMember.stickers.doubles)
    .filter(([_, count]) => count > 0)
    .map(([stickerId, count]) => {
      const info = getStickerById(stickerId);
      return { stickerId, info, count };
    })
    .filter(({ info }) => {
      if (!info) return false;
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return info.team.code.toLowerCase().includes(q) ||
        info.team.name.toLowerCase().includes(q) ||
        info.sticker.number.toString().includes(q);
    });

  const sorted = [...doubles].sort((a, b) => {
    if (!a.info || !b.info) return 0;
    switch (sortMode) {
      case 'number': return sortAsc ? a.info.sticker.number - b.info.sticker.number : b.info.sticker.number - a.info.sticker.number;
      case 'count': return sortAsc ? a.count - b.count : b.count - a.count;
      case 'team': return sortAsc ? a.info.team.code.localeCompare(b.info.team.code) : b.info.team.code.localeCompare(a.info.team.code);
    }
  });

  const totalDoubles = doubles.reduce((sum, d) => sum + d.count, 0);

  const handleCopy = async () => {
    const text = sorted.map(d => {
      if (!d.info) return '';
      return `${d.info.team.code} ${d.info.sticker.number} - ${d.info.team.name} (${d.count}x)`;
    }).filter(Boolean).join('\n');
    await navigator.clipboard.writeText(text || 'Geen dubbels');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = sorted.map(d => {
      if (!d.info) return '';
      return `${d.info.team.code} ${d.info.sticker.number} - ${d.info.team.name} (${d.count}x)`;
    }).filter(Boolean).join('%0A');
    const message = `*Mijn Dubbels - Sticker Tracker 26*%0A%0A${text || 'Geen dubbels'}%0A%0A_Wil je ruilen?_`;
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Dubbels</h1>
          <p className="text-sm text-muted-foreground">{doubles.length} stickers, {totalDoubles} totaal</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCopy} variant="outline" size="sm" className="min-h-[44px] min-w-[44px]" aria-label={copied ? 'Gekopieerd!' : 'Kopieer lijst'}>
            <Copy className="w-4 h-4 mr-1.5" aria-hidden="true" />
            {copied ? 'Gekopieerd!' : 'Kopieer'}
          </Button>
          <Button onClick={handleWhatsApp} variant="default" size="sm" className="min-h-[44px] min-w-[44px] bg-green-600 hover:bg-green-700" aria-label="Deel via WhatsApp">
            <Share2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
            WhatsApp
          </Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
        <label htmlFor="doubles-search" className="sr-only">Zoek dubbels</label>
        <Input id="doubles-search" placeholder="Zoek team, code of nummer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground self-center">Sorteer:</span>
        {(['number', 'count', 'team'] as SortMode[]).map(mode => (
          <Button key={mode} variant={sortMode === mode ? 'default' : 'outline'} size="sm"
            onClick={() => { if (sortMode === mode) setSortAsc(!sortAsc); else { setSortMode(mode); setSortAsc(true); } }}
            className="min-h-[44px] capitalize"
          >
            {mode === 'number' ? 'Nummer' : mode === 'count' ? 'Aantal' : 'Team'}
            {sortMode === mode && (sortAsc ? <SortAsc className="w-3 h-3 ml-1" /> : <SortDesc className="w-3 h-3 ml-1" />)}
          </Button>
        ))}
      </div>

      <Card className="divide-y divide-border">
        {sorted.map(({ stickerId, info, count }) => {
          if (!info) return null;
          return (
            <div key={stickerId} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: info.team.color + '18' }}
                >
                  {info.team.flag}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground">{info.team.code} {info.sticker.number}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{info.team.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm font-bold">{count}x</Badge>
                <Button variant="ghost" size="sm" onClick={() => onRemoveDouble(stickerId, info.sticker.number, info.team.code)}
                  className="min-h-[44px] min-w-[44px]" aria-label={`Verwijder een dubbel van sticker ${info.team.code} ${info.sticker.number}`}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
          );
        })}
      </Card>

      {sorted.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" aria-hidden="true" />
          <p className="text-muted-foreground">Nog geen dubbels</p>
          <p className="text-sm text-muted-foreground mt-1">Dubbel-tap op een sticker om een dubbel toe te voegen</p>
        </div>
      )}
    </div>
  );
}
