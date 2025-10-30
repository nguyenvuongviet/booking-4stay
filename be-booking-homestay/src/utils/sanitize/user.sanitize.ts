import { buildImageUrl, sanitizeCollection } from 'src/utils/object.util';

function sanitizeUser(user: any) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
    gender: user.gender,
    avatar: buildImageUrl(user.avatar),
    country: user.country,
    roles: Array.isArray(user.user_roles)
      ? user.user_roles.map((ur: any) => ur.roles?.name).filter(Boolean)
      : [],
    loyaltyLevel: user.loyalty_program?.levels?.name || null,
    isActive: user.isActive,
    isVerified: user.isVerified,
    provider: user.provider,
    createdAt: user.createdAt.toISOString(),
  };
}

export function sanitizeUserData(data: any) {
  return sanitizeCollection(data, sanitizeUser);
}
