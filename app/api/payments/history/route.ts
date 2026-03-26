import { NextRequest } from 'next/server';
import { toNextResponse, getRequestUser } from '@/server/next/http';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user?.id) return toNextResponse({ status: 401, body: { message: 'Unauthorized' } });

  const { data, error } = await supabase
    .from('payments')
    .select('id, project_id, reference, amount, gateway, status, created_at, confirmed_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return toNextResponse({ status: 500, body: { message: error.message } });
  }

  return toNextResponse({ status: 200, body: { payments: data ?? [] } });
}
