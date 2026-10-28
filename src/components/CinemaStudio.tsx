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
  RotateCcw,
  LayoutGrid,
  Edit2,
  FolderPlus,
  FolderKanban,
  Tag,
} from 'lucide-react';

interface CinemaStudioProps {
  onBackToBananaStudio?: () => void;
}

export interface SceneItem {
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

export interface CinemaProject {
  id: string;
  title: string;
  genre: string;
  aspectRatio: string;
  createdAt: string;
  scenes: SceneItem[];
}

const PROJECT_GENRES = [
  'Cyberpunk / Sci-Fi',
  'Sinematik Gerilim',
  'Aksiyon & Macera',
  'Dram / Sinema',
  'Korku & Gizem',
  'Reklam & Tanıtım',
  'Belgesel & Doğa',
];

const DEFAULT_PROJECTS: CinemaProject[] = [
  {
    id: 'proj-cyberpunk-teaser',
    title: 'Neon Tokyo 2099 (Cyberpunk Teaser)',
    genre: 'Cyberpunk / Sci-Fi',
    aspectRatio: '16:9',
    createdAt: '28.10.2026',
    scenes: [
      {
        id: 1,
        title: 'Scene 1: Neon Alleyway Arrival',
        prompt: 'An intense neon-lit cyberpunk alleyway in heavy rain. A lone operative in a high-tech reflective trenchcoat stands under a flickering holographic billboard, steam rising from grates.',
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
        prompt: "Extreme close-up on the operative's eye reflecting glowing cyan and magenta data streams, realistic skin pores and droplets of rainwater dripping.",
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
      {
        id: 3,
        title: 'Scene 3: High-Speed Cyber Pursuit',
        prompt: 'Futuristic magnetic hover-bike racing between gargantuan towering neon mega-structures, cinematic motion blur and lens flare.',
        duration: '10s',
        ratio: '16:9',
        resolution: '1080p',
        cameraMovement: 'FPV Drone Dive',
        filmSetup: 'IMAX 70mm',
        colorPalette: 'Teal & Orange',
        lighting: 'Neon Spill & Reflections',
        hasAudio: true,
        variations: 1,
      },
    ],
  },
  {
    id: 'proj-deepspace-monolith',
    title: 'Derin Uzay: Monolith Keşfi',
    genre: 'Sinematik Gerilim',
    aspectRatio: '2.39:1',
    createdAt: '27.10.2026',
    scenes: [
      {
        id: 1,
        title: 'Scene 1: Yörüngeden İniş Modülü',
        prompt: 'Massive exploration starship descending through violent purple dust clouds into the atmosphere of an uncharted exoplanet.',
        duration: '15s',
        ratio: '2.39:1',
        resolution: '1080p',
        cameraMovement: 'Crane Down',
        filmSetup: 'IMAX 70mm',
        colorPalette: 'Moody Film Noir',
        lighting: 'Volumetric God Rays',
        hasAudio: true,
        variations: 1,
      },
      {
        id: 2,
        title: 'Scene 2: Kadim Monolith ile İlk Temas',
        prompt: 'Two lone astronauts in illuminated pressurized helmets standing in front of a giant obsidian monolith humming with ancient energy.',
        duration: '10s',
        ratio: '2.39:1',
        resolution: '1080p',
        cameraMovement: 'Dolly In (Push)',
        filmSetup: '35mm Anamorphic',
        colorPalette: 'Teal & Orange',
        lighting: 'Chiaroscuro Noir',
        hasAudio: true,
        variations: 1,
      },
    ],
  },
];

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
  { id: 'gemini-omni-1.1-flash', name: 'Gemini Omni 1.1 Flash', tag: 'Fast & Ultra High Res', color: 'text-sky-400' },
  { id: 'seedance-2.5', name: 'Seedance 2.5 Cinema', tag: 'Hyper-Realistic Motion', color: 'text-purple-400' },
  { id: 'minimax-h3', name: 'MiniMax H3 Max', tag: 'Extended 4K Render', color: 'text-amber-400' },
];

const RATIOS = ['1:1', '3:4', '9:16', '4:3', '16:9', '21:9'];

const renderRatioIcon = (ratio: string, className = "text-gray-300") => {
  switch (ratio) {
    case '1:1':
      return <div className={`w-[13px] h-[13px] border-[1.5px] border-current rounded-[2.5px] shrink-0 ${className}`} />;
    case '3:4':
      return <div className={`w-[11px] h-[15px] border-[1.5px] border-current rounded-[2.5px] shrink-0 ${className}`} />;
    case '9:16':
      return <div className={`w-[9px] h-[16px] border-[1.5px] border-current rounded-[2.5px] shrink-0 ${className}`} />;
    case '4:3':
      return <div className={`w-[15px] h-[11px] border-[1.5px] border-current rounded-[2.5px] shrink-0 ${className}`} />;
    case '16:9':
      return <div className={`w-[17px] h-[10px] border-[1.5px] border-current rounded-[2.5px] shrink-0 ${className}`} />;
    case '21:9':
      return <div className={`w-[19px] h-[8px] border-[1.5px] border-current rounded-[2px] shrink-0 ${className}`} />;
    default:
      return <div className={`w-[17px] h-[10px] border-[1.5px] border-current rounded-[2px] shrink-0 ${className}`} />;
  }
};

interface ScrubberSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  presets?: number[];
  onChange: (val: number) => void;
}

