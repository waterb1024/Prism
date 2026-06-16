import { createClient, type Client } from "@libsql/client";

declare global {
  // eslint-disable-next-line no-var
  var __tursoClient: Client | undefined;
}

function buildClient(): Client {
  const url = process.env.TURSO_URL;
  const authToken = process.env.TURSO_TOKEN;
  if (!url) throw new Error("TURSO_URL is not set");
  if (!authToken) throw new Error("TURSO_TOKEN is not set");
  return createClient({ url, authToken });
}

export const db: Client = global.__tursoClient ?? buildClient();

if (process.env.NODE_ENV !== "production") {
  global.__tursoClient = db;
}
