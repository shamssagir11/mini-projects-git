import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { api } from "../api/axios";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

interface BoardSummary {
  id: string;
  title: string;
  description?: string;
  colorTheme: string;
  _count: { lists: number };
  members: any[];
}

export default function Dashboard() {
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  async function loadBoards() {
    const { data } = await api.get("/boards");
    setBoards(data);
  }

  useEffect(() => {
    loadBoards();
  }, []);

  async function handleCreate() {
    if (!title.trim()) return;
    try {
      const { data } = await api.post("/boards", { title });
      toast.success("Board created!");
      setShowModal(false);
      setTitle("");
      navigate(`/board/${data.id}`);
    } catch {
      toast.error("Failed to create board");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Boards</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus size={16} /> New Board
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <div
              key={board.id}
              onClick={() => navigate(`/board/${board.id}`)}
              className="cursor-pointer rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition bg-white dark:bg-gray-900"
              style={{ borderTop: `4px solid ${board.colorTheme}` }}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{board.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{board.description || "No description"}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{board._count.lists} lists</span>
                <span>{board.members.length} members</span>
              </div>
            </div>
          ))}
        </div>

        {boards.length === 0 && (
          <p className="text-gray-400 text-center mt-16">No boards yet — create your first one!</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">New Board</h3>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Board title..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-transparent dark:text-white mb-4 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="text-sm text-gray-500 px-3 py-2">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="text-sm bg-brand-600 text-white px-4 py-2 rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
