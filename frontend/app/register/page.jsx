'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import API_URL from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    nama: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registrasi gagal.');
      }

      router.push('/login');
    } catch (error) {
      setMessage(
        error.message || 'Tidak dapat terhubung ke server.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center
      bg-cover bg-center bg-fixed px-5 py-10 text-[#00182C]"
      style={{
        backgroundImage: `
          linear-gradient(
            rgba(255,255,255,0.78),
            rgba(255,255,255,0.78)
          ),
          url('/image.png')
        `,
      }}
    >
      <section className="w-full max-w-[440px] rounded-[24px]
        border border-[#E2E8E1] bg-white p-7 shadow-sm
        sm:p-10">

        <div className="mb-8">
          <p className="mt-8 text-xs font-semibold uppercase
            tracking-[0.16em] text-[#00182C]">
            Get started
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight
            text-[#00182C]">
            Create account
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-600">
            Create an account to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="nama"
              className="mb-2 block text-sm font-medium
                text-[#26372F]"
            >
              Full name
            </label>

            <input
              id="nama"
              name="nama"
              type="text"
              autoComplete="name"
              value={form.nama}
              onChange={handleChange}
              placeholder="Your name"
              required
              className="w-full rounded-xl border
                border-[#DCE3DA] bg-white px-4 py-3
                text-sm text-[#00182C] outline-none
                placeholder:text-gray-400
                focus:border-[#64836D]
                focus:ring-2 focus:ring-[#64836D]/15"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium
                text-[#26372F]"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl border
                border-[#DCE3DA] bg-white px-4 py-3
                text-sm text-[#00182C] outline-none
                placeholder:text-gray-400
                focus:border-[#64836D]
                focus:ring-2 focus:ring-[#64836D]/15"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium
                text-[#26372F]"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
              className="w-full rounded-xl border
                border-[#DCE3DA] bg-white px-4 py-3
                text-sm text-[#00182C] outline-none
                placeholder:text-gray-400
                focus:border-[#64836D]
                focus:ring-2 focus:ring-[#64836D]/15"
            />
          </div>

          {message && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 px-3 py-2
                text-sm text-red-700"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#00182C]
              px-4 py-3.5 text-sm font-semibold text-white
              transition hover:bg-black
              disabled:cursor-not-allowed
              disabled:opacity-60
              cursor-pointer"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-[#00182C]
              hover:text-[#00182C]"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
