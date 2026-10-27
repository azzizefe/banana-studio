import React, { useState, useRef, useEffect } from 'react';
import {
  Clapperboard,
  Film,
  Camera,
  Palette,
  Sun,
  Plus,
  AtSign,
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  Gem,
  Trash2,
  Play,
  Pause,
  Layers,
  Video,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Maximize2,
  Scan,
  Eye,
  Upload,
  Wand2,
  Focus,
  Sliders,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';

interface CinemaStudioProps {
  onBackToBananaStudio: () => void;
}

interface SceneItem {
  id: number;
  title: string;
  prompt: string;
  duration: string;
  ratio: string;
  resolution: string;
  cameraMovement: string;
  filmSetup: string;
  colorPalette: string;
  lighting: string;
  hasAudio: boolean;
  variations: number;
}

const FILM_SETUP_PRESETS = [
  { id: 'auto', name: 'Auto', desc: 'AI selects optimal lens and film stock', badge: 'Default' },
  { id: '35mm_anamorphic', name: '35mm Anamorphic', desc: 'Cinematic oval bokeh & blue horizontal flares', badge: 'Cinema Standard' },
  { id: '50mm_prime', name: '50mm f/1.2 Prime', desc: 'Natural perspective with ultra-shallow depth of field', badge: 'Portraits' },
  { id: '85mm_tele', name: '85mm Telephoto', desc: 'Intense background compression & subject isolation', badge: 'Drama' },
  { id: '24mm_wide', name: '24mm Ultra-Wide', desc: 'Expansive vistas, architectural dominance, high immersion', badge: 'Wide' },
  { id: 'imax_70mm', name: 'IMAX 70mm', desc: 'Ultra-high fidelity, grain-free pristine visual scale', badge: 'Epic' },
  { id: 'kodak_500t', name: 'Kodak Vision3 500T', desc: 'Rich tungsten warmth, authentic organic film grain', badge: 'Vintage' },
  { id: 'cinestill_800t', name: 'CineStill 800T', desc: 'Vibrant neon red halations around bright light sources', badge: 'Night' },
];

const CAMERA_PRESETS = [
  { id: 'auto', name: 'Auto Camera', desc: 'Dynamic AI intelligent camera tracking' },
  { id: 'dolly_in', name: 'Dolly In (Push)', desc: 'Smooth forward motion building tension' },
  { id: 'orbit_360', name: '360° Orbit', desc: 'Revolving cinematic turn around subject' },
  { id: 'pan_right', name: 'Pan Right →', desc: 'Horizontal sweeping camera motion' },
  { id: 'crane_down', name: 'Crane Down', desc: 'Descending shot revealing environment' },
  { id: 'fpv_drone', name: 'FPV Drone Dive', desc: 'High-speed dynamic aerobatic swoop' },
  { id: 'steadicam', name: 'Steadicam Follow', desc: 'Smooth handheld chase behind characters' },
  { id: 'dutch_angle', name: 'Dutch Tilt Angle', desc: 'Canted frame emphasizing psychological unease' },
];

const COLOR_PRESETS = [
  { id: 'auto', name: 'Auto Color', color: 'from-gray-500 to-gray-700', desc: 'Balanced natural film tones' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', color: 'from-fuchsia-500 to-cyan-500', desc: 'Vibrant magenta, violet, and electric cyan' },
  { id: 'golden_hour', name: 'Golden Hour Warmth', color: 'from-amber-400 to-orange-600', desc: 'Rich sunset glow, warm highlights' },
  { id: 'teal_orange', name: 'Teal & Orange', color: 'from-teal-500 to-orange-500', desc: 'Hollywood blockbuster color separation' },
  { id: 'noir', name: 'Moody Film Noir', color: 'from-slate-700 to-zinc-950', desc: 'High-contrast monochrome, dramatic shadows' },
  { id: 'bleach_bypass', name: 'Bleach Bypass', color: 'from-stone-400 to-neutral-700', desc: 'Desaturated gritty war/thriller aesthetic' },
  { id: 'pastel_dream', name: 'Pastel Dreamscape', color: 'from-pink-300 to-indigo-300', desc: 'Soft euphoric pastel hues, ethereal haze' },
];

const LIGHTING_PRESETS = [
  { id: 'auto', name: 'Auto Lighting', desc: 'Adaptive scene-aware illumination' },
  { id: 'volumetric', name: 'Volumetric God Rays', desc: 'Atmospheric light beams piercing through dust or smoke' },
  { id: 'dramatic_rim', name: 'Dramatic Rim Light', desc: 'Bright edge silhouette separating subject from background' },
  { id: 'chiaroscuro', name: 'Chiaroscuro Noir', desc: 'Deep painterly shadows with sharp high-contrast keys' },
  { id: 'neon_glow', name: 'Neon Spill & Reflections', desc: 'Saturated neon signs casting reflections on wet surfaces' },
  { id: 'soft_diffused', name: 'Soft Studio Octabox', desc: 'Silky smooth wrapping light with gentle falloff' },
  { id: 'candlelight', name: 'Candlelight & Fire Glow', desc: 'Flickering warm intimate organic light' },
];

const MENTION_TAGS = [
  { tag: '@CyberNinja', desc: 'Character · Armored stealth protagonist' },
  { tag: '@DetectiveVance', desc: 'Character · Gritty trenchcoat investigator' },
  { tag: '@NeoTokyo2099', desc: 'Location · Rain-soaked skyscraper metropolis' },
  { tag: '@OrbitalStation', desc: 'Location · Zero-g luxury space dock' },
  { tag: '@DesertWasteland', desc: 'Location · Barren dunes with ancient monolith' },
];

const MODELS = [
  { id: 'cinema-4.0', name: 'Cinema Studio 4.0', tag: 'Director Flagship', color: 'text-lime-400' },
  { id: 'gemini-omni-1.1-flash', name: 'Gemini Omni 1.1 Flash', tag: 'Fast & Ultra High Res', color: 'text-sky-400' },
  { id: 'seedance-2.5', name: 'Seedance 2.5 Cinema', tag: 'Hyper-Realistic Motion', color: 'text-purple-400' },
  { id: 'minimax-h3', name: 'MiniMax H3 Max', tag: 'Extended 4K Render', color: 'text-amber-400' },
];

const RATIOS = ['16:9', '9:16', '2.39:1', '1:1', '4:3'];
const RESOLUTIONS = ['720p', '1080p', '4K'];
const DURATIONS = ['5s', '10s', '15s', '30s'];

export const CinemaStudio: React.FC<CinemaStudioProps> = ({ onBackToBananaStudio }) => {
  const [mode, setMode] = useState<'image' | 'video'>('video');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [activePresetMenu, setActivePresetMenu] = useState<'film' | 'camera' | 'color' | 'lighting' | 'references' | null>(null);

  const [prompt, setPrompt] = useState('An intense neon-lit cyberpunk alleyway in heavy rain. A lone operative in a high-tech reflective trenchcoat stands under a flickering holographic billboard, steam rising from grates.');
  const [mentionMenuOpen, setMentionMenuOpen] = useState(false);

  // References state
  const [references, setReferences] = useState<string[]>([]);

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Scenes Storyboard
  const [scenes, setScenes] = useState<SceneItem[]>([
    {
      id: 1,
      title: 'Scene 1: Neon Alleyway Arrival',
      prompt: 'An intense neon-lit cyberpunk alleyway in heavy rain. A lone operative in a high-tech reflective trenchcoat stands under a flickering holographic billboard.',
      duration: '10s',
      ratio: '16:9',
      resolution: '1080p',
      cameraMovement: 'Dolly In (Push)',
      filmSetup: '35mm Anamorphic',
      colorPalette: 'Cyberpunk Neon',
      lighting: 'Volumetric God Rays',
      hasAudio: true,
      variations: 1,
    },
    {
      id: 2,
      title: 'Scene 2: Protagonist Retinal Scan',
      prompt: 'Extreme close-up on the operative\'s eye reflecting glowing cyan and magenta data streams, realistic skin pores and droplets of rainwater dripping.',
      duration: '5s',
      ratio: '16:9',
      resolution: '1080p',
      cameraMovement: 'Auto Camera',
      filmSetup: '50mm f/1.2 Prime',
      colorPalette: 'Cyberpunk Neon',
      lighting: 'Dramatic Rim Light',
      hasAudio: true,
      variations: 1,
    },
  ]);
  const [selectedSceneId, setSelectedSceneId] = useState(1);
  const activeScene = scenes.find(s => s.id === selectedSceneId) || scenes[0];

  // Active Scene Settings Sync
  const updateActiveScene = (patch: Partial<SceneItem>) => {
    setScenes(prev => prev.map(s => s.id === activeScene.id ? { ...s, ...patch } : s));
  };

  const handleAddScene = () => {
    const nextId = scenes.length > 0 ? Math.max(...scenes.map(s => s.id)) + 1 : 1;
    const newScene: SceneItem = {
      id: nextId,
      title: `Scene ${nextId}: Cinematic Sequence`,
      prompt: 'Wide cinematic establishing shot, anamorphic lens flare, high budget cinematic lighting.',
      duration: activeScene.duration,
      ratio: activeScene.ratio,
      resolution: activeScene.resolution,
      cameraMovement: 'Auto Camera',
      filmSetup: 'Auto',
      colorPalette: 'Auto Color',
      lighting: 'Auto Lighting',
      hasAudio: true,
      variations: 1,
    };
    setScenes([...scenes, newScene]);
    setSelectedSceneId(nextId);
  };

  const handleDeleteScene = (idToDelete: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (scenes.length <= 1) {
      const resetScene: SceneItem = {
        id: 1,
        title: 'Scene 1: Opening Shot',
        prompt: 'Cinematic wide shot, 35mm anamorphic lens, atmospheric lighting and rain particles.',
        duration: '10s',
        ratio: '16:9',
        resolution: '1080p',
        cameraMovement: 'Auto Camera',
        filmSetup: 'Auto',
        colorPalette: 'Auto Color',
        lighting: 'Auto Lighting',
        hasAudio: true,
        variations: 1,
      };
      setScenes([resetScene]);
      setSelectedSceneId(1);
      return;
    }

    const filtered = scenes.filter(s => s.id !== idToDelete);
    setScenes(filtered);
    if (selectedSceneId === idToDelete) {
      setSelectedSceneId(filtered[0]?.id || 1);
    }
  };

  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerationProgress(5);
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return prev + 15;
      });
    }, 400);
  };

  // Close popovers on click outside
  const popoverRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePresetMenu(null);
        setModelDropdownOpen(false);
        setMentionMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-45px)] overflow-hidden bg-[#0a0d14] text-white selection:bg-lime-400 selection:text-black">
      {/* Top Bar with Return button & Mode Title */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0d111a] px-6 py-2.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToBananaStudio}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all shadow-sm"
          >
            <ArrowLeft size={14} />
            Banana Studio'ya Dön
          </button>
        </div>
      </div>

      {/* Main Director Stage Area */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6" ref={popoverRef}>
        
        {/* HIGGSFIELD DIRECTOR INPUT CONSOLE */}
        <div className="max-w-5xl mx-auto w-full flex items-start gap-4">
          
          {/* Vertical Mode Pill (Left) */}
          <div className="flex flex-col bg-[#161a23] border border-white/10 rounded-2xl p-1.5 gap-1.5 shadow-xl shrink-0">
            <button
              type="button"
              onClick={() => setMode('image')}
              className={`flex flex-col items-center justify-center w-12 h-14 rounded-xl text-[11px] font-medium transition-all ${
                mode === 'image'
                  ? 'bg-white/15 text-white shadow-inner'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ImageIcon size={18} className="mb-0.5" />
              <span>Image</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('video')}
              className={`flex flex-col items-center justify-center w-12 h-14 rounded-xl text-[11px] font-medium transition-all ${
                mode === 'video'
                  ? 'bg-lime-400 text-black font-semibold shadow-lg shadow-lime-400/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Video size={18} className="mb-0.5" />
              <span>Video</span>
            </button>
          </div>

          {/* Main Director Control Deck */}
          <div className="flex-1 flex flex-col gap-3 relative">
            
            {/* Top Row: Module Director Capsules */}
            <div className="grid grid-cols-5 gap-2.5">
              
              {/* 1. References */}
              <button
                type="button"
                onClick={() => setActivePresetMenu(activePresetMenu === 'references' ? null : 'references')}
                className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 transition-all text-left group ${
                  activePresetMenu === 'references'
                    ? 'border-lime-400/60 bg-lime-400/10 shadow-lg shadow-lime-400/10'
                    : 'border-white/10 bg-[#141822] hover:border-white/20 hover:bg-[#1a202c]'
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/40 border border-white/10 text-gray-300 group-hover:text-lime-400 transition-colors">
                  <Plus size={16} />
                </div>
                <div className="truncate">
                  <div className="text-[11px] text-gray-400">References</div>
                  <div className="text-xs font-semibold text-white">{references.length}/50</div>
                </div>
              </button>

              {/* 2. Film setup */}
              <button
                type="button"
                onClick={() => setActivePresetMenu(activePresetMenu === 'film' ? null : 'film')}
                className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 transition-all text-left group ${
                  activePresetMenu === 'film'
                    ? 'border-lime-400/60 bg-lime-400/10 shadow-lg shadow-lime-400/10'
                    : 'border-white/10 bg-[#141822] hover:border-white/20 hover:bg-[#1a202c]'
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-300">
                  <Film size={17} />
                </div>
                <div className="truncate">
                  <div className="text-[11px] text-gray-400">Film setup</div>
                  <div className="text-xs font-semibold text-white truncate">{activeScene.filmSetup}</div>
                </div>
              </button>

              {/* 3. Camera */}
              <button
                type="button"
                onClick={() => setActivePresetMenu(activePresetMenu === 'camera' ? null : 'camera')}
                className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 transition-all text-left group ${
                  activePresetMenu === 'camera'
                    ? 'border-lime-400/60 bg-lime-400/10 shadow-lg shadow-lime-400/10'
                    : 'border-white/10 bg-[#141822] hover:border-white/20 hover:bg-[#1a202c]'
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-300">
                  <Camera size={17} />
                </div>
                <div className="truncate">
                  <div className="text-[11px] text-gray-400">Camera</div>
                  <div className="text-xs font-semibold text-white truncate">{activeScene.cameraMovement}</div>
                </div>
              </button>

              {/* 4. Color palette */}
              <button
                type="button"
                onClick={() => setActivePresetMenu(activePresetMenu === 'color' ? null : 'color')}
                className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 transition-all text-left group ${
                  activePresetMenu === 'color'
                    ? 'border-lime-400/60 bg-lime-400/10 shadow-lg shadow-lime-400/10'
                    : 'border-white/10 bg-[#141822] hover:border-white/20 hover:bg-[#1a202c]'
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-violet-500/10 border border-pink-500/30 text-pink-300">
                  <Palette size={17} />
                </div>
                <div className="truncate">
                  <div className="text-[11px] text-gray-400">Color palette</div>
                  <div className="text-xs font-semibold text-white truncate">{activeScene.colorPalette}</div>
                </div>
              </button>

              {/* 5. Lighting */}
              <button
                type="button"
                onClick={() => setActivePresetMenu(activePresetMenu === 'lighting' ? null : 'lighting')}
                className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 transition-all text-left group ${
                  activePresetMenu === 'lighting'
                    ? 'border-lime-400/60 bg-lime-400/10 shadow-lg shadow-lime-400/10'
                    : 'border-white/10 bg-[#141822] hover:border-white/20 hover:bg-[#1a202c]'
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 text-yellow-300">
                  <Sun size={17} />
                </div>
                <div className="truncate">
                  <div className="text-[11px] text-gray-400">Lighting</div>
                  <div className="text-xs font-semibold text-white truncate">{activeScene.lighting}</div>
                </div>
              </button>
            </div>

            {/* EXPANDABLE MODULE POPOVERS */}
            {activePresetMenu && (
              <div className="absolute top-16 left-0 right-0 z-50 bg-[#141824] border border-white/15 rounded-2xl p-5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                
                {/* Popover Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    {activePresetMenu === 'references' && <Plus className="text-lime-400" size={18} />}
                    {activePresetMenu === 'film' && <Film className="text-amber-400" size={18} />}
                    {activePresetMenu === 'camera' && <Camera className="text-cyan-400" size={18} />}
                    {activePresetMenu === 'color' && <Palette className="text-pink-400" size={18} />}
                    {activePresetMenu === 'lighting' && <Sun className="text-yellow-400" size={18} />}
                    <h4 className="text-sm font-semibold capitalize text-white">
                      {activePresetMenu === 'references' && 'Karakter & Mekan Referansları (0/50)'}
                      {activePresetMenu === 'film' && 'Film & Lens Kurulumu (Film Setup)'}
                      {activePresetMenu === 'camera' && 'Kamera Hareketleri (Camera Motions)'}
                      {activePresetMenu === 'color' && 'Renk Paleti ve Tonlama (Color Grading)'}
                      {activePresetMenu === 'lighting' && 'Sinematik Işık Kurulumu (Lighting Setup)'}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActivePresetMenu(null)}
                    className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* References View */}
                {activePresetMenu === 'references' && (
                  <div className="flex flex-col gap-4">
                    <div className="border border-dashed border-white/20 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-black/20 hover:border-lime-400/50 transition-colors cursor-pointer">
                      <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-lime-400 mb-2">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs font-medium text-white mb-1">Görsel referans sürükleyin veya seçin</p>
                      <p className="text-[11px] text-gray-400">Yüz kilitleme, kıyafet koruma veya arka plan mekan tutarlılığı sağlar</p>
                    </div>
                  </div>
                )}

                {/* Film Setup Presets */}
                {activePresetMenu === 'film' && (
                  <div className="grid grid-cols-4 gap-2.5">
                    {FILM_SETUP_PRESETS.map(preset => (
                      <div
                        key={preset.id}
                        onClick={() => {
                          updateActiveScene({ filmSetup: preset.name });
                          setActivePresetMenu(null);
                        }}
                        className={`cursor-pointer rounded-xl border p-3 transition-all ${
                          activeScene.filmSetup === preset.name
                            ? 'border-lime-400 bg-lime-400/10 text-white'
                            : 'border-white/5 bg-white/[0.02] text-gray-300 hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold">{preset.name}</span>
                          {preset.badge && (
                            <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
                              {preset.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 leading-snug">{preset.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Camera Presets */}
                {activePresetMenu === 'camera' && (
                  <div className="grid grid-cols-4 gap-2.5">
                    {CAMERA_PRESETS.map(preset => (
                      <div
                        key={preset.id}
                        onClick={() => {
                          updateActiveScene({ cameraMovement: preset.name });
                          setActivePresetMenu(null);
                        }}
                        className={`cursor-pointer rounded-xl border p-3 transition-all ${
                          activeScene.cameraMovement === preset.name
                            ? 'border-lime-400 bg-lime-400/10 text-white'
                            : 'border-white/5 bg-white/[0.02] text-gray-300 hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className="text-xs font-semibold block mb-1">{preset.name}</span>
                        <p className="text-[11px] text-gray-400 leading-snug">{preset.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Color Palette Presets */}
                {activePresetMenu === 'color' && (
                  <div className="grid grid-cols-4 gap-2.5">
                    {COLOR_PRESETS.map(preset => (
                      <div
                        key={preset.id}
                        onClick={() => {
                          updateActiveScene({ colorPalette: preset.name });
                          setActivePresetMenu(null);
                        }}
                        className={`cursor-pointer rounded-xl border p-3 transition-all ${
                          activeScene.colorPalette === preset.name
                            ? 'border-lime-400 bg-lime-400/10 text-white'
                            : 'border-white/5 bg-white/[0.02] text-gray-300 hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`h-3.5 w-3.5 rounded-full bg-gradient-to-tr ${preset.color}`} />
                          <span className="text-xs font-semibold">{preset.name}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-snug">{preset.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Lighting Presets */}
                {activePresetMenu === 'lighting' && (
                  <div className="grid grid-cols-4 gap-2.5">
                    {LIGHTING_PRESETS.map(preset => (
                      <div
                        key={preset.id}
                        onClick={() => {
                          updateActiveScene({ lighting: preset.name });
                          setActivePresetMenu(null);
                        }}
                        className={`cursor-pointer rounded-xl border p-3 transition-all ${
                          activeScene.lighting === preset.name
                            ? 'border-lime-400 bg-lime-400/10 text-white'
                            : 'border-white/5 bg-white/[0.02] text-gray-300 hover:border-white/20 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className="text-xs font-semibold block mb-1">{preset.name}</span>
                        <p className="text-[11px] text-gray-400 leading-snug">{preset.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* HIGGSFIELD MAIN PROMPT BOX CONTAINER */}
            <div className="relative rounded-2xl border border-white/15 bg-[#141822] p-4 shadow-2xl flex flex-col gap-3 group focus-within:border-lime-400/70 transition-all">
              
              {/* Prompt Textarea */}
              <div className="flex items-start gap-4">
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={e => {
                    setPrompt(e.target.value);
                    updateActiveScene({ prompt: e.target.value });
                  }}
                  placeholder="Describe your scene - use @ to add characters & locations"
                  className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none resize-none leading-relaxed font-sans"
                />

                {/* NEON LIME HIGGSFIELD GENERATE BUTTON */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="shrink-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#dfff00] to-[#b8eb00] hover:from-[#e7ff26] hover:to-[#c6fa00] text-black font-black uppercase rounded-2xl px-8 py-3.5 shadow-[0_0_25px_rgba(223,255,0,0.35)] hover:shadow-[0_0_35px_rgba(223,255,0,0.5)] active:scale-95 transition-all select-none cursor-pointer disabled:opacity-50"
                >
                  <span className="tracking-wider text-xs">GENERATE</span>
                  <span className="flex items-center gap-1 text-[11px] font-extrabold opacity-90 mt-0.5">
                    <Sparkles size={11} className="fill-black" />
                    <span>✦ 480</span>
                  </span>
                </button>
              </div>

              {/* Mention Auto-Suggest Dropdown */}
              {mentionMenuOpen && (
                <div className="absolute top-16 left-4 z-50 bg-[#161c28] border border-white/15 rounded-xl p-2 shadow-2xl w-80 animate-in fade-in zoom-in-95">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">
                    Karakterler & Mekanlar
                  </div>
                  {MENTION_TAGS.map(item => (
                    <div
                      key={item.tag}
                      onClick={() => {
                        setPrompt(prev => prev + ' ' + item.tag + ' ');
                        setMentionMenuOpen(false);
                      }}
                      className="cursor-pointer flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs hover:bg-lime-400/10 hover:text-lime-300 transition-colors"
                    >
                      <span className="font-semibold text-white">{item.tag}</span>
                      <span className="text-[10px] text-gray-400">{item.desc}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Quick Tools Toolbar */}
              <div className="flex items-center justify-between border-t border-white/5 pt-2.5 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  
                  {/* Plus / Media Attach Button */}
                  <button
                    type="button"
                    title="Referans Medya Ekle"
                    onClick={() => setActivePresetMenu('references')}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <Plus size={14} />
                  </button>

                  {/* At-mention Tag Button */}
                  <button
                    type="button"
                    title="Karakter / Mekan Etiketle (@)"
                    onClick={() => setMentionMenuOpen(!mentionMenuOpen)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <AtSign size={14} />
                  </button>

                  {/* Framing / Scan icon */}
                  <button
                    type="button"
                    title="Kadraj ve Güvenli Alan Kılavuzu"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                  >
                    <Scan size={14} />
                  </button>

                  <div className="h-4 w-px bg-white/10 mx-1" />

                  {/* Model Selector Pill */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                      className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/10 px-3 py-1 text-xs hover:bg-white/[0.08] transition-colors"
                    >
                      <div className="h-2 w-2 rounded-full bg-lime-400 animate-pulse" />
                      <span className="font-semibold text-white">{selectedModel.name}</span>
                      <ChevronRight size={13} className="text-gray-400" />
                    </button>

                    {modelDropdownOpen && (
                      <div className="absolute bottom-9 left-0 z-50 bg-[#161c28] border border-white/15 rounded-xl p-1.5 shadow-2xl w-64">
                        {MODELS.map(m => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedModel(m);
                              setModelDropdownOpen(false);
                            }}
                            className={`cursor-pointer rounded-lg px-3 py-2 text-xs flex items-center justify-between ${
                              selectedModel.id === m.id
                                ? 'bg-lime-400/10 text-lime-400 font-semibold'
                                : 'text-gray-300 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div>
                              <div>{m.name}</div>
                              <div className="text-[10px] text-gray-400">{m.tag}</div>
                            </div>
                            {selectedModel.id === m.id && <Check size={14} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Resolution Pill */}
                  <div className="flex items-center gap-1 rounded-xl bg-white/[0.04] border border-white/10 px-2.5 py-1">
                    <Gem size={12} className="text-sky-400" />
                    <select
                      value={activeScene.resolution}
                      onChange={e => updateActiveScene({ resolution: e.target.value })}
                      className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                    >
                      {RESOLUTIONS.map(r => (
                        <option key={r} value={r} className="bg-[#161c28]">{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Aspect Ratio Pill */}
                  <div className="flex items-center gap-1 rounded-xl bg-white/[0.04] border border-white/10 px-2.5 py-1">
                    <span className="text-gray-400">▭</span>
                    <select
                      value={activeScene.ratio}
                      onChange={e => updateActiveScene({ ratio: e.target.value })}
                      className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                    >
                      {RATIOS.map(r => (
                        <option key={r} value={r} className="bg-[#161c28]">{r}</option>
                      ))}
                    </select>
                  </div>

                  {/* Duration Pill */}
                  <div className="flex items-center gap-1 rounded-xl bg-white/[0.04] border border-white/10 px-2.5 py-1">
                    <Clock size={12} className="text-amber-400" />
                    <select
                      value={activeScene.duration}
                      onChange={e => updateActiveScene({ duration: e.target.value })}
                      className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
                    >
                      {DURATIONS.map(d => (
                        <option key={d} value={d} className="bg-[#161c28]">{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Audio Pill */}
                  <button
                    type="button"
                    onClick={() => updateActiveScene({ hasAudio: !activeScene.hasAudio })}
                    className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 transition-all ${
                      activeScene.hasAudio
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border-white/10 bg-white/[0.04] text-gray-400'
                    }`}
                  >
                    {activeScene.hasAudio ? <Volume2 size={13} /> : <VolumeX size={13} />}
                    <span>{activeScene.hasAudio ? 'On' : 'Off'}</span>
                  </button>
                </div>

                {/* Variations Stepper */}
                <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 px-2 py-0.5">
                  <button
                    type="button"
                    onClick={() => updateActiveScene({ variations: Math.max(1, activeScene.variations - 1) })}
                    className="px-1.5 py-0.5 text-gray-400 hover:text-white"
                  >
                    -
                  </button>
                  <span className="font-semibold text-white">{activeScene.variations}/4</span>
                  <button
                    type="button"
                    onClick={() => updateActiveScene({ variations: Math.min(4, activeScene.variations + 1) })}
                    className="px-1.5 py-0.5 text-gray-400 hover:text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Progress bar when generating */}
              {isGenerating && (
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden mt-1">
                  <div
                    className="bg-gradient-to-r from-lime-400 to-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MULTI-SCENE STORYBOARD & DIRECTOR WORKSPACE */}
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-lime-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Yönetmen Sahne Kurgusu (Multi-Scene Storyboard)
              </h3>
              <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full">
                {scenes.length} Sahne
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddScene}
              className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
            >
              <Plus size={14} className="text-lime-400" />
              Yeni Sahne Ekle
            </button>
          </div>

          {/* Scenes Grid */}
          <div className="grid grid-cols-2 gap-4">
            {scenes.map((scene, idx) => (
              <div
                key={scene.id}
                onClick={() => setSelectedSceneId(scene.id)}
                className={`cursor-pointer rounded-2xl border p-4 transition-all relative flex flex-col gap-3 group ${
                  selectedSceneId === scene.id
                    ? 'border-lime-400/80 bg-[#161c28] shadow-xl shadow-lime-400/5 ring-1 ring-lime-400/40'
                    : 'border-white/10 bg-[#111520] hover:border-white/20 hover:bg-[#141926]'
                }`}
              >
                {/* Scene Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-lime-400/20 text-lime-300 font-extrabold text-xs">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white">{scene.title}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-300 bg-black/40 px-2 py-0.5 rounded-md border border-white/5 font-mono">
                      {scene.duration} · {scene.ratio} · {scene.resolution}
                    </span>
                    <button
                      type="button"
                      title="Sahneyi Sil"
                      onClick={e => handleDeleteScene(scene.id, e)}
                      className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Director Viewport Mock for Scene */}
                <div className="w-full aspect-[2.39/1] rounded-xl bg-gradient-to-br from-[#1b2230] to-[#0c0f17] border border-white/10 flex flex-col items-center justify-center p-3 relative overflow-hidden group">
                  <div className="absolute inset-0 pointer-events-none border border-white/5 grid grid-cols-3 grid-rows-3 opacity-20" />
                  <Clapperboard size={22} className="text-gray-500 mb-1 group-hover:text-lime-400 transition-colors" />
                  <p className="text-[11px] text-gray-300 line-clamp-2 text-center max-w-sm px-2">
                    {scene.prompt}
                  </p>
                </div>

                {/* Scene Badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                  <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-md">
                    🎥 {scene.filmSetup}
                  </span>
                  <span className="bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded-md">
                    🔄 {scene.cameraMovement}
                  </span>
                  <span className="bg-pink-500/10 text-pink-300 border border-pink-500/20 px-2 py-0.5 rounded-md">
                    🎨 {scene.colorPalette}
                  </span>
                  <span className="bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 px-2 py-0.5 rounded-md">
                    ☀️ {scene.lighting}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
