import mongoose, { Schema, Types } from "mongoose";

interface ClassDocument {
  _id: Types.ObjectId;
  className: string;
  teacherId: Types.ObjectId;
  studentIds: Types.ObjectId[];
}

const classSchema = new Schema<ClassDocument>(
  {
    className: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    studentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

export const Class = mongoose.model<ClassDocument>("Class", classSchema);
