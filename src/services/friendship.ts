import { Types } from "mongoose";
import { AppError } from "@/lib/error";
import { FriendshipModel, UserModel } from "@/models";
import type { IFriendship } from "@/models/Friendship";
import type { IUser } from "@/models/User";

export interface FriendUserResponse {
  id: string;
  nickname: string;
  email: string;
  profileImage?: string;
}

export interface FriendshipRequestResponse {
  id: string;
  requesterId: string;
  receiverId: string;
  status: IFriendship["status"];
  createdAt: Date;
  updatedAt: Date;
  counterparty?: FriendUserResponse;
}

export interface FriendshipResponse {
  id: string;
  requesterId: string;
  receiverId: string;
  status: IFriendship["status"];
  createdAt: Date;
  updatedAt: Date;
}

function toObjectId(id: string): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError("유효하지 않은 식별자입니다.", 400, "INVALID_ID");
  }
  return new Types.ObjectId(id);
}

function mapUser(user: IUser & { _id: Types.ObjectId }): FriendUserResponse {
  return {
    id: user._id.toString(),
    nickname: user.nickname,
    email: user.email,
    profileImage: user.profileImage,
  };
}

async function findUserByIdentifier(
  identifier: string,
): Promise<IUser & { _id: Types.ObjectId }> {
  const user = await UserModel.findOne({
    $or: [{ email: identifier }, { nickname: identifier }],
  });

  if (!user) {
    throw new AppError("사용자를 찾을 수 없습니다.", 404, "USER_NOT_FOUND");
  }

  return user as IUser & { _id: Types.ObjectId };
}

export async function sendFriendRequest(
  requesterId: string,
  identifier: string,
): Promise<FriendshipRequestResponse> {
  const requester = await UserModel.findById(requesterId);
  if (!requester) {
    throw new AppError("사용자를 찾을 수 없습니다.", 404, "USER_NOT_FOUND");
  }

  const receiver = await findUserByIdentifier(identifier);
  if (requesterId === receiver._id.toString()) {
    throw new AppError(
      "자기 자신에게 친구 요청을 보낼 수 없습니다.",
      400,
      "SELF_REQUEST",
    );
  }

  const requesterObjectId = toObjectId(requesterId);
  const receiverObjectId = new Types.ObjectId(receiver._id);

  const existing = await FriendshipModel.findOne({
    $or: [
      { requesterId: requesterObjectId, receiverId: receiverObjectId },
      { requesterId: receiverObjectId, receiverId: requesterObjectId },
    ],
  });

  if (existing) {
    if (existing.status === "ACCEPTED") {
      throw new AppError("이미 친구 상태입니다.", 409, "ALREADY_FRIEND");
    }
    throw new AppError(
      "이미 처리 중인 친구 요청이 있습니다.",
      409,
      "FRIENDSHIP_ALREADY_EXISTS",
    );
  }

  const friendship = await FriendshipModel.create({
    requesterId: requesterObjectId,
    receiverId: receiverObjectId,
    status: "PENDING",
  });

  return {
    id: friendship._id.toString(),
    requesterId: friendship.requesterId.toString(),
    receiverId: friendship.receiverId.toString(),
    status: "PENDING",
    createdAt: friendship.createdAt,
    updatedAt: friendship.updatedAt,
  };
}

export async function listFriends(
  userId: string,
): Promise<FriendUserResponse[]> {
  const userObjectId = toObjectId(userId);

  const friendships = await FriendshipModel.find({
    status: "ACCEPTED",
    $or: [{ requesterId: userObjectId }, { receiverId: userObjectId }],
  });

  const friendIds = friendships.map((friendship) =>
    friendship.requesterId.equals(userObjectId)
      ? friendship.receiverId
      : friendship.requesterId,
  );

  const friends = await UserModel.find({ _id: { $in: friendIds } });
  const friendMap = new Map(
    friends.map((friend) => [
      friend._id.toString(),
      mapUser(friend as IUser & { _id: Types.ObjectId }),
    ]),
  );

  // 요청자/수신자 순서와 관계없이 일관된 친구 목록 반환
  return friendIds
    .map((id) => friendMap.get(id.toString()))
    .filter((friend): friend is FriendUserResponse => friend !== undefined);
}

