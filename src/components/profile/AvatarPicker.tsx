import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AvatarPickerProps {
  open: boolean;
  onClose: () => void;
  currentAvatar: string;
}

const AVATARS = [
  '/avatars/01.png',
  '/avatars/02.png',
  '/avatars/03.png',
  '/avatars/06.png',
  '/avatars/07.png',
  '/avatars/avatar-02.png',
  '/avatars/avatar-04.png',
  '/avatars/avatar-12.png',
  '/avatars/avatar-17.png',
  '/avatars/avatar-18.png',
  '/avatars/avatar-20.png',
  '/avatars/avatar-22.png',
  '/avatars/avatar-23.png',
  '/avatars/avatar2-08.png',
  '/avatars/avatar2-10.png',
  '/avatars/user-00.jpeg',
  '/avatars/user-01.jpeg',
  '/avatars/user-02.jpeg',
  '/avatars/user-04.jpeg',
  '/avatars/user-07.jpeg',
  '/avatars/user-08.jpeg',
  '/avatars/File2.jpg',
  '/avatars/File4.png',
  '/avatars/File6.png',
  '/avatars/File9.jpg',
  '/avatars/beerus.png',
  '/avatars/vegeta.png',
];

export default function AvatarPicker({ open, onClose, currentAvatar }: AvatarPickerProps) {
  const { updateAvatar } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setSelectedAvatar(currentAvatar);
  }, [open, currentAvatar]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (!selectedAvatar || selectedAvatar === currentAvatar) {
      onClose();
      return;
    }
    setSaving(true);
    await updateAvatar(selectedAvatar);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#111] rounded-xl border border-white/10 max-w-lg w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-semibold">Choose Avatar</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {AVATARS.map((avatar, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedAvatar(avatar)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedAvatar === avatar
                    ? 'border-[#ff4444] ring-2 ring-[#ff4444]/50'
                    : 'border-transparent hover:border-white/30'
                }`}
              >
                <img src={avatar} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                {selectedAvatar === avatar && (
                  <div className="absolute inset-0 bg-[#ff4444]/20 flex items-center justify-center">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/10 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="px-4 py-2 bg-[#ff4444] hover:bg-[#ff3333] text-white rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
