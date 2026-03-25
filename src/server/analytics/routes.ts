import { getAnalyticsDashboard, getDailyMetrics, getFunnel, getTotalUsers, trackEvent } from './service';
import type { TrackedEventName } from './types';

type HttpRequest = {
  body?: unknown;
  query?: Record<string, string | undefined>;
  user?: { id?: string; role?: string };
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

function serverError(error: unknown): HttpResponse {
  return { status: 500, body: { message: error instanceof Error ? error.message : 'Internal server error' } };
}

function requireAdmin(req: HttpRequest) {
  if (req.user?.role !== 'admin') throw new Error('FORBIDDEN');
}

function getDateRange(req: HttpRequest) {
  const from = req.query?.from;
  const to = req.query?.to;

  if (!from || !to) {
    throw new Error('from dan to wajib diisi (ISO timestamp).');
  }

  return { from, to };
}

export async function postTrackEvent(req: HttpRequest): Promise<HttpResponse> {
  try {
    const { eventName, metadata } = (req.body ?? {}) as {
      eventName?: TrackedEventName;
      metadata?: Record<string, unknown>;
    };

    if (!eventName) return badRequest('eventName wajib diisi.');

    await trackEvent({
      userId: req.user?.id ?? null,
      eventName,
      metadata,
    });

    return ok({ success: true });
  } catch (error) {
    return serverError(error);
  }
}

export async function getDashboard(req: HttpRequest): Promise<HttpResponse> {
  try {
    requireAdmin(req);
    const range = getDateRange(req);
    const dashboard = await getAnalyticsDashboard(range);
    return ok(dashboard);
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') return forbidden('Admin only');
    if (error instanceof Error && error.message.includes('wajib diisi')) return badRequest(error.message);
    return serverError(error);
  }
}

export async function getDashboardTotalUsers(req: HttpRequest): Promise<HttpResponse> {
  try {
    requireAdmin(req);
    const totalUsers = await getTotalUsers();
    return ok({ totalUsers });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') return forbidden('Admin only');
    return serverError(error);
  }
}

export async function getDashboardDailyMetrics(req: HttpRequest): Promise<HttpResponse> {
  try {
    requireAdmin(req);
    const range = getDateRange(req);
    const dailyMetrics = await getDailyMetrics(range);
    return ok({ dailyMetrics });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') return forbidden('Admin only');
    if (error instanceof Error && error.message.includes('wajib diisi')) return badRequest(error.message);
    return serverError(error);
  }
}

export async function getDashboardFunnel(req: HttpRequest): Promise<HttpResponse> {
  try {
    requireAdmin(req);
    const range = getDateRange(req);
    const funnel = await getFunnel(range);
    return ok({ funnel });
  } catch (error) {
    if (error instanceof Error && error.message === 'FORBIDDEN') return forbidden('Admin only');
    if (error instanceof Error && error.message.includes('wajib diisi')) return badRequest(error.message);
    return serverError(error);
  }
}
