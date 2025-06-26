This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment Variables

`NEXT_PUBLIC_API_BASE` sets the base URL used by frontend API calls. If not provided, `/` is used.

## Emotion Training

Run `backend/emotion_trainer.py` with your labeled chat CSV files to build an
`emotion_rules.json` file used by the API. Each CSV should contain `message` and
`emotion` columns (or `text`/`label`). The generated rules allow
`classify_emotion` to infer emotions such as "기쁨" or "슬픔" from incoming
messages.

### GPT-Based Classification

`classify_emotion_gpt` in `backend/services/emotion_classifier.py` can utilize
OpenAI's GPT model to detect an emotion and related keywords from a chat
message. Set the `OPENAI_API_KEY` environment variable and the API will attempt
this method first, falling back to the local rules when GPT is unavailable.

### Redis Chat Storage

Chat records in Redis include the user's emotion so that UIs can display an
emoji next to each message. Each entry stored under `chat:{userId}` has the
following structure:

```json
{
  "userId": "test123",
  "timestamp": "2025-06-26T21:00:00",
  "message": "요즘 너무 우울하고 힘들어요",
  "emotion": "슬픔",
  "keywords": ["우울", "힘들어"]
}
```

