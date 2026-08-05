import { NextRequest, NextResponse } from "next/server";
import { AppError } from "@/lib/error";
import { getCurrentUser } from "@/lib/auth";
import { getMongoose } from "@/lib/db";
import { validateInput } from "@/zod";
import { updateTaskSchema, taskIdParamSchema } from "@/zod/task";
import {
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/response";
import { updateTask, deleteTask } from "@/services/taskService";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { sub } = await getCurrentUser(request);
    await getMongoose();

    const validId = validateInput(taskIdParamSchema, id);
    const body = await request.json();
    const input = validateInput(updateTaskSchema, body);

    const task = await updateTask(sub, validId, input);

    return NextResponse.json(createSuccessResponse(task));
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("할 일 수정 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { sub } = await getCurrentUser(request);
    await getMongoose();

    const validId = validateInput(taskIdParamSchema, id);
    await deleteTask(sub, validId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        createErrorResponse(error.message, error.code, error.details),
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      createErrorResponse("할 일 삭제 중 오류가 발생했습니다."),
      { status: 500 },
    );
  }
}
