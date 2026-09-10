import { Router } from "express";
import { prisma } from "../prisma";

const router = Router();

// Lists the organizations the current user can switch into — the frontend
// uses this both to render the org switcher (hidden entirely when there's
// only one) and to decide which dashboard to land on after login.
router.get("/me", async (req, res) => {
  const memberships = await prisma.organizationMembership.findMany({
    where: { userId: req.user!.sub },
    include: { organization: true },
    orderBy: { organization: { name: "asc" } },
  });
  res.json(
    memberships.map((m) => ({
      slug: m.organization.slug,
      name: m.organization.name,
      role: m.role,
    }))
  );
});

export default router;
