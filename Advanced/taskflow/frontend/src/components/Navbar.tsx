import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, LogOut } from "lucide-react";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <h1
        onClick={() => navigate("/dashboard")}
        className="font-bold text-lg text-brand-600 cursor-pointer"
      >
        TaskFlow
      </h1>

      <div className="flex items-center gap-4">
        <button onClick={() => setDark(!dark)} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-7 h-7 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center">
          {user?.name?.charAt(0) || "?"}
        </div>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="text-gray-500 hover:text-red-500"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
