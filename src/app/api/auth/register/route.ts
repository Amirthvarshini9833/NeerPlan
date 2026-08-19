import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
const data = z.object({ name: z.string().trim().min(2).max(80), email: z.string().email(), password: z.string().min(10).max(128) });
export async function POST(request: Request) { const parsed = data.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({ error: "Use a name, valid email, and a password of at least 10 characters." }, { status: 400 }); try { const user = await prisma.user.create({ data: { name: parsed.data.name, email: parsed.data.email.toLowerCase(), passwordHash: await bcrypt.hash(parsed.data.password, 12) } }); return NextResponse.json({ id: user.id, email: user.email }, { status: 201 }); } catch { return NextResponse.json({ error: "An account already uses this email." }, { status: 409 }); } }
