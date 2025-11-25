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
    loyalty_program: {
      levels: user.loyalty_program?.levels,
      totalBooking: user.loyalty_program?.totalBookings,
      totalNight: user.loyalty_program?.totalNights,
      totalPoint: user.loyalty_program?.points,
      lastUpgradeDate: user.loyalty_program?.lastUpgradeDate,
    },
    isActive: user.isActive,
    isVerified: user.isVerified,
    provider: user.provider,
    createdAt: user.createdAt.toISOString(),
  };
}

export function sanitizeUserData(data: any) {
  return sanitizeCollection(data, sanitizeUser);
}
