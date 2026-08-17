import { create } from "zustand";

export interface Card {
  id: string;
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  position: number;
  listId: string;
  dueDate?: string;
  assignee?: { id: string; name: string; avatarUrl?: string };
}

export interface List {
  id: string;
  title: string;
  position: number;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  colorTheme: string;
  lists: List[];
  members: any[];
}

interface BoardState {
  activeBoard: Board | null;
  setActiveBoard: (board: Board) => void;
  moveCardLocal: (cardId: string, fromListId: string, toListId: string, newPosition: number) => void;
  addCardLocal: (card: Card) => void;
  addListLocal: (list: List) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  activeBoard: null,
  setActiveBoard: (board) => set({ activeBoard: board }),

  // Optimistic local update so drag-and-drop feels instant before the server confirms
  moveCardLocal: (cardId, fromListId, toListId, newPosition) =>
    set((state) => {
      if (!state.activeBoard) return state;
      const lists = state.activeBoard.lists.map((list) => ({ ...list, cards: [...list.cards] }));

      const fromList = lists.find((l) => l.id === fromListId);
      const toList = lists.find((l) => l.id === toListId);
      if (!fromList || !toList) return state;

      const cardIndex = fromList.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return state;

      const [card] = fromList.cards.splice(cardIndex, 1);
      card.listId = toListId;
      toList.cards.splice(newPosition, 0, card);

      return { activeBoard: { ...state.activeBoard, lists } };
    }),

  addCardLocal: (card) =>
    set((state) => {
      if (!state.activeBoard) return state;
      const lists = state.activeBoard.lists.map((l) =>
        l.id === card.listId ? { ...l, cards: [...l.cards, card] } : l
      );
      return { activeBoard: { ...state.activeBoard, lists } };
    }),

  addListLocal: (list) =>
    set((state) => {
      if (!state.activeBoard) return state;
      return { activeBoard: { ...state.activeBoard, lists: [...state.activeBoard.lists, list] } };
    }),
}));
