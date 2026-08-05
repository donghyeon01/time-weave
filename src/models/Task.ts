import { Schema, model, models, type Types, type Model } from "mongoose";

export interface ITask {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// 사용자별 조회 및 마감일 기반 조회 성능 향상을 위한 복합 인덱스
TaskSchema.index({ userId: 1, dueDate: 1 });

export const TaskModel =
  (models.Task as Model<ITask> | undefined) ??
  model<ITask>("Task", TaskSchema);
