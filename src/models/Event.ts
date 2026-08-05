import { Schema, model, models, type Types, type Model } from "mongoose";

export interface IEvent {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
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
    },
    location: {
      type: String,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    allDay: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// 사용자별 기간 조회 성능을 위한 복합 인덱스
EventSchema.index({ userId: 1, startTime: 1 });

export const EventModel =
  (models.Event as Model<IEvent> | undefined) ??
  model<IEvent>("Event", EventSchema);