const ScrubberSlider: React.FC<ScrubberSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  presets,
  onChange,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const calculateValue = (clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const raw = min + ratio * (max - min);
    const stepped = Math.round(raw / step) * step;
    const clamped = Math.max(min, Math.min(max, stepped));
    onChange(clamped);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    calculateValue(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      calculateValue(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  const percent = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="flex flex-col gap-2 p-1 select-none">
      <div className="text-xs text-gray-400 font-semibold px-0.5">
        {label}
      </div>

      {/* Interactive Track Container matching user screenshot */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-10 bg-[#161922] border border-white/20 hover:border-white/35 rounded-xl relative flex items-center px-3.5 cursor-ew-resize select-none overflow-hidden transition-colors"
      >
        {/* Subtle filled track */}
        <div
          className="absolute left-0 top-0 bottom-0 bg-white/[0.06] pointer-events-none transition-all"
          style={{ width: `${percent}%` }}
        />

        {/* Current Value Display on Left */}
        <span className="text-sm font-bold text-white z-10 pointer-events-none font-sans">
          {value}{unit}
        </span>

        {/* Vertical White Bar Thumb */}
        <div
          className="absolute w-[4px] h-6 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.7)] pointer-events-none"
          style={{ left: `calc(6px + ${percent * 0.01} * (100% - 16px))` }}
        />
      </div>

      {/* Quick Presets */}
      {presets && (
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {presets.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                value === p
                  ? 'border-lime-400 bg-lime-400/20 text-lime-300'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {p}{unit}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
const RESOLUTIONS = ['480p', '720p', '1080p'];
const DURATIONS = ['5s', '10s', '15s', '20s', '25s', '30s'];

export const CinemaStudio: React.FC<CinemaStudioProps> = () => {
  // Projects Management State
  const [projects, setProjects] = useState<CinemaProject[]>(() => {
    const saved = localStorage.getItem('banana_cinema_projects_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return projects[0]?.id || 'proj-cyberpunk-teaser';
  });

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || DEFAULT_PROJECTS[0];

  // Save projects to localStorage
  useEffect(() => {
    localStorage.setItem('banana_cinema_projects_v2', JSON.stringify(projects));
  }, [projects]);

  // Project Modals & Dropdown State
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [ratioDropdownOpen, setRatioDropdownOpen] = useState(false);
  const [resolutionDropdownOpen, setResolutionDropdownOpen] = useState(false);
  const [durationDropdownOpen, setDurationDropdownOpen] = useState(false);
  const [variationsDropdownOpen, setVariationsDropdownOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleValue, setEditingTitleValue] = useState('');

  // New Project Form State
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectGenre, setNewProjectGenre] = useState(PROJECT_GENRES[0]);
  const [newProjectRatio, setNewProjectRatio] = useState('16:9');

  // Studio Director State
  const [mode, setMode] = useState<'image' | 'video'>('video');
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [activePresetMenu, setActivePresetMenu] = useState<'film' | 'camera' | 'color' | 'lighting' | 'references' | null>(null);

  const [selectedSceneId, setSelectedSceneId] = useState<number>(() => {
    return activeProject?.scenes[0]?.id || 1;
  });

  const activeScene = activeProject.scenes.find(s => s.id === selectedSceneId) || activeProject.scenes[0] || {
    id: 1,
    title: 'Scene 1: Opening Shot',
    prompt: '',
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

  const [prompt, setPrompt] = useState(activeScene.prompt);
  const [mentionMenuOpen, setMentionMenuOpen] = useState(false);
  const [references, setReferences] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Sync prompt when active scene changes
  useEffect(() => {
    if (activeScene) {
      setPrompt(activeScene.prompt);
    }
  }, [activeScene.id, activeProjectId]);

  // Project Switch handler
  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
    const target = projects.find(p => p.id === projectId);
    if (target && target.scenes.length > 0) {
      const firstScene = target.scenes[0];
      setSelectedSceneId(firstScene.id);
      setPrompt(firstScene.prompt);
    }
    setIsProjectDropdownOpen(false);
    setIsProjectsModalOpen(false);
  };

  // Create Project handler
  const handleCreateProject = (e?: React.FormEvent) => {
    e?.preventDefault();
    const title = newProjectTitle.trim() || `Film Projesi ${projects.length + 1}`;
    const newId = `proj-${Date.now()}`;
    const initialScene: SceneItem = {
      id: 1,
      title: 'Scene 1: Establishing Shot',
      prompt: 'Cinematic wide angle establishing shot, high aesthetic production value, atmospheric lighting.',
      duration: '10s',
      ratio: newProjectRatio,
      resolution: '1080p',
      cameraMovement: 'Auto Camera',
      filmSetup: 'Auto',
      colorPalette: 'Auto Color',
      lighting: 'Auto Lighting',
      hasAudio: true,
      variations: 1,
    };

    const newProject: CinemaProject = {
      id: newId,
      title,
      genre: newProjectGenre,
      aspectRatio: newProjectRatio,
      createdAt: new Date().toLocaleDateString('tr-TR'),
      scenes: [initialScene],
    };

    setProjects([newProject, ...projects]);
    setActiveProjectId(newId);
    setSelectedSceneId(1);
    setPrompt(initialScene.prompt);
    setNewProjectTitle('');
    setIsNewProjectModalOpen(false);
    setIsProjectsModalOpen(false);
  };

  // Rename Active Project
  const handleSaveProjectTitle = () => {
    const trimmed = editingTitleValue.trim();
    if (trimmed) {
      setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, title: trimmed } : p));
    }
    setIsEditingTitle(false);
  };

  // Delete Project handler
  const handleDeleteProject = (projectIdToDelete: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (projects.length <= 1) {
      alert('En az bir proje bulunmalıdır.');
      return;
    }
    if (!window.confirm('Bu projeyi ve tüm sahnelerini silmek istediğinize emin misiniz?')) {
      return;
    }
    const filtered = projects.filter(p => p.id !== projectIdToDelete);
    setProjects(filtered);
    if (activeProjectId === projectIdToDelete) {
      const nextProj = filtered[0];
      setActiveProjectId(nextProj.id);
      if (nextProj.scenes.length > 0) {
        setSelectedSceneId(nextProj.scenes[0].id);
        setPrompt(nextProj.scenes[0].prompt);
      }
    }
  };

  // Active Scene Settings Sync
  const updateActiveScene = (patch: Partial<SceneItem>) => {
    setProjects(prev => prev.map(proj => {
      if (proj.id !== activeProject.id) return proj;
      return {
        ...proj,
        scenes: proj.scenes.map(s => s.id === activeScene.id ? { ...s, ...patch } : s),
      };
    }));
  };

  const handleAddScene = () => {
    const currentScenes = activeProject.scenes;
    const nextId = currentScenes.length > 0 ? Math.max(...currentScenes.map(s => s.id)) + 1 : 1;
    const newScene: SceneItem = {
      id: nextId,
      title: `Scene ${nextId}: Cinematic Sequence`,
      prompt: 'Cinematic composition, hyper-realistic depth of field, anamorphic lens flare.',
      duration: activeScene?.duration || '10s',
      ratio: activeScene?.ratio || activeProject.aspectRatio || '16:9',
      resolution: activeScene?.resolution || '1080p',
      cameraMovement: 'Auto Camera',
      filmSetup: 'Auto',
      colorPalette: 'Auto Color',
      lighting: 'Auto Lighting',
      hasAudio: true,
      variations: 1,
    };

    setProjects(prev => prev.map(proj => {
      if (proj.id !== activeProject.id) return proj;
      return {
        ...proj,
        scenes: [...proj.scenes, newScene],
      };
    }));
    setSelectedSceneId(nextId);
    setPrompt(newScene.prompt);
  };

  const handleDeleteScene = (idToDelete: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const currentScenes = activeProject.scenes;
    if (currentScenes.length <= 1) {
      const resetScene: SceneItem = {
        id: 1,
        title: 'Scene 1: Opening Shot',
        prompt: 'Cinematic wide shot, 35mm anamorphic lens, atmospheric lighting and rain particles.',
        duration: '10s',
        ratio: activeProject.aspectRatio || '16:9',
        resolution: '1080p',
        cameraMovement: 'Auto Camera',
        filmSetup: 'Auto',
        colorPalette: 'Auto Color',
        lighting: 'Auto Lighting',
        hasAudio: true,
        variations: 1,
      };
      setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, scenes: [resetScene] } : p));
      setSelectedSceneId(1);
      setPrompt(resetScene.prompt);
      return;
    }

    const filtered = currentScenes.filter(s => s.id !== idToDelete);
    setProjects(prev => prev.map(p => p.id === activeProject.id ? { ...p, scenes: filtered } : p));
    if (selectedSceneId === idToDelete) {
      const nextScene = filtered[0];
      setSelectedSceneId(nextScene.id);
      setPrompt(nextScene.prompt);
    }
  };

  const calculateTotalDuration = (scenes: SceneItem[]) => {
    const totalSeconds = scenes.reduce((acc, s) => {
      const num = parseInt(s.duration.replace(/\D/g, '')) || 0;
      return acc + num;
    }, 0);
    if (totalSeconds >= 60) {
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return secs > 0 ? `${mins}dk ${secs}s` : `${mins}dk`;
    }
    return `${totalSeconds}s`;
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
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const ratioDropdownRef = useRef<HTMLDivElement>(null);
  const resolutionDropdownRef = useRef<HTMLDivElement>(null);
  const durationDropdownRef = useRef<HTMLDivElement>(null);
  const variationsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePresetMenu(null);
        setModelDropdownOpen(false);
        setMentionMenuOpen(false);
      }
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
      if (ratioDropdownRef.current && !ratioDropdownRef.current.contains(e.target as Node)) {
        setRatioDropdownOpen(false);
      }
      if (resolutionDropdownRef.current && !resolutionDropdownRef.current.contains(e.target as Node)) {
        setResolutionDropdownOpen(false);
      }
      if (durationDropdownRef.current && !durationDropdownRef.current.contains(e.target as Node)) {
        setDurationDropdownOpen(false);
      }
      if (variationsDropdownRef.current && !variationsDropdownRef.current.contains(e.target as Node)) {
        setVariationsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-45px)] overflow-hidden bg-[#0a0d14] text-white selection:bg-lime-400 selection:text-black">
      
      {/* =========================================================================
          1. CINEMA PROJECTS WORKSPACE HEADER (PROJE ALANI)
          ========================================================================= */}
      <div className="border-b border-white/[0.08] bg-[#0d121c] px-6 py-2.5 flex items-center justify-between z-30 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          
          {/* Active Project Dropdown Switcher */}
          <div className="relative" ref={projectDropdownRef}>
            <button
              type="button"
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center gap-2.5 bg-[#161c28] hover:bg-[#1c2434] border border-lime-400/30 hover:border-lime-400/60 px-3 py-1.5 rounded-xl transition-all shadow-sm group"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-lime-400/20 text-lime-400 group-hover:scale-105 transition-transform">
                <Clapperboard size={14} />
              </div>
              <div className="text-left flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-wider text-lime-400">Aktif Proje</span>
                <span className="text-xs font-bold text-white max-w-[200px] truncate">{activeProject.title}</span>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProjectDropdownOpen ? 'rotate-180 text-lime-400' : ''}`} />
            </button>

            {/* Project Quick Switcher Dropdown */}
            {isProjectDropdownOpen && (
              <div className="absolute top-12 left-0 w-80 bg-[#141824] border border-white/15 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1.5">
                  Kayıtlı Projeler ({projects.length})
                </div>
                <div className="max-h-64 overflow-y-auto flex flex-col gap-1 py-1">
                  {projects.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProject(p.id)}
                      className={`cursor-pointer rounded-xl px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        p.id === activeProject.id
                          ? 'bg-lime-400/15 text-white border border-lime-400/30 font-semibold'
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-medium">{p.title}</div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <span className="text-lime-300/80">{p.genre}</span>
                          <span>·</span>
                          <span>{p.scenes.length} Sahne</span>
                          <span>·</span>
                          <span>{calculateTotalDuration(p.scenes)}</span>
                        </div>
                      </div>
                      {p.id === activeProject.id && <Check size={14} className="text-lime-400 shrink-0" />}
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 mt-1 pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProjectDropdownOpen(false);
                      setIsNewProjectModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 text-lime-300 text-xs font-semibold py-2 transition-colors border border-lime-400/20"
                  >
                    <Plus size={14} />
                    Yeni Film Projesi Oluştur
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Inline Rename Project Title */}
          {isEditingTitle ? (
            <div className="flex items-center gap-1.5 bg-[#161c28] border border-white/20 rounded-xl px-2 py-1">
              <input
                type="text"
                value={editingTitleValue}
                onChange={e => setEditingTitleValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveProjectTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                autoFocus
                className="bg-transparent text-xs text-white focus:outline-none w-48"
              />
              <button
                type="button"
                onClick={handleSaveProjectTitle}
                className="p-1 rounded-md bg-lime-400 text-black hover:bg-lime-300"
              >
                <Check size={12} />
              </button>
              <button
                type="button"
                onClick={() => setIsEditingTitle(false)}
                className="p-1 rounded-md text-gray-400 hover:text-white"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              title="Proje Adını Düzenle"
              onClick={() => {
                setEditingTitleValue(activeProject.title);
                setIsEditingTitle(true);
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Edit2 size={13} />
            </button>
          )}

          {/* Project Metadata Badges */}
          <div className="hidden md:flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1 rounded-lg bg-white/[0.04] border border-white/10 px-2.5 py-1 text-gray-300">
              <Tag size={12} className="text-lime-400" />
              <span>{activeProject.genre}</span>
            </span>
            <span className="flex items-center gap-1 rounded-lg bg-white/[0.04] border border-white/10 px-2.5 py-1 text-gray-300">
              <Film size={12} className="text-amber-400" />
              <span>{activeProject.scenes.length} Sahne</span>
            </span>
            <span className="flex items-center gap-1 rounded-lg bg-white/[0.04] border border-white/10 px-2.5 py-1 text-gray-300">
              <Clock size={12} className="text-sky-400" />
              <span>{calculateTotalDuration(activeProject.scenes)}</span>
            </span>
            <span className="flex items-center gap-1 rounded-lg bg-white/[0.04] border border-white/10 px-2.5 py-1 text-gray-300">
              <span className="text-purple-400 font-mono">📐</span>
              <span>{activeProject.aspectRatio}</span>
            </span>
          </div>
        </div>

        {/* Project Actions (Right) */}
        <div className="flex items-center gap-2">
          {/* Visual Projects Gallery Button */}
          <button
            type="button"
            onClick={() => setIsProjectsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-gray-200 hover:text-white transition-all shadow-sm"
          >
            <LayoutGrid size={14} className="text-lime-400" />
            <span>Tüm Projeler ({projects.length})</span>
          </button>

          {/* Create New Project Button */}
          <button
            type="button"
            onClick={() => setIsNewProjectModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black px-3.5 py-1.5 text-xs font-extrabold shadow-md shadow-lime-400/20 active:scale-95 transition-all"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>Yeni Proje</span>
          </button>

          {/* Delete Project (if > 1) */}
          {projects.length > 1 && (
            <button
              type="button"
              title="Aktif Projeyi Sil"
              onClick={e => handleDeleteProject(activeProject.id, e)}
              className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          2. MAIN DIRECTOR STAGE AREA
          ========================================================================= */}
      <div className="flex-1 overflow-y-auto px-8 pt-9 pb-16 flex flex-col gap-8" ref={popoverRef}>
        
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
                        className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all ${
                          activeScene.filmSetup === preset.name
                            ? 'border-lime-400 bg-lime-400/10 shadow-md shadow-lime-400/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-white">{preset.name}</span>
                            <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono">
                              {preset.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-snug">{preset.desc}</p>
                        </div>
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
                        className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all ${
                          activeScene.cameraMovement === preset.name
                            ? 'border-lime-400 bg-lime-400/10 shadow-md shadow-lime-400/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-semibold text-white block mb-1">{preset.name}</span>
                          <p className="text-[11px] text-gray-400 leading-snug">{preset.desc}</p>
                        </div>
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
                        className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all ${
                          activeScene.colorPalette === preset.name
                            ? 'border-lime-400 bg-lime-400/10 shadow-md shadow-lime-400/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={`h-3 w-8 rounded-full bg-gradient-to-r ${preset.color}`} />
                            <span className="text-xs font-semibold text-white">{preset.name}</span>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-snug">{preset.desc}</p>
                        </div>
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
                        className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all ${
                          activeScene.lighting === preset.name
                            ? 'border-lime-400 bg-lime-400/10 shadow-md shadow-lime-400/10'
                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div>
                          <span className="text-xs font-semibold text-white block mb-1">{preset.name}</span>
                          <p className="text-[11px] text-gray-400 leading-snug">{preset.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Central Unified Prompt Console */}
            <div className="flex flex-col bg-[#141822] border border-white/15 rounded-3xl p-4 shadow-2xl relative transition-all focus-within:border-lime-400/50">
              
              {/* Scene Indicator & Prompt Textarea */}
              <div className="flex items-center justify-between mb-1 text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5 font-semibold text-lime-400">
                  <Clapperboard size={13} />
                  <span>{activeScene.title} İstem Metni</span>
                </span>
                <span className="text-[10px] text-gray-500 font-mono">Proje: {activeProject.title}</span>
              </div>

              <div className="flex items-start gap-3">
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
                  className="shrink-0 flex items-center justify-center bg-gradient-to-b from-[#dfff00] to-[#b8eb00] hover:from-[#e7ff26] hover:to-[#c6fa00] text-black font-black uppercase rounded-2xl px-8 py-5 shadow-[0_0_25px_rgba(223,255,0,0.35)] hover:shadow-[0_0_35px_rgba(223,255,0,0.5)] active:scale-95 transition-all select-none cursor-pointer disabled:opacity-50"
                >
                  <span className="tracking-wider text-xs">GENERATE</span>
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
                        const updated = prompt + ' ' + item.tag + ' ';
                        setPrompt(updated);
                        updateActiveScene({ prompt: updated });
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

                  {/* Resolution Pill with Custom Floating Popover matching user screenshot */}
                  <div className="relative" ref={resolutionDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setResolutionDropdownOpen(!resolutionDropdownOpen)}
                      className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs transition-all ${
                        resolutionDropdownOpen
                          ? 'border-sky-400/50 bg-sky-400/10 text-white shadow-inner'
                          : 'border-white/10 bg-white/[0.04] text-gray-200 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <Gem size={12} className="text-sky-400" />
                      <span className="font-semibold">{activeScene.resolution === '4K' ? '1080p' : activeScene.resolution}</span>
                    </button>

                    {/* Resolution Floating Dropdown Menu matching user screenshot */}
                    {resolutionDropdownOpen && (
                      <div className="absolute bottom-11 left-0 z-50 bg-[#141722] border border-white/15 rounded-2xl p-1.5 shadow-2xl w-36 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-1">
                        {RESOLUTIONS.map(res => {
                          const isSelected = activeScene.resolution === res || (res === '1080p' && activeScene.resolution === '4K');
                          return (
                            <div
                              key={res}
                              onClick={() => {
                                updateActiveScene({ resolution: res });
                                setResolutionDropdownOpen(false);
                              }}
                              className={`cursor-pointer rounded-xl px-3.5 py-2.5 text-xs flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-[#1e2433] text-white font-bold shadow-sm'
                                  : 'text-gray-300 hover:bg-white/5 hover:text-white font-semibold'
                              }`}
                            >
                              <span className="text-sm font-bold tracking-wide">{res}</span>
                              {isSelected && (
                                <Check size={14} className="text-lime-400 stroke-[3]" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Aspect Ratio Pill with Custom Floating Popover */}
                  <div className="relative" ref={ratioDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setRatioDropdownOpen(!ratioDropdownOpen)}
                      className={`flex items-center gap-2 rounded-xl bg-white/[0.04] border px-3 py-1 text-xs transition-all ${
                        ratioDropdownOpen
                          ? 'border-white/30 bg-white/10 text-white shadow-inner'
                          : 'border-white/10 hover:border-white/20 text-gray-200 hover:text-white'
                      }`}
                    >
                      {renderRatioIcon(activeScene.ratio, "text-gray-300")}
                      <span className="font-semibold">{activeScene.ratio}</span>
                    </button>

                    {/* Ratio Floating Dropdown Menu */}
                    {ratioDropdownOpen && (
                      <div className="absolute bottom-11 left-0 z-50 bg-[#141722] border border-white/15 rounded-2xl p-1.5 shadow-2xl w-48 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-1">
                        {RATIOS.map(r => {
                          const isSelected = activeScene.ratio === r;
                          return (
                            <div
                              key={r}
                              onClick={() => {
                                updateActiveScene({ ratio: r });
                                setRatioDropdownOpen(false);
                              }}
                              className={`cursor-pointer rounded-xl px-3 py-2 text-xs flex items-center justify-between transition-all ${
                                isSelected
                                  ? 'bg-[#1e2433] text-white font-bold shadow-sm'
                                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-5 h-5">
                                  {renderRatioIcon(r, isSelected ? 'text-white' : 'text-gray-400')}
                                </div>
                                <span className="text-xs font-semibold">{r}</span>
                              </div>
                              {isSelected && (
                                <Check size={14} className="text-lime-400 stroke-[3]" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Duration Pill with Scrubber Popover */}
                  <div className="relative" ref={durationDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setDurationDropdownOpen(!durationDropdownOpen)}
                      className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs transition-all ${
                        durationDropdownOpen
                          ? 'border-amber-400/50 bg-amber-400/10 text-white shadow-inner'
                          : 'border-white/10 bg-white/[0.04] text-gray-300 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <Clock size={12} className="text-amber-400" />
                      <span className="font-semibold">{activeScene.duration}</span>
                      <ChevronDown size={11} className={`text-gray-400 transition-transform ${durationDropdownOpen ? 'rotate-180 text-amber-400' : ''}`} />
                    </button>

                    {/* Duration Scrubber Popover matching user screenshot */}
                    {durationDropdownOpen && (
                      <div className="absolute bottom-11 left-0 z-50 bg-[#141722] border border-white/15 rounded-2xl p-3 shadow-2xl w-64 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-2">
                        <ScrubberSlider
                          label="Duration"
                          value={Math.min(30, Math.max(5, parseInt(activeScene.duration.replace(/\D/g, '')) || 15))}
                          min={5}
                          max={30}
                          step={1}
                          unit="s"
                          presets={[5, 10, 15, 20, 25, 30]}
                          onChange={val => updateActiveScene({ duration: `${val}s` })}
                        />
                      </div>
                    )}
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

                {/* Variations Pill with Scrubber Popover matching user screenshot */}
                <div className="relative" ref={variationsDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setVariationsDropdownOpen(!variationsDropdownOpen)}
                    className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs transition-all ${
                      variationsDropdownOpen
                        ? 'border-lime-400/50 bg-lime-400/10 text-white shadow-inner'
                        : 'border-white/10 bg-white/[0.04] text-gray-300 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <Layers size={12} className="text-lime-400" />
                    <span className="font-semibold">{activeScene.variations} Var</span>
                    <ChevronDown size={11} className={`text-gray-400 transition-transform ${variationsDropdownOpen ? 'rotate-180 text-lime-400' : ''}`} />
                  </button>

                  {/* Variations Scrubber Popover */}
                  {variationsDropdownOpen && (
                    <div className="absolute bottom-11 right-0 z-50 bg-[#141722] border border-white/15 rounded-2xl p-3 shadow-2xl w-64 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-2">
                      <ScrubberSlider
                        label="Variations"
                        value={activeScene.variations}
                        min={1}
                        max={16}
                        step={1}
                        unit=""
                        presets={[1, 2, 4, 8, 12, 16]}
                        onChange={val => updateActiveScene({ variations: val })}
                      />
                    </div>
                  )}
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

        {/* =========================================================================
            3. MULTI-SCENE STORYBOARD (AKTİF PROJE SAHNE KURGUSU)
            ========================================================================= */}
        <div className="max-w-5xl mx-auto w-full flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/15 text-lime-400 border border-lime-400/25">
                <Layers size={17} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white tracking-wide">
                    {activeProject.title} — SAHNE KURGUSU
                  </h3>
                  <span className="text-[11px] font-semibold text-lime-300 bg-lime-400/10 border border-lime-400/20 px-2 py-0.5 rounded-full">
                    {activeProject.scenes.length} Sahne
                  </span>
                  <span className="text-[11px] text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                    {calculateTotalDuration(activeProject.scenes)} Toplam
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Bu projeye ait sinematik sahneleri yönetin. Bir sahneye tıklayarak yukarıdaki yönetmen konsolunda anında düzenleyebilirsiniz.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddScene}
              className="flex items-center gap-1.5 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/30 px-3.5 py-2 text-xs font-bold text-lime-300 transition-all shadow-sm"
            >
              <Plus size={14} className="stroke-[3]" />
              Yeni Sahne Ekle
            </button>
          </div>

          {/* Scenes Grid */}
          <div className="grid grid-cols-2 gap-4">
            {activeProject.scenes.map((scene, idx) => (
              <div
                key={scene.id}
                onClick={() => {
                  setSelectedSceneId(scene.id);
                  setPrompt(scene.prompt);
                }}
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

      {/* =========================================================================
          4. ALL PROJECTS VISUAL MANAGER MODAL (TÜM PROJELER - GRID GÖRÜNÜMÜ)
          ========================================================================= */}
      {isProjectsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="bg-[#121622] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#151a28]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400/20 text-lime-400 border border-lime-400/30">
                  <FolderKanban size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Film & Video Projeleriniz</h3>
                  <p className="text-xs text-gray-400">Tüm projelerinizi görüntüleyin, geçiş yapın veya yeni bir kurgu projesi başlatın.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black px-3.5 py-1.5 text-xs font-bold transition-all shadow-md"
                >
                  <Plus size={14} className="stroke-[3]" />
                  Yeni Proje Başlat
                </button>
                <button
                  type="button"
                  onClick={() => setIsProjectsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body - Projects Grid */}
            <div className="p-6 overflow-y-auto grid grid-cols-2 gap-4">
              {projects.map(proj => {
                const isActive = proj.id === activeProject.id;
                return (
                  <div
                    key={proj.id}
                    onClick={() => handleSelectProject(proj.id)}
                    className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between relative group ${
                      isActive
                        ? 'border-lime-400/80 bg-[#171f2e] shadow-xl shadow-lime-400/10 ring-1 ring-lime-400/30'
                        : 'border-white/10 bg-[#141824] hover:border-white/20 hover:bg-[#181d2c]'
                    }`}
                  >
                    <div>
                      {/* Project Header Banner */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-lime-300 bg-lime-400/10 border border-lime-400/20 px-2.5 py-1 rounded-lg">
                            {proj.genre}
                          </span>
                          <span className="text-[10px] text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md font-mono">
                            {proj.aspectRatio}
                          </span>
                        </div>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] font-extrabold text-lime-400 bg-lime-400/15 border border-lime-400/30 px-2 py-0.5 rounded-full">
                            <Check size={11} className="stroke-[3]" />
                            Aktif Proje
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-white mb-1 group-hover:text-lime-300 transition-colors">
                        {proj.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 mb-3 flex items-center gap-2">
                        <span>Oluşturulma: {proj.createdAt}</span>
                        <span>·</span>
                        <span>{proj.scenes.length} Sahne</span>
                        <span>·</span>
                        <span>{calculateTotalDuration(proj.scenes)}</span>
                      </p>

                      {/* Mini Scenes Strip Preview */}
                      <div className="bg-black/30 rounded-xl p-2.5 border border-white/5 mb-3 flex flex-col gap-1.5">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Sahneler:</span>
                        {proj.scenes.slice(0, 2).map((sc, sIdx) => (
                          <div key={sc.id} className="text-[11px] text-gray-300 truncate flex items-center gap-1.5">
                            <span className="text-lime-400 font-bold">{sIdx + 1}.</span>
                            <span className="truncate">{sc.title}</span>
                          </div>
                        ))}
                        {proj.scenes.length > 2 && (
                          <span className="text-[10px] text-gray-500 italic">+{proj.scenes.length - 2} daha fazla sahne...</span>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <span className="text-xs font-semibold text-lime-400 group-hover:underline">
                        {isActive ? 'Düzenlemeye Devam Et →' : 'Bu Projeyi Aç →'}
                      </span>
                      {projects.length > 1 && (
                        <button
                          type="button"
                          title="Projeyi Sil"
                          onClick={e => handleDeleteProject(proj.id, e)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add Project Card Placeholder */}
              <div
                onClick={() => setIsNewProjectModalOpen(true)}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-white/15 hover:border-lime-400/50 bg-white/[0.02] hover:bg-lime-400/[0.04] p-6 flex flex-col items-center justify-center text-center transition-all group min-h-[200px]"
              >
                <div className="h-12 w-12 rounded-2xl bg-white/5 group-hover:bg-lime-400/20 text-gray-400 group-hover:text-lime-400 flex items-center justify-center mb-3 transition-colors">
                  <FolderPlus size={24} />
                </div>
                <h5 className="text-xs font-bold text-white group-hover:text-lime-300 mb-1 transition-colors">
                  Yeni Bir Film Projesi Başlat
                </h5>
                <p className="text-[11px] text-gray-400 max-w-xs">
                  Ayrı bir hikaye, sahne kurgusu ve görsel estetiğe sahip yepyeni bir proje oluşturun.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          5. CREATE NEW PROJECT MODAL
          ========================================================================= */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="bg-[#141824] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#161c28]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/20 text-lime-400">
                  <Clapperboard size={16} />
                </div>
                <h3 className="text-sm font-bold text-white">Yeni Film Projesi Oluştur</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewProjectModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 flex flex-col gap-5">
              
              {/* Project Title Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-300">
                  Proje Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Cyberpunk 2099, Derin Uzay Keşfi, Parfüm Lansmanı..."
                  value={newProjectTitle}
                  onChange={e => setNewProjectTitle(e.target.value)}
                  autoFocus
                  className="w-full rounded-xl bg-black/40 border border-white/15 px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-lime-400 transition-colors"
                />
              </div>

              {/* Genre Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-300">
                  Proje Türü / Teması
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PROJECT_GENRES.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setNewProjectGenre(g)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold text-left border transition-all ${
                        newProjectGenre === g
                          ? 'border-lime-400 bg-lime-400/15 text-lime-300 shadow-sm'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-300">
                  Görsel Formatı (En-Boy Oranı)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {RATIOS.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewProjectRatio(r)}
                      className={`flex items-center justify-center gap-2 px-2.5 py-2 rounded-xl text-xs font-mono font-semibold border text-center transition-all ${
                        newProjectRatio === r
                          ? 'border-lime-400 bg-lime-400/15 text-lime-300 shadow-sm'
                          : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {renderRatioIcon(r, newProjectRatio === r ? 'text-lime-300' : 'text-gray-400')}
                      <span>{r}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black px-5 py-2 text-xs font-extrabold shadow-lg shadow-lime-400/20 active:scale-95 transition-all"
                >
                  <Plus size={15} className="stroke-[3]" />
                  Projeyi Oluştur ve Başla
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
