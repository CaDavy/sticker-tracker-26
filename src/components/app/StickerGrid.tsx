import { useState, useRef, useCallback, useEffect } from 'react';
import { Sticker } from '../../types';
import { getTeamById } from '../../data/teams';
import { FamilyMember } from '../../types';
import { cn } from '../../lib/utils';

import { ChevronLeft, Lock, Unlock, Camera, X, Minus, Plus } from 'lucide-react';

interface StickerGridProps {
  currentMember: FamilyMember;
  teamId: string;
  onBack: () => void;
  onToggleCollected: (stickerId: string, stickerNumber: number, teamCode: string) => void;
  onAddDouble: (stickerId: string, stickerNumber: number, teamCode: string) => void;
  onRemoveDouble: (stickerId: string, stickerNumber: number, teamCode: string) => void;
  onScannerOpen: () => void;
}

export function StickerGrid({ currentMember, teamId, onBack, onToggleCollected, onAddDouble, onRemoveDouble, onScannerOpen }: StickerGridProps) {
  const [scrollLock, setScrollLock] = useState(false);
  const [menuSticker, setMenuSticker] = useState<Sticker | null>(null);
  const [animatingSticker, setAnimatingSticker] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const tapTimer = useRef<number | null>(null);
  const tapCount = useRef(0);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const team = getTeamById(teamId);
  const stickers = team?.stickers || [];

  const isCollected = (sticker: Sticker) => currentMember.stickers.collected.has(sticker.id);
  const getDoublesCount = (sticker: Sticker) => currentMember.stickers.doubles[sticker.id] || 0;

  const handleTouchStart = useCallback((sticker: Sticker, e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };

    longPressTimer.current = window.setTimeout(() => {
      setMenuSticker(sticker);
      setShowMenu(true);
      longPressTimer.current = null;
    }, 600);
  }, []);

  const handleTouchMove = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback((sticker: Sticker, e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    const touch = e.changedTouches[0];
    if (touchStartPos.current) {
      const dx = Math.abs(touch.clientX - touchStartPos.current.x);
      const dy = Math.abs(touch.clientY - touchStartPos.current.y);
      if (dx > 10 || dy > 10) return;
    }

    if (scrollLock) return;

    tapCount.current++;
    if (tapCount.current === 1) {
      tapTimer.current = window.setTimeout(() => {
        onToggleCollected(sticker.id, sticker.number, team?.code || 'SPC');
        setAnimatingSticker(sticker.id);
        setTimeout(() => setAnimatingSticker(null), 250);
        tapCount.current = 0;
      }, 250);
    } else if (tapCount.current === 2) {
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
        tapTimer.current = null;
      }
      onAddDouble(sticker.id, sticker.number, team?.code || 'SPC');
      setAnimatingSticker(sticker.id);
      setTimeout(() => setAnimatingSticker(null), 250);
      tapCount.current = 0;
    }
  }, [scrollLock, onToggleCollected, onAddDouble, team]);

  const handleMouseDown = useCallback((sticker: Sticker) => {
    longPressTimer.current = window.setTimeout(() => {
      setMenuSticker(sticker);
      setShowMenu(true);
      longPressTimer.current = null;
    }, 600);
  }, []);

  const handleMouseUp = useCallback((sticker: Sticker) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      if (scrollLock) return;
      onToggleCollected(sticker.id, sticker.number, team?.code || 'SPC');
      setAnimatingSticker(sticker.id);
      setTimeout(() => setAnimatingSticker(null), 250);
    }
  }, [scrollLock, onToggleCollected, team]);

  const handleContextMenu = useCallback((e: React.MouseEvent, sticker: Sticker) => {
    e.preventDefault();
    setMenuSticker(sticker);
    setShowMenu(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [showMenu]);

  useEffect(() => {
    return () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      if (tapTimer.current) clearTimeout(tapTimer.current);
    };
  }, []);

  const collectedCount = stickers.filter(s => isCollected(s)).length;
  const totalCount = stickers.length;
  const progress = totalCount > 0 ? Math.round((collectedCount / totalCount) * 100) : 0;

  if (!team) {
    return (
      <div className="p-4 pb-20">
        <button onClick={onBack} className="flex items-center gap-2 text-primary mb-4 min-h-[44px] min-w-[44px]">
          <ChevronLeft className="w-5 h-5" aria-hidden="true" /> Terug
        </button>
        <p className="text-muted-foreground">Team niet gevonden</p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-primary font-medium min-h-[44px] min-w-[44px]"
            aria-label="Terug naar landenlijst"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            <span className="hidden sm:inline">Terug</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">{team.flag}</span>
            <div className="text-center">
              <h1 className="text-lg font-extrabold text-foreground leading-tight">{team.name}</h1>
              <p className="text-xs text-muted-foreground">{collectedCount}/{totalCount} stickers</p>
            </div>
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 rounded-md text-white ml-1"
              style={{ backgroundColor: team.color }}
            >
              {team.code}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onScannerOpen}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-primary/10 text-primary"
              aria-label="Open camera scanner"
            >
              <Camera className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={() => setScrollLock(!scrollLock)}
              className={cn(
                "min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors",
                scrollLock ? "bg-orange-100 text-orange-600" : "bg-muted text-muted-foreground"
              )}
              aria-label={scrollLock ? "Scroll lock uit" : "Scroll lock aan"}
              aria-pressed={scrollLock}
            >
              {scrollLock ? <Lock className="w-5 h-5" aria-hidden="true" /> : <Unlock className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: team.color }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      {/* Sticker Grid */}
      <div className="p-3 pt-4">
        <div className="grid grid-cols-5 gap-2.5" role="grid" aria-label={`${team.name} stickers`}>
          {stickers.map((sticker) => {
            const collected = isCollected(sticker);
            const doubles = getDoublesCount(sticker);
            const isAnimating = animatingSticker === sticker.id;

            return (
              <button
                key={sticker.id}
                onMouseDown={() => handleMouseDown(sticker)}
                onMouseUp={() => handleMouseUp(sticker)}
                onMouseLeave={() => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } }}
                onTouchStart={(e) => handleTouchStart(sticker, e)}
                onTouchMove={handleTouchMove}
                onTouchEnd={(e) => handleTouchEnd(sticker, e)}
                onContextMenu={(e) => handleContextMenu(e, sticker)}
                className={cn(
                  "relative aspect-[3/4] rounded-xl flex flex-col items-center justify-between p-1.5 transition-all duration-200 select-none min-h-[72px] min-w-[60px]",
                  collected
                    ? "shadow-lg text-white"
                    : "bg-muted/80 text-muted-foreground border-2 border-dashed border-muted-foreground/30",
                  isAnimating && "animate-pulse-scale"
                )}
                style={collected ? { backgroundColor: team.color } : undefined}
                aria-label={`Sticker ${team.code} ${sticker.number}${collected ? ', verzameld' : ', ontbrekend'}${doubles > 0 ? `, ${doubles} dubbel${doubles > 1 ? 's' : ''}` : ''}`}
                aria-pressed={collected}
              >
                {/* Top: Team Code */}
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-80 leading-none mt-0.5">
                  {team.code}
                </span>

                {/* Center: Number */}
                <span className="text-xl sm:text-2xl font-extrabold leading-none">
                  {sticker.number}
                </span>

                {/* Bottom: Status indicator */}
                <div className="h-4 flex items-center justify-center">
                  {doubles > 0 ? (
                    <span className="text-[9px] font-bold bg-white/25 px-1.5 py-0.5 rounded-full">
                      x{doubles}
                    </span>
                  ) : collected ? (
                    <span className="text-[9px] opacity-70">✓</span>
                  ) : (
                    <span className="text-[9px] opacity-40">—</span>
                  )}
                </div>

                {/* Double badge */}
                {doubles > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-md"
                    style={{ backgroundColor: '#f97316' }}
                    aria-label={`${doubles} dubbel${doubles > 1 ? 's' : ''}`}
                  >
                    {doubles}
                  </span>
                )}

                {/* Shimmer effect for collected */}
                {collected && (
                  <div className="absolute inset-0 rounded-xl sticker-shimmer pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 p-3 bg-muted/50 rounded-xl text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground mb-2">Bediening:</p>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-muted border-2 border-dashed border-muted-foreground/30 inline-block" />
            <span>Ontbrekend</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded inline-block" style={{ backgroundColor: team.color }} />
            <span>Verzameld</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded inline-block relative" style={{ backgroundColor: team.color }}>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full text-[7px] text-white flex items-center justify-center">2</span>
            </span>
            <span>Dubbel tap = dubbel toevoegen</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" aria-hidden="true" />
            <span>Scroll lock voorkomt per ongeluk klikken</span>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {showMenu && menuSticker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div ref={menuRef} className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xs overflow-hidden animate-pop-in">
            <div className="p-4 text-center border-b border-border">
              <div
                className="w-16 h-20 rounded-xl mx-auto mb-2 flex flex-col items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: team.color }}
              >
                <span className="text-xs font-bold">{team.code}</span>
                <span className="text-2xl font-extrabold">{menuSticker.number}</span>
              </div>
              <p className="font-bold text-foreground">{team.name}</p>
            </div>
            <div className="p-2 space-y-1">
              <button
                onClick={() => {
                  onToggleCollected(menuSticker.id, menuSticker.number, team.code);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-muted transition-colors text-left min-h-[48px]"
                aria-label={isCollected(menuSticker) ? 'Markeer als ontbrekend' : 'Markeer als verzameld'}
              >
                <span className="text-xl">{isCollected(menuSticker) ? '❌' : '✅'}</span>
                <span className="font-medium text-foreground">{isCollected(menuSticker) ? 'Markeer ontbrekend' : 'Markeer verzameld'}</span>
              </button>
              <button
                onClick={() => {
                  onAddDouble(menuSticker.id, menuSticker.number, team.code);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-muted transition-colors text-left min-h-[48px]"
                aria-label="Voeg dubbel toe"
              >
                <Plus className="w-5 h-5 text-orange-500" aria-hidden="true" />
                <span className="font-medium text-foreground">Dubbel toevoegen</span>
              </button>
              {getDoublesCount(menuSticker) > 0 && (
                <button
                  onClick={() => {
                    onRemoveDouble(menuSticker.id, menuSticker.number, team.code);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-muted transition-colors text-left min-h-[48px]"
                  aria-label="Verwijder dubbel"
                >
                  <Minus className="w-5 h-5 text-blue-500" aria-hidden="true" />
                  <span className="font-medium text-foreground">Dubbel verwijderen</span>
                </button>
              )}
              <div className="border-t border-border my-1" />
              <button
                onClick={() => setShowMenu(false)}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl hover:bg-muted transition-colors text-left min-h-[48px]"
                aria-label="Sluit menu"
              >
                <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                <span className="font-medium text-muted-foreground">Sluiten</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
