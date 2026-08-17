import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { List, Card } from "../store/boardStore";
import CardItem from "./CardItem";

interface Props {
  list: List;
  onAddCard: (listId: string, title: string) => void;
  onCardClick: (card: Card) => void;
}

export default function ListColumn({ list, onAddCard, onCardClick }: Props) {
  const [showInput, setShowInput] = useState(false);
  const [title, setTitle] = useState("");
  const { setNodeRef } = useDroppable({ id: list.id });

  function handleAdd() {
    if (!title.trim()) return;
    onAddCard(list.id, title.trim());
    setTitle("");
    setShowInput(false);
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 rounded-xl w-72 flex-shrink-0 flex flex-col max-h-full">
      <div className="px-3 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">{list.title}</h3>
        <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-800 rounded-full px-2 py-0.5">
          {list.cards.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto scrollbar-thin px-2 min-h-[40px]">
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <CardItem key={card.id} card={card} onClick={() => onCardClick(card)} />
          ))}
        </SortableContext>
      </div>

      <div className="p-2">
        {showInput ? (
          <div className="space-y-1">
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Card title..."
              className="w-full text-sm px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="flex gap-2">
              <button onClick={handleAdd} className="text-xs bg-brand-600 text-white px-3 py-1 rounded-md">
                Add
              </button>
              <button onClick={() => setShowInput(false)} className="text-xs text-gray-500">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowInput(true)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 px-2 py-1.5 w-full rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
          >
            <Plus size={16} /> Add card
          </button>
        )}
      </div>
    </div>
  );
}
