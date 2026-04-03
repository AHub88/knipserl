import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, unknown> = {};

  // Check DB connection
  try {
    await prisma.$queryRaw`SELECT 1 as ok`;
    checks.dbConnection = "OK";
  } catch (e: unknown) {
    checks.dbConnection = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Check if users table exists
  try {
    const count = await prisma.user.count();
    checks.usersTable = `OK (${count} rows)`;
  } catch (e: unknown) {
    checks.usersTable = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Check if orders table exists
  try {
    const count = await prisma.order.count();
    checks.ordersTable = `OK (${count} rows)`;
  } catch (e: unknown) {
    checks.ordersTable = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Check if vacations table exists
  try {
    const count = await prisma.vacation.count();
    checks.vacationsTable = `OK (${count} rows)`;
  } catch (e: unknown) {
    checks.vacationsTable = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Check all tables in DB
  try {
    const tables = await prisma.$queryRaw<{tablename: string}[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
    `;
    checks.allTables = tables.map((t: {tablename: string}) => t.tablename);
  } catch (e: unknown) {
    checks.allTables = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  checks.env = {
    DATABASE_URL: process.env.DATABASE_URL ? "SET (hidden)" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json(checks, { status: 200 });
}
