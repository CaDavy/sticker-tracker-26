import { useState } from 'react';
import { FamilyMember } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Users, Plus, Trash2, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '../ui/dialog';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#d946ef', '#ec4899', '#6b7280'];

interface FamilyManagementProps {
  familyMembers: FamilyMember[];
  currentMemberId: string | null;
  onAddMember: (name: string, color: string) => void;
  onRemoveMember: (memberId: string) => void;
  onSetCurrentMember: (memberId: string) => void;
  onUpdateMember: (memberId: string, updates: Partial<FamilyMember>) => void;
  familyPercentage: number;
  totalFamilyCollected: number;
  familyStats: Array<{ id: string; name: string; color: string; collected: number; doubles: number }>;
}

export function FamilyManagement({ familyMembers, currentMemberId, onAddMember, onRemoveMember, onSetCurrentMember, onUpdateMember, familyPercentage, totalFamilyCollected, familyStats }: FamilyManagementProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddMember = () => {
    if (newName.trim()) { onAddMember(newName.trim(), newColor); setNewName(''); setNewColor(COLORS[0]); }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Familie</h1>
          <p className="text-sm text-muted-foreground">{familyMembers.length} lid{familyMembers.length !== 1 ? 'en' : ''}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="min-h-[44px]" aria-label="Lid toevoegen"><Plus className="w-4 h-4 mr-2" aria-hidden="true" />Toevoegen</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Lid toevoegen</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label htmlFor="member-name" className="text-sm font-medium text-foreground">Naam</label>
                <Input id="member-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Naam invoeren..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">Kleur</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(color => (
                    <button key={color} onClick={() => setNewColor(color)}
                      className={`w-10 h-10 rounded-full transition-transform ${newColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}`}
                      style={{ backgroundColor: color }} aria-label={`Kleur ${color} kiezen`}
                    />
                  ))}
                </div>
              </div>
              <DialogClose asChild>
                <Button onClick={handleAddMember} disabled={!newName.trim()} className="w-full min-h-[44px]">Lid toevoegen</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-primary" aria-hidden="true" />
          <h2 className="font-semibold text-foreground">Gezamenlijke voortgang</h2>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Unieke stickers</span>
            <span className="font-semibold text-foreground">{familyPercentage}%</span>
          </div>
          <Progress value={familyPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">{totalFamilyCollected} unieke stickers verzameld</p>
        </div>
      </Card>

      <div className="space-y-3">
        {familyMembers.map(member => {
          const stats = familyStats.find(s => s.id === member.id);
          const isEditing = editingId === member.id;
          const isCurrentMember = member.id === currentMemberId;
          return (
            <Card key={member.id} className={`p-4 ${isCurrentMember ? 'ring-2 ring-primary' : ''}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => onSetCurrentMember(member.id)}
                  className={`relative w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-transform ${isCurrentMember ? 'scale-110 ring-2 ring-offset-2' : ''}`}
                  style={{ backgroundColor: member.color, borderColor: isCurrentMember ? member.color : 'transparent' }}
                  aria-label={`Schakel naar collectie van ${member.name}`} aria-pressed={isCurrentMember}
                >
                  {member.name[0]}
                  {isCurrentMember && <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background" aria-hidden="true" />}
                </button>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-10" aria-label="Naam bewerken" />
                      <Button size="sm" onClick={() => { if (editName.trim()) onUpdateMember(member.id, { name: editName.trim() }); setEditingId(null); }}
                        className="min-w-[44px] min-h-[44px]" aria-label="Opslaan"
                      ><Check className="w-4 h-4" aria-hidden="true" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}
                        className="min-w-[44px] min-h-[44px]" aria-label="Annuleren"
                      ><X className="w-4 h-4" aria-hidden="true" /></Button>
                    </div>
                  ) : (
                    <>
                      <p className="font-semibold text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{stats?.collected} verzameld - {stats?.doubles} dubbels</p>
                    </>
                  )}
                </div>
                {!isEditing && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingId(member.id); setEditName(member.name); }}
                      className="min-h-[44px] min-w-[44px]" aria-label={`${member.name} bewerken`}
                    ><Users className="w-4 h-4" aria-hidden="true" /></Button>
                    {familyMembers.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => onRemoveMember(member.id)}
                        className="min-h-[44px] min-w-[44px] text-destructive hover:text-destructive" aria-label={`${member.name} verwijderen`}
                      ><Trash2 className="w-4 h-4" aria-hidden="true" /></Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
