"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 1️⃣ Type for API
  interface LoginResponse {
  message: string;
  id: string;
  email: string;
  name: string;
  role: string;
}


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("handleSubmit fired");
    try {
      const loginPromise = fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
          credentials: "include",
        }
      ).then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Login failed ❌");
        return json as LoginResponse;
      });

      toast.promise(loginPromise, {
        loading: "Logging in...",
        success: (data) => data.message || "Logged in 🎉",
        error: (err) => err.message || "Something went wrong ❌",
      });

      const data = await loginPromise;
      console.log("Login response:", data);

      const role = data.role?.toLowerCase().trim();

      switch (role) {
        case "admin":
          router.push("/dashboard/admin");
          break;
        case "student":
          router.push("/dashboard/student");
          break;
        case "verifier":
          router.push("/dashboard/verifier");
          break;
        default:
          router.push("/");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-xl border border-gray-200 rounded-md p-4 my-10">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-semibold">
            Login to Your Account
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="mt-2">
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="mt-2">
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="********"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 mt-5">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Logging in..." : "Login"}
            </Button>

            <span className="text-sm text-center">
              Don’t have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </span>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
