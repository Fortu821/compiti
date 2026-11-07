import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  type: "nuovo_compito" | "nuovo_appunto" | "nuova_verifica" | "risposta_richiesta";
  title: string;
  body: string;
  materia?: string;
  link?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Nessun header di autorizzazione");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) throw new Error("Utente non autenticato");

    const payload: NotificationPayload = await req.json();
    if (!payload.type || !payload.title || !payload.body) {
      throw new Error("Payload incompleto");
    }

    // 1. Leggi le preferenze di TUTTI gli utenti
    const { data: preferenze, error: prefError } = await supabaseClient
      .from("notifiche_preferenze")
      .select("user_id, " + payload.type + ", profiles(telegram_chat_id, nome)");

    if (prefError) throw prefError;

    // 2. Filtra solo chi ha la notifica attiva E ha un chat_id
    const destinatari = (preferenze || []).filter(
      (p: any) => p[payload.type] === true && p.profiles?.telegram_chat_id
    );

    if (destinatari.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "Nessun destinatario" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Costruisci il messaggio
    const emojiMap: Record<string, string> = {
      nuovo_compito: "📝",
      nuovo_appunto: "📓",
      nuova_verifica: "📋",
      risposta_richiesta: "🙋",
    };
    const emoji = emojiMap[payload.type] || "🔔";

    const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    let inviati = 0;

    // 4. Invia a ciascun destinatario
    for (const dest of destinatari) {
      const chatId = dest.profiles.telegram_chat_id;
      const nomeDestinatario = dest.profiles.nome || "Utente";
      
      let message = `${emoji} <b>${payload.title}</b>\n\n${payload.body}`;
      if (payload.materia) message += `\n\n📚 Materia: ${payload.materia}`;
      if (payload.link) message += `\n\n <a href="${payload.link}">Apri nell'app</a>`;

      try {
        const res = await fetch(
          `https://api.telegram.org/bot${telegramToken}/sendMessage`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: "HTML",
            }),
          }
        );
        const data = await res.json();
        if (data.ok) inviati++;
        else console.error(`Errore invio a ${nomeDestinatario}:`, data);
      } catch (err) {
        console.error(`Errore fetch per ${nomeDestinatario}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: inviati, total: destinatari.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});