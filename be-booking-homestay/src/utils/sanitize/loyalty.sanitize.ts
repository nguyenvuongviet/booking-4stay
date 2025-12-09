import { buildImageUrl, sanitizeCollection } from 'src/utils/object.util';

function sanitize(program: any) {
  if (!program) return null;

  return {
    id: program.id,
    user: {
      id: program.users.id,
      email: program.users.email,
      firstName: program.users.firstName,
      lastName: program.users.lastName,
      phoneNumber: program.users.phoneNumber,
      dateOfBirth: program.users.dateOfBirth,
      gender: program.users.gender,
      country: program.users.country,
      roles: program.users.user_roles.map((ur: any) => ur.roles?.name),
      avatar: buildImageUrl(program.users.avatar),
    },
    level: program.levels.name,
    points: program.points,
    totalBookings: program.totalBookings,
    totalNights: program.totalNights,
    lastUpgradeDate: program.lastUpgradeDate,
  };
}

export function sanitizeProgram(data: any) {
  return sanitizeCollection(data, sanitize);
}
