import { NextRequest, NextResponse } from "next/server";

function base64UrlDecode(value: string): Uint8Array {
  const base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );

  const binary = atob(padded);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function verifyJWT(
  token: string,
  secret: string
) {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const [header, payload, signature] = parts;

    const data = new TextEncoder().encode(
      `${header}.${payload}`
    );

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      {
        name: "HMAC",
        hash: "SHA-256",
      },
      false,
      ["verify"]
    );

    const signatureBytes =
  base64UrlDecode(signature);

const signatureBuffer = new ArrayBuffer(
  signatureBytes.byteLength
);

new Uint8Array(signatureBuffer).set(signatureBytes);

const dataBuffer = new ArrayBuffer(
  data.byteLength
);

new Uint8Array(dataBuffer).set(data);

const valid = await crypto.subtle.verify(
  "HMAC",
  key,
  signatureBuffer,
  dataBuffer
);

    if (!valid) {
      return null;
    }

    const payloadBytes = base64UrlDecode(payload);

    const payloadText = new TextDecoder().decode(
      payloadBytes
    );

    return JSON.parse(payloadText);
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

export async function middleware(
  request: NextRequest
) {
  const pathname = request.nextUrl.pathname;

  const isParentRoute =
    pathname.startsWith("/parent");

  const isAdminRoute =
    pathname.startsWith("/admin");

  // Ignore public pages
  if (!isParentRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  const token =
    request.cookies.get("auth_token")?.value;

  console.log("AUTH:", pathname);
  console.log("TOKEN:", !!token);

  if (!token) {
    console.log("NO TOKEN");

    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  const JWT_SECRET = process.env.JWT_SECRET;

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is missing");

    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  const decoded = await verifyJWT(
    token,
    JWT_SECRET
  );

  if (!decoded) {
    console.log("INVALID TOKEN");

    const response = NextResponse.redirect(
      new URL("/login", request.url)
    );

    response.cookies.delete("auth_token");

    return response;
  }

  console.log("AUTHENTICATED USER:", decoded);

  // Parent route
  if (
    isParentRoute &&
    decoded.role !== "PARENT"
  ) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // Admin route
  if (
    isAdminRoute &&
    decoded.role !== "ADMIN"
  ) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  console.log("ACCESS GRANTED");

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/parent/:path*",
    "/admin/:path*",
  ],
};