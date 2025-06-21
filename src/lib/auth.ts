import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "~/server/db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function login(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new Error("Invalid password");
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
  console.log("Login attempt:", email);
if (!user) {
  console.log("No user found.");
  throw new Error("User not found");
}
console.log("User found, checking password...");
  return { token, user };
  
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; role: string };
    
  } catch {
    throw new Error("Invalid token");
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}