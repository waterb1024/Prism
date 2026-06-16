"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Typography from "@tiptap/extension-typography";
import { useEffect, useRef, useState } from "react";
import EditorToolbar from "./EditorToolbar";
import type { Note, Notebook } from "@/lib/types";

type Props = {
  note: Note | null;
  notebooks: Notebook[];
  onSave: (
    id: number,
    patch: { title?: string; content?: string; plain_text?: string },
  ) => Promise<void>;
  onChangeNotebook: (id: number, notebookId: number) => Promise<void>;
};

const AUTOSAVE_DELAY = 700;

export default function Editor({ note, notebooks, onSave, onChangeNotebook }: Props) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: "여기에 작성하세요..." }),
      Link.configure({ openOnClick: false, autolink: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Typography,
    ],
    content: note?.content || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-neutral max-w-none focus:outline-none min-h-[60vh]",
      },
    },
    onUpdate({ editor }) {
      if (!note) return;
      const html = editor.getHTML();
      const text = editor.getText();
      scheduleSave({ content: html, plain_text: text });
    },
  });

  useEffect(() => {
    setTitle(note?.title ?? "");
    if (editor && note) {
      editor.commands.setContent(note.content || "", false);
    }
    setSavedAt(null);
  }, [note?.id, editor]); // eslint-disable-line react-hooks/exhaustive-deps

  function scheduleSave(patch: { title?: string; content?: string; plain_text?: string }) {
    if (!note) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await onSave(note.id, patch);
      setSavedAt(Date.now());
    }, AUTOSAVE_DELAY);
  }

  if (!note) {
    return (
      <div className="flex-1 grid place-items-center text-neutral-300 text-sm bg-neutral-50">
        왼쪽에서 노트를 선택하거나 새 노트를 만드세요.
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col bg-white">
      <div className="border-b border-neutral-100 px-8 pt-6 pb-3">
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <select
            value={note.notebook_id ?? ""}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isFinite(v) && v > 0) onChangeNotebook(note.id, v);
            }}
            className="bg-transparent border-none focus:outline-none cursor-pointer text-neutral-500 hover:text-neutral-700"
          >
            {notebooks.map((nb) => (
              <option key={nb.id} value={nb.id}>
                📓 {nb.name}
              </option>
            ))}
          </select>
          <span>{savedAt ? `${new Date(savedAt).toLocaleTimeString("ko-KR")} 저장됨` : ""}</span>
        </div>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            scheduleSave({ title: e.target.value });
          }}
          placeholder="제목"
          className="mt-3 w-full text-3xl font-bold text-neutral-900 placeholder:text-neutral-300 focus:outline-none"
        />
      </div>
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <EditorContent editor={editor} />
      </div>
    </main>
  );
}
