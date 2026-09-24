import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";

async function getAdminFromRequest(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET_MISSING");
  }

  const decoded = jwt.verify(token, JWT_SECRET) as {
    userId: string;
    role: string;
    email: string;
  };

  if (decoded.role !== "ADMIN") {
    throw new Error("FORBIDDEN");
  }

  return decoded;
}


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    await getAdminFromRequest(request);

    const { id } = await context.params;

    const student = await Student.findById(id).lean();

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Application not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("GET ADMIN APPLICATION ERROR:", error);

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          {
            success: false,
            message: "Only admins can access applications",
          },
          { status: 403 }
        );
      }

      if (error.message === "JWT_SECRET_MISSING") {
        return NextResponse.json(
          {
            success: false,
            message: "JWT_SECRET is not configured",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch application",
      },
      { status: 500 }
    );
  }
}


export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    await getAdminFromRequest(request);

    const { id } = await context.params;

    const body = await request.json();

    const {
      action,
      examScore,
      examResult,
      examRemarks,
    } = body;

    const student = await Student.findById(id);

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Application not found",
        },
        { status: 404 }
      );
    }


    if (action === "SAVE_EXAM_RESULT") {
      if (
        examScore === undefined ||
        examScore === null ||
        examScore === ""
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Exam score is required",
          },
          { status: 400 }
        );
      }

      if (!examResult) {
        return NextResponse.json(
          {
            success: false,
            message: "Please select an exam result",
          },
          { status: 400 }
        );
      }

      const score = Number(examScore);

      if (Number.isNaN(score) || score < 0 || score > 100) {
        return NextResponse.json(
          {
            success: false,
            message: "Exam score must be between 0 and 100",
          },
          { status: 400 }
        );
      }

      student.examScore = score;
      student.examResult = examResult;
      student.examRemarks = examRemarks || "";
      student.examStatus = "COMPLETED";
      student.status = "EXAM_COMPLETED";

      await student.save();

      return NextResponse.json({
        success: true,
        message: "Exam result saved successfully",
        student,
      });
    }


    if (action === "HOLD") {
      student.status = "ON_HOLD";

      await student.save();

      return NextResponse.json({
        success: true,
        message: "Application placed on hold",
        student,
      });
    }


    if (action === "ADMIT") {
      student.status = "ADMITTED";
      student.admissionDecision = "ADMITTED";
      student.admissionDate = new Date();

      await student.save();

      return NextResponse.json({
        success: true,
        message: "Student admitted successfully",
        student,
      });
    }


    if (action === "REJECT") {
      student.status = "REJECTED";
      student.admissionDecision = "REJECTED";
      student.admissionDate = new Date();

      await student.save();

      return NextResponse.json({
        success: true,
        message: "Application rejected",
        student,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("UPDATE ADMIN APPLICATION ERROR:", error);

    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          {
            success: false,
            message: "Only admins can update applications",
          },
          { status: 403 }
        );
      }

      if (error.message === "JWT_SECRET_MISSING") {
        return NextResponse.json(
          {
            success: false,
            message: "JWT_SECRET is not configured",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update application",
      },
      { status: 500 }
    );
  }
}