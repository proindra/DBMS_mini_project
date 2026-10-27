import type { Role } from "@prisma/client";

export type Principal = {
  id: number;
  role: Role;
};

export class AuthAccessError extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403,
  ) {
    super(message);
    this.name = "AuthAccessError";
  }
}

export function requirePrincipal(
  principal: Principal | null,
): Principal {
  if (!principal) {
    throw new AuthAccessError("Authentication required.", 401);
  }

  return principal;
}

export function requireRole(
  principal: Principal | null,
  role: Role,
): Principal {
  const authenticatedPrincipal = requirePrincipal(principal);

  if (authenticatedPrincipal.role !== role) {
    throw new AuthAccessError("You are not allowed to access this resource.", 403);
  }

  return authenticatedPrincipal;
}

export function assertOwnerOrAdmin(
  principal: Principal | null,
  ownerId: number,
): Principal {
  const authenticatedPrincipal = requirePrincipal(principal);

  if (
    authenticatedPrincipal.role !== "ADMIN" &&
    authenticatedPrincipal.id !== ownerId
  ) {
    throw new AuthAccessError("You are not allowed to access this resource.", 403);
  }

  return authenticatedPrincipal;
}

export function authErrorResponse(error: AuthAccessError): Response {
  return Response.json(
    { error: error.status === 401 ? "Authentication required." : "Forbidden." },
    { status: error.status },
  );
}
