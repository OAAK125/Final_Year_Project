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

  // in your dashboard page
useEffect(() => {
  const verifyPayment = async () => {
    const reference = new URLSearchParams(window.location.search).get("reference");
    if (!reference) return;

    const res = await fetch("/api/paystack/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    });

    const data = await res.json();
    if (data.status === "success") {
      // subscription updated in DB
      alert("Payment successful! Your subscription is now active.");
    } else {
      alert("Payment verification failed.");
    }
  };

  verifyPayment();
}, []);


  return <DashboardHome />;
}

