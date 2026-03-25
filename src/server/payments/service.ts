import crypto from 'crypto';
import { supabase } from '../../lib/supabaseClient';
import type { PaymentRecord, TripayWebhookPayload } from './types';

function requireValue(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

function mapRecord(data: unknown): PaymentRecord {
  return data as PaymentRecord;
}

export async function createManualQrisPayment(input: {
  userId: string;
  projectId: string;
  reference: string;
  amount: number;
}) {
  const { data, error } = await supabase.rpc('create_manual_qris_payment', {
    p_user_id: input.userId,
    p_project_id: input.projectId,
    p_reference: input.reference,
    p_amount: input.amount,
  });

  if (error) throw new Error(error.message);
  return mapRecord(data);
}

export async function markManualWaitingConfirmation(input: { userId: string; reference: string }) {
  const { data, error } = await supabase.rpc('mark_manual_payment_waiting_confirmation', {
    p_user_id: input.userId,
    p_reference: input.reference,
  });

  if (error) throw new Error(error.message);
  return mapRecord(data);
}

export async function adminDecideManualPayment(input: {
  adminId: string;
  reference: string;
  approve: boolean;
}) {
  const { data, error } = await supabase.rpc('admin_decide_manual_payment', {
    p_admin_id: input.adminId,
    p_reference: input.reference,
    p_approve: input.approve,
  });

  if (error) throw new Error(error.message);
  return mapRecord(data);
}

export async function createTripayQrisPayment(input: {
  userId: string;
  projectId: string;
  reference: string;
  amount: number;
}) {
  const tripayApiKey = requireValue(process.env.TRIPAY_API_KEY, 'TRIPAY_API_KEY');
  const tripayMerchantCode = requireValue(process.env.TRIPAY_MERCHANT_CODE, 'TRIPAY_MERCHANT_CODE');
  const callbackUrl = requireValue(process.env.TRIPAY_CALLBACK_URL, 'TRIPAY_CALLBACK_URL');

  const payload = {
    method: 'QRIS',
    merchant_ref: input.reference,
    amount: input.amount,
    customer_name: 'User',
    customer_email: 'user@example.com',
    order_items: [{ name: 'Project Upgrade', price: input.amount, quantity: 1 }],
    return_url: callbackUrl,
    expired_time: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
    signature: crypto
      .createHmac('sha256', tripayApiKey)
      .update(`${tripayMerchantCode}${input.reference}${input.amount}`)
      .digest('hex'),
  };

  const response = await fetch('https://tripay.co.id/api-sandbox/transaction/create', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tripayApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Tripay create transaction failed: ${response.status}`);
  }

  const json = await response.json();
  const gatewayRef = json?.data?.reference as string | undefined;
  if (!gatewayRef) throw new Error('Tripay response missing reference');

  const { data, error } = await supabase.rpc('create_tripay_qris_payment', {
    p_user_id: input.userId,
    p_project_id: input.projectId,
    p_reference: input.reference,
    p_amount: input.amount,
    p_gateway_ref: gatewayRef,
  });

  if (error) throw new Error(error.message);

  return {
    payment: mapRecord(data),
    checkoutUrl: json?.data?.checkout_url as string,
    qrUrl: json?.data?.qr_url as string | undefined,
  };
}

export function verifyTripayWebhookSignature(rawBody: string, incomingSignature: string | null): boolean {
  const privateKey = requireValue(process.env.TRIPAY_PRIVATE_KEY, 'TRIPAY_PRIVATE_KEY');
  if (!incomingSignature) return false;

  const calculated = crypto.createHmac('sha256', privateKey).update(rawBody).digest('hex');
  return calculated === incomingSignature;
}

export async function processTripayWebhook(payload: TripayWebhookPayload, eventId: string) {
  const { data, error } = await supabase.rpc('process_tripay_webhook', {
    p_event_id: eventId,
    p_reference: payload.merchant_ref,
    p_gateway_ref: payload.reference,
    p_tripay_status: payload.status,
    p_payload: payload,
  });

  if (error) throw new Error(error.message);
  return mapRecord(data);
}
