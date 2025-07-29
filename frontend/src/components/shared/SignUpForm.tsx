import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LocationState {
  role?: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

export default function SignUpForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const userRole = state?.role || 'User';

  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password || !form.confirm) {
      return setError('Please fill all fields.');
    }
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          role: userRole,
          password: form.password,
        }),
      });

      if (!response.ok) throw new Error('Failed to create user');

      const data = await response.json();
      localStorage.setItem('userId', data.id);
      navigate('/role');
    } catch (err) {
      console.error(err);
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-center mb-4 text-pink-400">Create Your Account</h2>
      <p className="text-center text-sm text-gray-300 mb-4">
        You’re signing up as a <span className="font-semibold">{userRole}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-white/20 border border-white/20 text-white focus:outline-none"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-white/20 border border-white/20 text-white focus:outline-none"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-white/20 border border-white/20 text-white focus:outline-none"
        />
        <input
          type="password"
          name="confirm"
          placeholder="Confirm Password"
          value={form.confirm}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-white/20 border border-white/20 text-white focus:outline-none"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 hover:bg-pink-600 py-3 px-4 rounded-full font-semibold"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </>
  );
}
