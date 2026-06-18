import { useState, useEffect, useCallback } from 'react';
import { AppState, FamilyMember, ChangeLogEntry, CollectorsStickers } from '../types';
import { getTotalStickersCount } from '../data/teams';

const STORAGE_KEY = 'sticker-tracker-26-v1';
const MAX_CHANGES = 50;

const createEmptyStickers = (): CollectorsStickers => ({
  collected: new Set<string>(),
  doubles: {}
});

const defaultMember: FamilyMember = {
  id: 'default',
  name: 'Mijn Collectie',
  color: '#3b82f6',
  stickers: createEmptyStickers()
};

const getInitialState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        familyMembers: parsed.familyMembers.map((m: FamilyMember & { stickers: { collected: string[]; doubles: Record<string, number> } }) => ({
          ...m,
          stickers: { collected: new Set(m.stickers.collected), doubles: m.stickers.doubles }
        })),
        lastChanges: parsed.lastChanges || []
      };
    }
  } catch (e) {
    console.error('Fout bij laden:', e);
  }
  return { currentMemberId: 'default', familyMembers: [defaultMember], lastChanges: [] };
};

export function useStickerState() {
  const [state, setState] = useState<AppState>(getInitialState);

  useEffect(() => {
    const toStore = {
      ...state,
      familyMembers: state.familyMembers.map(m => ({
        ...m,
        stickers: { collected: Array.from(m.stickers.collected), doubles: m.stickers.doubles }
      }))
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }, [state]);

  const getCurrentMember = useCallback((): FamilyMember =>
    state.familyMembers.find(m => m.id === state.currentMemberId) || state.familyMembers[0],
    [state]
  );

  const addChangeLog = useCallback((entry: Omit<ChangeLogEntry, 'timestamp' | 'memberId'>) => {
    setState(prev => ({
      ...prev,
      lastChanges: [{ ...entry, timestamp: Date.now(), memberId: prev.currentMemberId || 'default' }, ...prev.lastChanges].slice(0, MAX_CHANGES)
    }));
  }, []);

  const toggleCollected = useCallback((stickerId: string, stickerNumber: number, teamCode: string) => {
    setState(prev => {
      const memberIndex = prev.familyMembers.findIndex(m => m.id === prev.currentMemberId);
      if (memberIndex === -1) return prev;
      const member = prev.familyMembers[memberIndex];
      const isCollected = member.stickers.collected.has(stickerId);
      const newCollected = new Set(member.stickers.collected);
      if (isCollected) {
        newCollected.delete(stickerId);
        const newDoubles = { ...member.stickers.doubles };
        delete newDoubles[stickerId];
        const newMembers = [...prev.familyMembers];
        newMembers[memberIndex] = { ...member, stickers: { collected: newCollected, doubles: newDoubles } };
        return { ...prev, familyMembers: newMembers };
      } else {
        newCollected.add(stickerId);
        const newMembers = [...prev.familyMembers];
        newMembers[memberIndex] = { ...member, stickers: { ...member.stickers, collected: newCollected } };
        return { ...prev, familyMembers: newMembers };
      }
    });
    const member = state.familyMembers.find(m => m.id === state.currentMemberId);
    const isCollected = member?.stickers.collected.has(stickerId);
    addChangeLog({ stickerId, stickerNumber, teamCode, action: isCollected ? 'removed' : 'collected' });
  }, [state, addChangeLog]);

  const addDouble = useCallback((stickerId: string, stickerNumber: number, teamCode: string) => {
    setState(prev => {
      const memberIndex = prev.familyMembers.findIndex(m => m.id === prev.currentMemberId);
      if (memberIndex === -1) return prev;
      const member = prev.familyMembers[memberIndex];
      const newDoubles = { ...member.stickers.doubles };
      newDoubles[stickerId] = (newDoubles[stickerId] || 0) + 1;
      const newCollected = new Set(member.stickers.collected);
      if (!newCollected.has(stickerId)) newCollected.add(stickerId);
      const newMembers = [...prev.familyMembers];
      newMembers[memberIndex] = { ...member, stickers: { collected: newCollected, doubles: newDoubles } };
      return { ...prev, familyMembers: newMembers };
    });
    addChangeLog({ stickerId, stickerNumber, teamCode, action: 'double_added' });
  }, [addChangeLog]);

  const removeDouble = useCallback((stickerId: string, stickerNumber: number, teamCode: string) => {
    setState(prev => {
      const memberIndex = prev.familyMembers.findIndex(m => m.id === prev.currentMemberId);
      if (memberIndex === -1) return prev;
      const member = prev.familyMembers[memberIndex];
      const newDoubles = { ...member.stickers.doubles };
      if (newDoubles[stickerId] && newDoubles[stickerId] > 1) {
        newDoubles[stickerId]--;
      } else {
        delete newDoubles[stickerId];
      }
      const newMembers = [...prev.familyMembers];
      newMembers[memberIndex] = { ...member, stickers: { ...member.stickers, doubles: newDoubles } };
      return { ...prev, familyMembers: newMembers };
    });
    addChangeLog({ stickerId, stickerNumber, teamCode, action: 'double_removed' });
  }, [addChangeLog]);

  const setStickerStatus = useCallback((stickerId: string, stickerNumber: number, teamCode: string, status: 'missing' | 'collected' | 'double') => {
    setState(prev => {
      const memberIndex = prev.familyMembers.findIndex(m => m.id === prev.currentMemberId);
      if (memberIndex === -1) return prev;
      const member = prev.familyMembers[memberIndex];
      const newCollected = new Set(member.stickers.collected);
      const newDoubles = { ...member.stickers.doubles };

      if (status === 'missing') {
        newCollected.delete(stickerId);
        delete newDoubles[stickerId];
      } else if (status === 'collected') {
        newCollected.add(stickerId);
        delete newDoubles[stickerId];
      } else if (status === 'double') {
        newCollected.add(stickerId);
        newDoubles[stickerId] = (newDoubles[stickerId] || 0) + 1;
      }

      const newMembers = [...prev.familyMembers];
      newMembers[memberIndex] = { ...member, stickers: { collected: newCollected, doubles: newDoubles } };
      return { ...prev, familyMembers: newMembers };
    });
    addChangeLog({ stickerId, stickerNumber, teamCode, action: status === 'double' ? 'double_added' : status === 'collected' ? 'collected' : 'removed' });
  }, [addChangeLog]);

  const addFamilyMember = useCallback((name: string, color: string) => {
    const newMember: FamilyMember = {
      id: `member-${Date.now()}`,
      name,
      color,
      stickers: createEmptyStickers()
    };
    setState(prev => ({ ...prev, familyMembers: [...prev.familyMembers, newMember] }));
  }, []);

  const removeFamilyMember = useCallback((memberId: string) => {
    setState(prev => {
      if (prev.familyMembers.length <= 1) return prev;
      const newMembers = prev.familyMembers.filter(m => m.id !== memberId);
      return { ...prev, familyMembers: newMembers, currentMemberId: prev.currentMemberId === memberId ? newMembers[0].id : prev.currentMemberId };
    });
  }, []);

  const setCurrentMember = useCallback((memberId: string) => {
    setState(prev => ({ ...prev, currentMemberId: memberId }));
  }, []);

  const updateFamilyMember = useCallback((memberId: string, updates: Partial<FamilyMember>) => {
    setState(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(m => m.id === memberId ? { ...m, ...updates } : m)
    }));
  }, []);

  const exportData = useCallback(() => {
    const data = JSON.stringify({
      ...state,
      familyMembers: state.familyMembers.map(m => ({
        ...m,
        stickers: { collected: Array.from(m.stickers.collected), doubles: m.stickers.doubles }
      }))
    }, null, 2);
    return data;
  }, [state]);

  const importData = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      setState({
        ...parsed,
        familyMembers: parsed.familyMembers.map((m: FamilyMember & { stickers: { collected: string[]; doubles: Record<string, number> } }) => ({
          ...m,
          stickers: { collected: new Set(m.stickers.collected), doubles: m.stickers.doubles }
        }))
      });
      return true;
    } catch (e) {
      console.error('Import mislukt:', e);
      return false;
    }
  }, []);

  const getStats = useCallback(() => {
    const member = getCurrentMember();
    const collected = member.stickers.collected.size;
    const total = getTotalStickersCount();
    const doubles = Object.values(member.stickers.doubles).reduce((a, b) => a + b, 0);
    const percentage = total > 0 ? Math.round((collected / total) * 100) : 0;
    const familyStats = state.familyMembers.map(m => ({
      id: m.id,
      name: m.name,
      color: m.color,
      collected: m.stickers.collected.size,
      doubles: Object.values(m.stickers.doubles).reduce((a, b) => a + b, 0)
    }));
    const totalFamilyCollected = new Set(state.familyMembers.flatMap(m => Array.from(m.stickers.collected))).size;
    return {
      collected, total, doubles, percentage,
      familyStats, totalFamilyCollected,
      familyPercentage: total > 0 ? Math.round((totalFamilyCollected / total) * 100) : 0
    };
  }, [getCurrentMember, state.familyMembers]);

  const resetCollection = useCallback(() => {
    setState(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.map(m => ({ ...m, stickers: createEmptyStickers() })),
      lastChanges: []
    }));
  }, []);

  return {
    state,
    getCurrentMember,
    toggleCollected,
    addDouble,
    removeDouble,
    setStickerStatus,
    addFamilyMember,
    removeFamilyMember,
    setCurrentMember,
    updateFamilyMember,
    exportData,
    importData,
    getStats,
    lastChanges: state.lastChanges,
    resetCollection
  };
}
