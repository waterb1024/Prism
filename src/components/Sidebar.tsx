"use client";

import { useState } from "react";
import type { Notebook } from "@/lib/types";

type Props = {
  notebooks: Notebook[];
  activeId: number | "all";
  onSelect: (id: number | "all") => void;
  onCreate: () => void;
  onRename: (id: number, name: string) => Promise<void> | void;
  onDelete: (id: number) => Promise<void> | void;
  onLogout: () => void;
};

export default function Sidebar({
  notebooks,
  activeId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onLogout,
}: Props) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");

  const totalNotes = notebooks.reduce((sum, n) => sum + (n.note_count ?? 0), 0);

  return (
    <aside className="w-60 shrink-0 border-r border-neutral-200 bg-neutral-50 flex flex-col">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="font-semibold text-neutral-800">📝 Notepad</div>
        <button
          onClick={onLogout}
          title="로그아웃"
          className="text-xs text-neutral-400 hover:text-neutral-700"
        >
          로그아웃
        </button>
      </div>

      <div className="px-2">
        <button
          onClick={() => onSelect("all")}
          className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center justify-between ${
            activeId === "all"
              ? "bg-emerald-50 text-emerald-700 font-medium"
              : "text-neutral-700 hover:bg-neutral-200/60"
          }`}
        >
          <span>📚 모든 노트</span>
          <span className="text-xs text-neutral-400">{totalNotes}</span>
        </button>
      </div>

      <div className="mt-4 px-4 flex items-center justify-between text-xs uppercase tracking-wide text-neutral-500">
        <span>노트북</span>
        <button
          onClick={onCreate}
          className="text-neutral-400 hover:text-emerald-600 text-base leading-none"
          title="새 노트북"
        >
          +
        </button>
      </div>

      <ul className="px-2 mt-1 flex-1 overflow-y-auto">
        {notebooks.map((nb) => {
          const isActive = activeId === nb.id;
          const isEditing = editingId === nb.id;
          return (
            <li key={nb.id} className="group">
              {isEditing ? (
                <input
                  autoFocus
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onBlur={async () => {
                    const v = editingValue.trim();
                    if (v && v !== nb.name) await onRename(nb.id, v);
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="w-full px-3 py-1.5 rounded-md text-sm border border-emerald-400 outline-none"
                />
              ) : (
                <div
                  onClick={() => onSelect(nb.id)}
                  onDoubleClick={() => {
                    setEditingId(nb.id);
                    setEditingValue(nb.name);
                  }}
                  className={`px-3 py-1.5 rounded-md text-sm flex items-center justify-between cursor-pointer ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-medium"
                      : "text-neutral-700 hover:bg-neutral-200/60"
                  }`}
                >
                  <span className="truncate">📓 {nb.name}</span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-xs text-neutral-400">{nb.note_count ?? 0}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(nb.id);
                      }}
                      title="삭제"
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 text-xs"
                    >
                      ✕
                    </button>
                  </span>
                </div>
              )}
            </li>
          );
        })}
        {notebooks.length === 0 && (
          <li className="px-3 py-2 text-xs text-neutral-400">노트북이 없어요</li>
        )}
      </ul>
    </aside>
  );
}
