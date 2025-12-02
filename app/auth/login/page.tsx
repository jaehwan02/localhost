"use client";

import { LoginForm } from "@/components/login-form";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUser(user);

        // Get team info to check role
        const { data: teamData } = await supabase
          .from('teams')
          .select('role')
          .eq('id', user.id)
          .single();

        setTeam(teamData);
      }

      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If user is logged in, show logout option instead of login form
  if (user && team) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Already Logged In</CardTitle>
              <CardDescription>
                You are currently logged in as {user.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Button
                  variant="default"
                  onClick={() => router.push(team.role === 'admin' ? '/admin' : '/community')}
                >
                  Go to {team.role === 'admin' ? 'Admin Dashboard' : 'Community'}
                </Button>
                <form action="/auth/signout" method="post">
                  <Button type="submit" variant="outline" className="w-full">
                    Logout
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
