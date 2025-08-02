import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export function generateApiRouteResponse<T>(
  cb: (req: NextRequest) => Promise<T>,
) {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    return NextResponse.json(await cb(req));
  };
}

export class ApiResponseRetriever {
  constructor(
    private readonly url: string,
    private readonly options?: RequestInit,
  ) {}

  async retrieve<T>(schema?: z.ZodSchema<T>): Promise<T> {
    const response = await fetch(this.url, this.options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (schema) {
      return schema.parse(data);
    }

    return data;
  }
}
