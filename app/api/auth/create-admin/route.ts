import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST() {
  try {
    await connectDB();

    const name = "Admission Admin";
    const email = "admin@school.com";
    const password = "admin123";

    const hashedPassword = await bcrypt.hash(password, 10);

    const existingAdmin = await User.findOne({
      email,
    });

    if (existingAdmin) {
      existingAdmin.name = name;
      existingAdmin.password = hashedPassword;
      existingAdmin.role = "ADMIN";

      await existingAdmin.save();

      return NextResponse.json({
        success: true,
        message: "Admin account updated successfully",
        admin: {
          id: existingAdmin._id.toString(),
          name: existingAdmin.name,
          email: existingAdmin.email,
          role: existingAdmin.role,
        },
      });
    }

    const admin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "ADMIN",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Admin account created successfully",
        admin: {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CREATE ADMIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create/update admin",
      },
      { status: 500 }
    );
  }
}