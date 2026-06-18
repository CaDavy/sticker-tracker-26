import { useState } from 'react';
import { Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

interface TopBarProps {
  onExport: () => string;
  onImport: () => void;
  onReset: () => void;
}

export function TopBar({ onExport, onImport, onReset }: TopBarProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    const data = onExport();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sticker-tracker-26-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
      <div className="flex items-center justify-between px-4 py-2.5 max-w-lg mx-auto">
        <div className="flex items-center gap-1">
          <span className="text-xl mr-1" aria-hidden="true">🏆</span>
          <span className="font-extrabold text-foreground text-sm sm:text-base">Sticker Tracker 26</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={handleExport} aria-label="Exporteer collectie" className="min-h-[44px] min-w-[44px]">
            <Download className="w-5 h-5" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onImport} aria-label="Importeer collectie" className="min-h-[44px] min-w-[44px]">
            <Upload className="w-5 h-5" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowResetConfirm(true)} aria-label="Reset collectie" className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive">
            <Trash2 className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xs p-5 animate-pop-in">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-8 h-8 text-destructive" aria-hidden="true" />
              <div>
                <h3 className="font-bold text-foreground">Collectie resetten?</h3>
                <p className="text-sm text-muted-foreground">Dit verwijdert alle stickers</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex-1 min-h-[44px]" onClick={() => setShowResetConfirm(false)}>Annuleren</Button>
              <Button variant="destructive" className="flex-1 min-h-[44px]" onClick={() => { onReset(); setShowResetConfirm(false); }}>Reset</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
