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
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { compileCinematicPrompt } from '../lib/cinema/promptCompiler';
import { createVideoTask, pollVideoTask } from '../services/runwayService';
import { generateMedia } from '../services/geminiService';
import { VideoAspectRatio, VideoModelId, DEFAULT_VIDEO_MODEL, DEFAULT_IMAGE_MODEL, ImageModelId, GenerationConfig } from '../types';

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
  filmGenre?: string;
  filmEra?: string;
  filmEraYear?: string;
  filmTempo?: string;
  filmLens?: string;
  colorPalette: string;
  lighting: string;
  hasAudio: boolean;
  variations: number;
  videoUrl?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  status?: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  taskId?: string;
  modelUsed?: string;
  generatedAt?: number;
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
        filmSetup: 'Noir · 2090s+ (2099) · Calm',
        filmGenre: 'Noir',
        filmEra: '2090s+',
        filmEraYear: '2099',
        filmTempo: 'Calm',
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
        filmSetup: 'Drama · 2020s (2026) · Single Shot',
        filmGenre: 'Drama',
        filmEra: '2020s',
        filmEraYear: '2026',
        filmTempo: 'Single Shot',
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
        filmSetup: 'Action · 2090s+ (2099) · Chaotic',
        filmGenre: 'Action',
        filmEra: '2090s+',
        filmEraYear: '2099',
        filmTempo: 'Chaotic',
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
        filmSetup: 'Epic · 1970s (1979) · Dynamic',
        filmGenre: 'Epic',
        filmEra: '1970s',
        filmEraYear: '1979',
        filmTempo: 'Dynamic',
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
        filmSetup: 'Sci-Fi · 1960s (1968) · Single Shot',
        filmGenre: 'Sci-Fi',
        filmEra: '1960s',
        filmEraYear: '1968',
        filmTempo: 'Single Shot',
        colorPalette: 'Teal & Orange',
        lighting: 'Chiaroscuro Noir',
        hasAudio: true,
        variations: 1,
      },
    ],
  },
];

export interface FilmGenreOption {
  id: string;
  name: string;
  desc: string;
  image: string;
  gradient: string;
  isAuto?: boolean;
}

export interface FilmEraOption {
  id: string;
  name: string;
  yearRange: string;
  desc: string;
  sampleYears: string[];
  image: string;
  gradient: string;
  isAuto?: boolean;
}

export interface FilmTempoOption {
  id: string;
  name: string;
  desc: string;
  segments: number[];
  speedMs: number;
  image: string;
  gradient: string;
  isAuto?: boolean;
}

const FILM_GENRE_OPTIONS: FilmGenreOption[] = [
  {
    id: 'auto',
    name: 'Auto',
    desc: 'Story conventions automatically inferred from your scene prompt',
    image: '',
    gradient: 'from-indigo-500/40 via-amber-400/35 to-sky-500/40',
    isAuto: true,
  },
  {
    id: 'drama',
    name: 'Drama',
    desc: 'Intimate character emotion, naturalistic depth, poignant storytelling',
    image: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-amber-900/80 via-slate-800 to-slate-950',
  },
  {
    id: 'noir',
    name: 'Noir',
    desc: 'High-contrast chiaroscuro shadows, rain-slicked streets & Venetian blinds',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-zinc-900 via-neutral-950 to-black',
  },
  {
    id: 'comedy',
    name: 'Comedy',
    desc: 'Warm vibrant lighting, expressive character framing & snappy visual timing',
    image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-amber-500/50 via-orange-600/40 to-rose-900/70',
  },
  {
    id: 'horror',
    name: 'Horror',
    desc: 'Unsettling dread, deep eerie negative space & claustrophobic shadows',
    image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-emerald-950 via-slate-950 to-black',
  },
  {
    id: 'action',
    name: 'Action',
    desc: 'High-octane kinetic framing, visceral impact & explosive dynamics',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-orange-700/70 via-red-950 to-slate-950',
  },
  {
    id: 'animation',
    name: 'Animation',
    desc: 'Stylized 3D/2D feature animation aesthetics, expressive lighting & color',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-fuchsia-600/60 via-violet-800/70 to-indigo-950',
  },
  {
    id: 'epic',
    name: 'Epic',
    desc: 'Monumental scale, sweeping vistas & grand theatrical composition',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-slate-700 via-amber-900/60 to-stone-950',
  },
  {
    id: 'scifi',
    name: 'Sci-Fi',
    desc: 'Futuristic cybernetic worlds, neon megastructures & cosmic scale',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-cyan-700/70 via-blue-950 to-violet-950',
  },
  {
    id: 'thriller',
    name: 'Thriller',
    desc: 'Psychological tension, cold clinical tones & tight suspenseful framing',
    image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-teal-950 via-slate-900 to-black',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    desc: 'Mythical realms, ethereal magic illumination & otherworldly grandeur',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-purple-800/70 via-indigo-950 to-slate-950',
  },
  {
    id: 'western',
    name: 'Western',
    desc: 'Sun-scorched frontier vistas, dusty standoffs & warm anamorphic grit',
    image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-amber-700/80 via-orange-950 to-stone-950',
  },
  {
    id: 'romance',
    name: 'Romance',
    desc: 'Soft golden hour glow, dreamy bokeh & intimate emotional warmth',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-rose-600/60 via-amber-800/60 to-slate-950',
  },
  {
    id: 'documentary',
    name: 'Documentary',
    desc: 'Authentic observational realism, handheld immediacy & natural light',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-emerald-800/60 via-stone-900 to-slate-950',
  },
];

