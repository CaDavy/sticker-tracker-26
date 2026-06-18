export interface Sticker {
  id: string;
  number: number;
  teamId: string;
}

export interface Team {
  id: string;
  code: string;
  name: string;
  flag: string;
  color: string;
  stickers: Sticker[];
}

export interface CollectorsStickers {
  collected: Set<string>;
  doubles: Record<string, number>;
}

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  stickers: CollectorsStickers;
}

export interface AppState {
  currentMemberId: string | null;
  familyMembers: FamilyMember[];
  lastChanges: ChangeLogEntry[];
}

export interface ChangeLogEntry {
  stickerId: string;
  stickerNumber: number;
  teamCode: string;
  action: 'collected' | 'removed' | 'double_added' | 'double_removed';
  timestamp: number;
  memberId: string;
}

export type StickerStatus = 'missing' | 'collected' | 'double';

export interface ScannerResult {
  teamCode: string;
  number: number;
}
