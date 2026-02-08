import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Contratista } from "../types";

export function useContratistas() {
  const [contratistas, setContratistas] = useState<Contratista[]>([]);
  const [loadingContratistas, setLoadingContratistas] = useState(false);

  useEffect(() => {
    const fetchContratistas = async () => {
      setLoadingContratistas(true);
      try {
        const { data, error } = await supabase
          .from("contratistas")
          .select("id, nombre")
          .order("nombre", { ascending: true });

        if (error) throw error;
        setContratistas((data ?? []) as Contratista[]);
      } catch (e: unknown) {
        console.error("Error al cargar contratistas:", e);
      } finally {
        setLoadingContratistas(false);
      }
    };

    fetchContratistas();
  }, []);

  return { contratistas, loadingContratistas };
}