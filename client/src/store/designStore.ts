import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';

export interface Point2D { x: number; y: number; }

export interface Wall {
  id: string;
  start: Point2D;
  end: Point2D;
  thickness: number;
  height: number;
  color?: string;
  material?: string;
}

export interface FurnitureItem {
  id: string;
  type: string;
  label: string;
  assetUrl?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  isSnapped?: boolean;
}

export interface SceneMaterial {
  floor: 'wood' | 'tile' | 'concrete' | 'marble';
  wallPaint: string; // hex color
}

export interface Analytics {
  totalWallLength: number;
  totalArea: number;
  estimatedBricks: number;
  estimatedPaintVolume: number;
}

interface HistoryEntry {
  walls: Wall[];
  furniture: FurnitureItem[];
}

interface DesignState {
  projectId: string | null;
  projectName: string;
  walls: Wall[];
  furniture: FurnitureItem[];
  sceneMaterial: SceneMaterial;
  selectedFurnitureId: string | null;
  selectedWallId: string | null;
  isSaving: boolean;
  isLoading: boolean;
  
  // Undo/Redo
  history: HistoryEntry[];
  historyIndex: number;

  loadTemplate: (data: Partial<DesignState>) => void;
  loadRoomTemplate: (type: 'bedroom' | 'living') => void;
  setProjectId: (id: string) => void;
  setProjectName: (name: string) => void;
  addWall: (wall: Wall) => void;
  updateWall: (id: string, updates: Partial<Wall>) => void;
  removeWall: (id: string) => void;
  clearWalls: () => void;
  selectWall: (id: string | null) => void;
  addFurniture: (item: FurnitureItem) => void;
  updateFurniture: (id: string, updates: Partial<FurnitureItem>) => void;
  updateFurniturePosition: (id: string, position: [number, number, number]) => void;
  updateFurnitureRotation: (id: string, rotation: [number, number, number]) => void;
  removeFurniture: (id: string) => void;
  selectFurniture: (id: string | null) => void;
  setSceneMaterial: (updates: Partial<SceneMaterial>) => void;
  clearAll: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveProjectToServer: () => Promise<void>;
  loadProjectFromServer: (id: string) => Promise<void>;
  deleteProjectFromServer: (id: string) => Promise<boolean>;
  getAnalytics: () => Analytics;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const MAX_HISTORY = 50;

function snapshot(walls: Wall[], furniture: FurnitureItem[]): HistoryEntry {
  return {
    walls: JSON.parse(JSON.stringify(walls)),
    furniture: JSON.parse(JSON.stringify(furniture)),
  };
}

export const useDesignStore = create<DesignState>((set, get) => ({
  projectId: null,
  projectName: 'Untitled Project',
  walls: [],
  furniture: [],
  sceneMaterial: { floor: 'wood', wallPaint: '#c7d2fe' },
  selectedFurnitureId: null,
  selectedWallId: null,
  isSaving: false,
  isLoading: false,
  history: [],
  historyIndex: -1,

  loadTemplate: (data) => {
    set({
      projectId: null,
      projectName: data.projectName || 'Dự án mẫu',
      walls: data.walls || [],
      furniture: data.furniture || [],
      sceneMaterial: data.sceneMaterial || { floor: 'wood', wallPaint: '#ffffff' },
      history: [{ walls: data.walls || [], furniture: data.furniture || [] }],
      historyIndex: 0,
    });
  },

  loadRoomTemplate: (type) => {
    const s = get();
    // Default 5x4m room
    const w: Wall[] = [
      { id: 'w1', start: { x: 0, y: 0 }, end: { x: 5, y: 0 }, thickness: 0.2, height: 2.7, color: '#f1f5f9' },
      { id: 'w2', start: { x: 5, y: 0 }, end: { x: 5, y: 4 }, thickness: 0.2, height: 2.7, color: '#f1f5f9' },
      { id: 'w3', start: { x: 5, y: 4 }, end: { x: 0, y: 4 }, thickness: 0.2, height: 2.7, color: '#f1f5f9' },
      { id: 'w4', start: { x: 0, y: 4 }, end: { x: 0, y: 0 }, thickness: 0.2, height: 2.7, color: '#f1f5f9' }
    ];
    let f: FurnitureItem[] = [];
    
    if (type === 'bedroom') {
      f = [
        { id: 'bed1', type: 'bed', label: 'Giường Đôi', assetUrl: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/bed/model.gltf', position: [2.5, 0, 1.5], rotation: [0, 0, 0], scale: [1.5, 1.5, 1.5], color: '#bfdbfe' },
        { id: 'wardrobe1', type: 'wardrobe', label: 'Tủ Quần Áo', assetUrl: '', position: [4.5, 0, 3], rotation: [0, -Math.PI/2, 0], scale: [1.2, 2.1, 0.6], color: '#e2e8f0' },
        { id: 'plant1', type: 'plant', label: 'Cây Monstera', assetUrl: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/plant/model.gltf', position: [0.5, 0, 0.5], rotation: [0, 0, 0], scale: [1.5, 1.5, 1.5], color: '#16a34a' }
      ];
    } else if (type === 'living') {
      f = [
        { id: 'sofa1', type: 'sofa', label: 'Sofa Nhung', assetUrl: 'https://modelviewer.dev/shared-assets/models/sheen-chair.glb', position: [2.5, 0, 2], rotation: [0, Math.PI, 0], scale: [1.5, 1.5, 1.5], color: '#7c6b5a' },
        { id: 'table1', type: 'coffee-table', label: 'Bàn Trà', assetUrl: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/table-round/model.gltf', position: [2.5, 0, 3], rotation: [0, 0, 0], scale: [1.2, 1.2, 1.2], color: '#6b4e2a' },
        { id: 'bookshelf1', type: 'bookshelf', label: 'Kệ Sách', assetUrl: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/bookshelf/model.gltf', position: [0.5, 0, 2], rotation: [0, Math.PI/2, 0], scale: [1.2, 1.2, 1.2], color: '#8B5E3C' }
      ];
    }
    
    (s as any)._commit(w, f);
    set({ selectedFurnitureId: null, selectedWallId: null });
  },

  setProjectId: (id) => set({ projectId: id }),
  setProjectName: (name) => set({ projectName: name }),

  // Commit to history then mutate
  _commit: (newWalls: Wall[], newFurniture: FurnitureItem[]) => {
    const s = get();
    const newHistory = s.history.slice(0, s.historyIndex + 1);
    newHistory.push(snapshot(s.walls, s.furniture));
    if (newHistory.length > MAX_HISTORY) newHistory.shift();
    set({ walls: newWalls, furniture: newFurniture, history: newHistory, historyIndex: newHistory.length - 1 });
  },

  addWall: (wall) => {
    const s = get();
    const newWalls = [...s.walls, wall];
    (s as any)._commit(newWalls, s.furniture);
  },

  updateWall: (id, updates) => {
    const s = get();
    const newWalls = s.walls.map(w => w.id === id ? { ...w, ...updates } : w);
    (s as any)._commit(newWalls, s.furniture);
  },

  removeWall: (id) => {
    const s = get();
    const newWalls = s.walls.filter(w => w.id !== id);
    (s as any)._commit(newWalls, s.furniture);
  },

  clearWalls: () => {
    const s = get();
    (s as any)._commit([], s.furniture);
  },

  selectWall: (id) => set({ selectedWallId: id, selectedFurnitureId: null }),

  addFurniture: (item) => {
    const s = get();
    (s as any)._commit(s.walls, [...s.furniture, item]);
  },

  updateFurniture: (id, updates) => {
    const s = get();
    const newFur = s.furniture.map(f => f.id === id ? { ...f, ...updates } : f);
    (s as any)._commit(s.walls, newFur);
  },

  updateFurniturePosition: (id, position) => {
    set((s) => ({
      furniture: s.furniture.map(f => f.id === id ? { ...f, position } : f)
    }));
  },

  updateFurnitureRotation: (id, rotation) => {
    set((s) => ({
      furniture: s.furniture.map(f => f.id === id ? { ...f, rotation } : f)
    }));
  },

  removeFurniture: (id) => {
    const s = get();
    (s as any)._commit(s.walls, s.furniture.filter(f => f.id !== id));
  },

  selectFurniture: (id) => set({ selectedFurnitureId: id, selectedWallId: null }),

  setSceneMaterial: (updates) => set(s => ({ sceneMaterial: { ...s.sceneMaterial, ...updates } })),

  clearAll: () => {
    const s = get();
    (s as any)._commit([], []);
    set({ selectedFurnitureId: null, selectedWallId: null });
  },

  undo: () => {
    const s = get();
    if (s.historyIndex < 0) return;
    const entry = s.history[s.historyIndex];
    set({
      walls: entry ? entry.walls : [],
      furniture: entry ? entry.furniture : [],
      historyIndex: s.historyIndex - 1,
    });
  },

  redo: () => {
    const s = get();
    const nextIdx = s.historyIndex + 1;
    if (nextIdx >= s.history.length) return;
    const entry = s.history[nextIdx];
    set({ walls: entry.walls, furniture: entry.furniture, historyIndex: nextIdx });
  },

  canUndo: () => get().historyIndex >= 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  saveProjectToServer: async () => {
    const state = get();
    set({ isSaving: true });
    try {
      const payload = {
        id: state.projectId,
        name: state.projectName,
        designData: { walls: state.walls, furniture: state.furniture, sceneMaterial: state.sceneMaterial }
      };
      const response = await axios.post(`${API_URL}/projects`, payload);
      if (response.data.success && response.data.project?.id) {
        set({ projectId: response.data.project.id });
        toast.success("Dự án đã được lưu!", { style: { background: '#10b981', color: '#fff' } });
      }
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Lưu dự án thất bại.', { style: { background: '#ef4444', color: '#fff' } });
    } finally {
      set({ isSaving: false });
    }
  },

  loadProjectFromServer: async (id) => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/projects/${id}`);
      if (response.data.success) {
        const d = response.data.project.designData;
        set({
          projectId: id,
          walls: d?.walls || [],
          furniture: d?.furniture || [],
          sceneMaterial: d?.sceneMaterial || { floor: 'wood', wallPaint: '#c7d2fe' },
          history: [],
          historyIndex: -1,
        });
      }
    } catch (error) {
      console.error('Load failed:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProjectFromServer: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/projects/${id}`);
      return response.data?.success || false;
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Xóa dự án thất bại.');
      return false;
    }
  },

  getAnalytics: () => {
    const walls = get().walls;
    let totalLength = 0;
    walls.forEach(w => {
      const dx = w.end.x - w.start.x;
      const dy = w.end.y - w.start.y;
      totalLength += Math.sqrt(dx * dx + dy * dy);
    });
    const totalArea = totalLength * 2.7;
    return {
      totalWallLength: Number(totalLength.toFixed(2)),
      totalArea: Number(totalArea.toFixed(2)),
      estimatedBricks: Math.ceil(totalArea * 65),
      estimatedPaintVolume: Number((totalArea / 10).toFixed(1))
    };
  }
}));
