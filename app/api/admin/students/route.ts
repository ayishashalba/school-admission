import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      return NextResponse.json(
        {
          success: false,
          message: "JWT_SECRET is not configured",
        },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      role: string;
      email: string;
    };

    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Only admins can access student applications",
        },
        { status: 403 }
      );
    }
    const students = await Student.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      students,
    });
  } catch (error) {
    console.error("ADMIN GET STUDENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch student applications",
      },
      { status: 500 }
    );
  }
}