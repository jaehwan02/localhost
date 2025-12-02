import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Admin email pattern: teacher000@bssm.hs.kr (000 can be any 3 digits)
const ADMIN_EMAIL_PATTERN = /^teacher\d{3}@bssm\.hs\.kr$/;

// Create a Supabase client with the Service Role Key for Admin actions
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceRoleKey!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validate email pattern
    if (!ADMIN_EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { error: "관리자 계정은 teacher000@bssm.hs.kr 형식의 이메일만 사용할 수 있습니다." },
        { status: 400 }
      );
    }

    // Validate password
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 최소 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // Extract teacher ID from email (e.g., teacher001 -> teacher001)
    const teacherId = email.split('@')[0]; // teacher001

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        team_id: teacherId,
        name: teacherId,
        role: 'admin'
      },
    });

    if (authError) {
      // Check if user already exists
      if (authError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "이미 등록된 이메일입니다." },
          { status: 400 }
        );
      }
      throw authError;
    }

    // 2. Create Team Record with Admin Role
    if (authData.user) {
      const { error: dbError } = await supabaseAdmin.from("teams").insert({
        id: authData.user.id,
        team_id: teacherId,
        name: teacherId, // Can be customized later
        coins: 10000, // Admin starts with 10000 coins
        role: 'admin', // Admin role
      });

      if (dbError) {
        // Rollback auth user if DB insert fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

        // Check for unique constraint violation
        if (dbError.message.includes("duplicate") || dbError.code === "23505") {
          return NextResponse.json(
            { error: "이미 존재하는 팀 ID입니다." },
            { status: 400 }
          );
        }

        throw dbError;
      }
    }

    return NextResponse.json({
      success: true,
      message: "관리자 계정이 성공적으로 생성되었습니다.",
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        role: 'admin'
      }
    });
  } catch (error: any) {
    console.error("Admin signup error:", error);
    return NextResponse.json(
      { error: error.message || "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
