"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Student {
  _id: string;
  name: string;
  applyingGrade: string;
  registrationFeePaid: boolean;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const studentId = searchParams.get("id");

  const [student, setStudent] = useState<Student | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentId) {
      setError("Student ID is missing.");
      setPageLoading(false);
      return;
    }

    async function fetchStudent() {
      try {
        const response = await fetch(
          `/api/students?id=${studentId}`
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load student");
          return;
        }

        setStudent(data.student);
      } catch (error) {
        console.error(error);
        setError("Failed to load student.");
      } finally {
        setPageLoading(false);
      }
    }

    fetchStudent();
  }, [studentId]);

async function handlePayment(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault();

  setError("");

  if (!paymentMethod) {
    setError("Please select a payment method.");
    return;
  }

  if (!studentId) {
    setError("Student ID is missing.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("/api/students", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId,
        paymentMethod,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Payment failed.");
      return;
    }

    router.push(
      `/parent/students/exam-slot?id=${studentId}`
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
          Loading payment details...
        </p>
      </main>
    );
  }

  if (error && !student) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
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
            href={`/parent/students/student-details?id=${student._id}`}
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            ← Back
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-3xl px-6 py-10">

        <div>
          <p className="text-sm font-semibold text-blue-600">
            STEP 2 OF 3
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Registration Fee
          </h1>

          <p className="mt-2 text-gray-500">
            Complete the registration payment to continue the
            admission process.
          </p>
        </div>

        {/* Payment Summary */}
        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Payment Summary
          </h2>

          <div className="mt-5 space-y-4">

            <div className="flex justify-between">
              <span className="text-gray-500">
                Student
              </span>

              <span className="font-medium">
                {student.name}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Applying Grade
              </span>

              <span className="font-medium">
                {student.applyingGrade}
              </span>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="font-semibold">
                  Registration Fee
                </span>

                <span className="text-2xl font-bold text-blue-600">
                  ₹1,000
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Payment Form */}
        <form
          onSubmit={handlePayment}
          className="mt-6 rounded-2xl bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-gray-900">
            Payment Method
          </h2>

          {error && (
            <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-5 space-y-3">

            <label className="flex cursor-pointer items-center gap-4 rounded-lg border p-4 hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="UPI"
                checked={paymentMethod === "UPI"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />

              <div>
                <p className="font-medium">
                  UPI
                </p>

                <p className="text-sm text-gray-500">
                  Pay using UPI
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-4 rounded-lg border p-4 hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="CARD"
                checked={paymentMethod === "CARD"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />

              <div>
                <p className="font-medium">
                  Debit / Credit Card
                </p>

                <p className="text-sm text-gray-500">
                  Pay using your card
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-center gap-4 rounded-lg border p-4 hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value="NET_BANKING"
                checked={paymentMethod === "NET_BANKING"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />

              <div>
                <p className="font-medium">
                  Net Banking
                </p>

                <p className="text-sm text-gray-500">
                  Pay using online banking
                </p>
              </div>
            </label>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Processing Payment..."
              : "Pay ₹1,000"}
          </button>
        </form>

        <div className="mt-6 rounded-xl bg-blue-50 p-5">
          <p className="text-sm font-medium text-blue-900">
            Mock Payment
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-700">
            This is a demo payment flow. No real money will be
            charged. The actual payment gateway can be integrated
            later.
          </p>
        </div>

      </div>
    </main>
  );
}