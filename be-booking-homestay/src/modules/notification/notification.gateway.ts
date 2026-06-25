import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ACCESS_TOKEN_SECRET } from 'src/common/constant/app.constant';

@WebSocketGateway({ namespace: '/notifications', cors: true })
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private logger = new Logger('NotificationGateway');

    constructor(private readonly jwtService: JwtService) { }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
        try {
            const token = client.handshake.auth?.token;
            if (!token) {
                client.disconnect();
                return;
            }
            const payload: any = this.jwtService.verify(token, {
                secret: ACCESS_TOKEN_SECRET as string,
            });
            const uid =
                payload?.userId ||
                payload?.user_id ||
                payload?.id ||
                payload?.sub;
            if (!uid) {
                client.disconnect();
                return;
            }
            const room = `user_${uid}`;
            client.join(room);
            this.logger.log(`Client ${client.id} auto-joined ${room}`);
            // attach to client data for convenience
            (client as any).data = { userId: uid };
        } catch (err) {
            this.logger.debug(`Socket auth failed for client ${client.id}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join')
    handleJoin(client: Socket, payload: { userId: number }) {
        try {
            const authUserId = (client as any)?.data?.userId;
            if (!authUserId) return { ok: false };
            if (payload?.userId && Number(payload.userId) !== Number(authUserId)) {
                return { ok: false };
            }
            const room = `user_${authUserId}`;
            client.join(room);
            this.logger.log(`Client ${client.id} joined ${room}`);
            return { ok: true };
        } catch (err) {
            this.logger.error('Join error', err);
            return { ok: false };
        }
    }

    emitToUser(userId: number, event: string, payload: any) {
        const room = `user_${userId}`;
        this.server.to(room).emit(event, payload);
    }
}
