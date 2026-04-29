import type { NextApiRequest, NextApiResponse } from "next";
import { AppSettings } from "@/functions/AppSettings";

export const config = {
  api: {
    bodyParser: false
  }
};

async function readRawBody(request: NextApiRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

function buildBackendUrl(slug: string[]) {
  return `${AppSettings.backendOrigin}/${slug.join("/")}`;
}

export default async function gatewayHandler(request: NextApiRequest, response: NextApiResponse) {
  const slug = request.query.slug;
  const segments = Array.isArray(slug) ? slug : [String(slug ?? "")];
  const targetUrl = new URL(buildBackendUrl(segments));

  if (request.url?.includes("?")) {
    targetUrl.search = request.url.split("?")[1] ?? "";
  }

  const headers: HeadersInit = {};
  Object.entries(request.headers).forEach(([key, value]) => {
    if (typeof value === "string" && key !== "host" && key !== "content-length") {
      headers[key] = value;
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers
  };

  if (!["GET", "HEAD"].includes(request.method ?? "GET")) {
    const rawBody = await readRawBody(request);
    init.body = new Uint8Array(rawBody);
  }

  const backendResponse = await fetch(targetUrl, init);
  const buffer = Buffer.from(await backendResponse.arrayBuffer());

  response.status(backendResponse.status);
  backendResponse.headers.forEach((value, key) => {
    if (!["transfer-encoding", "content-length", "connection"].includes(key.toLowerCase())) {
      response.setHeader(key, value);
    }
  });

  response.send(buffer);
}