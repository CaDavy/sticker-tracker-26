import { useState } from "react";
import { Scanner } from "./components/app/Scanner";
import { useStickerState } from "./hooks/useStickerState";
import { Dashboard } from "./components/app/Dashboard";
import { TeamOverview } from "./components/app/TeamOverview";
import { StickerGrid } from "./components/app/StickerGrid";
import { FamilyManagement } from "./components/app/FamilyManagement";
import { Trading } from "./components/app/Trading";
import { BottomNavigation } from "./components/app/BottomNavigation";
import { TopBar } from "./components/app/TopBar";
import { getTeamById } from "./data/teams";

type MainTab = "dashboard" | "album" | "trading" | "family";

export default function App() {
  const [mainTab, setMainTab] = useState<MainTab>("dashboard");
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  const {
    state,
    getCurrentMember,
    toggleCollected,
    addDouble,
    removeDouble,
    addFamilyMember,
    removeFamilyMember,
    setCurrentMember,
    updateFamilyMember,
    exportData,
    importData,
    getStats,
    resetCollection,
  } = useStickerState();

  const currentMember = getCurrentMember();
  const stats = getStats();

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        importData(text);
      }
    };

    input.click();
  };

  const handleScanResult = (result: { teamCode: string; number: number }) => {
    const team = getTeamById(result.teamCode);

    if (team) {
      const sticker = team.stickers.find(
        (s) => s.number === result.number
      );

      if (sticker) {
        toggleCollected(sticker.id, sticker.number, team.code);
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto min-h-screen bg-background relative">

      <TopBar
        onExport={exportData}
        onImport={handleImport}
        onReset={resetCollection}
      />

      <main>
        {mainTab === "dashboard" && (
          <Dashboard
            collected={stats.collected}
            doubles={stats.doubles}
            percentage={stats.percentage}
            familyStats={stats.familyStats}
            totalFamilyCollected={stats.totalFamilyCollected}
            familyPercentage={stats.familyPercentage}
            currentMember={currentMember}
            lastChanges={[]}   // 🔥 FIX BUILD ERROR
          />
        )}

        {mainTab === "album" && (
          <>
            {selectedTeamId ? (
              <StickerGrid
                currentMember={currentMember}
                teamId={selectedTeamId}
                onBack={() => setSelectedTeamId(null)}
                onToggleCollected={toggleCollected}
                onAddDouble={addDouble}
                onRemoveDouble={removeDouble}
                onScannerOpen={() => setShowScanner(true)}
              />
            ) : (
              <TeamOverview
                currentMember={currentMember}
                onSelectTeam={(id) => setSelectedTeamId(id)}
              />
            )}
          </>
        )}

        {mainTab === "trading" && (
          <Trading currentMember={currentMember} />
        )}

        {mainTab === "family" && (
          <FamilyManagement
            familyMembers={state.familyMembers}
            currentMemberId={state.currentMemberId}
            onAddMember={addFamilyMember}
            onRemoveMember={removeFamilyMember}
            onSetCurrentMember={setCurrentMember}
            onUpdateMember={updateFamilyMember}
            familyPercentage={stats.familyPercentage}
            totalFamilyCollected={stats.totalFamilyCollected}
            familyStats={stats.familyStats}
          />
        )}
      </main>

      {showScanner && (
        <Scanner
          onClose={() => setShowScanner(false)}
          onScanResult={handleScanResult}
        />
      )}

      <BottomNavigation
        activeTab={mainTab}
        onTabChange={setMainTab}
      />
    </div>
  );
}