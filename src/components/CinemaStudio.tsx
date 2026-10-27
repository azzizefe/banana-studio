import React, { useState } from 'react';
import { Clapperboard, Film, Video, Play, Plus, Sparkles, Layers, Sliders, ArrowLeft, Camera, MonitorPlay, Trash2 } from 'lucide-react';

interface CinemaStudioProps {
  onBackToBananaStudio: () => void;
}

export const CinemaStudio: React.FC<CinemaStudioProps> = ({ onBackToBananaStudio }) => {
  const [scenes, setScenes] = useState([
    { id: 1, title: 'Scene 1: Opening Shot', prompt: 'Cinematic wide establishing shot, golden hour lighting, 35mm lens, atmospheric haze', duration: '5s', ratio: '2.39:1' },
    { id: 2, title: 'Scene 2: Protagonist Close-up', prompt: 'Medium close-up, shallow depth of field, dramatic rim light, emotional expression', duration: '5s', ratio: '2.39:1' },
  ]);
  const [selectedSceneId, setSelectedSceneId] = useState(1);

  const activeScene = scenes.find(s => s.id === selectedSceneId) || scenes[0];

  const handleAddScene = () => {
    const nextId = scenes.length > 0 ? Math.max(...scenes.map(s => s.id)) + 1 : 1;
    const newScene = {
      id: nextId,
      title: `Scene ${nextId}: New Sequence`,
      prompt: 'Cinematic tracking shot, anamorphic lens, high contrast color grading',
      duration: '5s',
      ratio: '2.39:1',
    };
    setScenes([...scenes, newScene]);
    setSelectedSceneId(nextId);
  };

  const handleDeleteScene = (idToDelete: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (scenes.length <= 1) {
      const resetScene = {
        id: 1,
        title: 'Scene 1: New Sequence',
        prompt: 'Cinematic wide shot, 35mm lens, atmospheric lighting',
        duration: '5s',
        ratio: '2.39:1',
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

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-45px)] overflow-hidden bg-[#0d1117] text-white">
      {/* Top Banner / Studio Nav */}
      <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#161b22]/70 px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToBananaStudio}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Banana Studio'ya Dön
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Clapperboard size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">Cinema Studio</span>
                <span className="rounded bg-violet-500/20 px-1.5 py-0.5 text-[10px] font-medium text-violet-300 border border-violet-500/30">
                  Director Mode
                </span>
              </div>
              <p className="text-[11px] text-gray-400">Çoklu sahne, sinematik kamera hareketleri ve kurgu stüdyosu</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddScene}
            className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/20"
          >
            <Plus size={14} />
            Yeni Sahne Ekle
          </button>
        </div>
      </div>

      {/* Main Director Workspace */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        {/* Left: Scene Explorer */}
        <div className="col-span-3 border-r border-white/[0.08] bg-[#0d1117] p-4 flex flex-col gap-3 overflow-y-auto">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5">
              <Layers size={13} /> Sahneler ({scenes.length})
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {scenes.map((scene, idx) => (
              <div
                key={scene.id}
                onClick={() => setSelectedSceneId(scene.id)}
                className={`cursor-pointer rounded-xl border p-3 transition-all ${
                  selectedSceneId === scene.id
                    ? 'border-violet-500/60 bg-violet-500/10 text-white shadow-md'
                    : 'border-white/[0.06] bg-white/[0.02] text-gray-300 hover:bg-white/[0.05] hover:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium flex items-center gap-1.5 truncate pr-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="truncate">{scene.title}</span>
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[10px] text-gray-400 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                      {scene.duration} · {scene.ratio}
                    </span>
                    <button
                      type="button"
                      title="Sahneyi Sil"
                      onClick={e => handleDeleteScene(scene.id, e)}
                      className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                  {scene.prompt}
                </p>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddScene}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 p-3 text-xs text-gray-400 hover:border-violet-400/50 hover:text-violet-300 hover:bg-violet-500/5 transition-colors mt-1"
          >
            <Plus size={14} /> Sahne Ekle
          </button>
        </div>

        {/* Center: Stage / Director Viewport */}
        <div className="col-span-6 bg-[#090d12] flex flex-col items-center justify-center p-6 border-r border-white/[0.08] relative">
          <div className="w-full max-w-2xl aspect-[2.39/1] rounded-2xl border border-white/10 bg-gradient-to-b from-[#131720] to-[#0b0e14] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group">
            {/* Anamorphic Guides */}
            <div className="absolute inset-0 pointer-events-none border border-white/5 grid grid-cols-3 grid-rows-3 opacity-20" />
            <div className="absolute top-3 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[11px] text-gray-300">
              <Camera size={12} className="text-violet-400" />
              <span>Cinema Anamorphic (2.39:1)</span>
            </div>

            <div className="flex flex-col items-center gap-3 text-center px-6 z-10">
              <div className="h-12 w-12 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                <MonitorPlay size={24} />
              </div>
              <h3 className="text-sm font-semibold text-white">{activeScene.title}</h3>
              <p className="text-xs text-gray-400 max-w-md">
                {activeScene.prompt}
              </p>
            </div>

            <div className="absolute bottom-3 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-[11px] text-gray-400">
              <span>Süre: {activeScene.duration}</span>
              <span>·</span>
              <span className="text-violet-300">Hazır</span>
            </div>
          </div>
        </div>

        {/* Right: Scene Director Controls */}
        <div className="col-span-3 bg-[#0d1117] p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <Sliders size={13} /> Sahne Parametreleri
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="text-xs font-medium text-gray-300 mb-1.5 block">Sahne Başlığı</label>
              <input
                type="text"
                value={activeScene.title}
                onChange={e => {
                  const val = e.target.value;
                  setScenes(scenes.map(s => s.id === activeScene.id ? { ...s, title: val } : s));
                }}
                className="w-full rounded-lg border border-white/10 bg-[#161b22] px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-300 mb-1.5 block">Sinematik Prompt</label>
              <textarea
                rows={4}
                value={activeScene.prompt}
                onChange={e => {
                  const val = e.target.value;
                  setScenes(scenes.map(s => s.id === activeScene.id ? { ...s, prompt: val } : s));
                }}
                className="w-full rounded-lg border border-white/10 bg-[#161b22] px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none resize-none leading-relaxed"
                placeholder="Sahne açıklaması, kamera açısı ve ışıklandırma..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-300 mb-1.5 block">Kamera Açısı</label>
                <select className="w-full rounded-lg border border-white/10 bg-[#161b22] px-2.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none">
                  <option>Geniş Açı (Wide)</option>
                  <option>Yakın Çekim (Close-Up)</option>
                  <option>Dron / Kuşbakışı</option>
                  <option>Takip (Tracking)</option>
                  <option>Düşük Açı (Low Angle)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-300 mb-1.5 block">En-Boy Oranı</label>
                <select className="w-full rounded-lg border border-white/10 bg-[#161b22] px-2.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none">
                  <option>2.39:1 (Anamorphic)</option>
                  <option>16:9 (Cinematic HD)</option>
                  <option>1.85:1 (Flat)</option>
                  <option>9:16 (Vertical)</option>
                </select>
              </div>
            </div>

            <div className="mt-2 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
              <div className="flex items-center gap-1.5 text-xs font-medium text-violet-300 mb-1">
                <Sparkles size={13} />
                <span>AI Yönetmen Notu</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Cinema Studio çoklu sahne kurgusu ve kamera hareketleri için hazırlandı.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleDeleteScene(activeScene.id)}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-colors mt-1"
            >
              <Trash2 size={13} />
              Bu Sahneyi Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