const FILM_ERA_OPTIONS: FilmEraOption[] = [
  {
    id: 'auto',
    name: 'Auto',
    yearRange: 'Automatic Period',
    desc: 'AI automatically matches the historical or futuristic period of your prompt',
    sampleYears: [],
    image: '',
    gradient: 'from-blue-500/50 via-orange-400/50 to-indigo-600/50',
    isAuto: true,
  },
  {
    id: '1920s',
    name: '1920s',
    yearRange: '1920 – 1929',
    desc: 'Silent cinema, Art Deco grandeur, orthochromatic silver nitrate grain',
    sampleYears: ['1920', '1922', '1925', '1927', '1929'],
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-stone-600 via-neutral-800 to-black',
  },
  {
    id: '1940s',
    name: '1940s',
    yearRange: '1940 – 1949',
    desc: 'Classic Hollywood Golden Age, deep monochrome silver-screen contrast',
    sampleYears: ['1941', '1943', '1945', '1947', '1949'],
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-zinc-700 via-zinc-900 to-black',
  },
  {
    id: '1950s',
    name: '1950s',
    yearRange: '1950 – 1959',
    desc: 'Three-strip Technicolor saturation, CinemaScope widescreen glamour',
    sampleYears: ['1950', '1953', '1955', '1957', '1959'],
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-red-700/70 via-amber-700/60 to-sky-950',
  },
  {
    id: '1960s',
    name: '1960s',
    yearRange: '1960 – 1969',
    desc: 'French New Wave, vintage 16mm/35mm Kodak stock & counterculture vibes',
    sampleYears: ['1960', '1963', '1966', '1968', '1969'],
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-amber-600/70 via-stone-800 to-slate-950',
  },
  {
    id: '1970s',
    name: '1970s',
    yearRange: '1970 – 1979',
    desc: 'New Hollywood gritty 35mm film grain, warm tungsten halation & zoom lenses',
    sampleYears: ['1971', '1974', '1976', '1977', '1979'],
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-orange-800/80 via-amber-950 to-stone-950',
  },
  {
    id: '1980s',
    name: '1980s',
    yearRange: '1980 – 1989',
    desc: 'Anamorphic blue lens flares, neon synth atmosphere & practical effects',
    sampleYears: ['1980', '1982', '1984', '1986', '1989'],
    image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-fuchsia-700/70 via-indigo-900 to-slate-950',
  },
  {
    id: '1990s',
    name: '1990s',
    yearRange: '1990 – 1999',
    desc: 'Classic 35mm photochemical blockbuster & independent cinema aesthetic',
    sampleYears: ['1991', '1994', '1995', '1997', '1999'],
    image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-emerald-900/70 via-slate-900 to-black',
  },
  {
    id: '2000s',
    name: '2000s',
    yearRange: '2000 – 2009',
    desc: 'Super 35mm, early DI color grading, high-contrast teal/green & bleach bypass',
    sampleYears: ['2000', '2003', '2005', '2007', '2009'],
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-teal-800/70 via-slate-900 to-zinc-950',
  },
  {
    id: '2010s',
    name: '2010s',
    yearRange: '2010 – 2019',
    desc: 'ARRI Alexa digital cinema clarity, natural skin tones & wide dynamic range',
    sampleYears: ['2010', '2013', '2015', '2017', '2019'],
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-sky-800/70 via-slate-900 to-black',
  },
  {
    id: '2020s',
    name: '2020s',
    yearRange: '2020 – 2029',
    desc: 'Ultra-crisp Large Format 65mm / IMAX digital optics & modern HDR grading',
    sampleYears: ['2020', '2022', '2024', '2026', '2028'],
    image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-indigo-800/70 via-slate-900 to-black',
  },
  {
    id: '2090s',
    name: '2090s+',
    yearRange: '2050 – 2150 (Future)',
    desc: 'Futuristic holographic optics, cybernetic atmosphere & post-modern worlds',
    sampleYears: ['2049', '2077', '2099', '2120', '2150'],
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-cyan-600/70 via-fuchsia-900/70 to-black',
  },
];

const FILM_TEMPO_OPTIONS: FilmTempoOption[] = [
  {
    id: 'auto',
    name: 'Auto',
    desc: 'Montage rhythm adapts organically to the scene action',
    segments: [26, 24, 26, 24],
    speedMs: 900,
    image: '',
    gradient: 'from-pink-500/50 via-rose-500/40 to-amber-500/40',
    isAuto: true,
  },
  {
    id: 'chaotic',
    name: 'Chaotic',
    desc: 'Frenetic rapid-fire cuts, high-adrenaline kinetic montage',
    segments: [11, 11, 11, 11, 11, 11, 11, 11, 11],
    speedMs: 260,
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-rose-700/70 via-teal-900 to-slate-950',
  },
  {
    id: 'dynamic',
    name: 'Dynamic',
    desc: 'Rhythmic action-driven cuts with fluid momentum & energy',
    segments: [20, 20, 20, 20, 20],
    speedMs: 520,
    image: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-sky-700/70 via-emerald-900 to-slate-950',
  },
  {
    id: 'calm',
    name: 'Calm',
    desc: 'Slow contemplative pacing, lingering serene shots & gentle rhythm',
    segments: [50, 50],
    speedMs: 1400,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-teal-700/60 via-sky-950 to-slate-950',
  },
  {
    id: 'single_shot',
    name: 'Single Shot',
    desc: 'Unbroken continuous one-take camera choreography (Oner)',
    segments: [100],
    speedMs: 2200,
    image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-amber-700/70 via-stone-900 to-black',
  },
  {
    id: 'fast_cut',
    name: 'Fast Cut',
    desc: 'Snappy whip-pans and high-tempo blockbuster action editing',
    segments: [14, 14, 14, 14, 14, 14, 14],
    speedMs: 350,
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-orange-600/70 via-red-950 to-black',
  },
  {
    id: 'slow_burn',
    name: 'Slow Burn',
    desc: 'Deliberate, gradually escalating tension with measured cuts',
    segments: [33, 33, 34],
    speedMs: 1100,
    image: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-emerald-900/70 via-slate-950 to-black',
  },
  {
    id: 'slow_motion',
    name: 'Slow Motion',
    desc: 'Ultra-high framerate 120fps dreamlike suspended motion',
    segments: [72, 28],
    speedMs: 1800,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    gradient: 'from-violet-700/70 via-indigo-950 to-black',
  },
];

export const FILM_LENS_PRESETS = [
  { id: 'auto', name: 'Auto', desc: 'AI selects optimal lens and film stock', badge: 'Default' },
  { id: '35mm_anamorphic', name: '35mm Anamorphic', desc: 'Cinematic oval bokeh & blue horizontal flares', badge: 'Cinema Standard' },
  { id: '50mm_prime', name: '50mm f/1.2 Prime', desc: 'Natural perspective with ultra-shallow depth of field', badge: 'Portraits' },
  { id: '85mm_tele', name: '85mm Telephoto', desc: 'Intense background compression & subject isolation', badge: 'Drama' },
  { id: '24mm_wide', name: '24mm Ultra-Wide', desc: 'Expansive vistas, architectural dominance, high immersion', badge: 'Wide' },
  { id: 'imax_70mm', name: 'IMAX 70mm', desc: 'Ultra-high fidelity, grain-free pristine visual scale', badge: 'Epic' },
  { id: 'kodak_500t', name: 'Kodak Vision3 500T', desc: 'Rich tungsten warmth, authentic organic film grain', badge: 'Vintage' },
  { id: 'cinestill_800t', name: 'CineStill 800T', desc: 'Vibrant neon red halations around bright light sources', badge: 'Night' },
];

