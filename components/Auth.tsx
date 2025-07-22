import { useState } from 'react';
import supabase from '../lib/supabase';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const isPhone = /^\+?\d+$/.test(loginInput.trim());

  const handleAuth = async () => {
    setLoading(true);
    const input = loginInput.trim();

    let error = null;

    if (isLogin) {
      if (isPhone) {
        const { error: pwError } = await supabase.auth.signInWithPassword({
          phone: input,
          password,
        });
        error = pwError;
      } else {
        const { error: pwError } = await supabase.auth.signInWithPassword({
          email: input,
          password,
        });
        error = pwError;
      }
    } else {
      if (isPhone) {
        const { error: signupError } = await supabase.auth.signUp({
          phone: input,
          password,
          options: {
            data: { username },
          },
        });
        error = signupError;
      } else {
        const { error: signupError } = await supabase.auth.signUp({
          email: input,
          password,
          options: {
            data: { username },
          },
        });
        error = signupError;
      }
    }

    if (error) {
      alert(error.message);
    } else {
      alert(isLogin ? 'Logged in!' : 'Signup complete! Confirm if required.');
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded shadow w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-center text-blue-600">
        {isLogin ? 'Log In' : 'Sign Up'}
      </h2>

      <input
        type="text"
        placeholder="Email or Phone"
        value={loginInput}
        onChange={(e) => setLoginInput(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <button
        onClick={handleAuth}
        disabled={loading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? 'Loading...' : isLogin ? 'Log In' : 'Sign Up'}
      </button>

      <p className="text-center mt-4 text-sm">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-500 hover:underline"
        >
          {isLogin ? 'Sign Up' : 'Log In'}
        </button>
      </p>
    </div>
  );
};

export default Auth;
