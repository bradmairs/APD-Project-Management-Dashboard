import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { prisma } from "../prisma";
import { COOKIE_NAME, signToken } from "../auth";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// This app is reachable from the open internet, so login needs its own
// brute-force/credential-stuffing throttle rather than relying on a
// strong password alone. Keyed by IP (express-rate-limit's default) — a
// shared office/NAT IP will share this budget, which is an acceptable
// trade-off for a small self-hosted deployment. Counts only failed
// attempts (skipSuccessfulRequests) so a legitimate user who mistypes
// their password once isn't locked out by their own subsequent correct
// login.
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "Too many login attempts. Try again in a few minutes." },
});

router.post("/login", loginRateLimiter, async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  if (!user.active) {
    return res
      .status(403)
      .json({ error: "This account has been deactivated. Contact an administrator." });
  }

  const token = signToken({
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  });
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTIONS, maxAge: undefined });
  res.status(204).send();
});

router.get("/me", requireAuth, (req, res) => {
  res.json({
    id: req.user!.sub,
    name: req.user!.name,
    email: req.user!.email,
    role: req.user!.role,
    createdAt: req.user!.createdAt,
  });
});

router.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };
  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current and new password are required" });
  }
  if (newPassword.length < 8) {
    return res
      .status(400)
      .json({ error: "New password must be at least 8 characters" });
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.sub } });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  res.status(204).send();
});

export default router;
