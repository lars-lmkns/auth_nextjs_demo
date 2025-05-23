"use server";

import { hashUserPassword } from "@/lib/hash";
import { createUser, getUserByEmail } from "@/lib/user";
import { redirect } from "next/navigation";
import sql from "better-sqlite3";
import { createAuthSession, destroyAuthSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/hash";

const db = sql("training.db");

export async function signUp(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  let errors = {};

  if (!email.includes("@")) {
    errors.email = "Invalid email address";
  }

  if (password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters long";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const hashedPassword = hashUserPassword(password);
  try {
    const userId = await createUser(email, hashedPassword);
    createAuthSession(userId);
    redirect("/training");
  } catch (error) {
    console.log(error);

    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      console.log("User already exists");

      return {
        errors: {
          email: "User already exists",
        },
      };
    }
    throw error;
  }
}


export async function login(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const user = await getUserByEmail(email);

  if (!user) {
    return {
      errors: {
        email: "Could not authenticate user",
      },
    };
  }

  const isValidPassword = verifyPassword(user.password, password );

  if (!isValidPassword) {
    return {
      errors: {
        email: "Could not authenticate user",
      },
    };
  }

  await createAuthSession(user.id);
  redirect("/training");
}

export async function auth(mode, prevState, formData) {
  if (mode === "login") {
    return login(prevState, formData);
  }
  return signUp(prevState, formData);
}

export async function logout() {
  await destroyAuthSession();
  redirect("/");
}