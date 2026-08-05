import { Schema, model, models, type Types, type Model } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  name: string;
  nickname: string;
  profileImage?: string;
  provider: "kakao" | "google";
  providerAccountId: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nickname: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    profileImage: {
      type: String,
    },
    provider: {
      type: String,
      required: true,
      enum: ["kakao", "google"],
      index: true,
    },
    providerAccountId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// 복합 인덱스: provider + providerAccountId 조합으로 동일 OAuth 계정 중복 방지
UserSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

export const UserModel =
  (models.User as Model<IUser> | undefined) ?? model<IUser>("User", UserSchema);
