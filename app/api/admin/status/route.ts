import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminSystemStatus } from "@/lib/admin-status";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await getAdminSystemStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    console.error("Error in Admin Status API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
