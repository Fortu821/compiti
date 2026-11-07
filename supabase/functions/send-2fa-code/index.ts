import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Nessun header di autorizzazione");
    }

    // Estrai il token JWT dall'header
    const token = authHeader.replace("Bearer ", "");
    
    // Crea il client con la Service Role Key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // 🛡️ FIX DEFINITIVO: Passa il token esplicitamente a getUser()
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error("Errore validazione utente:", userError);
      throw new Error("Utente non autenticato o token non valido.");
    }

    // 1. Controlla il profilo
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("telegram_chat_id, two_factor_method")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Errore DB profilo:", profileError);
      throw new Error("Impossibile leggere il profilo: " + profileError.message);
    }

    if (!profile?.telegram_chat_id) {
      throw new Error("Chat ID Telegram mancante. Vai nelle Impostazioni dell'app e salvalo.");
    }

    // 2. Controlla il token del bot
    const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!telegramToken) {
      throw new Error("TELEGRAM_BOT_TOKEN non configurato nei segreti di Supabase.");
    }

    // 3. Genera e salva il codice
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: dbError } = await supabaseClient
      .from("two_factor_codes")
      .insert({ user_id: user.id, code, expires_at: expiresAt });

    if (dbError) throw new Error("Errore nel salvataggio del codice: " + dbError.message);

    // 4. Invia a Telegram
    const message = `🔐 <b>Codice di verifica HomeWork Share</b>\n\nIl tuo codice è: <code>${code}</code>\n\nScade tra 10 minuti.\n\nSe non hai richiesto tu questo accesso, ignora questo messaggio.`;

    const response = await fetch(
      `https://api.telegram.org/bot${telegramToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: profile.telegram_chat_id,
          text: message,
          parse_mode: "HTML",
        }),
      }
    );

    const telegramData = await response.json();
    
    if (!telegramData.ok) {
      console.error("❌ Errore API Telegram:", telegramData);
      throw new Error(`Telegram ha rifiutato: ${telegramData.description}`);
    }

    console.log("✅ Codice 2FA inviato con successo a", profile.telegram_chat_id);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ ERRORE CRITICO 2FA:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});