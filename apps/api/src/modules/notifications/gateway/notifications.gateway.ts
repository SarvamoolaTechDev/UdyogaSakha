import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

/**
 * WebSocket gateway for real-time in-app notifications.
 *
 * Connection flow:
 *  1. Client connects with JWT in handshake auth: { auth: { token: 'Bearer ...' } }
 *  2. Gateway validates JWT, extracts userId
 *  3. Client joins their personal room: `user:{userId}`
 *  4. Server pushes notification events to that room
 *
 * Client usage:
 *  const socket = io('http://localhost:3001', { auth: { token: `Bearer ${accessToken}` } });
 *  socket.on('notification', (data) => console.log(data));
 */
@WebSocketGateway({
  cors: { origin: '*' },  // tighten in production via AppConfigService
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  // userId → Set of socketIds (one user can have multiple tabs/devices)
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = (client.handshake.auth?.token as string)?.replace('Bearer ', '');
      if (!token) throw new Error('No token');

      const payload = this.jwtService.verify(token);
      const userId: string = payload.sub;

      // Tag socket with userId for later lookup
      client.data.userId = userId;

      // Join personal room
      client.join(`user:${userId}`);

      // Track connection
      if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
      this.userSockets.get(userId)!.add(client.id);

      this.logger.debug(`Client connected: ${client.id} → user ${userId}`);
    } catch {
      this.logger.warn(`Unauthenticated WS connection rejected: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId as string | undefined;
    if (userId) {
      this.userSockets.get(userId)?.delete(client.id);
      if (this.userSockets.get(userId)?.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  /** Push a notification to a specific user across all their connected clients */
  pushToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  /** Push a notification payload to a user */
  pushNotification(userId: string, payload: {
    subject?: string;
    body: string;
    data?: Record<string, unknown>;
  }) {
    this.pushToUser(userId, 'notification', {
      ...payload,
      timestamp: new Date().toISOString(),
    });
  }

  /** Client can mark notifications as read */
  @SubscribeMessage('mark_read')
  handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    this.logger.debug(`User ${client.data.userId} marked notification ${data.notificationId} read`);
    // TODO: persist to notifications table when added to schema
    return { status: 'ok' };
  }

  /** Returns count of connected unique users — useful for monitoring */
  getConnectedUserCount(): number {
    return this.userSockets.size;
  }
}
