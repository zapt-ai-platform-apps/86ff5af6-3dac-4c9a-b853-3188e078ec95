import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.VITE_PUBLIC_SENTRY_DSN,
  environment: process.env.VITE_PUBLIC_APP_ENV,
  initialScope: {
    tags: {
      type: 'backend',
      projectId: process.env.VITE_PUBLIC_APP_ID,
    },
  },
});

export default async function handler(req, res) {
  try {
    const { prompt } = req.body;

    // Replace with actual image generation logic
    const imageUrl = await generateImageFromPrompt(prompt);

    res.status(200).json({ imageUrl });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function generateImageFromPrompt(prompt) {
  // Placeholder function for image generation API call
  // You should implement the actual API call here
  return 'https://example.com/generated-image.png';
}