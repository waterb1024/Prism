"use client";

import type { Editor } from "@tiptap/react";

export default function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return <div className="h-10 border-b border-neutral-100" />;

  const Btn = ({
    onClick,
    active,
    label,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    label: string;
    title: string;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      title={title}
      className={`px-2 py-1 rounded text-sm ${
        active ? "bg-emerald-100 text-emerald-700" : "text-neutral-600 hover:bg-neutral-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="border-b border-neutral-100 px-8 py-1.5 flex items-center gap-1 flex-wrap">
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        label="H1"
        title="제목 1"
      />
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        label="H2"
        title="제목 2"
      />
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        label="H3"
        title="제목 3"
      />
      <span className="w-px h-4 bg-neutral-200 mx-1" />
      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="B"
        title="굵게 (Cmd/Ctrl+B)"
      />
      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="I"
        title="기울임 (Cmd/Ctrl+I)"
      />
      <Btn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        label="S"
        title="취소선"
      />
      <Btn
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        label="</>"
        title="인라인 코드"
      />
      <span className="w-px h-4 bg-neutral-200 mx-1" />
      <Btn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="• 목록"
        title="글머리 기호"
      />
      <Btn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="1. 목록"
        title="번호 목록"
      />
      <Btn
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        active={editor.isActive("taskList")}
        label="☐ 할 일"
        title="체크박스 목록"
      />
      <span className="w-px h-4 bg-neutral-200 mx-1" />
      <Btn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label="❝"
        title="인용"
      />
      <Btn
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        label="{ }"
        title="코드 블록"
      />
      <Btn
        onClick={() => {
          const url = window.prompt("링크 URL");
          if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          else editor.chain().focus().unsetLink().run();
        }}
        active={editor.isActive("link")}
        label="🔗"
        title="링크"
      />
      <span className="w-px h-4 bg-neutral-200 mx-1" />
      <Btn
        onClick={() => editor.chain().focus().undo().run()}
        label="↶"
        title="실행 취소"
      />
      <Btn
        onClick={() => editor.chain().focus().redo().run()}
        label="↷"
        title="다시 실행"
      />
    </div>
  );
}
