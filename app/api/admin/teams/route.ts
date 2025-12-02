import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Create a Supabase client with the Service Role Key for Admin actions
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log("Service Role Key Present:", !!serviceRoleKey);

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
    const { name, teamId, password } = await request.json();

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: `${teamId}@localhost.com`, // Dummy email
      password: password,
      email_confirm: true,
      user_metadata: { team_id: teamId, name: name },
    });

    if (authError) throw authError;

    // 2. Create Team Record
    if (authData.user) {
      const { error: dbError } = await supabaseAdmin.from("teams").insert({
        id: authData.user.id,
        team_id: teamId,
        name: name,
        coins: 1000, // Default coins
        role: 'user', // Explicitly set as regular user (not admin)
      });

      if (dbError) {
        // Rollback auth user if DB insert fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw dbError;
      }
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) throw new Error("Missing ID");

    // 1. Manually delete related data to satisfy foreign key constraints
    await supabaseAdmin.from("media_queue").delete().eq("team_id", id);
    await supabaseAdmin.from("transactions").delete().eq("team_id", id);
    await supabaseAdmin.from("posts").delete().eq("team_id", id);
    await supabaseAdmin.from("bids").delete().eq("team_id", id);
    
    // 2. Delete from public.teams
    const { error: dbError } = await supabaseAdmin.from("teams").delete().eq("id", id);
    if (dbError) throw dbError;

    // 3. Delete Auth User
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, coins } = await request.json();

    const { error } = await supabaseAdmin
      .from("teams")
      .update({ coins })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
