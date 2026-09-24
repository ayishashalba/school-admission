"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Student {
  _id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  previousSchool: string;
  applyingGrade: string;

  parentName: string;
  parentEmail: string;
  parentPhone: string;

  status: string;

  registrationFeePaid: boolean;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentDate?: string;

  examDate?: string;
  examTime?: string;
  examStatus?: string;

  examScore?: number;
  examResult?: string;
  examRemarks?: string;

  admissionDecision?: string;
  admissionDate?: string;
}

export default function ApplicationPage() {
  const searchParams = useSearchParams();

  const studentId = searchParams.get("id");

  const [student, setStudent] = useState<Student | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [score, setScore] = useState("");
  const [result, setResult] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (studentId) {
      fetchApplication();
    }
  }, [studentId]);

  async function fetchApplication() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/admin/applications/${studentId}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load application");
        return;
      }

      setStudent(data.student);

      setScore(
        data.student.examScore !== undefined &&
          data.student.examScore !== null
          ? String(data.student.examScore)
          : ""
      );

      setResult(data.student.examResult || "");
      setRemarks(data.student.examRemarks || "");
    } catch (error) {
      console.error(error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function saveExamResult() {
    if (!studentId) return;

    setMessage("");
    setError("");

    if (!score) {
      setError("Please enter the exam score.");
      return;
    }

    if (!result) {
      setError("Please select the exam result.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/applications/${studentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "SAVE_EXAM_RESULT",
            examScore: Number(score),
            examResult: result,
            examRemarks: remarks,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to save exam result");
        return;
      }

      setStudent(data.student);
      setMessage("Exam result saved successfully.");
    } catch (error) {
      console.error(error);
      setError("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  async function updateAdmission(
    action: "ADMIT" | "REJECT" | "HOLD"
  ) {
    if (!studentId) return;

    const confirmation = window.confirm(
      action === "ADMIT"
        ? "Are you sure you want to admit this student?"
        : action === "REJECT"
          ? "Are you sure you want to reject this application?"
          : "Are you sure you want to put this application on hold?"
    );

    if (!confirmation) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/applications/${studentId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to update application");
        return;
      }

      setStudent(data.student);

      if (action === "ADMIT") {
        setMessage("Student admitted successfully.");
      }

      if (action === "REJECT") {
        setMessage("Application rejected.");
      }

      if (action === "HOLD") {
        setMessage("Application placed on hold.");
      }
    } catch (error) {
      console.error(error);
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          Loading application...
        </p>
      </main>
    );
  }

  if (!student) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Application Not Found
          </h1>

          <p className="mt-2 text-gray-500">
            {error || "This application could not be found."}
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

  const formattedDate = student.dateOfBirth
    ? new Date(student.dateOfBirth).toLocaleDateString(
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

      <div className="mx-auto max-w-6xl px-6 py-10">
     
        <div>
          <p className="text-sm font-semibold text-blue-600">
            APPLICATION REVIEW
          </p>

          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {student.name}
              </h1>

              <p className="mt-1 text-gray-500">
                Admission application details
              </p>
            </div>

            <StatusBadge status={getDisplayStatus(student.status)} />
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* Student Information */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Student Information
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Info
              label="Student Name"
              value={student.name}
            />

            <Info
              label="Date of Birth"
              value={formattedDate}
            />

            <Info
              label="Gender"
              value={student.gender}
            />

            <Info
              label="Applying Grade"
              value={student.applyingGrade}
            />

            <Info
              label="Previous School"
              value={student.previousSchool || "-"}
            />
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Parent / Guardian Information
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Info
              label="Parent Name"
              value={student.parentName}
            />

            <Info
              label="Email"
              value={student.parentEmail}
            />

            <Info
              label="Phone"
              value={student.parentPhone || "-"}
            />
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Registration Payment
          </h2>

          <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-gray-500">
                Registration Fee
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                ₹1,000
              </p>

              {student.paymentMethod && (
                <p className="mt-1 text-sm text-gray-500">
                  Method: {student.paymentMethod}
                </p>
              )}
            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                student.registrationFeePaid
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {student.registrationFeePaid
                ? "✓ Paid"
                : "Payment Pending"}
            </span>
          </div>
        </section>
        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Entrance Examination
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Info
              label="Exam Date"
              value={student.examDate || "-"}
            />

            <Info
              label="Exam Time"
              value={student.examTime || "-"}
            />

            <Info
              label="Exam Status"
              value={student.examStatus || "Not Booked"}
            />
          </div>
        </section>
        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Entrance Exam Result
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter the student&apos;s examination result after
              the exam.
            </p>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
   
            <div>
              <label
                htmlFor="score"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Exam Score
              </label>

              <input
                id="score"
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Enter score"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="result"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Result
              </label>

              <select
                id="result"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select result
                </option>

                <option value="PASSED">
                  Passed
                </option>

                <option value="FAILED">
                  Not Passed
                </option>

                <option value="FURTHER_REVIEW">
                  Further Review
                </option>
              </select>
            </div>
          </div>
          <div className="mt-6">
            <label
              htmlFor="remarks"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Remarks
            </label>

            <textarea
              id="remarks"
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks about the examination..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={saveExamResult}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Exam Result"}
            </button>
          </div>
          {student.examScore !== undefined &&
            student.examScore !== null && (
              <div className="mt-6 rounded-lg bg-gray-50 p-5">
                <p className="text-sm text-gray-500">
                  Saved Exam Result
                </p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {student.examScore}/100
                </p>

                <p className="mt-1 text-sm font-semibold text-blue-600">
                  {student.examResult}
                </p>

                {student.examRemarks && (
                  <p className="mt-2 text-sm text-gray-600">
                    {student.examRemarks}
                  </p>
                )}
              </div>
            )}
        </section>
        <section className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-6">
          <h2 className="text-xl font-semibold text-blue-900">
            Admission Decision
          </h2>

          <p className="mt-2 text-sm text-blue-700">
            After reviewing the application and examination
            result, the admission team can update the admission
            decision.
          </p>

          {student.status === "ADMITTED" && (
            <div className="mt-5 rounded-lg bg-green-100 p-4 text-sm font-semibold text-green-700">
              ✓ Student has been admitted.
            </div>
          )}

          {student.status === "REJECTED" && (
            <div className="mt-5 rounded-lg bg-red-100 p-4 text-sm font-semibold text-red-700">
              Application has been rejected.
            </div>
          )}

          {student.status === "ON_HOLD" && (
            <div className="mt-5 rounded-lg bg-yellow-100 p-4 text-sm font-semibold text-yellow-700">
              Application is currently on hold.
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
  type="button"
  onClick={() => {
    console.log("ADMIT CLICKED");
    console.log("STUDENT ID:", student._id);

    window.location.href = `/admin/admission?id=${student._id}`;
  }}
  className="rounded-lg bg-green-600 px-6 py-3 text-center font-semibold text-white hover:bg-green-700"
>
  Admit Student
</button>
            <button
              type="button"
              onClick={() => updateAdmission("HOLD")}
              disabled={saving || student.status === "ON_HOLD"}
              className="rounded-lg border border-yellow-300 bg-white px-6 py-3 font-semibold text-yellow-700 hover:bg-yellow-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Put on Hold
            </button>

            <button
              type="button"
              onClick={() => updateAdmission("REJECT")}
              disabled={saving || student.status === "REJECTED"}
              className="rounded-lg border border-red-300 bg-white px-6 py-3 font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reject Application
            </button>
          </div>
        </section>
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

function StatusBadge({
  status,
}: {
  status: string;
}) {
  let classes =
    "bg-gray-100 text-gray-700";

  if (status === "Exam Scheduled") {
    classes = "bg-blue-100 text-blue-700";
  }

  if (status === "Exam Completed") {
    classes = "bg-purple-100 text-purple-700";
  }

  if (status === "Admission Completed") {
    classes = "bg-green-100 text-green-700";
  }

  if (status === "Rejected") {
    classes = "bg-red-100 text-red-700";
  }

  if (status === "On Hold") {
    classes = "bg-yellow-100 text-yellow-700";
  }

  return (
    <span
      className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}

function getDisplayStatus(status: string) {
  switch (status) {
    case "APPLICATION_CREATED":
      return "Application Created";

    case "FEE_PAID":
      return "Payment Completed";

    case "EXAM_BOOKED":
      return "Exam Scheduled";

    case "EXAM_COMPLETED":
      return "Exam Completed";

    case "ADMITTED":
      return "Admission Completed";

    case "REJECTED":
      return "Rejected";

    case "ON_HOLD":
      return "On Hold";

    default:
      return status;
  }
}