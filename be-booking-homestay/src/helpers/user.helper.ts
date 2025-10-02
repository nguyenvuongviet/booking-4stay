import { Prisma } from '@prisma/client';
import { CLOUDINARY_BASE_URL, PORT } from 'src/common/constant/app.constant';
import { UserFilterDto } from 'src/modules/user/dto/filter-user.dto';
import { sanitizeCollection } from 'src/utils/object';

const BASE_URL = `http://localhost:${PORT}`;
const AVATAR_PATH = '/public/images/avatar';

function buildAvatarUrl(avatar: string | null): string | null {
  if (!avatar) return null;

  if (avatar.startsWith('4stay/')) {
    return `${CLOUDINARY_BASE_URL}/${avatar}.jpg`;
  }

  return `${BASE_URL}${AVATAR_PATH}/${avatar}`;
}

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
    avatar: buildAvatarUrl(user.avatar),
    country: user.country,
    roles: Array.isArray(user.user_roles)
      ? user.user_roles.map((ur: any) => ur.roles?.name).filter(Boolean)
      : [],
    loyaltyLevel: user.loyalty_program?.loyalty_levels?.name || null,
    isActive: user.isActive,
    isVerified: user.isVerified,
    provider: user.provider,
  };
}

export function sanitizeUserData(data: any): any {
  return sanitizeCollection(data, sanitizeUser);
}

export function buildUserWhereClause(
  dto: Partial<UserFilterDto>,
): Prisma.usersWhereInput {
  const { roleName, loyaltyLevel, search } = dto;

  const where: Prisma.usersWhereInput = { isDeleted: false };

  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { phoneNumber: { contains: search } },
    ];
  }

  if (roleName) {
    where.user_roles = {
      some: {
        roles: { name: roleName },
      },
    };
  }

  if (loyaltyLevel) {
    where.loyalty_program = {
      is: {
        loyalty_levels: {
          name: loyaltyLevel,
        },
      },
    };
  }

  return where;
}
