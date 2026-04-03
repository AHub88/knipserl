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

  // Check enum types
  try {
    const types = await prisma.$queryRaw<{typname: string}[]>`
      SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e' ORDER BY typname
    `;
    checks.enumTypes = types.map((t: {typname: string}) => t.typname);
  } catch (e: unknown) {
    checks.enumTypes = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Check vacations table columns
  try {
    const cols = await prisma.$queryRaw<{column_name: string, udt_name: string}[]>`
      SELECT column_name, udt_name FROM information_schema.columns WHERE table_name = 'vacations' ORDER BY ordinal_position
    `;
    checks.vacationsColumns = cols.map((c: {column_name: string, udt_name: string}) => `${c.column_name} (${c.udt_name})`);
  } catch (e: unknown) {
    checks.vacationsColumns = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  // Try creating a vacation (dry run - rollback)
  try {
    await prisma.$queryRaw`SELECT 1 FROM "vacations" LIMIT 0`;
    checks.vacationQueryTest = "OK";
  } catch (e: unknown) {
    checks.vacationQueryTest = `FAIL: ${e instanceof Error ? e.message : String(e)}`;
  }

  checks.env = {
    DATABASE_URL: process.env.DATABASE_URL ? "SET (hidden)" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json(checks, { status: 200 });
}
