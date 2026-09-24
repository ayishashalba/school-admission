"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

async function handleSubmit(e: FormEvent<HTMLFormElement>) {
  e.preventDefault();

  console.log("LOGIN BUTTON CLICKED");
  console.log("EMAIL:", email);

  setError("");

  if (!email || !password) {
    setError("Please enter your email and password.");
    return;
  }

  setLoading(true);

  try {
    console.log("SENDING LOGIN REQUEST...");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    console.log("LOGIN HTTP STATUS:", response.status);

    const data = await response.json();

    console.log("LOGIN RESPONSE:", data);
    console.log("USER ROLE:", data?.user?.role);

    if (!response.ok) {
      setError(data.message || "Login failed.");
      return;
    }

    if (data?.user?.role === "ADMIN") {
      console.log("ADMIN DETECTED → GOING TO ADMIN DASHBOARD");

      window.location.href = "/admin/dashboard";
      return;
    }

    if (data?.user?.role === "PARENT") {
      console.log("PARENT DETECTED → GOING TO PARENT DASHBOARD");

      window.location.href = "/parent/dashboard";
      return;
    }

    console.log("UNKNOWN ROLE:", data?.user?.role);
    setError("Unknown user role.");
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    setError("Unable to connect to the server.");
  } finally {
    setLoading(false);
  }
}
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Login to manage your child&apos;s admission.
          </p>
        </div>
        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@example.com"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Create Account
          </Link>
        </p>
      </div>
    </main>
  );
}