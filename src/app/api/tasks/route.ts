import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { getCurrentUser } from "@/lib/auth";
import { getMongoose } from "@/lib/db";
import { validateInput } from "@/zod";
import { createTaskSchema } from "@/zod/task";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/response";
import { createTask, getTasks } from "@/services/taskService";

export async function POST(request: NextRequest) {
  try {
    const { sub } = await getCurrentUser(request);
    await getMongoose();

    const body = await request.json();
    const input = validateInput(createTaskSchema, body);
    const task = await createTask(sub, input);

    return NextResponse.json(createSuccessResponse(task), { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("할 일 생성 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { sub } = await getCurrentUser(request);
    await getMongoose();

    const tasks = await getTasks(sub);

    return NextResponse.json(createSuccessResponse(tasks));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("할 일 목록 조회 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}
