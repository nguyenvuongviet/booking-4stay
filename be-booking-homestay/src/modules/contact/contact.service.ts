import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) { }

  async createContact(createContactDto: CreateContactDto) {
    try {
      this.logger.log(
        `Creating contact request for ${createContactDto.email} (userId=${createContactDto.userId ?? 'guest'})`,
      );

      const newContact = await this.prisma.contacts.create({
        data: {
          fullName: createContactDto.fullName,
          email: createContactDto.email,
          message: createContactDto.message,
          userId: createContactDto.userId || null,
        },
      });

      const admins = await this.prisma.users.findMany({
        where: {
          isDeleted: false,
          user_roles: {
            some: {
              roles: {
                name: 'ADMIN',
              },
            },
          },
        },
        select: {
          email: true,
        },
      });

      const adminEmails = Array.from(
        new Set(
          admins
            .map((admin) => admin.email?.trim())
            .filter((email): email is string => Boolean(email)),
        ),
      );

      if (adminEmails.length === 0) {
        adminEmails.push(process.env.ADMIN_EMAIL || 'thaolythly@gmail.com');
      }

      this.logger.log(
        `Contact #${newContact.id} saved. Sending support email to ${adminEmails.length} admin(s): ${adminEmails.join(', ')}`,
      );

      adminEmails.forEach((adminEmail) => {
        this.mailService.sendSupportMail(adminEmail, createContactDto)
          .then(() => {
            this.logger.log(
              `Support email for contact #${newContact.id} sent to ${adminEmail}`,
            );
          })
          .catch((err: unknown) => {
            const message =
              err instanceof Error ? err.stack ?? err.message : String(err);
            this.logger.error(
              `Failed to send support email for contact #${newContact.id} to ${adminEmail}`,
              message,
            );
          });
      });

      return {
        message: 'Gui yeu cau ho tro thanh cong',
        data: newContact,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.stack ?? error.message : String(error);
      this.logger.error(
        `Failed to create contact request for ${createContactDto.email}`,
        message,
      );
      throw new InternalServerErrorException(
        'Khong the gui yeu cau ho tro luc nay',
      );
    }
  }

  async getAdminInfo() {
    const admin = await this.prisma.users.findFirst({
      where: {
        isDeleted: false,
        user_roles: {
          some: {
            roles: {
              name: 'ADMIN',
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    return {
      data: admin,
    };
  }
}
