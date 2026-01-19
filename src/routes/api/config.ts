import { createAPIFileRoute } from "@tanstack/react-start/api";
import { isRegistrationAllowed } from "@/lib/auth";

export const APIRoute = createAPIFileRoute("/api/config")({
  // GET /api/config - Get public configuration
  GET: async () => {
    return Response.json({
      registrationEnabled: isRegistrationAllowed(),
    });
  },
});
