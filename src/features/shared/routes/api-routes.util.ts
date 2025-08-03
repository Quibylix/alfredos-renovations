import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export function generateApiRouteResponse<T>(
  cb: (req: NextRequest) => Promise<T>,
) {
  return async (req: NextRequest): Promise<NextResponse<T>> => {
    return NextResponse.json(await cb(req));
  };
}

export class ApiResponseRetriever<T> {
  private options: RequestInit = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  constructor(
    private url: string,
    private bodySchema?: z.ZodSchema<T>,
  ) {}

  withMethod(method: "GET" | "POST" | "PUT" | "DELETE") {
    this.options.method = method;
    return this;
  }

  withBody(body: T) {
    const parsedBody = this.bodySchema?.parse(body) ?? body;
    this.options.body = JSON.stringify(parsedBody);
    return this;
  }

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
