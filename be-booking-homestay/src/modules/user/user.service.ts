import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { sanitizeUserData } from 'src/common/helpers/sanitize-user.helpers';
import { buildUserWhereClause } from 'src/common/helpers/user-query.helper';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { PORT } from 'src/common/constant/app.constant';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

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
        roles: true,
        loyalty_program: true,
      },
    });
    return sanitizeUserData(users);
  }

  async findAllFiltered(filterDto: UserFilterDto) {
    const { page = 1, pageSize = 10 } = filterDto;
    const skip = (page - 1) * pageSize;

    const where = buildUserWhereClause(filterDto);

    const [totalItems, users] = await Promise.all([
      this.prismaService.users.count({ where }),
      this.prismaService.users.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        where,
        include: {
          roles: true,
          loyalty_program: true,
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
      loyaltyLevel,
    } = createUserDto;

    const [role, salt, userExist] = await Promise.all([
      this.prismaService.roles.findUnique({ where: { name: roleName } }),
      bcrypt.genSalt(10),
      this.prismaService.users.findUnique({ where: { email } }),
    ]);

    if (!role) {
      throw new BadRequestException(`Vai trò '${roleName}' không tồn tại`);
    }

    if (userExist) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.prismaService.users.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        country,
        roleId: role.id,
        isVerified: true,
        isActive: true,
        loyalty_program: loyaltyLevel
          ? {
              create: {
                level: loyaltyLevel,
                totalBookings: 0,
                totalNights: 0,
                points: 0,
              },
            }
          : undefined,
      },
      include: {
        roles: true,
        loyalty_program: true,
      },
    });

    return sanitizeUserData(user);
  }

  async findOne(id: number) {
    const user = await this.prismaService.users.findFirst({
      where: { id, isDeleted: false },
      include: {
        roles: true,
        loyalty_program: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    return sanitizeUserData(user);
  }

  async listRoles() {
    const roles = await this.prismaService.roles.findMany({
      orderBy: { id: 'asc' },
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
        roles: true,
        loyalty_program: true,
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
      loyaltyLevel,
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
        roleId: role.id,
        isActive,
        loyalty_program: loyaltyLevel
          ? {
              update: { level: loyaltyLevel },
            }
          : user.loyalty_program
            ? {
                update: { level: user.loyalty_program.level },
              }
            : {
                create: {
                  level: 'BRONZE',
                  totalBookings: 0,
                  totalNights: 0,
                  points: 0,
                },
              },
      },
      include: {
        roles: true,
        loyalty_program: true,
      },
    });

    console.log({ newUser });
    return sanitizeUserData(newUser);
  }

  async delete(id: number) {
    const user = await this.prismaService.users.update({
      where: { id },
      data: { isDeleted: true },
      select: { id: true, isDeleted: true },
    });

    if (!user || user.isDeleted === false) {
      throw new BadRequestException('Người dùng không tồn tại hoặc đã bị xoá');
    }

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
