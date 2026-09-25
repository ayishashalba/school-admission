"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface Student {
  _id: string;
  name: string;
  dateOfBirth: string;
  applyingGrade: string;

  examScore?: number;
  examResult?: string;

  admissionNumber?: string;
  academicYear?: string;
  assignedGrade?: string;
  section?: string;
  admissionDate?: string;
  studentId?: string;
  admissionNotes?: string;

  status?: string;
}

export default function AdmissionSuccessPage() {
      return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <p className="text-gray-500">
            Loading admission details...
          </p>
        </main>
      }
    >
      <AdmissionSuccessContent />
    </Suspense>
  );
}

function AdmissionSuccessContent() {
  const searchParams = useSearchParams();
  const studentId = searchParams.get("id");

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) {
      setError("Student ID is missing.");
      setLoading(false);
      return;
    }

    fetchStudent();
  }, [studentId]);

  async function fetchStudent() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/applications/${studentId}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load student.");
        return;
      }

      setStudent(data.student);
    } catch (error) {
      console.error(error);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading admission details...
        </p>
      </main>
    );
  }

  if (!student) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Admission Not Found
          </h1>

          <p className="mt-2 text-gray-500">
            {error || "Student information could not be found."}
          </p>

          <Link
            href="/admin/dashboard"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const admissionDate = student.admissionDate
    ? new Date(student.admissionDate).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      )
    : "-";

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
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
              href="/admin/dashboard"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Success */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">
            ✓
          </div>

          <p className="mt-6 text-sm font-semibold text-green-600">
            ADMISSION COMPLETED
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Admission Successfully Completed
          </h1>

          <p className="mt-3 text-gray-500">
            {student.name} has been successfully admitted to the
            school.
          </p>
        </div>

        {/* Student Card */}
        <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Admission Details
          </h2>

          <div className="mt-6 divide-y divide-gray-100">
            <Detail
              label="Student Name"
              value={student.name}
            />

            <Detail
              label="Admission Number"
              value={student.admissionNumber || "-"}
            />

            <Detail
              label="Student ID"
              value={student.studentId || student._id}
            />

            <Detail
              label="Academic Year"
              value={student.academicYear || "-"}
            />

            <Detail
              label="Grade"
              value={
                student.assignedGrade ||
                student.applyingGrade ||
                "-"
              }
            />

            <Detail
              label="Section"
              value={student.section || "-"}
            />

            <Detail
              label="Admission Date"
              value={admissionDate}
            />

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-gray-500">
                Admission Status
              </span>

              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                Admitted
              </span>
            </div>
          </div>
        </div>

        {/* Parent Notification */}
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="font-semibold text-blue-900">
            Parent Notification
          </h2>

          <p className="mt-2 text-sm leading-6 text-blue-700">
            The parent will be able to see the completed admission
            status from their dashboard.
          </p>
        </div>

        {/* Process Completed */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Admission Process
          </h2>

          <div className="mt-6 space-y-5">
            <Step
              number="1"
              title="Application Submitted"
            />

            <Step
              number="2"
              title="Registration Fee Paid"
            />

            <Step
              number="3"
              title="Entrance Exam Completed"
            />

            <Step
              number="4"
              title="Application Reviewed"
            />

            <Step
              number="5"
              title="Admission Completed"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/admin/dashboard"
            className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>

          <Link
            href={`/admin/application?id=${student._id}`}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
          >
            View Application
          </Link>
        </div>
      </div>
    </main>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-gray-900">
        {value}
      </span>
    </div>
  );
}

function Step({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 font-semibold text-green-700">
        ✓
      </div>

      <p className="font-semibold text-gray-900">
        {title}
      </p>
    </div>
  );
}