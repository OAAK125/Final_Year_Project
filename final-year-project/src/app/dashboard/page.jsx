'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import DashboardHome from './home/page';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [subscription, setSubscription] = useState(null);

  // ✅ Check auth
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

  // ✅ Verify Paystack payment on redirect
  useEffect(() => {
    const verifyPayment = async () => {
      const reference = new URLSearchParams(window.location.search).get('reference');
      if (!reference) return;

      try {
        const res = await fetch('/api/paystack/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });

        const data = await res.json();
        if (data.status === 'success') {
          alert('🎉 Payment successful! Your subscription is now active.');

          // 🔑 Refresh subscription from Supabase
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            const { data: sub } = await supabase
              .from('subscriptions')
              .select('plan_id, certification_id, status, plans(name)')
              .eq('user_id', user.id)
              .maybeSingle();

            setSubscription(sub || null);
          }
        } else {
          alert('Payment verification failed.');
        }
      } catch (err) {
        console.error('Verify error:', err);
        alert('An error occurred verifying your payment.');
      }
    };

    verifyPayment();
  }, [supabase]);

  return <DashboardHome subscription={subscription} />;
}
