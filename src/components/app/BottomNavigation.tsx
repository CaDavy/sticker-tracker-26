import { LayoutDashboard, Image, Repeat2, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

type Tab = 'dashboard' | 'album' | 'trading' | 'family';

interface BottomNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'album', label: 'Album', icon: Image },
    { id: 'trading', label: 'Ruilen', icon: Repeat2 },
    { id: 'family', label: 'Familie', icon: Users }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50" role="navigation" aria-label="Hoofd navigatie">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-4 min-h-[64px] min-w-[64px] transition-colors",
                isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={`${tab.label} tab`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-6 h-6 mb-1" aria-hidden="true" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}