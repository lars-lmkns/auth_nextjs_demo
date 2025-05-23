import sql from "better-sqlite3";

const db = sql("training.db");

export async function createUser(email, password) {
  const result = await db
    .prepare("INSERT INTO users (email, password) VALUES (?, ?)")
    .run(email, password);

  return result.lastInsertRowid;
}


export async function getUserByEmail(email) {
  const result = await db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email);

  return result;
}