import { User, Role, Permission } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Assuming we expand the User type with the relation
type UserWithRole = User & {
  role: (Role & { permissions: { permission: Permission }[] }) | null;
};

export const hasPermission = (
  user: UserWithRole | null | undefined,
  requiredPermission: string
): boolean => {
  if (!user || !user.role) {
    return false;
  }

  // Super Admin bypass
  if (user.role.name === "SUPER_ADMIN") {
    return true;
  }

  return user.role.permissions.some(
    (rp) => rp.permission.name === requiredPermission
  );
};

export const hasAnyPermission = (
  user: UserWithRole | null | undefined,
  permissions: string[]
): boolean => {
  if (!user || !user.role) return false;
  if (user.role.name === "SUPER_ADMIN") return true;

  return user.role.permissions.some((rp) =>
    permissions.includes(rp.permission.name)
  );
};

export const hasAllPermissions = (
  user: UserWithRole | null | undefined,
  permissions: string[]
): boolean => {
  if (!user || !user.role) return false;
  if (user.role.name === "SUPER_ADMIN") return true;

  const userPermissions = user.role.permissions.map((rp) => rp.permission.name);
  return permissions.every((p) => userPermissions.includes(p));
};

export async function getUserWithRole(userId: string): Promise<UserWithRole | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });
}
