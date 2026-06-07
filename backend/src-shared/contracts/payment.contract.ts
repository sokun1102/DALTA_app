export type StripeCheckoutOrderContract = {
  id: number;
  orderNumber: string;
  userId: number;
  shippingFee: number;
  tax: number;
};

export type StripeCheckoutItemContract = {
  productName: string;
  productImage?: string | null;
  price: number;
  quantity: number;
};

export type CreateStripeCheckoutContract = {
  order: StripeCheckoutOrderContract;
  items: StripeCheckoutItemContract[];
};

export type StripeCheckoutResponseContract = {
  id: string;
  url: string | null;
};

export type StripeCheckoutCompletedContract = {
  sessionId: string;
  paymentIntentId?: string | null;
};
