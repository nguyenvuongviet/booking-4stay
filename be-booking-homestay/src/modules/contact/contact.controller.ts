import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorator/public.decorator';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@ApiTags('contact')
@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Gui yeu cau ho tro (Public)' })
  createContact(@Body() createContactDto: CreateContactDto, @Req() req: any) {
    if (req.user && req.user.userId) {
      createContactDto.userId = req.user.userId;
    }

    return this.contactService.createContact(createContactDto);
  }

  @Get('admin-info')
  @Public()
  @ApiOperation({ summary: 'Lay thong tin admin de lien he' })
  getAdminInfo() {
    return this.contactService.getAdminInfo();
  }
}
