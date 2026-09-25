"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense,useEffect, useState } from "react";

interface Student {
  _id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  previousSchool: string;
  applyingGrade: string;
  status: string;
  registrationFeePaid: boolean;
}

export default function StudentDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <p className="text-gray-500">
            Loading payment details...
          </p>
        </main>
      }
    >
      <StudentDetailsContent />
    </Suspense>
  );
}

function StudentDetailsContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Student ID is missing.");
      setLoading(false);
      return;
    }

    async function fetchStudent() {
      try {
        const response = await fetch(`/api/students?id=${id}`);

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch student");
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

    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading student...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>

          <Link
            href="/parent/dashboard"
            className="mt-4 inline-block text-blue-600"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/parent/dashboard"
            className="text-xl font-bold text-blue-600"
          >
            School Admission
          </Link>

          <Link
            href="/parent/dashboard"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-10">

        <p className="text-sm font-semibold text-blue-600">
          APPLICATION
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Student Application
        </h1>

        <p className="mt-2 text-gray-500">
          Review your child&apos;s information before continuing.
        </p>

        {/* Status */}
        <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              ⏳
            </div>

            <div>
              <p className="font-semibold text-yellow-900">
                {student.status}
              </p>

              <p className="text-sm text-yellow-700">
                Registration fee payment is required to continue.
              </p>
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Student Information
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Info
              label="Student Name"
              value={student.name}
            />

            <Info
              label="Date of Birth"
              value={new Date(student.dateOfBirth).toLocaleDateString()}
            />

            <Info
              label="Gender"
              value={student.gender}
            />

            <Info
              label="Previous School"
              value={student.previousSchool || "Not provided"}
            />

            <Info
              label="Applying Grade"
              value={student.applyingGrade}
            />
          </div>
        </div>

        {/* Admission Process */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Admission Process
          </h2>

          <div className="mt-6 space-y-5">
            <Step
              number="1"
              title="Application Created"
              description="Student application has been created."
              active
            />

            <Step
              number="2"
              title="Registration Fee"
              description="Pay the registration fee to continue."
            />

            <Step
              number="3"
              title="Entrance Exam"
              description="Book and attend the entrance examination."
            />

            <Step
              number="4"
              title="Admission"
              description="School team reviews the result and completes admission."
            />
          </div>
        </div>

        {/* Payment */}
        {!student.registrationFeePaid && (
          <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Registration Fee
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Complete the registration payment to continue.
                </p>

                <p className="mt-3 text-2xl font-bold text-gray-900">
                  ₹1,000
                </p>
              </div>

              <Link
  href={`/parent/students/payment?id=${student._id}`}
  className="rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
>
  Pay Registration Fee
</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
  active = false,
}: {
  number: string;
  title: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold ${
          active
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-500"
        }`}
      >
        {number}
      </div>

      <div>
        <p
          className={`font-semibold ${
            active ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {title}
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}