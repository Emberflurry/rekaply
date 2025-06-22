import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
// pages/index.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabase';
import Auth from '../components/Auth';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const currentSession = supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        router.push('/dashboard');
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) router.push('/dashboard');
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div>
      {!session && <Auth />}
    </div>
  );
}
