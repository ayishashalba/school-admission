"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

interface Student {
  _id: string;
  name: string;
  dateOfBirth: string;
  applyingGrade: string;
  examScore?: number;
  examResult?: string;
  examRemarks?: string;
}

export default function AdmissionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id");

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [admissionNumber, setAdmissionNumber] = useState("");
  const [academicYear, setAcademicYear] = useState("2026 - 2027");
  const [assignedGrade, setAssignedGrade] = useState("Grade 3");
  const [section, setSection] = useState("A");
  const [admissionDate, setAdmissionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [studentId, setStudentId] = useState("");
  const [admissionNotes, setAdmissionNotes] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Student ID is missing");
      setLoading(false);
      return;
    }

    fetchStudent();
  }, [id]);

  async function fetchStudent() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/applications/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load student");
        return;
      }

      setStudent(data.student);

      setAssignedGrade(
        data.student.applyingGrade || "Grade 3"
      );
    } catch (error) {
      console.error("FETCH STUDENT ERROR:", error);
      setError("Failed to load student");
    } finally {
      setLoading(false);
    }
  }

  async function completeAdmission() {
    if (!id) {
      setError("Student ID is missing");
      return;
    }

    if (!admissionNumber.trim()) {
      setError("Admission number is required");
      return;
    }

    if (!studentId.trim()) {
      setError("Student ID is required");
      return;
    }

    setError("");
    setSaving(true);

    try {
      const response = await fetch(
        `/api/admin/admission/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            admissionNumber,
            academicYear,
            assignedGrade,
            section,
            admissionDate,
            studentId,
            admissionNotes,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to complete admission");
        return;
      }

      router.push(`/admin/admission-success?id=${id}`);
    } catch (error) {
      console.error("ADMISSION ERROR:", error);
      setError("Failed to complete admission");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
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
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">
            {error || "Student not found"}
          </p>

          <Link
            href="/admin/dashboard"
            className="mt-4 inline-block text-blue-600"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const examScore =
    student.examScore !== undefined
      ? `${student.examScore} / 100`
      : "Not entered";

  const examResult =
    student.examResult || "Not entered";

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

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <div>
          <p className="text-sm font-semibold text-blue-600">
            FINAL ADMISSION
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Complete Admission
          </h1>

          <p className="mt-2 text-gray-500">
            Complete the final admission details for the student.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Student Summary */}
        <section className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Student Summary
          </h2>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Info
              label="Student Name"
              value={student.name}
            />

            <Info
              label="Date of Birth"
              value={new Date(
                student.dateOfBirth
              ).toLocaleDateString()}
            />

            <Info
              label="Applying Grade"
              value={student.applyingGrade}
            />

            <Info
              label="Exam Score"
              value={examScore}
            />

            <div>
              <p className="text-sm text-gray-500">
                Exam Result
              </p>

              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                  examResult === "Passed"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {examResult === "Passed" ? "✓ " : ""}
                {examResult}
              </span>
            </div>
          </div>

          {student.examRemarks && (
            <div className="mt-6">
              <p className="text-sm text-gray-500">
                Exam Remarks
              </p>

              <p className="mt-1 text-sm text-gray-800">
                {student.examRemarks}
              </p>
            </div>
          )}
        </section>

        {/* Admission Details */}
        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Admission Details
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Assign the student to a class and create the admission
            record.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {/* Admission Number */}
            <div>
              <label
                htmlFor="admissionNumber"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Admission Number
              </label>

              <input
                id="admissionNumber"
                type="text"
                value={admissionNumber}
                onChange={(e) =>
                  setAdmissionNumber(e.target.value)
                }
                placeholder="ADM-2026-001"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Academic Year */}
            <div>
              <label
                htmlFor="academicYear"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Academic Year
              </label>

              <select
                id="academicYear"
                value={academicYear}
                onChange={(e) =>
                  setAcademicYear(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option>2026 - 2027</option>
                <option>2027 - 2028</option>
              </select>
            </div>

            {/* Grade */}
            <div>
              <label
                htmlFor="grade"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Assigned Grade
              </label>

              <select
                id="grade"
                value={assignedGrade}
                onChange={(e) =>
                  setAssignedGrade(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option>Grade 1</option>
                <option>Grade 2</option>
                <option>Grade 3</option>
                <option>Grade 4</option>
                <option>Grade 5</option>
              </select>
            </div>

            {/* Section */}
            <div>
              <label
                htmlFor="section"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Section
              </label>

              <select
                id="section"
                value={section}
                onChange={(e) =>
                  setSection(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
            </div>

            {/* Admission Date */}
            <div>
              <label
                htmlFor="admissionDate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Admission Date
              </label>

              <input
                id="admissionDate"
                type="date"
                value={admissionDate}
                onChange={(e) =>
                  setAdmissionDate(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Student ID */}
            <div>
              <label
                htmlFor="studentId"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Student ID
              </label>

              <input
                id="studentId"
                type="text"
                value={studentId}
                onChange={(e) =>
                  setStudentId(e.target.value)
                }
                placeholder="STU-2026-001"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Admission Notes
            </label>

            <textarea
              id="notes"
              rows={4}
              value={admissionNotes}
              onChange={(e) =>
                setAdmissionNotes(e.target.value)
              }
              placeholder="Add any additional admission notes..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </section>

        {/* Complete */}
        <section className="mt-6 rounded-xl border border-green-200 bg-green-50 p-6">
          <h2 className="text-xl font-semibold text-green-900">
            Ready to Complete Admission?
          </h2>

          <p className="mt-2 text-sm leading-6 text-green-700">
            Once admission is completed, the student will be officially
            added to the school and the parent will be able to see the
            admission status from their dashboard.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={completeAdmission}
              disabled={saving}
              className="rounded-lg bg-green-600 px-6 py-3 text-center font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Completing Admission..."
                : "Complete Admission"}
            </button>

            <Link
              href={`/admin/application?id=${id}`}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to Application
            </Link>
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