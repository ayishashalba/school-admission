import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: "JWT_SECRET is not configured" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
    };

    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Only admins can complete admission",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    const body = await request.json();

    const {
      admissionNumber,
      academicYear,
      assignedGrade,
      section,
      admissionDate,
      studentId,
      admissionNotes,
    } = body;

    if (
      !admissionNumber ||
      !academicYear ||
      !assignedGrade ||
      !section ||
      !admissionDate ||
      !studentId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "All admission details are required",
        },
        { status: 400 }
      );
    }

    const student = await Student.findById(id);

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    student.admissionDecision = "ADMITTED";
    student.admissionNumber = admissionNumber;
    student.academicYear = academicYear;
    student.assignedGrade = assignedGrade;
    student.section = section;
    student.admissionDate = new Date(admissionDate);
    student.studentId = studentId;
    student.admissionNotes = admissionNotes || "";

    student.status = "ADMITTED";

    await student.save();

    return NextResponse.json({
      success: true,
      message: "Admission completed successfully",
      student,
    });
  } catch (error) {
    console.error("COMPLETE ADMISSION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to complete admission",
      },
      { status: 500 }
    );
  }
}