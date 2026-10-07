/*
 * WhatsApp alerts for the TCT website.
 *
 * Primary route: the official Meta WhatsApp Business Cloud API — alerts arrive
 * from the TCT business number (a real WhatsApp Business profile), not from a
 * third-party bot. Secondary route: the old CallMeBot webhook, kept only as a
 * fallback so an existing key keeps working.
 *
 * Env vars (read lazily on every call, so importing this module before
 * dotenv.config() runs in server/index.js is safe):
 *   WHATSAPP_TOKEN              system-user / permanent access token
 *   WHATSAPP_PHONE_NUMBER_ID    "Phone number ID" of the sending business number
 *   WHATSAPP_TO                 who receives the alerts (defaults to WA_PHONE)
 *   WHATSAPP_TEMPLATE           optional approved template name (see below)
 *   WHATSAPP_TEMPLATE_LANG      template language code (default "en")
 *   WHATSAPP_API_VERSION        Graph API version (default v23.0)
 *   WA_PHONE / WA_APIKEY        legacy CallMeBot fallback
 *
 * Template or plain text? A business can only start a free-form conversation
 * inside the 24-hour customer service window. Outside it, WhatsApp requires an
 * approved template (category: utility), so alerts should always go through
 * WHATSAPP_TEMPLATE. The live TCT template is:
 *
 *   name  tct_alert_v1   language  en_US   category  Utility
 *   body  "New enquiry from {{1}}. Please open the TCT admin panel for details."
 *
 * Meta rejects a template whose variable sits at the very start or end of the
 * body, and rejects a body with a variable that carries no example value
 * (status REJECTED, reason INVALID_FORMAT) — the example is only needed while
 * creating the template, not when sending. With WHATSAPP_TEMPLATE empty this
 * module falls back to plain text, which works only inside the 24h window.
 */

const digits = (v) => String(v || "").replace(/\D/g, "");
const trimmed = (v) => String(v || "").trim();

export function whatsappConfig() {
  const phone = digits(process.env.WA_PHONE);
  return {
    token: trimmed(process.env.WHATSAPP_TOKEN),
    phoneNumberId: trimmed(process.env.WHATSAPP_PHONE_NUMBER_ID),
    to: digits(process.env.WHATSAPP_TO) || phone,
    template: trimmed(process.env.WHATSAPP_TEMPLATE),
    templateLang: trimmed(process.env.WHATSAPP_TEMPLATE_LANG) || "en",
    graphVersion: trimmed(process.env.WHATSAPP_API_VERSION) || "v23.0",
    phone,
    callmebotKey: trimmed(process.env.WA_APIKEY),
  };
}

/* "meta" | "callmebot" | "off" — reported by /api/health and the CLI tester. */
export function whatsappMode(cfg = whatsappConfig()) {
  if (cfg.token && cfg.phoneNumberId && cfg.to) return "meta";
  if (cfg.phone && cfg.callmebotKey) return "callmebot";
  return "off";
}

/* Template bodies cannot contain line breaks, so template alerts are folded
   into one readable line: "New enquiry — Name · 📞 98765… · 🛠 Web Development". */
export function flattenAlert(text) {
  return String(text || "")
    .replace(/[ \t]*\n+[ \t]*/g, " · ")
    .trim();
}

export function whatsappHelp(cfg = whatsappConfig()) {
  const mode = whatsappMode(cfg);
  if (mode === "meta") {
    return `Meta Cloud API → number ${cfg.to}${cfg.template ? ` (template "${cfg.template}" / ${cfg.templateLang})` : " (plain text — works only inside the 24h customer service window)"}`;
  }
  if (mode === "callmebot") {
    return `CallMeBot fallback → number ${cfg.phone}`;
  }
  return "off — set WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID + WHATSAPP_TO (Meta Cloud API) in server/.env";
}

/* Sends one alert. Never throws: a failed alert must not break a form
   submission, so the result is only logged and returned. */
export async function sendWhatsApp(text, cfg = whatsappConfig()) {
  const mode = whatsappMode(cfg);
  if (mode === "off") {
    console.log(`[alert] WhatsApp skipped — ${whatsappHelp(cfg)}`);
    return { ok: false, mode, detail: "not-configured" };
  }

  try {
    if (mode === "meta") {
      const post = async (payload) => {
        const res = await fetch(
          `https://graph.facebook.com/${cfg.graphVersion}/${cfg.phoneNumberId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${cfg.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        const body = await res.text();
        if (!res.ok) throw new Error(`HTTP ${res.status} — ${body.slice(0, 240)}`);
        try {
          return JSON.parse(body).messages?.[0]?.id || "";
        } catch {
          /* Graph replied with something unexpected — the 2xx is what matters */
          return "";
        }
      };

      const textPayload = {
        messaging_product: "whatsapp",
        to: cfg.to,
        type: "text",
        text: { preview_url: false, body: String(text).slice(0, 4096) },
      };

      let id = "";
      let via = "text";
      let templateError = "";

      if (cfg.template) {
        try {
          id = await post({
            messaging_product: "whatsapp",
            to: cfg.to,
            type: "template",
            template: {
              name: cfg.template,
              language: { code: cfg.templateLang },
              components: [
                {
                  type: "body",
                  parameters: [{ type: "text", text: flattenAlert(text).slice(0, 1024) }],
                },
              ],
            },
          });
          via = "template";
        } catch (err) {
          // A template still under review (Meta returns "template is pending" /
          // not-found) must not cost us the alert: fall through to plain text,
          // which still lands while the 24h customer service window is open.
          templateError = err.message;
          console.error(`[alert] template "${cfg.template}" failed — trying plain text:`, err.message);
        }
      }

      if (via !== "template") {
        try {
          id = await post(textPayload);
        } catch (err) {
          if (templateError) {
            console.error(`[alert] plain-text fallback failed too:`, err.message);
            throw new Error(`template: ${templateError} | text: ${err.message}`);
          }
          throw err;
        }
      }

      console.log(
        `[alert] WhatsApp sent via Meta${via === "template" ? ` template "${cfg.template}"` : " text"} to ${cfg.to}${id ? ` (${id})` : ""}`
      );
      return { ok: true, mode, via, id, ...(templateError ? { templateError } : {}) };
    }

    const url =
      `https://api.callmebot.com/whatsapp.php?phone=${cfg.phone}` +
      `&text=${encodeURIComponent(text)}&apikey=${cfg.callmebotKey}`;
    const res = await fetch(url);
    const body = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (/error/i.test(body.slice(0, 120))) throw new Error(body.slice(0, 120));
    console.log(`[alert] WhatsApp sent via CallMeBot to ${cfg.phone}`);
    return { ok: true, mode };
  } catch (err) {
    console.error(`[alert] WhatsApp send failed (${mode}):`, err.message);
    return { ok: false, mode, detail: err.message };
  }
}
