import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface LoginFormData {
  email: string;
  password: string;
}

interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string;
}

export default function LoginForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginFormData>({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      return setError('Please enter both email and password.');
    }

    setLoading(true);

    try {
      const res = await axios.post<UserResponse>('http://localhost:5000/auth/login', {
        email: form.email,
        password: form.password,
      });

      const user = res.data;

      const { id, name, role } = res.data;
    const userInfo = { uid: id, email: form.email, name, role };
    localStorage.setItem('hostInfo', JSON.stringify(userInfo));

    console.log('Login successful, navigating to dashboard');

      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.response?.status === 401) {
        setError('Incorrect password.');
      } else {
        setError('Invalid email or user does not exist.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur p-8 rounded-xl shadow-lg w-full max-w-md">
      <h2 className="text-3xl font-bold text-center mb-6 text-pink-400">Log In</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 hover:bg-pink-600 py-3 px-4 rounded-full font-semibold"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}