async function enrichFriendshipRequests(
  friendships: IFriendship[],
  userObjectId: Types.ObjectId,
): Promise<FriendshipRequestResponse[]> {
  const counterpartyIds = friendships.map((friendship) =>
    friendship.requesterId.equals(userObjectId)
      ? friendship.receiverId
      : friendship.requesterId,
  );

  const users = await UserModel.find({ _id: { $in: counterpartyIds } });
  const userMap = new Map(
    users.map((user) => [
      user._id.toString(),
      mapUser(user as IUser & { _id: Types.ObjectId }),
    ]),
  );

  return friendships.map((friendship) => {
    const counterpartyId = friendship.requesterId.equals(userObjectId)
      ? friendship.receiverId.toString()
      : friendship.requesterId.toString();

    return {
      id: friendship._id.toString(),
      requesterId: friendship.requesterId.toString(),
      receiverId: friendship.receiverId.toString(),
      status: friendship.status,
      createdAt: friendship.createdAt,
      updatedAt: friendship.updatedAt,
      counterparty: userMap.get(counterpartyId),
    };
  });
}

export async function listReceivedRequests(
  userId: string,
): Promise<FriendshipRequestResponse[]> {
  const userObjectId = toObjectId(userId);
  const requests = await FriendshipModel.find({
    receiverId: userObjectId,
    status: "PENDING",
  });

  return enrichFriendshipRequests(requests, userObjectId);
}

export async function listSentRequests(
  userId: string,
): Promise<FriendshipRequestResponse[]> {
  const userObjectId = toObjectId(userId);
  const requests = await FriendshipModel.find({
    requesterId: userObjectId,
    status: "PENDING",
  });

  return enrichFriendshipRequests(requests, userObjectId);
}

export async function acceptFriendRequest(
  friendshipId: string,
  userId: string,
): Promise<FriendshipResponse> {
  const friendship = await FriendshipModel.findById(toObjectId(friendshipId));
  if (!friendship) {
    throw new AppError(
      "친구 요청을 찾을 수 없습니다.",
      404,
      "FRIENDSHIP_NOT_FOUND",
    );
  }

  if (!friendship.receiverId.equals(toObjectId(userId))) {
    throw new AppError("수락 권한이 없습니다.", 403, "FORBIDDEN");
  }

  if (friendship.status !== "PENDING") {
    throw new AppError(
      "이미 처리 완료된 친구 요청입니다.",
      409,
      "ALREADY_PROCESSED",
    );
  }

  friendship.status = "ACCEPTED";
  await friendship.save();

  return {
    id: friendship._id.toString(),
    requesterId: friendship.requesterId.toString(),
    receiverId: friendship.receiverId.toString(),
    status: friendship.status,
    createdAt: friendship.createdAt,
    updatedAt: friendship.updatedAt,
  };
}

export async function deleteOrCancelFriendship(
  friendshipId: string,
  userId: string,
): Promise<void> {
  const userObjectId = toObjectId(userId);
  const friendship = await FriendshipModel.findById(toObjectId(friendshipId));
  if (!friendship) {
    throw new AppError(
      "친구 관계를 찾을 수 없습니다.",
      404,
      "FRIENDSHIP_NOT_FOUND",
    );
  }

  if (
    !friendship.requesterId.equals(userObjectId) &&
    !friendship.receiverId.equals(userObjectId)
  ) {
    throw new AppError("삭제 권한이 없습니다.", 403, "FORBIDDEN");
  }

  await FriendshipModel.findByIdAndDelete(friendship._id);
}

export async function searchUsers(
  userId: string,
  query: string,
): Promise<FriendUserResponse[]> {
  const userObjectId = toObjectId(userId);

  // 정규식 특수문자 이스케이프: 닉네임 검색 안정성 확보
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "i");

  const users = await UserModel.find({
    _id: { $ne: userObjectId },
    $or: [{ nickname: regex }, { email: query }],
  }).limit(20);

  return users.map((user) => mapUser(user as IUser & { _id: Types.ObjectId }));
}
