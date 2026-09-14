import "server-only";

export interface WhatsAppMessage {
  toPhone: string;
  body: string;
}

export interface WhatsAppProvider {
  send(message: WhatsAppMessage): Promise<{ providerRef?: string }>;
}

/**
 * Development / not-yet-configured fallback. It never calls a real API —
 * it just records that a message *would* be sent, so the rest of the
 * product (confirmations, reminders) can be built and tested end-to-end
 * before an official WhatsApp Business API account is connected.
 */
class NoopWhatsAppProvider implements WhatsAppProvider {
  async send(message: WhatsAppMessage) {
    console.info(`[whatsapp:noop] to=${message.toPhone} body=${message.body}`);
    return {};
  }
}

/**
 * Adapter for the official WhatsApp Business Cloud API (Meta).
 * Requires WHATSAPP_API_TOKEN and WHATSAPP_PHONE_NUMBER_ID to be set —
 * see .env.example. This is the only integration path used: no
 * unofficial/browser-automation WhatsApp libraries, which risk the
 * business's number being banned.
 */
class WhatsAppCloudApiProvider implements WhatsAppProvider {
  constructor(private token: string, private phoneNumberId: string) {}

  async send(message: WhatsAppMessage) {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: message.toPhone,
          type: "text",
          text: { body: message.body },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Falha ao enviar mensagem no WhatsApp: ${errorBody}`);
    }

    const json = (await response.json()) as { messages?: { id?: string }[] };
    return { providerRef: json.messages?.[0]?.id };
  }
}

export function getWhatsAppProvider(): WhatsAppProvider {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (token && phoneNumberId) {
    return new WhatsAppCloudApiProvider(token, phoneNumberId);
  }
  return new NoopWhatsAppProvider();
}
