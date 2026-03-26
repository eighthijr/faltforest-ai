export type PaymentStatus = 'pending' | 'waiting_confirmation' | 'success' | 'rejected';

export type PaymentGateway = 'manual_qris' | 'tripay_qris';

export type PaymentRecord = {
  id: string;
  user_id: string;
  project_id: string;
  reference: string;
  amount: number;
  status: PaymentStatus;
  gateway: PaymentGateway;
  gateway_ref: string | null;
  proof_path: string | null;
  confirmed_by: string | null;
  confirmed_at: string | null;
};

export type TripayWebhookPayload = {
  merchant_ref: string;
  reference: string;
  status: 'UNPAID' | 'PAID' | 'EXPIRED' | 'FAILED';
  total_amount: number;
};
