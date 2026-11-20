"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "../../components/AuthForm";
import { useAuth } from "../../components/AuthProvider";

export default function LoginPage() {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) router.replace("/");
  }, [router, user]);

  if (!ready || user) return null;

  return <AuthForm mode="login" />;
}
