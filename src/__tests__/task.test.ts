import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
  type Mock,
} from "vitest";
import { NextRequest } from "next/server";
import { validateInput } from "@/zod";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
} from "@/zod/task";
import { getCurrentUser } from "@/lib/auth";
import { getMongoose } from "@/lib/db";
import { TaskModel } from "@/models";
import { GET as getTasks, POST as createTask } from "@/app/api/tasks/route";
import {
  PUT as updateTask,
  DELETE as deleteTask,
} from "@/app/api/tasks/[id]/route";
import type { AccessTokenPayload } from "@/lib/jwt";
import type { Mongoose } from "mongoose";

interface TaskDoc {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  save: () => Promise<TaskDoc>;
  deleteOne: () => Promise<void>;
}

type CreateTaskDocData = Omit<
  TaskDoc,
  "_id" | "createdAt" | "updatedAt" | "save" | "deleteOne"
> & {
  _id?: string;
};

const mockTaskModel = vi.hoisted(() => {
  let store: TaskDoc[] = [];
  let seq = 0;

  const nextId = () => (seq++).toString(16).padStart(24, "0");

  const createDoc = (data: CreateTaskDocData): TaskDoc => {
    const now = new Date();
    const id = data._id ?? nextId();
    const doc: TaskDoc = {
      _id: id,
      userId: data.userId,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate,
      completed: data.completed ?? false,
      createdAt: now,
      updatedAt: now,
      save: async () => {
        doc.updatedAt = new Date();
        return doc;
      },
      deleteOne: async () => {
        store = store.filter((t) => t._id !== id);
      },
    };
    return doc;
  };

  return {
    create: vi.fn(async (data: CreateTaskDocData) => {
      const doc = createDoc(data);
      store.push(doc);
      return doc;
    }),
    find: vi.fn((filter: { userId: string }) => ({
      sort: () => ({
        exec: async (): Promise<TaskDoc[]> => {
          const filtered = store.filter((t) => t.userId === filter.userId);
          return [...filtered].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
          );
        },
      }),
    })),
    findById: vi.fn((id: string) => ({
      exec: async (): Promise<TaskDoc | null> =>
        store.find((t) => t._id === id) ?? null,
    })),
    __reset: () => {
      store = [];
      seq = 0;
    },
  };
});

