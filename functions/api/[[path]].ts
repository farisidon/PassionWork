import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { GoogleGenAI } from "@google/genai";
import Stripe from "stripe";

const app = new Hono().basePath('/api');

interface Env {
  GEMINI_API_KEY: string;
  STRIPE_SECRET_KEY: string;
}

// AI Chat Proxy
app.post('/ai/chat', async (c) => {
  const { message } = await c.req.json();
  const genAI = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY });
  const response = await (genAI as any).models.generateContent({
    model: "gemini-3-flash-preview",
    systemInstruction: `You are the PassionWork Career Advisor. 
    CRITICAL: Reply in maximum 2 very short sentences. Be straight, brief, and professional.`,
    contents: message
  });
  return c.json({ text: response.text });
});

// AI Strategy Proxy
app.post('/ai/strategy', async (c) => {
  const { prompt } = await c.req.json();
  const genAI = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY });
  const response = await (genAI as any).models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });
  return c.json({ text: response.text });
});

// AI Pulse Proxy
app.post('/ai/pulse', async (c) => {
  const { prompt } = await c.req.json();
  const genAI = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY });
  const response = await (genAI as any).models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });
  return c.json({ text: response.text });
});

// Jobs Proxy
app.get('/jobs', async (c) => {
  try {
    const industry = c.req.query('industry');
    const geo = c.req.query('geo');
    const count = c.req.query('count');
    
    const params = new URLSearchParams();
    if (industry && industry !== 'all') params.append('industry', String(industry));
    if (geo && geo !== 'all') params.append('geo', String(geo));
    params.append('count', String(count || '50'));
    
    const response = await fetch(`https://jobicy.com/api/v2/remote-jobs?${params.toString()}`, {
      headers: { 'User-Agent': 'PassionWork/1.0' }
    });
    const data = await response.json();
    return c.json(data);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// Stripe Pro Subscription
app.post('/create-subscription-session', async (c) => {
  const { email, userId } = await c.req.json();
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia" as any
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "PassionWork Pro Subscription",
            description: "Instant job alerts and priority feed access.",
          },
          unit_amount: 1900,
          recurring: { interval: "month" },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    customer_email: email,
    success_url: `${c.req.url.split('/api')[0]}/?session_id={CHECKOUT_SESSION_ID}&view=pro-success`,
    cancel_url: `${c.req.url.split('/api')[0]}/?view=pro`,
    metadata: { userId, type: 'pro-subscription' },
  });

  return c.json({ id: session.id, url: session.url });
});

// Stripe Checkout
app.post('/create-checkout-session', async (c) => {
  const { title, company, geo, type, category, url, employerId } = await c.req.json();
  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia" as any
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Featured Post: ${title} at ${company}`,
            description: "30-day priority placement on PassionWork",
          },
          unit_amount: 9900,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${c.req.url.split('/api')[0]}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${c.req.url.split('/api')[0]}/dashboard`,
    metadata: {
      post_type: "featured_job",
      employerId,
      jobTitle: title,
      companyName: company,
      location: geo,
      jobType: type,
      category,
      jobUrl: url
    },
  });

  return c.json({ id: session.id });
});

// Stripe Verification
app.get('/verify-checkout', async (c) => {
  const sessionId = c.req.query('session_id');
  if (!sessionId) return c.json({ error: "Missing session ID" }, 400);

  const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-01-27.acacia" as any
  });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return c.json({ status: session.payment_status, metadata: session.metadata });
});

export const onRequest = handle(app);
