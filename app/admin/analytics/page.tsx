'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LegacyAdminAnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/analytics');
  }, [router]);

  return <main className="px-4 py-10 text-sm text-slate-600">Mengalihkan ke dashboard analytics...</main>;
}
