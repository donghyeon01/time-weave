export interface User {
  id: string;
  email: string;
  name: string;
  nickname: string;
  profileImage?: string;
  provider: "kakao" | "google";
  providerAccountId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Friend {
  id: string;
  nickname: string;
  email: string;
  profileImage?: string;
}

export interface FriendRequest {
  id: string;
  requesterId: string;
  receiverId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  counterparty?: Friend;
}

export interface RecommendedSlot {
  start: string;
  end: string;
  score: number;
  availableParticipants: string[];
}

export interface SchedulingApiResponse {
  requestId: string;
  slots: {
    startTime: string;
    endTime: string;
    percent: number;
    availableCount: number;
    totalCount: number;
  }[];
}
