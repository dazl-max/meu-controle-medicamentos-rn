import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

// Chave "anon public" — feita pra ser usada no app (protegida pelas
// políticas de RLS no banco). A chave secreta (service_role) NUNCA
// deve entrar aqui; ela só existe na Edge Function.
const SUPABASE_URL = "https://cgmwqlphbkledwrujmkw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_e-1g4PW71BLgphkEsvTeqQ_YNWiKBdk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
