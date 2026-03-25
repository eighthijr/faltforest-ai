import {
  adminDecideManualPayment,
  createManualQrisPayment,
  createTripayQrisPayment,
  markManualWaitingConfirmation,
  processTripayWebhook,
  verifyTripayWebhookSignature,
} from './service';
import type { TripayWebhookPayload } from './types';

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

function forbidden(message: string): HttpResponse {
  return { status: 403, body: { message } };
}

function unauthorized(message: string): HttpResponse {
  return { status: 401, body: { message } };
}

function serverError(error: unknown): HttpResponse {
  return { status: 500, body: { message: error instanceof Error ? error.message : 'Internal server error' } };
}

function requireUser(req: HttpRequest) {
  if (!req.user?.id) throw new Error('Unauthorized');
  return req.user;
}

function requireAdmin(req: HttpRequest) {
  const user = requireUser(req);
  if (user.role !== 'admin') throw new Error('Forbidden');
  return user;
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

    const payment = await createManualQrisPayment({
      userId: user.id,
      projectId,
      reference,
      amount,
    });

    return ok({ payment });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') return unauthorized('Unauthorized');
    return serverError(error);
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
    if (error instanceof Error && error.message === 'Unauthorized') return unauthorized('Unauthorized');
    return serverError(error);
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
    if (error instanceof Error && error.message === 'Unauthorized') return unauthorized('Unauthorized');
    if (error instanceof Error && error.message === 'Forbidden') return forbidden('Admin only');
    return serverError(error);
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

    const transaction = await createTripayQrisPayment({
      userId: user.id,
      projectId,
      reference,
      amount,
    });

    return ok(transaction);
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') return unauthorized('Unauthorized');
    return serverError(error);
  }
}

export async function postTripayWebhook(req: HttpRequest): Promise<HttpResponse> {
  try {
    const signature = req.headers['x-callback-signature'] ?? null;
    const eventId = req.headers['x-callback-event'] ?? `tripay-${Date.now()}`;
    const rawBody = req.rawBody ?? JSON.stringify(req.body);

    if (!verifyTripayWebhookSignature(rawBody, signature)) {
      return forbidden('Invalid signature');
    }

    const payload = req.body as TripayWebhookPayload;
    if (!payload?.merchant_ref || !payload?.status || !payload?.reference) {
      return badRequest('Payload webhook tidak valid.');
    }

    const payment = await processTripayWebhook(payload, eventId);
    return ok({ payment, idempotentEventId: eventId });
  } catch (error) {
    return serverError(error);
  }
}
