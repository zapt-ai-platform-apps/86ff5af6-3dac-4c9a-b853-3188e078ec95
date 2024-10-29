import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.VITE_PUBLIC_SENTRY_DSN,
  environment: process.env.VITE_PUBLIC_APP_ENV,
  initialScope: {
    tags: {
      type: 'backend',
      projectId: process.env.PROJECT_ID,
    },
  },
});

export default async function handler(req, res) {
  try {
    const { prompt } = req.body;

    // Replace with actual ChatGPT request logic
    const suggestions = await getHairstyleSuggestions(prompt);

    res.status(200).json({ suggestions });
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function getHairstyleSuggestions(prompt) {
  // Placeholder function for ChatGPT API call
  // You should implement the actual API call here
  return [
    { name: 'Classic Bob', description: 'A timeless short hairstyle that...' },
    // Additional suggestions...
  ];
}