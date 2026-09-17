"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { loginSchema, type LoginFormValues } from "@/lib/validations";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    const res = await loginAction({ ...values, next });
    if (res.ok) {
      toast.success(res.message);
      router.push(next && next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } else toast.error(res.message);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="field-label">Adresse email</label>
        <input id="email" type="email" autoComplete="email" className="field-input" placeholder="admin@groupeisi.com" aria-invalid={!!errors.email} {...register("email")} />
        {errors.email && <p className="field-error">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password" className="field-label">Mot de passe</label>
        <div className="relative">
          <input id="password" type={show ? "text" : "password"} autoComplete="current-password" className="field-input pr-12" placeholder="••••••••" aria-invalid={!!errors.password} {...register("password")} />
          <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Masquer" : "Afficher"} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
        </div>
        {errors.password && <p className="field-error">{errors.password.message}</p>}
      </div>
      <Button type="submit" variant="primary" size="lg" className="w-full" loading={isSubmitting}><LogIn className="h-4 w-4" /> Se connecter</Button>
    </form>
  );
}
