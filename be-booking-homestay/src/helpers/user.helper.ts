import { Prisma } from '@prisma/client';
import { CLOUDINARY_BASE_URL, PORT } from 'src/common/constant/app.constant';
import { UserFilterDto } from 'src/modules/user/dto/filter-user.dto';
import { omitFields } from 'src/utils/object';

const BASE_URL = `http://localhost:${PORT}`;
const AVATAR_PATH = '/public/images/avatar';

const SENSITIVE_FIELDS = [
  'roleId',
  'password',
  'googleId',
  'deletedBy',
  'isDeleted',
  'deletedAt',
  'createdAt',
  'updatedAt',
  'lastLogin',
];

function buildAvatarUrl(avatar: string | null): string | null {
  if (!avatar) return null;

  if (avatar.startsWith('4stay/')) {
    return `${CLOUDINARY_BASE_URL}/${avatar}.jpg`;
  }

  return `${BASE_URL}${AVATAR_PATH}/${avatar}`;
}

function sanitize(user: any) {
  if (!user) return null;

  if (user.dateOfBirth instanceof Date) {
    user.dateOfBirth = user.dateOfBirth.toISOString();
  }

  const clone = omitFields(user, SENSITIVE_FIELDS);
  clone.avatar = buildAvatarUrl(user.avatar);

  if (user.user_roles?.length > 0) {
    clone.roles = user.user_roles
      .map((ur: any) => ur.roles?.name)
      .filter(Boolean);
  } else {
    clone.roles = [];
  }
  delete clone.user_roles;

  if (user.loyalty_program) {
    clone.loyaltyLevel = user.loyalty_program.loyalty_levels?.name || null;
    delete clone.loyalty_program;
  }

  return clone;
}

export function sanitizeUserData(data: any): any {
  if (!data) return null;
  return Array.isArray(data) ? data.map(sanitize) : sanitize(data);
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
