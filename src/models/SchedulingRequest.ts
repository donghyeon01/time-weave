import { Schema, model, models, type Types, type Model } from "mongoose";

export interface ISchedulingRequest {
  _id: Types.ObjectId;
  hostId: Types.ObjectId;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  slotMinutes?: number;
  status: "OPEN" | "VOTING" | "CONFIRMED" | "CANCELLED";
  participantIds: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const SchedulingRequestSchema = new Schema<ISchedulingRequest>(
  {
    hostId: {
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
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    slotMinutes: {
      type: Number,
      min: [15, "슬롯 간격은 최소 15분이어야 합니다."],
      max: [180, "슬롯 간격은 최대 180분이어야 합니다."],
    },
    status: {
      type: String,
      required: true,
      enum: ["OPEN", "VOTING", "CONFIRMED", "CANCELLED"],
      default: "OPEN",
      index: true,
    },
    participantIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      required: true,
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// 호스트 기반 조율 요청 조회 성능을 위한 복합 인덱스
SchedulingRequestSchema.index({ hostId: 1, status: 1 });

export const SchedulingRequestModel =
  (models.SchedulingRequest as Model<ISchedulingRequest> | undefined) ??
  model<ISchedulingRequest>("SchedulingRequest", SchedulingRequestSchema);
