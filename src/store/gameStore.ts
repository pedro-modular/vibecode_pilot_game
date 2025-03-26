import { create } from 'zustand';
import { SpaceEnvironment, GameObject, Vector3D } from '@/types/space';

interface GameState {
  isInitialized: boolean;
  isPaused: boolean;
  playerPosition: Vector3D;
  players: Map<string, GameObject>;
  environment: SpaceEnvironment | null;
  score: number;
  
  // Actions
  initialize: () => void;
  togglePause: () => void;
  updatePlayerPosition: (position: Vector3D) => void;
  addPlayer: (id: string, player: GameObject) => void;
  removePlayer: (id: string) => void;
  setEnvironment: (environment: SpaceEnvironment) => void;
  updateScore: (points: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  isInitialized: false,
  isPaused: false,
  playerPosition: { x: 0, y: 0, z: 0 },
  players: new Map(),
  environment: null,
  score: 0,

  initialize: () => set({ isInitialized: true }),
  
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  
  updatePlayerPosition: (position) => set({ playerPosition: position }),
  
  addPlayer: (id, player) => set((state) => {
    const newPlayers = new Map(state.players);
    newPlayers.set(id, player);
    return { players: newPlayers };
  }),
  
  removePlayer: (id) => set((state) => {
    const newPlayers = new Map(state.players);
    newPlayers.delete(id);
    return { players: newPlayers };
  }),
  
  setEnvironment: (environment) => set({ environment }),
  
  updateScore: (points) => set((state) => ({ score: state.score + points })),
})); 