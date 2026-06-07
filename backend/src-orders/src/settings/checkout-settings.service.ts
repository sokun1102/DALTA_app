import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export type CheckoutSettings = {
  paymentMethods: {
    cod: boolean;
    card: boolean;
    bank_transfer: boolean;
  };
  shippingFees: {
    standard: number;
    express: number;
  };
  taxRate: number;
  bankTransfer: {
    bankName: string;
    bankFullName: string;
    bankBin: string;
    accountNumber: string;
    accountName: string;
  };
};

@Injectable()
export class CheckoutSettingsService {
  private readonly storagePath = join(process.cwd(), 'uploads', 'cms', 'checkout-settings.json');

  constructor(private readonly configService: ConfigService) {}

  getSettings(): CheckoutSettings {
    this.ensureStorage();
    try {
      const parsed = JSON.parse(readFileSync(this.storagePath, 'utf8'));
      return this.mergeSettings(parsed);
    } catch {
      const settings = this.defaultSettings();
      this.writeSettings(settings);
      return settings;
    }
  }

  updateSettings(input: Partial<CheckoutSettings>): CheckoutSettings {
    const current = this.getSettings();
    const next = this.mergeSettings({
      ...current,
      ...input,
      paymentMethods: {
        ...current.paymentMethods,
        ...(input.paymentMethods || {}),
      },
      shippingFees: {
        ...current.shippingFees,
        ...(input.shippingFees || {}),
      },
      bankTransfer: {
        ...current.bankTransfer,
        ...(input.bankTransfer || {}),
      },
    });
    this.writeSettings(next);
    return next;
  }

  isPaymentEnabled(method: string): boolean {
    const settings = this.getSettings();
    return Boolean(settings.paymentMethods[method]);
  }

  getShippingFee(method: string): number {
    const settings = this.getSettings();
    return method === 'express' ? settings.shippingFees.express : settings.shippingFees.standard;
  }

  getTax(subtotal: number): number {
    return Math.round(subtotal * this.getSettings().taxRate);
  }

  private mergeSettings(input: any): CheckoutSettings {
    const fallback = this.defaultSettings();
    return {
      paymentMethods: {
        cod: input?.paymentMethods?.cod !== false,
        card: input?.paymentMethods?.card !== false,
        bank_transfer: input?.paymentMethods?.bank_transfer !== false,
      },
      shippingFees: {
        standard: Number(input?.shippingFees?.standard ?? fallback.shippingFees.standard),
        express: Number(input?.shippingFees?.express ?? fallback.shippingFees.express),
      },
      taxRate: Number(input?.taxRate ?? fallback.taxRate),
      bankTransfer: {
        bankName: input?.bankTransfer?.bankName || fallback.bankTransfer.bankName,
        bankFullName: input?.bankTransfer?.bankFullName || fallback.bankTransfer.bankFullName,
        bankBin: input?.bankTransfer?.bankBin || fallback.bankTransfer.bankBin,
        accountNumber: input?.bankTransfer?.accountNumber || fallback.bankTransfer.accountNumber,
        accountName: input?.bankTransfer?.accountName || fallback.bankTransfer.accountName,
      },
    };
  }

  private defaultSettings(): CheckoutSettings {
    return {
      paymentMethods: {
        cod: true,
        card: true,
        bank_transfer: true,
      },
      shippingFees: {
        standard: 30000,
        express: 60000,
      },
      taxRate: 0.08,
      bankTransfer: {
        bankName: this.configService.get<string>('BANK_TRANSFER_BANK_NAME') || 'BIDV',
        bankFullName:
          this.configService.get<string>('BANK_TRANSFER_BANK_FULL_NAME') ||
          'Ngân hàng TMCP Đầu tư & Phát triển Việt Nam',
        bankBin: this.configService.get<string>('BANK_TRANSFER_BANK_BIN') || '970418',
        accountNumber:
          this.configService.get<string>('BANK_TRANSFER_ACCOUNT_NUMBER') || '1303108973',
        accountName:
          this.configService.get<string>('BANK_TRANSFER_ACCOUNT_NAME') || 'DANG NHUT TRUONG',
      },
    };
  }

  private writeSettings(settings: CheckoutSettings) {
    this.ensureStorage();
    writeFileSync(this.storagePath, JSON.stringify(settings, null, 2), 'utf8');
  }

  private ensureStorage() {
    mkdirSync(join(process.cwd(), 'uploads', 'cms'), { recursive: true });
  }
}
