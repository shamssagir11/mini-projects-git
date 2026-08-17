import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { api } from "../api/axios";

const COLORS = ["#94a3b8", "#60a5fa", "#fb923c", "#f87171"];

interface Analytics {
  totalCards: number;
  cardsByList: { list: string; count: number }[];
  priorityBreakdown: { priority: string; count: number }[];
  overdue: number;
}

export default function AnalyticsPanel({ boardId }: { boardId: string }) {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    api.get(`/boards/${boardId}/analytics`).then((res) => setData(res.data));
  }, [boardId]);

  if (!data) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-500 mb-1">Total Cards</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{data.totalCards}</p>
        <p className="text-xs text-red-500 mt-1">{data.overdue} overdue</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-500 mb-2">Cards per List</p>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={data.cardsByList}>
            <XAxis dataKey="list" tick={{ fontSize: 10 }} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-500 mb-2">Priority Breakdown</p>
        <ResponsiveContainer width="100%" height={100}>
          <PieChart>
            <Pie data={data.priorityBreakdown} dataKey="count" nameKey="priority" innerRadius={25} outerRadius={40}>
              {data.priorityBreakdown.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
