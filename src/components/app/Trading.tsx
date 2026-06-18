import { useState } from 'react';
import { FamilyMember } from '../../types';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

import { getStickerById, allTeams } from '../../data/teams';
import { Copy, Share2 } from 'lucide-react';

interface TradingProps {
  currentMember: FamilyMember;
}

export function Trading({ currentMember }: TradingProps) {
  const [copied, setCopied] = useState(false);

  const doubles = Object.entries(currentMember.stickers.doubles)
    .filter(([_, count]) => count > 0)
    .map(([stickerId, count]) => {
      const info = getStickerById(stickerId);
      return { stickerId, info, count };
    })
    .filter(Boolean);

  const missing = allTeams.flatMap(team =>
    team.stickers.filter(s => !currentMember.stickers.collected.has(s.id)).map(s => ({
      sticker: s,
      team
    }))
  );

  const generateTradeText = () => {
    const doubleLines = doubles.map(d => {
      if (!d.info) return '';
      return `${d.info.team.code} ${d.info.sticker.number} - ${d.info.team.name} (${d.count}x)`;
    }).filter(Boolean);

    const missingLines = missing.map(m => `${m.team.code} ${m.sticker.number} - ${m.team.name}`);

    return `*Sticker Tracker 26 - Ruiloverzicht*\n\n` +
      `*IK HEB (${doubles.length})*\n${doubleLines.join('\n') || 'Geen dubbels'}\n\n` +
      `*IK ZOEK (${missing.length})*\n${missingLines.join('\n') || 'Alles compleet!'}\n\n` +
      `_Verstuurd vanuit Sticker Tracker 26_`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateTradeText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(generateTradeText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="p-4 pb-20 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Ruiloverzicht</h1>
          <p className="text-sm text-muted-foreground">Dubbels en ontbrekende stickers</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCopy} variant="outline" size="sm" className="min-h-[44px]" aria-label={copied ? 'Gekopieerd!' : 'Kopieer ruiloverzicht'}>
            <Copy className="w-4 h-4 mr-1.5" aria-hidden="true" />
            {copied ? 'Gekopieerd!' : 'Kopieer'}
          </Button>
          <Button onClick={handleWhatsApp} size="sm" className="min-h-[44px] bg-green-600 hover:bg-green-700" aria-label="Deel via WhatsApp">
            <Share2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
            WhatsApp
          </Button>
        </div>
      </div>

      {/* Doubles */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <span className="text-green-600" aria-hidden="true">✅</span>
            Ik heb ({doubles.length})
          </h2>
        </div>
        {doubles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {doubles.slice(0, 18).map(({ stickerId, info, count }) => {
              if (!info) return null;
              return (
                <div key={stickerId} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <span className="text-lg" aria-hidden="true">{info.team.flag}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-bold text-foreground truncate">{info.team.code} {info.sticker.number}</p>
                    <p className="text-xs text-muted-foreground truncate">{count}x</p>
                  </div>
                </div>
              );
            })}
            {doubles.length > 18 && (
              <p className="col-span-full text-center text-sm text-muted-foreground py-2">+{doubles.length - 18} meer</p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Nog geen dubbels om te ruilen</p>
        )}
      </Card>

      {/* Missing */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <span className="text-orange-500" aria-hidden="true">🔍</span>
            Ik zoek ({missing.length})
          </h2>
        </div>
        {missing.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {missing.slice(0, 18).map(({ sticker, team }) => (
              <div key={sticker.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <span className="text-lg" aria-hidden="true">{team.flag}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-sm font-bold text-foreground truncate">{team.code} {sticker.number}</p>
                  <p className="text-xs text-muted-foreground truncate">{team.name}</p>
                </div>
              </div>
            ))}
            {missing.length > 18 && (
              <p className="col-span-full text-center text-sm text-muted-foreground py-2">+{missing.length - 18} meer</p>
            )}
          </div>
        ) : (
          <p className="text-green-600 text-sm font-bold">Collectie compleet!</p>
        )}
      </Card>
    </div>
  );
}