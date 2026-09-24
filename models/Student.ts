import mongoose, { Schema, Model } from "mongoose";

export interface IStudent {
  name: string;
  dateOfBirth: Date;
  gender: string;
  previousSchool: string;
  applyingGrade: string;

  parentId: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;

  status: string;

  registrationFeePaid: boolean;

  paymentMethod: string;
  paymentStatus: string;
  paymentDate?: Date;

  examDate: string;
  examTime: string;
  examStatus: string;

  examScore?: number;
  examResult?: string;
  examRemarks?: string;

admissionDecision?: string;
admissionNumber?: string;
academicYear?: string;
assignedGrade?: string;
section?: string;
admissionDate?: Date;
studentId?: string;
admissionNotes?: string;
}

const StudentSchema = new Schema<IStudent>(
  {

    name: {
      type: String,
      required: true,
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      required: true,
    },

    gender: {
      type: String,
      required: true,
    },

    previousSchool: {
      type: String,
      default: "",
      trim: true,
    },

    applyingGrade: {
      type: String,
      required: true,
    },


    parentId: {
      type: String,
      required: true,
    },

    parentName: {
      type: String,
      required: true,
      trim: true,
    },

    parentEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    parentPhone: {
      type: String,
      default: "",
      trim: true,
    },


    status: {
      type: String,
      default: "APPLICATION_CREATED",
    },


    registrationFeePaid: {
      type: Boolean,
      default: false,
    },

    paymentMethod: {
      type: String,
      default: "",
    },

    paymentStatus: {
      type: String,
      default: "PENDING",
    },

    paymentDate: {
      type: Date,
    },

    examDate: {
      type: String,
      default: "",
    },

    examTime: {
      type: String,
      default: "",
    },

    examStatus: {
      type: String,
      default: "NOT_BOOKED",
    },

    examScore: {
      type: Number,
      default: null,
    },

    examResult: {
      type: String,
      default: "",
    },

    examRemarks: {
      type: String,
      default: "",
    },

    admissionDecision: {
  type: String,
  default: "",
},

admissionNumber: {
  type: String,
  default: "",
},

academicYear: {
  type: String,
  default: "",
},

assignedGrade: {
  type: String,
  default: "",
},

section: {
  type: String,
  default: "",
},

admissionDate: {
  type: Date,
},

studentId: {
  type: String,
  default: "",
},

admissionNotes: {
  type: String,
  default: "",
},
  },
  {
    timestamps: true,
  }
);

const Student: Model<IStudent> =
  mongoose.models.Student ||
  mongoose.model<IStudent>("Student", StudentSchema);

export default Student;