import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { PORT } from 'src/common/constant/app.constant';
import { sanitizeUserData } from 'src/utils/sanitize/user.sanitize';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserFilterDto } from './dto/filter-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async findAll() {
    const users = await this.prismaService.users.findMany({
      where: { isDeleted: false },
      include: {
        user_roles: { include: { roles: true } },
        loyalty_program: { include: { levels: true } },
      },
    });
    return sanitizeUserData(users);
  }

  async findAllFiltered(filterDto: UserFilterDto) {
    const {
      page = 1,
      pageSize = 10,
      search,
      roleName,
      loyaltyLevel,
    } = filterDto;

    const skip = (page - 1) * pageSize;

    const where: Prisma.usersWhereInput = {
      isDeleted: false,
      ...(search
        ? {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { phoneNumber: { contains: search } },
            ],
          }
        : {}),
      ...(roleName
        ? {
            user_roles: {
              some: {
                roles: { name: roleName },
              },
            },
          }
        : {}),
      ...(loyaltyLevel
        ? {
            loyalty_program: {
              is: {
                levels: { name: loyaltyLevel },
              },
            },
          }
        : {}),
    };

    const [totalItems, users] = await Promise.all([
      this.prismaService.users.count({ where }),
      this.prismaService.users.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        where,
        include: {
          user_roles: { include: { roles: true } },
          loyalty_program: { include: { levels: true } },
        },
      }),
    ]);

    return {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      data: sanitizeUserData(users),
    };
  }

  async create(createUserDto: CreateUserDto) {
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      country,
      roleName,
    } = createUserDto;

    const [role, existingUser] = await Promise.all([
      this.prismaService.roles.findUnique({
        where: { name: roleName },
      }),
      this.prismaService.users.findUnique({
        where: { email },
      }),
    ]);

    if (!role) {
      throw new BadRequestException(`Vai trò '${roleName}' không tồn tại`);
    }

    if (existingUser) {
      throw new BadRequestException('Email đã tồn tại!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prismaService.$transaction(
      async (tx: PrismaService) => {
        const newUser = await tx.users.create({
          data: {
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phoneNumber,
            country,
            isVerified: true,
            isActive: true,
            user_roles: {
              create: { roleId: role.id },
            },
          },
          include: {
            user_roles: { include: { roles: true } },
          },
        });

        return tx.users.findUnique({
          where: { id: newUser.id },
          include: {
            user_roles: { include: { roles: true } },
            loyalty_program: { include: { levels: true } },
          },
        });
      },
    );

    return sanitizeUserData(user);
  }

  async findOne(id: number) {
    const user = await this.prismaService.users.findFirst({
      where: { id, isDeleted: false },
      include: {
        user_roles: { include: { roles: true } },
        loyalty_program: { include: { levels: true } },
      },
    });

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    return sanitizeUserData(user);
  }

  async listRoles() {
    const roles = await this.prismaService.roles.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
      select: { id: true, name: true, description: true },
    });
    return roles;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { firstName, lastName, phoneNumber, dateOfBirth, gender, country } =
      updateUserDto;

    const dob = dateOfBirth ? new Date(dateOfBirth) : undefined;

    const newUser = await this.prismaService.users.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth: dob,
        gender,
        country,
      },
      include: {
        user_roles: { include: { roles: true } },
        loyalty_program: { include: { levels: true } },
      },
    });

    console.log({ newUser });

    return sanitizeUserData(newUser);
  }

  async adminUpdate(id: number, updateUserAdminDto: UpdateUserAdminDto) {
    const {
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
      gender,
      country,
      roleName,
      isActive,
    } = updateUserAdminDto;

    const dob = dateOfBirth ? new Date(dateOfBirth) : undefined;

    const [user, role] = await Promise.all([
      this.prismaService.users.findFirst({
        where: { id, isDeleted: false },
        include: { loyalty_program: true },
      }),
      this.prismaService.roles.findUnique({
        where: { name: roleName },
      }),
    ]);

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    if (!role) {
      throw new BadRequestException(`Vai trò '${roleName}' không tồn tại`);
    }

    const newUser = await this.prismaService.users.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth: dob,
        gender,
        country,
        isActive,
        user_roles: {
          deleteMany: {},
          create: { roleId: role.id },
        },
      },
      include: {
        user_roles: { include: { roles: true } },
        loyalty_program: { include: { levels: true } },
      },
    });

    return sanitizeUserData(newUser);
  }

  async delete(id: number) {
    const userExist = await this.prismaService.users.findFirst({
      where: { id, isDeleted: false },
      select: { id: true, email: true },
    });

    if (!userExist) {
      throw new BadRequestException('Người dùng không tồn tại hoặc đã bị xoá');
    }

    await this.prismaService.users.update({
      where: { id },
      data: {
        isDeleted: true,
        email: `${userExist.email}__deleted_${userExist.id}`,
        deletedAt: new Date(),
      },
    });

    return { message: 'Xoá người dùng thành công' };
  }

  async avatarLocal(id: number, file: Express.Multer.File) {
    if (!file || !file.filename) {
      throw new BadRequestException('Không có file được upload');
    }
    const user = await this.prismaService.users.findFirst({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    if (user.avatar) {
      const oldFilePath = path.join('./', 'public/images/avatar', user.avatar);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }
    await this.prismaService.users.update({
      where: { id },
      data: { avatar: file.filename },
    });

    return {
      message: 'Upload ảnh phòng thành công',
      filename: file.filename,
      imgUrl: `http://localhost:${PORT}/public/images/avatar/${file.filename}`,
    };
  }

  async avatarCloudinary(id: number, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Không có file được upload');
    }

    const user = await this.prismaService.users.findFirst({
      where: { id, isDeleted: false },
    });

    if (!user) throw new BadRequestException('Người dùng không tồn tại');

    if (user.avatar) await this.cloudinaryService.deleteImage(user.avatar);

    const uploadResult: any = await this.cloudinaryService.uploadImage(
      file.buffer,
      'avatars',
    );

    await this.prismaService.users.update({
      where: { id },
      data: { avatar: uploadResult.public_id },
    });

    return {
      message: 'Upload avatar thành công',
      filename: uploadResult.public_id,
      imgUrl: uploadResult.secure_url,
    };
  }
}
