import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import toast from "react-hot-toast";
import { api } from "../api/axios";
import { useBoardStore, Card } from "../store/boardStore";
import { useSocket } from "../hooks/useSocket";
import Navbar from "../components/Navbar";
import ListColumn from "../components/ListColumn";
import AnalyticsPanel from "../components/AnalyticsPanel";
import AttachmentUploader from "../components/AttachmentUploader";

export default function BoardView() {
  const { id } = useParams<{ id: string }>();
  const { activeBoard, setActiveBoard, moveCardLocal, addCardLocal } = useBoardStore();
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);

  useSocket(id);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (!id) return;
    api.get(`/boards/${id}`).then((res) => setActiveBoard(res.data));
  }, [id]);

  async function handleAddCard(listId: string, title: string) {
    const { data } = await api.post("/cards", { listId, title });
    addCardLocal(data);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || !activeBoard) return;

    const cardId = active.id as string;
    let fromListId = "";
    let card: Card | undefined;

    for (const list of activeBoard.lists) {
      const found = list.cards.find((c) => c.id === cardId);
      if (found) {
        fromListId = list.id;
        card = found;
        break;
      }
    }
    if (!card) return;

    // `over.id` is either a list id (dropped on empty area) or a card id (dropped between cards)
    let toListId = over.id as string;
    let newPosition = 0;

    const targetList = activeBoard.lists.find((l) => l.id === toListId);
    if (!targetList) {
      // over.id was a card — find its parent list
      for (const list of activeBoard.lists) {
        const idx = list.cards.findIndex((c) => c.id === over.id);
        if (idx !== -1) {
          toListId = list.id;
          newPosition = idx;
          break;
        }
      }
    } else {
      newPosition = targetList.cards.length;
    }

    if (fromListId === toListId && card.position === newPosition) return;

    moveCardLocal(cardId, fromListId, toListId, newPosition);

    try {
      await api.patch(`/cards/${cardId}/move`, { newListId: toListId, newPosition });
    } catch {
      toast.error("Failed to move card");
    }
  }

  if (!activeBoard) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">Loading board...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar />

      <div className="px-6 pt-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{activeBoard.title}</h2>
        <p className="text-sm text-gray-500 mb-4">{activeBoard.description}</p>
        <AnalyticsPanel boardId={activeBoard.id} />
      </div>

      <div className="flex-1 overflow-x-auto px-6 pb-6">
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full">
            {activeBoard.lists.map((list) => (
              <ListColumn
                key={list.id}
                list={list}
                onAddCard={handleAddCard}
                onCardClick={(card) => {
                  setSelectedCard(card);
                  setAttachments([]);
                }}
              />
            ))}
          </div>
        </DndContext>
      </div>

      {selectedCard && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelectedCard(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
              {selectedCard.title}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedCard.description || "No description added yet."}
            </p>

            <div className="mb-4">
              <AttachmentUploader
                cardId={selectedCard.id}
                attachments={attachments}
                onUploaded={(a) => setAttachments((prev) => [...prev, a])}
              />
            </div>

            <button
              onClick={() => setSelectedCard(null)}
              className="text-sm bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
