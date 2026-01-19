import { createFileRoute } from "@tanstack/react-router";
import { isRegistrationAllowed } from "@/lib/auth";

export const Route = createFileRoute("/api/config")({
  server: {
    handlers: {
      // GET /api/config - Get public configuration
      GET: async () => {
        return Response.json({
          registrationEnabled: isRegistrationAllowed(),
        });
      },
    },
  },
});
