import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import User from "@/models/User";

export async function POST(request: NextRequest) {
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

    if (decoded.role !== "PARENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Only parents can create students",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      name,
      dateOfBirth,
      gender,
      previousSchool,
      applyingGrade,
    } = body;

    if (!name || !dateOfBirth || !gender || !applyingGrade) {
      return NextResponse.json(
        {
          success: false,
          message: "Required student fields are missing",
        },
        { status: 400 }
      );
    }

    const parent = await User.findById(decoded.userId);

    if (!parent) {
      return NextResponse.json(
        {
          success: false,
          message: "Parent account not found",
        },
        { status: 404 }
      );
    }

    const student = await Student.create({
  name,
  dateOfBirth,
  gender,
  previousSchool: previousSchool || "",
  applyingGrade,
  parentId: parent._id.toString(),
  parentName: parent.name,
  parentEmail: parent.email,
  parentPhone: "",
  status: "APPLICATION_CREATED",
  registrationFeePaid: false,
});

    return NextResponse.json(
      {
        success: true,
        student,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE STUDENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create student",
      },
      { status: 500 }
    );
  }
}

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
    if (decoded.role === "ADMIN") {
      const students = await Student.find({})
        .sort({ createdAt: -1 })
        .lean();

      return NextResponse.json({
        success: true,
        students,
      });
    }
    if (decoded.role === "PARENT") {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");

      if (id) {
        const student = await Student.findOne({
          _id: id,
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

        return NextResponse.json({
          success: true,
          student,
        });
      }
      const students = await Student.find({
        parentId: decoded.userId,
      }).sort({
        createdAt: -1,
      });

      return NextResponse.json({
        success: true,
        students,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid user role",
      },
      { status: 403 }
    );
  } catch (error) {
    console.error("GET STUDENTS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch students",
      },
      { status: 500 }
    );
  }
}
export async function PATCH(request: NextRequest) {
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
        { success: false, message: "Only parents can update students" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      studentId,
      paymentMethod,
      examDate,
      examTime,
    } = body;

    const student = await Student.findOne({
      _id: studentId,
      parentId: decoded.userId,
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: "Student not found" },
        { status: 404 }
      );
    }

    if (paymentMethod) {
      student.paymentMethod = paymentMethod;
      student.paymentStatus = "PAID";
      student.paymentDate = new Date();
      student.registrationFeePaid = true;
      student.status = "FEE_PAID";
    }

    if (examDate && examTime) {
      student.examDate = examDate;
      student.examTime = examTime;
      student.examStatus = "BOOKED";
      student.status = "EXAM_BOOKED";
    }

    await student.save();

    return NextResponse.json({
      success: true,
      student,
    });
  } catch (error) {
    console.error("UPDATE STUDENT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update student",
      },
      { status: 500 }
    );
  }
}