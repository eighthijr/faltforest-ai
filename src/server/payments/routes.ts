import crypto from 'crypto';
import {
  adminDecideManualPayment,
  createManualQrisPayment,
  createTripayQrisPayment,
  markManualWaitingConfirmation,
  processTripayWebhook,
  verifyTripayWebhookSignature,
} from './service';
import type { TripayWebhookPayload } from './types';
import { getIdempotentResponse, saveIdempotentResponse } from '../common/idempotency';
import { AppError, toHttpError } from '../common/errors';
import { logEvent } from '../common/logger';

type HttpRequest = {
  body: unknown;
  rawBody?: string;
  headers: Record<string, string | undefined>;
  user?: { id: string; role?: string };
};

type HttpResponse = {
  status: number;
  body: unknown;
};

function ok(body: unknown): HttpResponse {
  return { status: 200, body };
}

function badRequest(message: string): HttpResponse {
  return { status: 400, body: { message } };
}

function requireUser(req: HttpRequest) {
  if (!req.user?.id) throw new AppError('UNAUTHORIZED', 'Unauthorized', 401);
  return req.user;
}

function requireAdmin(req: HttpRequest) {
  const user = requireUser(req);
  if (user.role !== 'admin') throw new AppError('FORBIDDEN', 'Admin only', 403);
  return user;
}

function buildRequestHash(payload: unknown) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export async function postManualQrisCreate(req: HttpRequest): Promise<HttpResponse> {
  try {
    const user = requireUser(req);
    const { projectId, reference, amount } = req.body as {
      projectId?: string;
      reference?: string;
      amount?: number;
    };

    if (!projectId || !reference || !amount) return badRequest('projectId, reference, amount wajib diisi.');

    const idempotencyKey = req.headers['x-idempotency-key'] ?? null;
    const requestHash = buildRequestHash({ projectId, reference, amount, userId: user.id });

    const cached = await getIdempotentResponse('payment:manual:create', idempotencyKey);
    if (cached?.response) {
      return ok({ payment: cached.response, idempotent: true });
    }

    const payment = await createManualQrisPayment({
      userId: user.id,
      projectId,
      reference,
      amount,
    });

    await saveIdempotentResponse('payment:manual:create', idempotencyKey, requestHash, payment);

    return ok({ payment, idempotent: false });
  } catch (error) {
    return toHttpError(error);
  }
}

export async function postManualQrisAlreadyPaid(req: HttpRequest): Promise<HttpResponse> {
  try {
    const user = requireUser(req);
    const { reference } = req.body as { reference?: string };

    if (!reference) return badRequest('reference wajib diisi.');

    const payment = await markManualWaitingConfirmation({
      userId: user.id,
      reference,
    });

    return ok({ payment });
  } catch (error) {
    return toHttpError(error);
  }
}

export async function postManualQrisAdminDecision(req: HttpRequest): Promise<HttpResponse> {
  try {
    const admin = requireAdmin(req);
    const { reference, approve } = req.body as { reference?: string; approve?: boolean };

    if (!reference || typeof approve !== 'boolean') {
      return badRequest('reference dan approve(boolean) wajib diisi.');
    }

    const payment = await adminDecideManualPayment({
      adminId: admin.id,
      reference,
      approve,
    });

    return ok({ payment });
  } catch (error) {
    return toHttpError(error);
  }
}

export async function postTripayQrisCreate(req: HttpRequest): Promise<HttpResponse> {
  try {
    const user = requireUser(req);
    const { projectId, reference, amount } = req.body as {
      projectId?: string;
      reference?: string;
      amount?: number;
    };

    if (!projectId || !reference || !amount) return badRequest('projectId, reference, amount wajib diisi.');

    const idempotencyKey = req.headers['x-idempotency-key'] ?? null;
    const requestHash = buildRequestHash({ projectId, reference, amount, userId: user.id });

    const cached = await getIdempotentResponse('payment:tripay:create', idempotencyKey);
    if (cached?.response) {
      return ok({ ...(cached.response as Record<string, unknown>), idempotent: true });
    }

    const transaction = await createTripayQrisPayment({
      userId: user.id,
      projectId,
      reference,
      amount,
    });

    await saveIdempotentResponse('payment:tripay:create', idempotencyKey, requestHash, transaction as Record<string, unknown>);

    return ok({ ...transaction, idempotent: false });
  } catch (error) {
    return toHttpError(error);
  }
}

export async function postTripayWebhook(req: HttpRequest): Promise<HttpResponse> {
  try {
    const signature = req.headers['x-callback-signature'] ?? null;
    const eventId = req.headers['x-callback-event'] ?? `tripay-${Date.now()}`;
    const rawBody = req.rawBody ?? JSON.stringify(req.body);

    if (!verifyTripayWebhookSignature(rawBody, signature)) {
      throw new AppError('INVALID_SIGNATURE', 'Invalid signature', 403);
    }

    const payload = req.body as TripayWebhookPayload;
    if (!payload?.merchant_ref || !payload?.status || !payload?.reference) {
      return badRequest('Payload webhook tidak valid.');
    }

    const payment = await processTripayWebhook(payload, eventId);
    return ok({ payment, idempotentEventId: eventId });
  } catch (error) {
    logEvent('error', 'webhook_failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
    return toHttpError(error);
  }
}