const formatFilmSetupSummary = (
  genre = 'Auto',
  era = 'Auto',
  eraYear = '',
  tempo = 'Auto',
  lens = 'Auto'
): string => {
  const parts: string[] = [];
  if (genre && genre !== 'Auto') parts.push(genre);
  if (eraYear && eraYear.trim()) {
    parts.push(era && era !== 'Auto' ? `${era} (${eraYear.trim()})` : eraYear.trim());
  } else if (era && era !== 'Auto') {
    parts.push(era);
  }
  if (tempo && tempo !== 'Auto') parts.push(tempo);
  if (lens && lens !== 'Auto') parts.push(lens);
  return parts.length > 0 ? parts.join(' · ') : 'Auto';
};

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
  const [activePresetMenu, setActivePresetMenu] = useState<'genre' | 'era' | 'tempo' | 'film' | 'camera' | 'color' | 'lighting' | 'references' | null>(null);
  const [filmSetupTab, setFilmSetupTab] = useState<'genre' | 'era' | 'tempo' | 'lens'>('genre');
  const [activeTempoSegment, setActiveTempoSegment] = useState<number>(0);

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
  const [generationError, setGenerationError] = useState<string | null>(null);

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

  // Current Film Setup Sub-values (Genre, Era, EraYear, Tempo, Lens)
  const currentGenre = activeScene.filmGenre || 'Auto';
  const currentEra = activeScene.filmEra || 'Auto';
  const currentEraYear = activeScene.filmEraYear || '';
  const currentTempo = activeScene.filmTempo || 'Auto';
  const currentLens = activeScene.filmLens || 'Auto';

  const activeGenreIndex = Math.max(0, FILM_GENRE_OPTIONS.findIndex(g => g.name === currentGenre));
  const activeEraIndex = Math.max(0, FILM_ERA_OPTIONS.findIndex(e => e.name === currentEra));
  const activeTempoIndex = Math.max(0, FILM_TEMPO_OPTIONS.findIndex(t => t.name === currentTempo));

  const activeGenreObj = FILM_GENRE_OPTIONS[activeGenreIndex] || FILM_GENRE_OPTIONS[0];
  const prevGenreObj = FILM_GENRE_OPTIONS[(activeGenreIndex - 1 + FILM_GENRE_OPTIONS.length) % FILM_GENRE_OPTIONS.length];
  const nextGenreObj = FILM_GENRE_OPTIONS[(activeGenreIndex + 1) % FILM_GENRE_OPTIONS.length];

  const activeEraObj = FILM_ERA_OPTIONS[activeEraIndex] || FILM_ERA_OPTIONS[0];
  const prevEraObj = FILM_ERA_OPTIONS[(activeEraIndex - 1 + FILM_ERA_OPTIONS.length) % FILM_ERA_OPTIONS.length];
  const nextEraObj = FILM_ERA_OPTIONS[(activeEraIndex + 1) % FILM_ERA_OPTIONS.length];

  const activeTempoObj = FILM_TEMPO_OPTIONS[activeTempoIndex] || FILM_TEMPO_OPTIONS[0];
  const prevTempoObj = FILM_TEMPO_OPTIONS[(activeTempoIndex - 1 + FILM_TEMPO_OPTIONS.length) % FILM_TEMPO_OPTIONS.length];
  const nextTempoObj = FILM_TEMPO_OPTIONS[(activeTempoIndex + 1) % FILM_TEMPO_OPTIONS.length];

  useEffect(() => {
    setActiveTempoSegment(0);
    if (activePresetMenu !== 'film' || filmSetupTab !== 'tempo') return;
    const count = activeTempoObj.segments.length;
    if (count <= 1) return;
    const timer = setInterval(() => {
      setActiveTempoSegment(prev => (prev + 1) % count);
    }, activeTempoObj.speedMs || 600);
    return () => clearInterval(timer);
  }, [activePresetMenu, filmSetupTab, activeTempoObj]);

  const handleUpdateFilmSetup = (patch: {
    filmGenre?: string;
    filmEra?: string;
    filmEraYear?: string;
    filmTempo?: string;
    filmLens?: string;
  }) => {
    const nextGenre = patch.filmGenre !== undefined ? patch.filmGenre : currentGenre;
    const nextEra = patch.filmEra !== undefined ? patch.filmEra : currentEra;
    const nextEraYear = patch.filmEraYear !== undefined ? patch.filmEraYear : currentEraYear;
    const nextTempo = patch.filmTempo !== undefined ? patch.filmTempo : currentTempo;
    const nextLens = patch.filmLens !== undefined ? patch.filmLens : currentLens;
    const summary = formatFilmSetupSummary(nextGenre, nextEra, nextEraYear, nextTempo, nextLens);
    updateActiveScene({
      filmGenre: nextGenre,
      filmEra: nextEra,
      filmEraYear: nextEraYear,
      filmTempo: nextTempo,
      filmLens: nextLens,
      filmSetup: summary,
    });
  };

  const handleResetFilmSetup = () => {
    updateActiveScene({
      filmGenre: 'Auto',
      filmEra: 'Auto',
      filmEraYear: '',
      filmTempo: 'Auto',
      filmLens: 'Auto',
      filmSetup: 'Auto',
    });
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

  const mapVideoAspectRatio = (ratioStr: string): VideoAspectRatio => {
    if (ratioStr === '2.39:1' || ratioStr === '21:9') return '21:9';
    if (ratioStr === '9:16') return '9:16';
    if (ratioStr === '1:1') return '1:1';
    if (ratioStr === '4:3') return '4:3';
    if (ratioStr === '3:4') return '3:4';
    return '16:9';
  };

  const handleGenerate = async () => {
    if (isGenerating || activeScene.status === 'processing') return;

    const compiledPrompt = compileCinematicPrompt(activeScene);
    if (!compiledPrompt.trim()) {
      setGenerationError('Lütfen sahne için bir prompt veya görsel açıklama yazın.');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(5);
    setGenerationError(null);

    const targetSceneId = activeScene.id;
    updateActiveScene({
      status: 'processing',
      progress: 5,
      error: undefined,
      modelUsed: selectedModel.name,
    });

    try {
      if (mode === 'video') {
        const videoModelId = (selectedModel.id as VideoModelId) || DEFAULT_VIDEO_MODEL;
        const requestedDuration = Math.min(30, Math.max(5, parseInt(activeScene.duration.replace(/\D/g, '')) || 5));
        const requestedQuality = (activeScene.resolution === '1080p' ? '1080p' : '720p') as '720p' | '1080p';
        const mappedRatio = mapVideoAspectRatio(activeScene.ratio);

        const config: GenerationConfig = {
          prompt: compiledPrompt,
          mode: 'video',
          videoModel: videoModelId,
          videoAspectRatio: mappedRatio,
          videoQuality: requestedQuality,
          videoDuration: requestedDuration,
          audioEnabled: activeScene.hasAudio,
          referenceImages: [],
          referenceVideos: [],
          referenceAudios: [],
          videoOperation: 'generate',
          videoPromptExpansionMode: 'balanced',
          count: 1,
          aspectRatio: (mappedRatio === '21:9' || mappedRatio === 'adaptive' ? '16:9' : mappedRatio) as any,
          resolution: '2K',
          imageModel: DEFAULT_IMAGE_MODEL,
        };

        const sceneVideoId = `cinema-${activeProject.id}-s${targetSceneId}-${Date.now()}`;
        const { taskId, endpoint, queueEndpoint } = await createVideoTask(config, { id: sceneVideoId });

        updateActiveScene({
          taskId,
          progress: 15,
        });
        setGenerationProgress(15);

        const videoResult = await pollVideoTask(
          taskId,
          (progressFraction) => {
            const pct = Math.min(99, Math.max(15, Math.round(progressFraction * 100)));
            setGenerationProgress(pct);
            updateActiveScene({ progress: pct });
          },
          videoModelId,
          endpoint,
          queueEndpoint
        );

        if (videoResult.urls && videoResult.urls.length > 0) {
          const videoUrl = videoResult.urls[0];
          setGenerationProgress(100);
          updateActiveScene({
            videoUrl,
            status: 'completed',
            progress: 100,
            generatedAt: Date.now(),
          });
        } else {
          throw new Error('Video üretimi tamamlandı ancak URL alınamadı.');
        }
      } else {
        // Image Mode
        const config: GenerationConfig = {
          prompt: compiledPrompt,
          mode: 'image',
          imageModel: DEFAULT_IMAGE_MODEL,
          videoModel: DEFAULT_VIDEO_MODEL,
          videoAspectRatio: '16:9',
          videoQuality: '720p',
          videoDuration: 5,
          audioEnabled: false,
          referenceImages: [],
          referenceVideos: [],
          referenceAudios: [],
          videoOperation: 'generate',
          videoPromptExpansionMode: 'balanced',
          count: 1,
          aspectRatio: '16:9',
          resolution: '2K',
        };

        const sceneImgId = `cinema-img-${activeProject.id}-s${targetSceneId}-${Date.now()}`;
        const generated = await generateMedia(
          config,
          (progressFraction) => {
            const pct = Math.min(99, Math.max(15, Math.round(progressFraction * 100)));
            setGenerationProgress(pct);
            updateActiveScene({ progress: pct });
          },
          undefined,
          { id: sceneImgId }
        );

        if (generated && generated.url) {
          setGenerationProgress(100);
          updateActiveScene({
            imageUrl: generated.url,
            status: 'completed',
            progress: 100,
            generatedAt: Date.now(),
          });
        } else {
          throw new Error('Görsel üretimi tamamlandı ancak URL alınamadı.');
        }
      }
    } catch (err: any) {
      console.error('Cinema Studio Generation Failed:', err);
      const errMsg = err?.message || 'Üretim sırasında bir hata meydana geldi.';
      setGenerationError(errMsg);
      updateActiveScene({
        status: 'failed',
        error: errMsg,
        progress: 0,
      });
    } finally {
      setIsGenerating(false);
    }
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
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-2">
              
              {/* 1. References */}
              <button
                type="button"
                onClick={() => setActivePresetMenu(activePresetMenu === 'references' ? null : 'references')}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-all text-left group min-w-0 ${
                  activePresetMenu === 'references'
                    ? 'border-lime-400/60 bg-lime-400/10 shadow-lg shadow-lime-400/10'
                    : 'border-white/10 bg-[#141822] hover:border-white/20 hover:bg-[#1a202c]'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black/40 border border-white/10 text-gray-300 group-hover:text-lime-400 transition-colors">
                  <Plus size={15} />
                </div>
                <div className="truncate">
                  <div className="text-[10px] text-gray-400">References</div>
                  <div className="text-xs font-semibold text-white">{references.length}/50</div>
                </div>
              </button>

              {/* 2. Genre */}
              <button
                type="button"
                onClick={() => {
                  setFilmSetupTab('genre');
                  setActivePresetMenu(activePresetMenu === 'genre' ? null : 'genre');
                }}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-all text-left group min-w-0 ${
                  activePresetMenu === 'genre' || (activePresetMenu === 'film' && filmSetupTab === 'genre')
                    ? 'border-lime-400/60 bg-lime-400/10 shadow-lg shadow-lime-400/10'
                    : 'border-white/10 bg-[#141822] hover:border-white/20 hover:bg-[#1a202c]'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/10 border border-purple-500/30 text-purple-300">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <rect x="2" y="4" width="20" height="16" rx="3" />
                    <line x1="6" y1="4" x2="6" y2="20" />
                    <line x1="18" y1="4" x2="18" y2="20" />
                  </svg>
                </div>
                <div className="truncate">
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span>Genre</span>
                    {currentGenre !== 'Auto' && <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shrink-0" />}
                  </div>
                  <div className="text-xs font-semibold text-white truncate">{currentGenre}</div>
                </div>
              </button>

              {/* 3. Era */}
              <button
                type="button"
                onClick={() => {
                  setFilmSetupTab('era');
                  setActivePresetMenu(activePresetMenu === 'era' ? null : 'era');
                }}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-all text-left group min-w-0 ${
                  activePresetMenu === 'era' || (activePresetMenu === 'film' && filmSetupTab === 'era')
                    ? 'border-lime-400/60 bg-lime-400/10 shadow-lg shadow-lime-400/10'
                    : 'border-white/10 bg-[#141822] hover:border-white/20 hover:bg-[#1a202c]'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-300">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M5 22h14" />
                    <path d="M5 2h14" />
                    <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                    <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                  </svg>
                </div>
                <div className="truncate">
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span>Era</span>
                    {(currentEra !== 'Auto' || currentEraYear) && <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shrink-0" />}
                  </div>
                  <div className="text-xs font-semibold text-white truncate">{currentEraYear || currentEra}</div>
                </div>
              </button>

              {/* 4. Tempo */}
              <button
                type="button"
                onClick={() => {
                  setFilmSetupTab('tempo');
                  setActivePresetMenu(activePresetMenu === 'tempo' ? null : 'tempo');
                }}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-all text-left group min-w-0 ${
                  activePresetMenu === 'tempo' || (activePresetMenu === 'film' && filmSetupTab === 'tempo')
                    ? 'border-lime-400/60 bg-lime-400/10 shadow-lg shadow-lime-400/10'
                    : 'border-white/10 bg-[#141822] hover:border-white/20 hover:bg-[#1a202c]'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/30 text-rose-300">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8H4Z" />
                    <path d="m4 11-.88-2.87a2 2 0 0 1 1.33-2.5l11.48-3.5a2 2 0 0 1 2.5 1.32l.87 2.87L4 11.01Z" />
                    <path d="m6.6 4.99 3.38 4.2" />
                    <path d="m11.86 3.38 3.38 4.2" />
                  </svg>
                </div>
                <div className="truncate">
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span>Tempo</span>
                    {currentTempo !== 'Auto' && <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shrink-0" />}
                  </div>
                  <div className="text-xs font-semibold text-white truncate">{currentTempo}</div>
                </div>
              </button>

              {/* 5. Film & Lens */}
              <button
                type="button"
                onClick={() => {
                  setFilmSetupTab('lens');
                  setActivePresetMenu(activePresetMenu === 'film' ? null : 'film');
                }}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-all text-left group min-w-0 ${
                  activePresetMenu === 'film' && filmSetupTab === 'lens'
                    ? 'border-lime-400/60 bg-lime-400/10 shadow-lg shadow-lime-400/10'
                    : 'border-white/10 bg-[#141822] hover:border-white/20 hover:bg-[#1a202c]'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 text-amber-300">
                  <Film size={15} />
                </div>
                <div className="truncate">
                  <div className="text-[10px] text-gray-400">Film setup</div>
                  <div className="text-xs font-semibold text-white truncate">{currentLens}</div>
                </div>
              </button>

              {/* 6. Camera */}
              <button
                type="button"
                onClick={() => setActivePresetMenu(activePresetMenu === 'camera' ? null : 'camera')}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-all text-left group min-w-0 ${
                  activePresetMenu === 'camera'
                    ? 'border-lime-400/60 bg-lime-400/10 shadow-lg shadow-lime-400/10'
                    : 'border-white/10 bg-[#141822] hover:border-white/20 hover:bg-[#1a202c]'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 text-cyan-300">
                  <Camera size={15} />
                </div>
                <div className="truncate">
                  <div className="text-[10px] text-gray-400">Camera</div>
                  <div className="text-xs font-semibold text-white truncate">{activeScene.cameraMovement}</div>
                </div>
              </button>

              {/* 7. Color palette */}
              <button
                type="button"
                onClick={() => setActivePresetMenu(activePresetMenu === 'color' ? null : 'color')}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-all text-left group min-w-0 ${
                  activePresetMenu === 'color'
                    ? 'border-lime-400/60 bg-lime-400/10 shadow-lg shadow-lime-400/10'
                    : 'border-white/10 bg-[#141822] hover:border-white/20 hover:bg-[#1a202c]'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/20 to-violet-500/10 border border-pink-500/30 text-pink-300">
                  <Palette size={15} />
                </div>
                <div className="truncate">
                  <div className="text-[10px] text-gray-400">Color palette</div>
                  <div className="text-xs font-semibold text-white truncate">{activeScene.colorPalette}</div>
                </div>
              </button>

              {/* 8. Lighting */}
              <button
                type="button"
                onClick={() => setActivePresetMenu(activePresetMenu === 'lighting' ? null : 'lighting')}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-2 transition-all text-left group min-w-0 ${
                  activePresetMenu === 'lighting'
                    ? 'border-lime-400/60 bg-lime-400/10 shadow-lg shadow-lime-400/10'
                    : 'border-white/10 bg-[#141822] hover:border-white/20 hover:bg-[#1a202c]'
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 text-yellow-300">
                  <Sun size={15} />
                </div>
                <div className="truncate">
                  <div className="text-[10px] text-gray-400">Lighting</div>
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
                    {(activePresetMenu === 'film' || activePresetMenu === 'genre' || activePresetMenu === 'era' || activePresetMenu === 'tempo') && <Film className="text-amber-400" size={18} />}
                    {activePresetMenu === 'camera' && <Camera className="text-cyan-400" size={18} />}
                    {activePresetMenu === 'color' && <Palette className="text-pink-400" size={18} />}
                    {activePresetMenu === 'lighting' && <Sun className="text-yellow-400" size={18} />}
                    <h4 className="text-sm font-semibold capitalize text-white">
                      {activePresetMenu === 'references' && 'Karakter & Mekan Referansları (0/50)'}
                      {(activePresetMenu === 'film' || activePresetMenu === 'genre' || activePresetMenu === 'era' || activePresetMenu === 'tempo') && 'Film & Lens Kurulumu (Film Setup)'}
                      {activePresetMenu === 'camera' && 'Kamera Hareketleri (Camera Motions)'}
                      {activePresetMenu === 'color' && 'Renk Paleti ve Tonlama (Color Grading)'}
                      {activePresetMenu === 'lighting' && 'Sinematik Işık Kurulumu (Lighting Setup)'}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {(activePresetMenu === 'film' || activePresetMenu === 'genre' || activePresetMenu === 'era' || activePresetMenu === 'tempo') && (
                      <button
                        type="button"
                        onClick={handleResetFilmSetup}
                        className="text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                      >
                        Reset all
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setActivePresetMenu(null)}
                      className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* FILM SETUP: GENRE, ERA, TEMPO, LENS BUTTONS (Kullanıcının "buraya genre , era , tempo butonları ekle" isteği) */}
                {(activePresetMenu === 'film' || activePresetMenu === 'genre' || activePresetMenu === 'era' || activePresetMenu === 'tempo') && (
                  <div className="flex flex-col gap-4">
                    {/* Switcher Buttons: Genre, Era, Tempo, Lens & Film */}
                    <div className="flex items-center gap-2 bg-[#0c1018] p-1.5 rounded-xl border border-white/10">
                      {/* Genre Button */}
                      <button
                        type="button"
                        onClick={() => setFilmSetupTab('genre')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                          filmSetupTab === 'genre'
                            ? 'bg-lime-400 text-black border-lime-400 shadow-md shadow-lime-400/20'
                            : 'bg-white/[0.03] text-gray-300 border-white/5 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <rect x="2" y="4" width="20" height="16" rx="3" />
                          <line x1="6" y1="4" x2="6" y2="20" />
                          <line x1="18" y1="4" x2="18" y2="20" />
                        </svg>
                        <span>Genre</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                          filmSetupTab === 'genre' ? 'bg-black/20 text-black' : currentGenre !== 'Auto' ? 'bg-lime-400/20 text-lime-300' : 'text-gray-400'
                        }`}>
                          {currentGenre}
                        </span>
                      </button>

                      {/* Era Button */}
                      <button
                        type="button"
                        onClick={() => setFilmSetupTab('era')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                          filmSetupTab === 'era'
                            ? 'bg-lime-400 text-black border-lime-400 shadow-md shadow-lime-400/20'
                            : 'bg-white/[0.03] text-gray-300 border-white/5 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <path d="M5 22h14" />
                          <path d="M5 2h14" />
                          <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                          <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                        </svg>
                        <span>Era</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                          filmSetupTab === 'era' ? 'bg-black/20 text-black' : (currentEra !== 'Auto' || currentEraYear) ? 'bg-lime-400/20 text-lime-300' : 'text-gray-400'
                        }`}>
                          {currentEraYear || currentEra}
                        </span>
                      </button>

                      {/* Tempo Button */}
                      <button
                        type="button"
                        onClick={() => setFilmSetupTab('tempo')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                          filmSetupTab === 'tempo'
                            ? 'bg-lime-400 text-black border-lime-400 shadow-md shadow-lime-400/20'
                            : 'bg-white/[0.03] text-gray-300 border-white/5 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <path d="M4 11v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8H4Z" />
                          <path d="m4 11-.88-2.87a2 2 0 0 1 1.33-2.5l11.48-3.5a2 2 0 0 1 2.5 1.32l.87 2.87L4 11.01Z" />
                          <path d="m6.6 4.99 3.38 4.2" />
                          <path d="m11.86 3.38 3.38 4.2" />
                        </svg>
                        <span>Tempo</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                          filmSetupTab === 'tempo' ? 'bg-black/20 text-black' : currentTempo !== 'Auto' ? 'bg-lime-400/20 text-lime-300' : 'text-gray-400'
                        }`}>
                          {currentTempo}
                        </span>
                      </button>

                      {/* Lens & Film Button */}
                      <button
                        type="button"
                        onClick={() => setFilmSetupTab('lens')}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                          filmSetupTab === 'lens'
                            ? 'bg-lime-400 text-black border-lime-400 shadow-md shadow-lime-400/20'
                            : 'bg-white/[0.03] text-gray-300 border-white/5 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Film size={14} className="shrink-0" />
                        <span>Lens & Film</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                          filmSetupTab === 'lens' ? 'bg-black/20 text-black' : currentLens !== 'Auto' ? 'bg-lime-400/20 text-lime-300' : 'text-gray-400'
                        }`}>
                          {currentLens}
                        </span>
                      </button>
                    </div>

                    {/* 1. GENRE TAB VIEW */}
                    {filmSetupTab === 'genre' && (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white">Select genre</span>
                            <p className="text-[11px] text-gray-400">Story conventions the model should follow</p>
                          </div>
                          <span className="text-[11px] text-gray-400 bg-black/40 border border-white/10 px-2.5 py-1 rounded-lg">
                            {activeGenreObj.desc}
                          </span>
                        </div>

                        {/* Arched Wheel Visual Area */}
                        <div className="relative flex items-center justify-center h-[210px] overflow-hidden rounded-2xl bg-black/30 border border-white/5">
                          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[580px] h-[580px] rounded-full border-t border-white/[0.08] pointer-events-none" />

                          {/* Left Tilted Card */}
                          <div
                            onClick={() => handleUpdateFilmSetup({ filmGenre: prevGenreObj.name })}
                            title={`Önceki: ${prevGenreObj.name}`}
                            className="absolute -left-6 bottom-3 w-[180px] h-[110px] rounded-[20px] border-[6px] border-[#131416] overflow-hidden -rotate-[38deg] opacity-40 hover:opacity-75 transition-all cursor-pointer shadow-xl z-10"
                          >
                            <div className={`w-full h-full bg-gradient-to-br ${prevGenreObj.gradient} relative`}>
                              {prevGenreObj.image && (
                                <img src={prevGenreObj.image} alt={prevGenreObj.name} className="w-full h-full object-cover" />
                              )}
                              {prevGenreObj.isAuto && (
                                <div
                                  className="absolute inset-0"
                                  style={{
                                    backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.03) 4px, rgba(0,0,0,0.35) 8px, rgba(255,255,255,0.15) 12px)',
                                  }}
                                />
                              )}
                            </div>
                          </div>

                          {/* Center Card */}
                          <div className="relative w-[280px] h-[160px] rounded-[22px] border-[8px] border-[#131416] shadow-2xl overflow-hidden z-20">
                            <div className={`w-full h-full bg-gradient-to-br ${activeGenreObj.gradient} relative`}>
                              {activeGenreObj.image ? (
                                <img
                                  src={activeGenreObj.image}
                                  alt={activeGenreObj.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full relative overflow-hidden bg-gradient-to-tr from-indigo-500 via-amber-300/80 to-sky-400">
                                  <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-orange-400/80 blur-xl" />
                                  <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-blue-600/80 blur-xl" />
                                  <div
                                    className="absolute inset-0 backdrop-blur-[2px]"
                                    style={{
                                      backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.28) 0px, rgba(255,255,255,0.05) 3px, rgba(0,0,0,0.35) 6px, rgba(255,255,255,0.18) 9px)',
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right Tilted Card */}
                          <div
                            onClick={() => handleUpdateFilmSetup({ filmGenre: nextGenreObj.name })}
                            title={`Sonraki: ${nextGenreObj.name}`}
                            className="absolute -right-6 bottom-3 w-[180px] h-[110px] rounded-[20px] border-[6px] border-[#131416] overflow-hidden rotate-[38deg] opacity-40 hover:opacity-75 transition-all cursor-pointer shadow-xl z-10"
                          >
                            <div className={`w-full h-full bg-gradient-to-br ${nextGenreObj.gradient} relative`}>
                              {nextGenreObj.image && (
                                <img src={nextGenreObj.image} alt={nextGenreObj.name} className="w-full h-full object-cover" />
                              )}
                              {nextGenreObj.isAuto && (
                                <div
                                  className="absolute inset-0"
                                  style={{
                                    backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.03) 4px, rgba(0,0,0,0.35) 8px, rgba(255,255,255,0.15) 12px)',
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Controls & Quick Chips */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap flex-1 mr-4">
                            {FILM_GENRE_OPTIONS.map(g => (
                              <button
                                key={g.id}
                                type="button"
                                onClick={() => handleUpdateFilmSetup({ filmGenre: g.name })}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all border ${
                                  currentGenre === g.name
                                    ? 'bg-lime-400 text-black border-lime-400 font-bold'
                                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                {g.name}
                              </button>
                            ))}
                          </div>

                          {/* Stepper */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUpdateFilmSetup({ filmGenre: prevGenreObj.name })}
                              className="w-8 h-8 rounded-full bg-[#1b202c] hover:bg-[#252b3b] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all active:scale-95"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <div className="min-w-[90px] px-4 py-1.5 rounded-full bg-[#1b202c] border border-white/15 text-center text-xs font-bold text-white">
                              {activeGenreObj.name}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUpdateFilmSetup({ filmGenre: nextGenreObj.name })}
                              className="w-8 h-8 rounded-full bg-[#1b202c] hover:bg-[#252b3b] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all active:scale-95"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. ERA TAB VIEW */}
                    {filmSetupTab === 'era' && (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white">Select era</span>
                            <p className="text-[11px] text-gray-400">The period the film belongs to</p>
                          </div>

                          {/* Year Specification */}
                          <div className="flex items-center gap-2 bg-[#0c1018] border border-white/10 rounded-xl px-3 py-1.5">
                            <span className="text-[11px] font-semibold text-gray-300">Tam Yıl:</span>
                            <input
                              type="text"
                              placeholder="Örn: 1984"
                              value={currentEraYear}
                              onChange={e => {
                                const val = e.target.value;
                                handleUpdateFilmSetup({ filmEraYear: val });
                              }}
                              className="w-20 bg-transparent text-xs font-mono font-bold text-lime-400 placeholder-gray-500 focus:outline-none text-center"
                            />
                            {currentEraYear && (
                              <button
                                type="button"
                                onClick={() => handleUpdateFilmSetup({ filmEraYear: '' })}
                                className="text-gray-400 hover:text-white"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Center Preview Card */}
                        <div className="flex items-center justify-center h-[180px] rounded-2xl bg-black/30 border border-white/5">
                          <div className="relative w-[280px] h-[155px] rounded-[22px] border-[8px] border-[#131416] shadow-2xl overflow-hidden">
                            {activeEraObj.isAuto && !currentEraYear ? (
                              <div className="w-full h-full relative overflow-hidden bg-gradient-to-tr from-blue-600 via-orange-300 to-indigo-500">
                                <div className="absolute top-2 left-6 w-36 h-36 rounded-full bg-orange-400/90 blur-xl" />
                                <div className="absolute bottom-2 right-6 w-40 h-40 rounded-full bg-amber-300/80 blur-xl" />
                                <div className="absolute inset-y-0 left-1/3 w-28 bg-blue-700/80 blur-xl" />
                                <div
                                  className="absolute inset-0"
                                  style={{
                                    backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.32) 0px, rgba(255,255,255,0.06) 3px, rgba(15,23,42,0.45) 6px, rgba(255,255,255,0.2) 9px)',
                                  }}
                                />
                              </div>
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${activeEraObj.gradient} relative`}>
                                {activeEraObj.image && (
                                  <img src={activeEraObj.image} alt={activeEraObj.name} className="w-full h-full object-cover" />
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-2.5 text-center">
                                  <span className="text-xs font-bold text-white">
                                    {currentEraYear ? `Yıl: ${currentEraYear}` : activeEraObj.yearRange}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Ruler & Stepper */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between px-6 h-6 relative">
                            {Array.from({ length: 29 }).map((_, idx) => {
                              const isCenter = idx === 14;
                              const isMajor = idx % 5 === 0;
                              const distFromCenter = Math.abs(idx - 14);
                              const opacity = Math.max(0.12, 1 - distFromCenter * 0.055);
                              if (isCenter) {
                                return (
                                  <div
                                    key={idx}
                                    className="w-[2.5px] h-6 bg-lime-400 rounded-full shadow-[0_0_8px_rgba(223,255,0,0.8)]"
                                  />
                                );
                              }
                              return (
                                <div
                                  key={idx}
                                  className={`w-[1px] rounded-full bg-white ${isMajor ? 'h-4' : 'h-2.5'}`}
                                  style={{ opacity }}
                                />
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-center gap-5">
                            <button
                              type="button"
                              onClick={() => handleUpdateFilmSetup({ filmEra: prevEraObj.name, filmEraYear: '' })}
                              className="w-24 text-right text-sm font-semibold text-white/30 hover:text-white/70 transition-colors truncate"
                            >
                              {prevEraObj.name}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateFilmSetup({ filmEra: prevEraObj.name, filmEraYear: '' })}
                              className="w-8 h-8 rounded-full bg-[#1b202c] hover:bg-[#252b3b] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all active:scale-95"
                            >
                              <ChevronLeft size={15} />
                            </button>

                            <div className="min-w-[120px] text-center">
                              <span className="text-xl font-extrabold text-lime-400 tracking-tight">
                                {currentEraYear || activeEraObj.name}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleUpdateFilmSetup({ filmEra: nextEraObj.name, filmEraYear: '' })}
                              className="w-8 h-8 rounded-full bg-[#1b202c] hover:bg-[#252b3b] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all active:scale-95"
                            >
                              <ChevronRight size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleUpdateFilmSetup({ filmEra: nextEraObj.name, filmEraYear: '' })}
                              className="w-24 text-left text-sm font-semibold text-white/30 hover:text-white/70 transition-colors truncate"
                            >
                              {nextEraObj.name}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. TEMPO TAB VIEW */}
                    {filmSetupTab === 'tempo' && (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-white">Select tempo</span>
                            <p className="text-[11px] text-gray-400">Pacing of the montage</p>
                          </div>
                          <span className="text-[11px] text-gray-400 bg-black/40 border border-white/10 px-2.5 py-1 rounded-lg">
                            {activeTempoObj.desc}
                          </span>
                        </div>

                        {/* 3-Card Carousel */}
                        <div className="relative flex items-center justify-center gap-4 h-[190px] overflow-hidden rounded-2xl bg-black/30 border border-white/5">
                          {/* Left Card */}
                          <div
                            onClick={() => handleUpdateFilmSetup({ filmTempo: prevTempoObj.name })}
                            title={`Önceki: ${prevTempoObj.name}`}
                            className="w-[180px] h-[115px] rounded-[20px] border-[6px] border-[#131416] overflow-hidden shrink-0 cursor-pointer opacity-50 hover:opacity-85 transition-all -ml-16 shadow-lg"
                          >
                            {prevTempoObj.isAuto ? (
                              <div className="w-full h-full relative overflow-hidden bg-gradient-to-tr from-pink-600 via-rose-400 to-fuchsia-800">
                                <div
                                  className="absolute inset-0"
                                  style={{
                                    backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.28) 0px, rgba(255,255,255,0.04) 3px, rgba(0,0,0,0.4) 6px, rgba(255,255,255,0.16) 9px)',
                                  }}
                                />
                              </div>
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${prevTempoObj.gradient} relative`}>
                                {prevTempoObj.image && (
                                  <img src={prevTempoObj.image} alt={prevTempoObj.name} className="w-full h-full object-cover" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Center Card with Segmented Montage Bar */}
                          <div className="w-[280px] h-[160px] rounded-[22px] border-[8px] border-[#131416] shadow-2xl overflow-hidden shrink-0 relative z-10">
                            {activeTempoObj.isAuto ? (
                              <div className="w-full h-full relative overflow-hidden bg-gradient-to-tr from-pink-600 via-rose-400 to-amber-400">
                                <div className="absolute -top-8 left-8 w-36 h-36 rounded-full bg-rose-300/80 blur-xl" />
                                <div className="absolute -bottom-8 right-8 w-40 h-40 rounded-full bg-fuchsia-700/80 blur-xl" />
                                <div
                                  className="absolute inset-0"
                                  style={{
                                    backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.3) 0px, rgba(255,255,255,0.05) 3px, rgba(0,0,0,0.4) 6px, rgba(255,255,255,0.18) 9px)',
                                  }}
                                />
                              </div>
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${activeTempoObj.gradient} relative`}>
                                {activeTempoObj.image && (
                                  <img
                                    src={activeTempoObj.image}
                                    alt={activeTempoObj.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                            )}

                            {/* Segmented Montage Cut Pacing Bar */}
                            <div className="absolute bottom-3 left-4 right-4 flex items-center gap-1.5 z-20">
                              {activeTempoObj.segments.map((seg, sIdx) => {
                                const isActiveSeg = sIdx === activeTempoSegment;
                                return (
                                  <div
                                    key={sIdx}
                                    style={{ flex: seg }}
                                    className={`h-1.5 rounded-full transition-all duration-200 ${
                                      isActiveSeg
                                        ? 'bg-lime-400 shadow-[0_0_8px_rgba(223,255,0,0.8)]'
                                        : 'bg-white/45'
                                    }`}
                                  />
                                );
                              })}
                            </div>
                          </div>

                          {/* Right Card */}
                          <div
                            onClick={() => handleUpdateFilmSetup({ filmTempo: nextTempoObj.name })}
                            title={`Sonraki: ${nextTempoObj.name}`}
                            className="w-[180px] h-[115px] rounded-[20px] border-[6px] border-[#131416] overflow-hidden shrink-0 cursor-pointer opacity-50 hover:opacity-85 transition-all -mr-16 shadow-lg"
                          >
                            {nextTempoObj.isAuto ? (
                              <div className="w-full h-full relative overflow-hidden bg-gradient-to-tr from-pink-600 via-rose-400 to-fuchsia-800">
                                <div
                                  className="absolute inset-0"
                                  style={{
                                    backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.28) 0px, rgba(255,255,255,0.04) 3px, rgba(0,0,0,0.4) 6px, rgba(255,255,255,0.16) 9px)',
                                  }}
                                />
                              </div>
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${nextTempoObj.gradient} relative`}>
                                {nextTempoObj.image && (
                                  <img src={nextTempoObj.image} alt={nextTempoObj.name} className="w-full h-full object-cover" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Controls & Quick Chips */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 flex-wrap flex-1 mr-4">
                            {FILM_TEMPO_OPTIONS.map(t => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => handleUpdateFilmSetup({ filmTempo: t.name })}
                                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all border ${
                                  currentTempo === t.name
                                    ? 'bg-lime-400 text-black border-lime-400 font-bold'
                                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                              >
                                {t.name}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleUpdateFilmSetup({ filmTempo: prevTempoObj.name })}
                              className="w-8 h-8 rounded-full bg-[#1b202c] hover:bg-[#252b3b] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all active:scale-95"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <div className="min-w-[90px] px-4 py-1.5 rounded-full bg-[#1b202c] border border-white/15 text-center text-xs font-bold text-white">
                              {activeTempoObj.name}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUpdateFilmSetup({ filmTempo: nextTempoObj.name })}
                              className="w-8 h-8 rounded-full bg-[#1b202c] hover:bg-[#252b3b] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all active:scale-95"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 4. LENS & FILM TAB VIEW (Matches media_1793218772651_9f1cf3ea.png) */}
                    {filmSetupTab === 'lens' && (
                      <div className="grid grid-cols-4 gap-2.5">
                        {FILM_LENS_PRESETS.map(preset => {
                          const isSelected = (activeScene.filmLens || 'Auto') === preset.name || (!activeScene.filmLens && preset.id === 'auto');
                          return (
                            <div
                              key={preset.id}
                              onClick={() => handleUpdateFilmSetup({ filmLens: preset.name })}
                              className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all ${
                                isSelected
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
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

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
              
              {/* Generation Error Banner */}
              {generationError && (
                <div className="mb-3 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0 text-red-400" />
                    <span>{generationError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGenerationError(null)}
                    className="p-1 text-red-400 hover:text-white rounded-lg hover:bg-white/10"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {/* Active Scene Video Screening Monitor (If already rendered) */}
              {activeScene.videoUrl && (
                <div className="mb-3 w-full rounded-2xl overflow-hidden border border-emerald-500/30 bg-black/60 relative group aspect-[2.39/1] max-h-72">
                  <video
                    src={activeScene.videoUrl}
                    controls
                    playsInline
                    loop
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-emerald-500/40 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-300 pointer-events-none">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>{activeScene.title} — Hazır Oynatıcı</span>
                  </div>
                </div>
              )}

              {/* Active Scene Image Monitor (If image rendered) */}
              {!activeScene.videoUrl && activeScene.imageUrl && (
                <div className="mb-3 w-full rounded-2xl overflow-hidden border border-emerald-500/30 bg-black/60 relative group aspect-[2.39/1] max-h-72 flex items-center justify-center">
                  <img
                    src={activeScene.imageUrl}
                    alt={activeScene.title}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-emerald-500/40 px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-300 pointer-events-none">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span>{activeScene.title} — Görsel Hazır</span>
                  </div>
                </div>
              )}

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

                {/* Director Viewport for Scene */}
                <div className="w-full aspect-[2.39/1] rounded-xl bg-gradient-to-br from-[#1b2230] to-[#0c0f17] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden group">
                  {scene.status === 'processing' ? (
                    <div className="flex flex-col items-center justify-center p-4 gap-2 z-10 w-full h-full bg-black/75">
                      <Loader2 size={24} className="text-lime-400 animate-spin" />
                      <span className="text-xs font-semibold text-lime-300">
                        Sahne Oluşturuluyor... %{scene.progress || generationProgress || 5}
                      </span>
                      <div className="w-3/4 max-w-xs bg-white/10 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-lime-400 h-full transition-all duration-300"
                          style={{ width: `${scene.progress || generationProgress || 5}%` }}
                        />
                      </div>
                    </div>
                  ) : scene.videoUrl ? (
                    <div className="relative w-full h-full">
                      <video
                        src={scene.videoUrl}
                        controls
                        playsInline
                        loop
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-black/70 backdrop-blur-sm border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-300 shadow">
                        <CheckCircle2 size={11} />
                        <span>RENDERED</span>
                      </div>
                    </div>
                  ) : scene.imageUrl ? (
                    <div className="relative w-full h-full">
                      <img
                        src={scene.imageUrl}
                        alt={scene.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-black/70 backdrop-blur-sm border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-300 shadow">
                        <CheckCircle2 size={11} />
                        <span>IMAGE READY</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 relative w-full h-full">
                      <div className="absolute inset-0 pointer-events-none border border-white/5 grid grid-cols-3 grid-rows-3 opacity-20" />
                      <Clapperboard size={22} className="text-gray-500 mb-1 group-hover:text-lime-400 transition-colors" />
                      <p className="text-[11px] text-gray-300 line-clamp-2 text-center max-w-sm px-2">
                        {scene.prompt}
                      </p>
                      {scene.status === 'failed' && (
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
                          <AlertCircle size={11} />
                          <span className="truncate max-w-[200px]">{scene.error || 'Hata'}</span>
                        </div>
                      )}
                    </div>
                  )}
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
