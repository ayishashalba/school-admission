import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";

export async function POST(request: NextRequest) {
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

    if (decoded.role !== "PARENT") {
      return NextResponse.json(
        { success: false, message: "Only parents can make payments" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { studentId, paymentMethod } = body;

    if (!studentId || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          message: "Student ID and payment method are required",
        },
        { status: 400 }
      );
    }

    const allowedMethods = ["UPI", "CARD", "NET_BANKING"];

    if (!allowedMethods.includes(paymentMethod)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payment method",
        },
        { status: 400 }
      );
    }

    const student = await Student.findOne({
      _id: studentId,
      parentId: decoded.userId,
    });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          message: "Student not found",
        },
        { status: 404 }
      );
    }

    if (student.registrationFeePaid) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration fee has already been paid",
        },
        { status: 400 }
      );
    }

    student.registrationFeePaid = true;
    student.status = "REGISTRATION_FEE_PAID";

    await student.save();

    return NextResponse.json({
      success: true,
      message: "Registration fee paid successfully",
      student,
    });
  } catch (error) {
    console.error("PAYMENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Payment failed",
      },
      { status: 500 }
    );
  }
}