// components/Auth.tsx
import { useState } from 'react';
import supabase from '../lib/supabase';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    setLoading(true);
    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-4 border rounded">
      <h2 className="text-xl font-bold mb-4">{isLogin ? 'Log In' : 'Sign Up'}</h2>
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 mb-2 border rounded"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 mb-4 border rounded"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleAuth}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
      >
        {loading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}
      </button>
      <p className="text-center mt-4 text-sm">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-600 underline"
        >
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </div>
  );
}
