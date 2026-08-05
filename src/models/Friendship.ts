import { Schema, model, models, type Types, type Model } from "mongoose";

export interface IFriendship {
  _id: Types.ObjectId;
  requesterId: Types.ObjectId;
  receiverId: Types.ObjectId;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: Date;
  updatedAt: Date;
}

const FriendshipSchema = new Schema<IFriendship>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// 동일한 사용자 쌍으로의 중복 친구 관계 생성 방지
FriendshipSchema.index({ requesterId: 1, receiverId: 1 }, { unique: true });
FriendshipSchema.index({ requesterId: 1, status: 1 });
FriendshipSchema.index({ receiverId: 1, status: 1 });

export const FriendshipModel =
  (models.Friendship as Model<IFriendship> | undefined) ??
  model<IFriendship>("Friendship", FriendshipSchema);
