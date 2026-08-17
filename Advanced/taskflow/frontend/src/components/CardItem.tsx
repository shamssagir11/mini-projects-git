import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, User } from "lucide-react";
import { Card } from "../store/boardStore";

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

export default function CardItem({ card, onClick }: { card: Card; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:shadow-md transition mb-2"
    >
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">{card.title}</p>

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[card.priority]}`}>
          {card.priority}
        </span>

        <div className="flex items-center gap-2 text-gray-400">
          {card.dueDate && (
            <span className="flex items-center gap-1 text-xs">
              <Calendar size={12} />
              {new Date(card.dueDate).toLocaleDateString()}
            </span>
          )}
          {card.assignee && (
            <div
              title={card.assignee.name}
              className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center"
            >
              {card.assignee.name.charAt(0)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
