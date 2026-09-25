import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
export const dynamic = "force-dynamic";
export default async function ParentDashboard() {
  await connectDB();

  const students = await Student.find()
    .sort({ createdAt: -1 })
    .lean();

  const totalApplications = students.length;

  const latestStudent = students[0];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/parent/dashboard"
            className="text-xl font-bold text-blue-600"
          >
            School Admission
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, Parent
            </span>

            <Link
              href="/login"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Logout
            </Link>
          </div>
        </div>
      </nav>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Parent Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your child&apos;s school admission application.
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Total Applications
            </p>

            <p className="mt-3 text-3xl font-bold text-gray-900">
              {totalApplications}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Current Status
            </p>

            <p className="mt-3 text-xl font-bold text-blue-600">
              {latestStudent
                ? latestStudent.registrationFeePaid
                  ? "Fee Paid"
                  : "Fee Pending"
                : "No Application"}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">
              Admission
            </p>

            <p className="mt-3 text-xl font-bold text-orange-500">
              {latestStudent
                ? latestStudent.status
                : "Not Started"}
            </p>
          </div>
        </div>
        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                My Children
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View and manage your child&apos;s admission application.
              </p>
            </div>

            <Link
              href="/parent/students/new"
              className="rounded-lg bg-blue-600 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Add Student
            </Link>
          </div>

          <div className="mt-6 space-y-4">

            {students.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">

                <h3 className="text-lg font-semibold text-gray-900">
                  No student applications
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  You have not added a child yet.
                </p>

                <Link
                  href="/parent/students/new"
                  className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Add Student
                </Link>

              </div>

            ) : (
              students.map((student) => (

                <div
                  key={student._id.toString()}
                  className="rounded-xl border border-gray-200 p-5"
                >
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

                    <div>

                      <h3 className="text-lg font-semibold text-gray-900">
                        {student.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Applying for {student.applyingGrade}
                      </p>

                      <div className="mt-3">

                        {student.registrationFeePaid ? (

                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            Registration Fee Paid
                          </span>

                        ) : (

                          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                            Registration Fee Pending
                          </span>

                        )}

                      </div>

                    </div>

                    <Link
                      href={`/parent/students/student-details?id=${student._id.toString()}`}
                      className="rounded-lg border border-blue-600 px-5 py-2.5 text-center text-sm font-medium text-blue-600 hover:bg-blue-50"
                    >
                      View Application
                    </Link>

                  </div>
                </div>

              ))
            )}

          </div>
        </div>
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">

          <h2 className="text-lg font-semibold text-gray-900">
            Need to apply for another child?
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Start a new student application and complete the admission
            process online.
          </p>

          <Link
            href="/parent/students/new"
            className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Start New Application
          </Link>

        </div>

      </div>
    </main>
  );
}