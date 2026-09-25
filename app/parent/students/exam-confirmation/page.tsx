"use client";

import {Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Student {
  _id: string;
  name: string;
  applyingGrade: string;
  examDate: string;
  examTime: string;
  examStatus: string;
  status: string;
}

export default function ExamConfirmationPage() {
   return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <p className="text-gray-500">
            Loading...
          </p>
        </main>
      }
    >
      <ExamConfirmationContent />
    </Suspense>
  );
}

function ExamConfirmationContent() {
  const searchParams = useSearchParams();

  const studentId = searchParams.get("id");

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudent() {
      if (!studentId) {
        setError("Student ID is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/students?id=${studentId}`,
          {
            method: "GET",
            credentials: "include",
          }
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

    loadStudent();
  }, [studentId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading exam details...
        </p>
      </main>
    );
  }

  if (error || !student) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="rounded-xl bg-red-50 p-5 text-red-600">
            {error || "Student not found."}
          </div>

          <Link
            href="/parent/dashboard"
            className="mt-5 inline-block text-blue-600"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const formattedDate = student.examDate
    ? new Date(student.examDate).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not scheduled";

  const isBooked = student.examStatus === "BOOKED";

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

          <Link
            href="/parent/dashboard"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Success */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">
            ✓
          </div>

          <p className="mt-6 text-sm font-semibold text-green-600">
            {isBooked
              ? "EXAM SLOT CONFIRMED"
              : "EXAM SLOT"}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {isBooked
              ? "Entrance Exam Scheduled"
              : "Entrance Exam Details"}
          </h1>

          <p className="mt-3 text-gray-500">
            {isBooked
              ? "Your child's entrance examination has been successfully scheduled."
              : "Your child's exam information is shown below."}
          </p>
        </div>

        {/* Exam Details */}
        <div className="mt-8 rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Exam Details
          </h2>

          <div className="mt-6 divide-y divide-gray-100">
            <Detail
              label="Student Name"
              value={student.name}
            />

            <Detail
              label="Applying Grade"
              value={student.applyingGrade}
            />

            <Detail
              label="Exam Date"
              value={formattedDate}
            />

            <Detail
              label="Exam Time"
              value={student.examTime || "Not scheduled"}
            />

            <Detail
              label="Location"
              value="School Main Campus"
            />

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-gray-500">
                Status
              </span>

              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                {isBooked ? "Scheduled" : "Not Scheduled"}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="font-semibold text-blue-900">
            Exam Instructions
          </h2>

          <ul className="mt-3 space-y-2 text-sm leading-6 text-blue-700">
            <li>
              • Arrive at least 15 minutes before the exam.
            </li>

            <li>
              • Bring the student&apos;s application details.
            </li>

            <li>
              • Bring any required identification documents.
            </li>

            <li>
              • Parents should remain available during the exam.
            </li>
          </ul>
        </div>

        {/* What Happens Next */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            What happens next?
          </h2>

          <div className="mt-6 space-y-5">
            <Step
              number="1"
              title="Application Submitted"
              description="Your child's admission application has been created."
              completed
            />

            <Step
              number="2"
              title="Registration Fee Paid"
              description="Registration fee payment has been completed."
              completed
            />

            <Step
              number="3"
              title="Entrance Exam"
              description="Attend the scheduled entrance examination."
              active
            />

            <Step
              number="4"
              title="Admission Review"
              description="The admission team will review the exam result."
            />

            <Step
              number="5"
              title="Admission Completed"
              description="Final admission status will be updated here."
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8">
          <Link
            href="/parent/dashboard"
            className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
          >
            Go to Dashboard
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
  description,
  completed = false,
  active = false,
}: {
  number: string;
  title: string;
  description: string;
  completed?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold ${
          completed
            ? "bg-green-100 text-green-700"
            : active
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-500"
        }`}
      >
        {completed ? "✓" : number}
      </div>

      <div>
        <p
          className={`font-semibold ${
            active || completed
              ? "text-gray-900"
              : "text-gray-500"
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