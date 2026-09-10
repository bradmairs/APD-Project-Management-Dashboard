import { Router } from "express";
import { cmpPrisma } from "../../cmpPrisma";

const router = Router();

router.get("/recent", async (_req, res) => {
  const entries = await cmpPrisma.cmpActivityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 15,
  });
  res.json(entries);
});

export default router;
