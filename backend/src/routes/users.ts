import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";

const router = Router();

router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { name: "asc" },
  });
  res.json(users);
});

router.post("/", async (req, res) => {
  const { name, email, password, role } = req.body as {
    name?: string;
    email?: string;
    password?: string;
    role?: "ADMIN" | "MEMBER";
  };
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  if (role && role !== "ADMIN" && role !== "MEMBER") {
    return res.status(400).json({ error: "Role must be ADMIN or MEMBER" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), passwordHash, role: role || "MEMBER" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(409).json({ error: "A user with that email already exists" });
  }
});

router.put("/:id", async (req, res) => {
  const { role } = req.body as { role?: "ADMIN" | "MEMBER" };
  if (!role || (role !== "ADMIN" && role !== "MEMBER")) {
    return res.status(400).json({ error: "Role must be ADMIN or MEMBER" });
  }
  if (req.params.id === req.user!.sub && role !== "ADMIN") {
    return res.status(400).json({ error: "You can't remove your own admin access" });
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
});

export default router;
