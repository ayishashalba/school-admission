import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-blue-600">
            School Admission
          </h1>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center px-6">
        <div className="max-w-3xl">
          <p className="font-semibold text-blue-600">
            SCHOOL ADMISSION PORTAL
          </p>

          <h2 className="mt-4 text-5xl font-bold leading-tight text-gray-900">
            Manage Your Child&apos;s
            <span className="text-blue-600"> Admission </span>
            Online
          </h2>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Apply for admission, complete registration, book the
            entrance exam, and track your child&apos;s admission
            status from one place.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Start Application
            </Link>

            <Link
              href="/login"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100"
            >
              Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}