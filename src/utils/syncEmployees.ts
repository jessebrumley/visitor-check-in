// === Imports ===
import { supabase } from "../lib/supabase";

// === Types ===
type Employee = {
  id: string;
  display_name: string;
  email: string;
  job_title: string;
};

// === Function ===
export async function syncEmployees(employees: Employee[]) {
  try {
    // Base query for upsert
    if (import.meta.env.DEV) {
      const { data, error } = await supabase
        .from("employees")
        .upsert(employees, {
          onConflict: "email",
          ignoreDuplicates: true,
        })
        .select();

      if (error) throw error;

      console.log("Synced employees:", data);
    } else {
      const { error } = await supabase
        .from("employees")
        .upsert(employees, {
          onConflict: "email",
          ignoreDuplicates: true,
        });

      if (error) throw error;

      console.log("Synced employees (prod): OK");
    }
  } catch (error) {
    console.error("Error syncing employees:", error);
    throw error;
  }
}
