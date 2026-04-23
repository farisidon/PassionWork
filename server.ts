import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      console.warn("STRIPE_SECRET_KEY is not defined. Stripe features will be disabled.");
      return null;
    }
    stripe = new Stripe(key);
  }
  return stripe;
};

const app = express();

app.use(express.json());

// API Routes
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message } = req.body;
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const response = await (genAI as any).models.generateContent({
      model: "gemini-3-flash-preview",
      systemInstruction: `You are the PassionWork Career Advisor. 
      CRITICAL: Reply in maximum 2 very short sentences. Be straight, brief, and professional.`,
      contents: message
    });
    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/strategy", async (req, res) => {
  try {
    const { prompt } = req.body;
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const response = await (genAI as any).models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/ai/pulse", async (req, res) => {
  try {
    const { prompt } = req.body;
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const response = await (genAI as any).models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/create-checkout-session", async (req, res) => {
  try {
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.status(500).json({ error: "Stripe is not configured on the server." });
    }

    const { title, company, geo, type, category, url, employerId } = req.body;

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Featured Job: ${title} at ${company}`,
              description: "30-day featured placement on PassionWork",
            },
            unit_amount: 9900, // $99.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.origin}/?session_id={CHECKOUT_SESSION_ID}&view=checkout-success`,
      cancel_url: `${req.headers.origin}/?view=checkout-cancel`,
      metadata: {
        title,
        company,
        employerId
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/create-subscription-session", async (req, res) => {
  try {
    const stripeInstance = getStripe();
    if (!stripeInstance) {
      return res.status(500).json({ error: "Stripe is not configured on the server." });
    }

    const { email, userId } = req.body;

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "PassionWork Pro Subscription",
              description: "Instant job alerts and priority feed access.",
            },
            unit_amount: 1900, // $19.00
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      customer_email: email,
      success_url: `${req.headers.origin}/?session_id={CHECKOUT_SESSION_ID}&view=pro-success`,
      cancel_url: `${req.headers.origin}/?view=pro`,
      metadata: {
        userId,
        type: 'pro-subscription'
      },
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Proxy endpoint to fetch jobs from Jobicy
app.get("/api/jobs", async (req, res) => {
  try {
    const { industry, geo, count } = req.query;
    const params = new URLSearchParams();
    if (industry && industry !== 'all') params.append('industry', String(industry));
    if (geo && geo !== 'all') params.append('geo', String(geo));
    params.append('count', String(count || '20'));

    const jobicyUrl = `https://jobicy.com/api/v2/remote-jobs?${params.toString()}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const response = await fetch(jobicyUrl, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'PassionWork/1.0'
        }
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Jobicy API returned ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (innerError: any) {
      clearTimeout(timeoutId);
      if (innerError.name === 'AbortError') {
        return res.status(504).json({ error: "Jobicy API request timed out" });
      }
      throw innerError;
    }
  } catch (error: any) {
    console.error("Job Proxy Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch jobs from jobicy" });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// Only start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupVite().then(() => {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

export default app;
