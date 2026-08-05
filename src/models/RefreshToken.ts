import { Schema, model, models, type Types, type Model } from "mongoose";

export interface IRefreshToken {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenId: string;
  tokenHash: string;
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
  lastAccessedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tokenId: {
      type: String,
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastAccessedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const RefreshTokenModel =
  (models.RefreshToken as Model<IRefreshToken> | undefined) ??
  model<IRefreshToken>("RefreshToken", RefreshTokenSchema);
