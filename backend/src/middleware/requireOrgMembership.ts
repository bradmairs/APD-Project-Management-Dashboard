import { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma";

declare global {
  namespace Express {
    interface Request {
      orgRole?: "ADMIN" | "MEMBER";
    }
  }
}

// Must run after requireAuth (needs req.user already populated). Gates
// access to an organization's routes (e.g. CMP's /api/cmp/*) on a matching
// OrganizationMembership row rather than anything stored in the JWT, so
// membership changes take effect immediately instead of waiting out the
// session — the same reasoning requireAuth already applies to User.active.
export function requireOrgMembership(orgSlug: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const membership = await prisma.organizationMembership.findFirst({
      where: { userId: req.user!.sub, organization: { slug: orgSlug } },
      select: { role: true },
    });
    if (!membership) {
      return res.status(403).json({ error: "You don't have access to this organization." });
    }
    req.orgRole = membership.role;
    next();
  };
}
