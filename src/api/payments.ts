export type PaymentStatus = 'pending' | 'waiting_confirmation' | 'success' | 'rejected';
export type PaymentGateway = 'manual_qris' | 'tripay_qris';

export type PaymentHistoryItem = {
  id: string;
  project_id: string;
  reference: string;
  amount: number;
  gateway: PaymentGateway;
  status: PaymentStatus;
  created_at: string;
  confirmed_at: string | null;
};

export async function listPaymentHistory(): Promise<PaymentHistoryItem[]> {
  const response = await fetch('/api/payments/history', { cache: 'no-store' });
  const payload = (await response.json().catch(() => null)) as { payments?: PaymentHistoryItem[]; message?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? 'Gagal memuat histori pembayaran.');
  }

  return payload?.payments ?? [];
}

export async function fetchManualQrisImageUrl(): Promise<string> {
  const response = await fetch('/api/payments/manual/qris-image', { cache: 'no-store' });
  const payload = (await response.json().catch(() => null)) as { imageUrl?: string; message?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? 'Gagal memuat gambar QRIS manual.');
  }

  return payload?.imageUrl ?? '';
}

export async function submitManualPaymentProof(input: { projectId: string; file: File }): Promise<{ reference: string; proofUrl: string }> {
  const formData = new FormData();
  formData.append('projectId', input.projectId);
  formData.append('file', input.file);

  const response = await fetch('/api/payments/manual/submit-proof', {
    method: 'POST',
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as { reference?: string; proofUrl?: string; message?: string } | null;

  if (!response.ok || !payload?.reference) {
    throw new Error(payload?.message ?? 'Gagal mengirim bukti pembayaran.');
  }

  return { reference: payload.reference, proofUrl: payload.proofUrl ?? '' };
}

export async function confirmManualAlreadyPaid(input: { projectId: string; amount: number; reference: string }) {
  const createResponse = await fetch('/api/payments/manual/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  const createPayload = (await createResponse.json().catch(() => null)) as { message?: string } | null;

  if (!createResponse.ok) {
    throw new Error(createPayload?.message ?? 'Gagal membuat data pembayaran manual.');
  }

  const markResponse = await fetch('/api/payments/manual/already-paid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference: input.reference }),
  });

  const markPayload = (await markResponse.json().catch(() => null)) as { message?: string } | null;

  if (!markResponse.ok) {
    throw new Error(markPayload?.message ?? 'Gagal mengirim konfirmasi pembayaran manual.');
  }
}
