import { Prisma } from '@prisma/client';
import { UserFilterDto } from 'src/modules/user/dto/user-filter.dto';

export function buildUserWhereClause(
  dto: Partial<UserFilterDto>,
): Prisma.usersWhereInput {
  const { roleName, loyaltyLevel, search } = dto;

  const where: Prisma.usersWhereInput = { isDeleted: false };

  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { email: { contains: search } },
      { phoneNumber: { contains: search } },
    ];
  }

  if (roleName) {
    where.roles = { name: roleName };
  }

  if (loyaltyLevel) {
    where.loyalty_program = { level: loyaltyLevel };
  }

  return where;
}
