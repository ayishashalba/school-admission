"use client";

import { Suspense,useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Student {
  _id: string;
  name: string;
  applyingGrade: string;
  registrationFeePaid: boolean;
  examDate?: string;
  examTime?: string;
  examStatus?: string;
}

export default function ExamSlotPage() {
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
      <ExamSlotContent />
    </Suspense>
  );
}

function ExamSlotContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const studentId = searchParams.get("id");

  const [student, setStudent] = useState<Student | null>(null);
  const [examDate, setExamDate] = useState("");
  const [examTime, setExamTime] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  const availableDates = [
    "2026-10-05",
    "2026-10-07",
    "2026-10-10",
    "2026-10-12",
  ];

  // Load student from DB
  useEffect(() => {
    async function loadStudent() {
      if (!studentId) {
        setError("Student ID is missing.");
        setPageLoading(false);
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
          setError(data.message || "Failed to load student");
          return;
        }

        setStudent(data.student);

        // If already booked
        if (data.student.examDate) {
          setExamDate(data.student.examDate);
        }

        if (data.student.examTime) {
          setExamTime(data.student.examTime);
        }
      } catch (error) {
        console.error(error);
        setError("Failed to load student.");
      } finally {
        setPageLoading(false);
      }
    }

    loadStudent();
  }, [studentId]);

  async function handleBooking(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");

    if (!studentId) {
      setError("Student ID is missing.");
      return;
    }

    if (!examDate || !examTime) {
      setError("Please select an exam date and time.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/students", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          studentId,
          examDate,
          examTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to book exam slot.");
        return;
      }

      console.log("Exam booked:", data.student);

      router.push(
        `/parent/students/exam-confirmation?id=${studentId}`
      );
    } catch (error) {
      console.error(error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading student...
        </p>
      </main>
    );
  }

  if (!student) {
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
            href={`/parent/students/student-details?id=${studentId}`}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            ← Back
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Header */}
        <div>
          <p className="text-sm font-semibold text-blue-600">
            STEP 3 OF 4
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Book Entrance Exam
          </h1>

          <p className="mt-2 text-gray-500">
            Select an available date and time for the entrance
            examination.
          </p>
        </div>

        {/* Payment Success */}
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700">
              ✓
            </div>

            <div>
              <p className="font-semibold text-green-900">
                Registration Fee Paid
              </p>

              <p className="text-sm text-green-700">
                Your registration payment was successful.
              </p>
            </div>
          </div>
        </div>

        {/* Student */}
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Student
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Name
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {student.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Applying Grade
              </p>

              <p className="mt-1 font-medium text-gray-900">
                {student.applyingGrade}
              </p>
            </div>
          </div>
        </div>

        {/* Exam Booking */}
        <form
          onSubmit={handleBooking}
          className="mt-6 rounded-xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-gray-900">
            Select Exam Slot
          </h2>

          {error && (
            <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Date */}
          <div className="mt-6">
            <label
              htmlFor="examDate"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Exam Date
            </label>

            <select
              id="examDate"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select an available date
              </option>

              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </option>
              ))}
            </select>
          </div>

          {/* Time */}
          <div className="mt-6">
            <label
              htmlFor="examTime"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Exam Time
            </label>

            <select
              id="examTime"
              value={examTime}
              onChange={(e) => setExamTime(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">
                Select an available time
              </option>

              <option value="09:00 AM">09:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="04:00 PM">04:00 PM</option>
            </select>
          </div>

          {/* Info */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-800">
              Important
            </p>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              Please arrive at least 15 minutes before the
              scheduled examination time.
            </p>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Booking Exam..."
              : "Confirm Exam Slot"}
          </button>
        </form>
      </div>
    </main>
  );
}