vi.mock("@/models", () => ({ TaskModel: mockTaskModel }));
vi.mock("@/lib/auth", () => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/db", () => ({ getMongoose: vi.fn() }));

const ownerId = "000000000000000000000001";
const otherId = "000000000000000000000002";

const ownerPayload: AccessTokenPayload = {
  sub: ownerId,
  email: "owner@example.com",
  name: "Owner",
  nickname: "owner",
  provider: "kakao",
};

const otherPayload: AccessTokenPayload = {
  sub: otherId,
  email: "other@example.com",
  name: "Other",
  nickname: "other",
  provider: "google",
};

describe("Task Zod 스키마", () => {
  it("유효한 할 일 본문을 통과시킨다", () => {
    const data = {
      title: "할 일",
      description: "설명",
      dueDate: "2025-06-01T00:00:00.000Z",
      completed: false,
    };
    const parsed = validateInput(createTaskSchema, data);
    expect(parsed.title).toBe("할 일");
    expect(parsed.dueDate?.toISOString()).toBe("2025-06-01T00:00:00.000Z");
    expect(parsed.completed).toBe(false);
  });

  it("제목이 없으면 생성 스키마를 거부한다", () => {
    expect(() => validateInput(createTaskSchema, {})).toThrow();
  });

  it("완료 상태만 변경하는 수정 입력을 통과시킨다", () => {
    const parsed = validateInput(updateTaskSchema, { completed: true });
    expect(parsed.completed).toBe(true);
    expect(parsed.title).toBeUndefined();
  });

  it("24자리 hex ID를 통과시키고 잘못된 ID를 거부한다", () => {
    const valid = "0123456789abcdef01234567";
    expect(validateInput(taskIdParamSchema, valid)).toBe(valid);
    expect(() => validateInput(taskIdParamSchema, "not-an-id")).toThrow();
  });
});

describe("Task API 통합", () => {
  const taskModel = TaskModel as unknown as typeof mockTaskModel;

  beforeAll(() => {
    process.env.JWT_SECRET = "test-jwt-secret-for-todo-tasks";
  });

  beforeEach(() => {
    taskModel.__reset();
    vi.clearAllMocks();
    vi.mocked(getMongoose).mockResolvedValue({} as unknown as Mongoose);
    vi.mocked(getCurrentUser).mockImplementation(async (req: NextRequest) => {
      const auth = req.headers.get("authorization");
      if (auth === "Bearer owner-token") return ownerPayload;
      if (auth === "Bearer other-token") return otherPayload;
      throw new Error("Unauthorized");
    });
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("POST /api/tasks 는 할 일을 생성하고 201 응답한다", async () => {
    const request = new NextRequest("http://localhost:3000/api/tasks", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer owner-token",
      },
      body: JSON.stringify({
        title: "새 할 일",
        description: "설명",
        dueDate: "2025-06-01T00:00:00.000Z",
      }),
    });

    const response = await createTask(request);
    expect(response.status).toBe(201);

    const json = (await response.json()) as {
      success: boolean;
      data: { title: string; completed: boolean };
    };
    expect(json.success).toBe(true);
    expect(json.data.title).toBe("새 할 일");
    expect(json.data.completed).toBe(false);
  });

  it("GET /api/tasks 는 로그인한 사용자의 할 일만 반환한다", async () => {
    await taskModel.create({
      userId: ownerId,
      title: "내 할 일",
      completed: false,
    });
    await taskModel.create({
      userId: otherId,
      title: "남의 할 일",
      completed: false,
    });

    const request = new NextRequest("http://localhost:3000/api/tasks", {
      headers: { authorization: "Bearer owner-token" },
    });

    const response = await getTasks(request);
    const json = (await response.json()) as {
      success: boolean;
      data: { title: string }[];
    };
    const titles = json.data.map((t) => t.title);
    expect(titles).toContain("내 할 일");
    expect(titles).not.toContain("남의 할 일");
  });

  it("PUT /api/tasks/[id] 는 작성자만 할 일을 수정할 수 있다", async () => {
    const task = await taskModel.create({
      userId: ownerId,
      title: "수정 전",
      completed: false,
    });
    const taskId = task._id;

    const request = new NextRequest(
      `http://localhost:3000/api/tasks/${taskId}`,
      {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer owner-token",
        },
        body: JSON.stringify({ completed: true }),
      },
    );

    const response = await updateTask(request, {
      params: Promise.resolve({ id: taskId }),
    });
    const json = (await response.json()) as {
      success: boolean;
      data: { title: string; completed: boolean };
    };
    expect(json.success).toBe(true);
    expect(json.data.title).toBe("수정 전");
    expect(json.data.completed).toBe(true);

    const otherRequest = new NextRequest(
      `http://localhost:3000/api/tasks/${taskId}`,
      {
        method: "PUT",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer other-token",
        },
        body: JSON.stringify({ completed: false }),
      },
    );

    const forbidden = await updateTask(otherRequest, {
      params: Promise.resolve({ id: taskId }),
    });
    expect(forbidden.status).toBe(403);
  });

  it("DELETE /api/tasks/[id] 는 204 응답하며 작성자만 삭제할 수 있다", async () => {
    const task = await taskModel.create({
      userId: ownerId,
      title: "삭제 대상",
      completed: false,
    });
    const taskId = task._id;

    const otherRequest = new NextRequest(
      `http://localhost:3000/api/tasks/${taskId}`,
      {
        method: "DELETE",
        headers: { authorization: "Bearer other-token" },
      },
    );
    const forbidden = await deleteTask(otherRequest, {
      params: Promise.resolve({ id: taskId }),
    });
    expect(forbidden.status).toBe(403);

    const request = new NextRequest(
      `http://localhost:3000/api/tasks/${taskId}`,
      {
        method: "DELETE",
        headers: { authorization: "Bearer owner-token" },
      },
    );
    const response = await deleteTask(request, {
      params: Promise.resolve({ id: taskId }),
    });
    expect(response.status).toBe(204);

    const deleted = await taskModel.findById(taskId).exec();
    expect(deleted).toBeNull();
  });
});
