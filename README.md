# PassionWork 🚀

Turn your passion into a remote career. **PassionWork** is a high-density, modern job board specifically designed for the remote work economy. It curates the best roles from across the web and offers a premium, glassmorphic interface for job seekers and employers.

![PassionWork Preview](https://placehold.co/1200x600/2563EB/FFFFFF?text=PassionWork+Remote+Jobs)

## ✨ Features

- 💎 **Curated Remote Roles:** Real-time ingestion from premium job sources.
- 🎨 **Glassmorphic Design:** A sleek, tech-forward UI with smooth Framer Motion animations.
- ⚡ **Turbo Dashboard:** Instantly filter by region, job type, and category without page reloads.
- 🏢 **Employer Hub:** Post jobs, track analytics, and manage postings with ease.
- 💳 **Stripe Integration:** Seamless checkout for featured postings and Pro upgrades.
- 🔐 **Firebase Auth:** Secure, one-tap Google sign-in.
- 🌓 **Dark Mode:** Fully responsive, native dark mode support.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, Framer Motion
- **Backend:** Express (via Vercel Serverless Functions)
- **Database/Auth:** Firebase (Firestore & Auth)
- **Payments:** Stripe API
- **AI:** Google Gemini API (integrated for smart job matching & support)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/passionwork.git
cd passionwork
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root based on `.env.example`:
```env
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
GEMINI_API_KEY=...
```

### 4. Run the development server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

## 📦 Deployment

This project is optimized for **Vercel**. 

1. Push your code to GitHub.
2. Connect your repo in the [Vercel Dashboard](https://vercel.com).
3. Add your environment variables in Vercel.
4. **Important:** Add your Vercel deployment URL to "Authorized Domains" in your Firebase Project settings.

## 📄 License

MIT License - feel free to use this as a template for your own career marketplace!
