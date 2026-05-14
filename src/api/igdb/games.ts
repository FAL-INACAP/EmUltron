import type { VercelRequest, VercelResponse } from "@vercel/node";

// Deshabilitar el body parser de Vercel para recibir el cuerpo como texto plano
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // Leer el body crudo (texto plano con la query IGDB)
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const body = Buffer.concat(chunks).toString("utf-8");

    const response = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": req.headers["client-id"] as string,
        Authorization: req.headers["authorization"] as string,
        "Content-Type": "text/plain",
      },
      body,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
