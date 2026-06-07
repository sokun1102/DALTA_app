import { Injectable } from '@nestjs/common';

type VoucherContext = {
  subtotal: number;
  shippingFee: number;
};

@Injectable()
export class VoucherService {
  quote(voucherCode: string | undefined, context: VoucherContext) {
    const code = voucherCode?.trim().toUpperCase();
    if (!code) return { voucherCode: null, discount: 0 };

    const rules: Record<string, () => number> = {
      AEROTEC10: () => Math.round(context.subtotal * 0.1),
      DALTA10: () => Math.round(context.subtotal * 0.1),
      FREESHIP: () => context.shippingFee,
    };

    return {
      voucherCode: code,
      discount: rules[code]?.() ?? 0,
    };
  }
}
