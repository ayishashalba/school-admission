"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewStudentPage() {
  const router = useRouter();

  const [studentName, setStudentName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [previousSchool, setPreviousSchool] = useState("");
  const [applyingGrade, setApplyingGrade] = useState("");
  const [error, setError] = useState("");

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setError("");

  if (!studentName || !dateOfBirth || !gender || !applyingGrade) {
    setError("Please fill in all required fields.");
    return;
  }

  try {
    const response = await fetch("/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: studentName,
        dateOfBirth,
        gender,
        previousSchool,
        applyingGrade,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Failed to create student");
      return;
    }

    console.log("Student created:", data.student);

    // Go to the newly created student's details page
    router.push(`/parent/students/student-details?id=${data.student._id}`);
  } catch (error) {
    console.error(error);
    setError("Something went wrong. Please try again.");
  }
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
            href="/parent/dashboard"
            className="text-sm text-gray-600 hover:text-blue-600"
          >
            ← Dashboard
          </Link>
        </div>
      </nav>

      {/* Page */}
      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Heading */}
        <div>
          <p className="text-sm font-semibold text-blue-600">
            STEP 1 OF 3
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Student Admission Application
          </h1>

          <p className="mt-2 text-gray-500">
            Enter your child&apos;s details to start the admission process.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-2xl bg-white p-8 shadow-sm"
        >
          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Student Name */}
            <div>
              <label
                htmlFor="studentName"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Student Name *
              </label>

              <input
                id="studentName"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student's full name"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label
                htmlFor="dateOfBirth"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Date of Birth *
              </label>

              <input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Gender *
              </label>

              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Previous School */}
            <div>
              <label
                htmlFor="previousSchool"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Previous School
              </label>

              <input
                id="previousSchool"
                type="text"
                value={previousSchool}
                onChange={(e) => setPreviousSchool(e.target.value)}
                placeholder="Enter previous school name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Applying Grade */}
            <div>
              <label
                htmlFor="applyingGrade"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Applying Grade *
              </label>

              <select
                id="applyingGrade"
                value={applyingGrade}
                onChange={(e) => setApplyingGrade(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select grade</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Grade 4">Grade 4</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Link
              href="/parent/dashboard"
              className="rounded-lg border border-gray-300 px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        </form>

        {/* Information */}
        <div className="mt-6 rounded-xl bg-blue-50 p-5">
          <p className="text-sm font-medium text-blue-900">
            Admission Process
          </p>

          <p className="mt-2 text-sm leading-6 text-blue-700">
            After submitting the student details, you will need to
            complete the registration fee payment and book an entrance
            exam slot.
          </p>
        </div>
      </div>
    </main>
  );
}