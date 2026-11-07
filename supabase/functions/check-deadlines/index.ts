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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calcola la data di domani
    const domani = new Date();
    domani.setDate(domani.getDate() + 1);
    const domaniStr = domani.toISOString().split("T")[0];

    // 1. Compiti in scadenza domani
    const { data: compiti } = await supabaseClient
      .from("compiti")
      .select("materia, richiesta")
      .eq("data_consegna", domaniStr);

    // 2. Verifiche di domani
    const { data: verifiche } = await supabaseClient
      .from("verifiche")
      .select("materia, argomento")
      .eq("data", domaniStr);

    if ((!compiti || compiti.length === 0) && (!verifiche || verifiche.length === 0)) {
      return new Response(
        JSON.stringify({ message: "Nessuna scadenza per domani" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Leggi utenti con promemoria attivo
    const { data: utenti } = await supabaseClient
      .from("notifiche_preferenze")
      .select("user_id, promemoria_scadenze, profiles(telegram_chat_id, nome)")
      .eq("promemoria_scadenze", true);

    const destinatari = (utenti || []).filter((u: any) => u.profiles?.telegram_chat_id);
    if (destinatari.length === 0) {
      return new Response(
        JSON.stringify({ message: "Nessun utente con promemoria attivo" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Costruisci messaggio
    let message = `⏰ <b>Promemoria scadenze di domani</b>\n\n`;
    if (compiti && compiti.length > 0) {
      message += `<b> Compiti:</b>\n`;
      compiti.forEach((c: any) => {
        message += `• ${c.materia}: ${c.richiesta}\n`;
      });
      message += `\n`;
    }
    if (verifiche && verifiche.length > 0) {
      message += `<b>📋 Verifiche:</b>\n`;
      verifiche.forEach((v: any) => {
        message += `• ${v.materia}: ${v.argomento || "Argomento non specificato"}\n`;
      });
    }

    // 5. Invia
    const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    let inviati = 0;

    for (const dest of destinatari) {
      try {
        const res = await fetch(
          `https://api.telegram.org/bot${telegramToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: dest.profiles.telegram_chat_id,
              text: message,
              parse_mode: "HTML",
            }),
          }
        );
        if ((await res.json()).ok) inviati++;
      } catch (err) {
        console.error("Errore:", err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: inviati }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});