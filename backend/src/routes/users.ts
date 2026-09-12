import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";

const router = Router();

// Every user gets MEMBER access to GVW (the "home" org all seeded users
// belong to); an ADMIN additionally gets ADMIN access to every other
// organization (CMP included, and any future one) so promoting or creating
// an admin always leaves them able to switch dashboards, mirroring what the
// seed script does for its own "Admin" account.
async function grantDefaultOrgMembership(userId: string, role: "ADMIN" | "MEMBER") {
  const organizations = await prisma.organization.findMany();
  const gvw = organizations.find((o) => o.slug === "gvw");
  const targets =
    role === "ADMIN"
      ? organizations
      : organizations.filter((o) => o.id === gvw?.id);

  for (const org of targets) {
    await prisma.organizationMembership.upsert({
      where: { userId_organizationId: { userId, organizationId: org.id } },
      update: role === "ADMIN" ? { role: "ADMIN" } : {},
      create: { userId, organizationId: org.id, role },
    });
  }
}

router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
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
    const resolvedRole = role || "MEMBER";
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase(), passwordHash, role: resolvedRole },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });
    await grantDefaultOrgMembership(user.id, resolvedRole);
    res.status(201).json(user);
  } catch (err) {
    res.status(409).json({ error: "A user with that email already exists" });
  }
});

router.put("/:id", async (req, res) => {
  const { role, active } = req.body as {
    role?: "ADMIN" | "MEMBER";
    active?: boolean;
  };
  if (role === undefined && active === undefined) {
    return res.status(400).json({ error: "Nothing to update" });
  }
  if (role !== undefined && role !== "ADMIN" && role !== "MEMBER") {
    return res.status(400).json({ error: "Role must be ADMIN or MEMBER" });
  }
  if (active !== undefined && typeof active !== "boolean") {
    return res.status(400).json({ error: "active must be true or false" });
  }
  if (req.params.id === req.user!.sub) {
    if (role !== undefined && role !== "ADMIN") {
      return res.status(400).json({ error: "You can't remove your own admin access" });
    }
    if (active === false) {
      return res.status(400).json({ error: "You can't deactivate your own account" });
    }
  }

  const data: { role?: "ADMIN" | "MEMBER"; active?: boolean } = {};
  if (role !== undefined) data.role = role;
  if (active !== undefined) data.active = active;

  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });
    if (role === "ADMIN") {
      await grantDefaultOrgMembership(user.id, "ADMIN");
    }
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
});

export default router;
