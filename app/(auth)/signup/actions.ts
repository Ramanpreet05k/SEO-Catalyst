"use server"; // This must be at the very top!

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Notice the 'export' keyword here!
export async function signUpUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Missing email or password" };
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      return { error: "User already exists with this email." };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Something went wrong." };
  }
}