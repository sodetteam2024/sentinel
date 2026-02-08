// app/login/page.tsx
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient"; // 👈 importa el cliente

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");   // lo usamos como email
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    // Supabase Auth: email + password
    const { data, error } = await supabase.auth.signInWithPassword({
      email: usuario,      // 👈 aquí usuario = correo
      password: password,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      setErrorMsg(error.message || "Error al iniciar sesión");
      return;
    }

    // Login OK → al dashboard
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="relative w-full max-w-5xl h-[500px] rounded-3xl overflow-hidden shadow-xl bg-slate-200">
        {/* Fondo */}
        <div className="absolute inset-0 flex">
          <div className="w-[32%] bg-[#1f9bb6]" />
          <div className="flex-1 relative">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/login-hero.png')" }}
            />
            <div className="absolute inset-0 bg-white/30" />
          </div>
        </div>

        {/* Contenido */}
        <div className="relative z-10 flex h-full">
          {/* Tarjeta */}
          <section className="w-[60%] flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-md px-12 py-10 w-[380px]">
              {/* Icono SVG desde /public */}
              <div className="flex justify-center mb-8">
                <Image
                  src="/images/login-user.svg"
                  alt="Login user icon"
                  width={90}
                  height={90}
                  className="opacity-90"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Usuario (email) */}
                <div className="space-y-1">
                  <label
                    htmlFor="usuario"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Usuario
                  </label>
                  <input
                    id="usuario"
                    type="email"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="Ingresa tu correo"
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs text-slate-700 shadow-sm outline-none focus:border-[#1f9bb6] focus:ring-1 focus:ring-[#1f9bb6]/70"
                    required
                  />
                </div>

                {/* Contraseña */}
                <div className="space-y-1">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full h-9 rounded-md border border-slate-200 px-3 text-xs text-slate-700 shadow-sm outline-none focus:border-[#1f9bb6] focus:ring-1 focus:ring-[#1f9bb6]/70"
                    required
                  />
                </div>

                {/* Error */}
                {errorMsg && (
                  <p className="text-[11px] text-red-500 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                    {errorMsg}
                  </p>
                )}

                <div className="pt-2 flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-1.5 rounded-full bg-[#1f9bb6] text-xs font-semibold text-white shadow-md hover:bg-[#17839b] active:scale-[0.98] transition disabled:opacity-60"
                  >
                    {loading ? "Ingresando..." : "Ingresar"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* Columna derecha (vacía por ahora) */}
          <section className="flex-1 flex items-end justify-end pr-10 pb-8 pointer-events-none"></section>
        </div>
      </div>
    </main>
  );
}
