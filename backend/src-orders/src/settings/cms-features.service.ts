import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import { join } from 'path';

export interface UserNotification {
  id: string;
  userId: number;
  title: string;
  message: string;
  type: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SupportRequest {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: number | null;
  userEmail: string | null;
  action: string;
  details: string;
  ip: string;
  timestamp: string;
  type?: 'SYSTEM' | 'ADMIN';
}

export interface MailLog {
  id: string;
  to: string;
  subject: string;
  status: 'SENT' | 'PENDING' | 'FAILED';
  error?: string;
  timestamp: string;
}

@Injectable()
export class CmsFeaturesService {
  private readonly logger = new Logger(CmsFeaturesService.name);
  private readonly storageDir = join(process.cwd(), 'uploads', 'cms');
  
  private readonly notificationsPath = join(this.storageDir, 'user-notifications.json');
  private readonly supportPath = join(this.storageDir, 'support-requests.json');
  private readonly auditLogsPath = join(this.storageDir, 'audit-logs.json');
  private readonly mailLogsPath = join(this.storageDir, 'mail-logs.json');

  private readonly notificationsServiceUrl: string;
  private readonly internalServiceKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.notificationsServiceUrl =
      this.configService.get<string>('NOTIFICATIONS_SERVICE_URL') || 'http://localhost:3007';
    this.internalServiceKey =
      this.configService.get<string>('INTERNAL_SERVICE_KEY') || 'local-dev-internal-key';
    
    this.ensureStorageExists();
  }

  private ensureStorageExists() {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  // --- USER NOTIFICATIONS ---
  
  private readNotifications(): UserNotification[] {
    this.ensureStorageExists();
    if (!fs.existsSync(this.notificationsPath)) {
      return [];
    }
    try {
      const data = fs.readFileSync(this.notificationsPath, 'utf8');
      return JSON.parse(data) || [];
    } catch {
      return [];
    }
  }

  private writeNotifications(list: UserNotification[]) {
    this.ensureStorageExists();
    fs.writeFileSync(this.notificationsPath, JSON.stringify(list, null, 2), 'utf8');
  }

  async getNotifications(userId: number): Promise<UserNotification[]> {
    const list = this.readNotifications();
    return list
      .filter((item) => item.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createNotification(
    userId: number,
    title: string,
    message: string,
    type: string,
    actionUrl?: string,
  ): Promise<UserNotification> {
    const list = this.readNotifications();
    const newNotif: UserNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      title,
      message,
      type,
      actionUrl,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    list.push(newNotif);
    this.writeNotifications(list);
    return newNotif;
  }

  async readNotification(userId: number, id: string): Promise<boolean> {
    const list = this.readNotifications();
    const item = list.find((n) => n.id === id && n.userId === userId);
    if (item) {
      item.isRead = true;
      this.writeNotifications(list);
      return true;
    }
    return false;
  }

  async readAllNotifications(userId: number): Promise<boolean> {
    const list = this.readNotifications();
    let updated = false;
    list.forEach((n) => {
      if (n.userId === userId && !n.isRead) {
        n.isRead = true;
        updated = true;
      }
    });
    if (updated) {
      this.writeNotifications(list);
    }
    return updated;
  }

  // --- SUPPORT REQUESTS ---

  private readSupportRequests(): SupportRequest[] {
    this.ensureStorageExists();
    if (!fs.existsSync(this.supportPath)) {
      return [];
    }
    try {
      const data = fs.readFileSync(this.supportPath, 'utf8');
      return JSON.parse(data) || [];
    } catch {
      return [];
    }
  }

  private writeSupportRequests(list: SupportRequest[]) {
    this.ensureStorageExists();
    fs.writeFileSync(this.supportPath, JSON.stringify(list, null, 2), 'utf8');
  }

  async createSupportRequest(
    fullName: string,
    email: string,
    subject: string,
    message: string,
  ): Promise<SupportRequest> {
    const list = this.readSupportRequests();
    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const newRequest: SupportRequest = {
      id: ticketId,
      fullName,
      email,
      subject,
      message,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };
    list.push(newRequest);
    this.writeSupportRequests(list);

    // Trigger SMTP email sending in the notification service asynchronously
    try {
      await this.httpService.axiosRef.post(
        `${this.notificationsServiceUrl}/notifications/email/support-ticket`,
        {
          fullName,
          email,
          subject,
          message,
          ticketId,
        },
        {
          headers: { 'x-internal-service-key': this.internalServiceKey },
        },
      );
    } catch (err) {
      this.logger.warn(`Could not dispatch support ticket email: ${err.message}`);
    }

    return newRequest;
  }

  async getSupportRequests(): Promise<SupportRequest[]> {
    const list = this.readSupportRequests();
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateSupportRequest(id: string, status: 'OPEN' | 'RESOLVED'): Promise<SupportRequest | null> {
    const list = this.readSupportRequests();
    const item = list.find((r) => r.id === id);
    if (item) {
      item.status = status;
      this.writeSupportRequests(list);
      return item;
    }
    return null;
  }

  // --- ADMIN AUDIT LOGS ---

  private readAuditLogs(): AuditLog[] {
    this.ensureStorageExists();
    if (!fs.existsSync(this.auditLogsPath)) {
      return [];
    }
    try {
      const data = fs.readFileSync(this.auditLogsPath, 'utf8');
      return JSON.parse(data) || [];
    } catch {
      return [];
    }
  }

  private writeAuditLogs(list: AuditLog[]) {
    this.ensureStorageExists();
    fs.writeFileSync(this.auditLogsPath, JSON.stringify(list.slice(0, 1000), null, 2), 'utf8'); // Limit to last 1000 entries
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    const list = this.readAuditLogs();
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async logAction(
    user: { userId: number; email: string } | null,
    action: string,
    details: string,
    ip: string = 'N/A',
    type: 'SYSTEM' | 'ADMIN' = 'SYSTEM',
  ): Promise<AuditLog> {
    const list = this.readAuditLogs();
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: user?.userId || null,
      userEmail: user?.email || null,
      action,
      details,
      ip,
      type,
      timestamp: new Date().toISOString(),
    };
    list.push(newLog);
    this.writeAuditLogs(list);
    return newLog;
  }

  // --- MAIL LOGS (EMAIL QUEUE) ---

  private readMailLogs(): MailLog[] {
    this.ensureStorageExists();
    if (!fs.existsSync(this.mailLogsPath)) {
      return [];
    }
    try {
      const data = fs.readFileSync(this.mailLogsPath, 'utf8');
      return JSON.parse(data) || [];
    } catch {
      return [];
    }
  }

  private writeMailLogs(list: MailLog[]) {
    this.ensureStorageExists();
    fs.writeFileSync(this.mailLogsPath, JSON.stringify(list.slice(0, 1000), null, 2), 'utf8'); // Limit to last 1000 entries
  }

  async getMailLogs(): Promise<MailLog[]> {
    const list = this.readMailLogs();
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async logMail(
    to: string,
    subject: string,
    status: 'SENT' | 'PENDING' | 'FAILED',
    error?: string,
  ): Promise<MailLog> {
    const list = this.readMailLogs();
    const newLog: MailLog = {
      id: `mail_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      to,
      subject,
      status,
      error,
      timestamp: new Date().toISOString(),
    };
    list.push(newLog);
    this.writeMailLogs(list);
    return newLog;
  }
}
