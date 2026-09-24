import React from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

interface AudioEqualizerProps {
  isPlaying: boolean;
  onToggleMuteOrStop?: () => void;
  messageText?: string;
  isCustomVoice?: boolean;
}

export const AudioEqualizer: React.FC<AudioEqualizerProps> = ({
  isPlaying,
  onToggleMuteOrStop,
  messageText,
  isCustomVoice = false,
}) => {
  if (!isPlaying) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm">
      <div className="bg-[#2c2a29] text-white p-3.5 rounded-2xl shadow-xl border border-[#c07a50]/40 flex items-center gap-3 backdrop-blur-md">
        {/* Animated equalizer waves */}
        <div className="flex items-end gap-1 h-7 px-1.5 py-1 bg-[#1b5e20]/40 rounded-lg border border-[#1b5e20]">
          <span className="w-1 bg-[#e67e22] rounded-full animate-wave-1"></span>
          <span className="w-1 bg-[#c07a50] rounded-full animate-wave-2"></span>
          <span className="w-1 bg-[#f4efe6] rounded-full animate-wave-3"></span>
          <span className="w-1 bg-[#e67e22] rounded-full animate-wave-4"></span>
          <span className="w-1 bg-[#1b5e20] rounded-full animate-wave-5"></span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold tracking-wide text-[#e67e22] uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#e67e22]" />
              {isCustomVoice ? 'Suara Stand Admin' : 'Sambutan Suara Stand'}
            </span>
          </div>
          <p className="text-xs text-[#f4efe6] truncate font-medium">
            {messageText || 'Menyambut pengunjung baru di Stand KLOVIBE...'}
          </p>
        </div>

        {onToggleMuteOrStop && (
          <button
            onClick={onToggleMuteOrStop}
            title="Hentikan Suara"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <VolumeX className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
