import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const APIRoute = createAPIFileRoute("/api/health")({
  GET: async () => {
    try {
      // Check database connectivity
      await db.execute(sql`SELECT 1`);

      return Response.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
      });
    } catch (error) {
      return Response.json(
        {
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          database: "disconnected",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 503 }
      );
    }
  },
});
