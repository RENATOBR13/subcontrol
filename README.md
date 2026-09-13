<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/a6a0b893-c994-4847-ab3c-3a3005063062

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy na Vercel

1. Importe este repositório no painel da Vercel.
2. Mantenha o framework como `Next.js` e o comando de build como `npm run build`.
3. Configure as variáveis de ambiente `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com os valores do projeto Supabase.
4. Faça o deploy. O arquivo `.env.local` não deve ser enviado ao repositório; use as Environment Variables da Vercel.
