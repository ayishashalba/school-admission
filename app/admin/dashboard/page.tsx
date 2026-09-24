"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Student {
  _id: string;
  name: string;
  applyingGrade: string;
  parentName: string;
  examDate?: string;
  examTime?: string;
  status: string;
  registrationFeePaid: boolean;
  examStatus?: string;
}

export default function AdminDashboardPage() {
  const [applications, setApplications] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      const response = await fetch("/api/students");

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to fetch applications");
        return;
      }

      setApplications(data.students || []);
    } catch (error) {
      console.error(error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function getStatus(student: Student) {
    if (student.status === "EXAM_BOOKED") {
      return "Exam Scheduled";
    }

    if (student.status === "FEE_PAID") {
      return "Payment Completed";
    }

    if (student.status === "EXAM_COMPLETED") {
      return "Exam Completed";
    }

    if (student.status === "ADMITTED") {
      return "Admission Completed";
    }

    return "Application Created";
  }

  const totalApplications = applications.length;

  const pendingReview = applications.filter(
    (student) =>
      student.status === "APPLICATION_CREATED" ||
      student.status === "FEE_PAID"
  ).length;

  const examScheduled = applications.filter(
    (student) => student.status === "EXAM_BOOKED"
  ).length;

  const completed = applications.filter(
    (student) =>
      student.status === "ADMITTED" ||
      student.status === "REJECTED"
  ).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/admin/dashboard"
            className="text-xl font-bold text-blue-600"
          >
            School Admission
          </Link>

          <div className="flex items-center gap-5">
            <span className="text-sm text-gray-600">
              Admission Team
            </span>

            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              Logout
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            ADMINISTRATION
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Admission Dashboard
          </h1>

          <p className="mt-2 text-gray-500">
            Manage student applications and admission progress.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Applications"
            value={totalApplications.toString()}
            description="All applications"
          />

          <StatCard
            title="Pending Review"
            value={pendingReview.toString()}
            description="Need attention"
          />

          <StatCard
            title="Exam Scheduled"
            value={examScheduled.toString()}
            description="Upcoming exams"
          />

          <StatCard
            title="Completed"
            value={completed.toString()}
            description="Admissions completed"
          />
        </div>

        <div className="mt-8 rounded-xl bg-white shadow-sm">
          <div className="border-b p-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Student Applications
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review and manage admission applications.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading applications...
              </div>
            ) : applications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No applications found.
              </div>
            ) : (
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-6 py-4 font-medium">
                      Student
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Grade
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Parent
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Exam
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {applications.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">
                          {student.name}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.applyingGrade}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.parentName}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student.examDate
                          ? `${student.examDate} ${student.examTime || ""}`
                          : "-"}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge
                          status={getStatus(student)}
                        />
                      </td>

                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/application?id=${student._id}`}
                          className="font-medium text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<string, string> = {
    "Application Created":
      "bg-gray-100 text-gray-700",

    "Payment Completed":
      "bg-yellow-100 text-yellow-700",

    "Exam Scheduled":
      "bg-blue-100 text-blue-700",

    "Exam Completed":
      "bg-purple-100 text-purple-700",

    "Admission Completed":
      "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        styles[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}