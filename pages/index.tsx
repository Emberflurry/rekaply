import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabase';
import Auth from '../components/Auth';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session);
        router.push('/dashboard');
      }
    });

    // Subscribe to future auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) router.push('/dashboard');
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      {!session && <Auth />}
    </main>
  );
}
