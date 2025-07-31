'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import DashboardHome from './home/page';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/authentication/login');
      }
    };

    checkSession();
  }, [router, supabase]);

  return <DashboardHome />;
}

