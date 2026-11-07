import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: "HTML" | "Markdown";
}

async function sendTelegramMessage(msg: TelegramMessage): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error(" TELEGRAM_BOT_TOKEN non configurato");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      }
    );

    const data = await response.json();
    if (!data.ok) {
      console.error("❌ Errore Telegram:", data);
      return false;
    }
    console.log("✅ Messaggio Telegram inviato a", msg.chat_id);
    return true;
  } catch (error) {
    console.error("❌ Errore fetch Telegram:", error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { chat_id, text, parse_mode = "HTML" } = await req.json();

    if (!chat_id || !text) {
      return new Response(
        JSON.stringify({ error: "chat_id e text sono obbligatori" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const success = await sendTelegramMessage({ chat_id, text, parse_mode });

    return new Response(
      JSON.stringify({ success }),
      { status: success ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});