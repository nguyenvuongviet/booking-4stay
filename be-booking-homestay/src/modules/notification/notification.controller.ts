import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetNotificationsDto } from './dto/get-notifications.dto';
import { MarkReadDto } from './dto/mark-read.dto';
import { NotificationService } from './notification.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
    constructor(private readonly service: NotificationService) { }

    @Get()
    @ApiBearerAuth('AccessToken')
    async list(@Req() req: Request, @Query() q: GetNotificationsDto) {
        const user = req['user'];
        return this.service.findForUserCursor(+user.id, {
            page: q?.page ?? 1,
            pageSize: q?.pageSize ?? 20,
            cursor: q?.cursor,
            limit: q?.limit,
        });
    }

    @Post('/mark-read')
    @ApiBearerAuth('AccessToken')
    async markRead(@Req() req: Request, @Body() dto: MarkReadDto) {
        const user = req['user'];
        return this.service.markRead(+user.id, dto.ids || []);
    }

    @Post('/mark-all-read')
    @ApiBearerAuth('AccessToken')
    async markAllRead(@Req() req: Request) {
        const user = req['user'];
        return this.service.markAllRead(+user.id);
    }
}
