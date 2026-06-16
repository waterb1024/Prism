export type Notebook = {
  id: number;
  name: string;
  created_at: number;
  updated_at: number;
  note_count?: number;
};

export type Note = {
  id: number;
  notebook_id: number | null;
  title: string;
  content: string;
  plain_text: string;
  pinned: 0 | 1;
  archived: 0 | 1;
  created_at: number;
  updated_at: number;
};

export type NoteSummary = Pick<
  Note,
  "id" | "notebook_id" | "title" | "plain_text" | "pinned" | "updated_at" | "created_at"
>;
