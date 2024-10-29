# New App

## Description

**New App** helps users decide on their next hairstyle by providing personalized suggestions based on their preferences. Users can input their hair length, type, desired style, and color preferences to receive hairstyle ideas. The app also offers additional features like generating images of the suggested hairstyles, audio descriptions, and the ability to save favorites.

## User Journey

1. **Sign In**
   - Users are prompted to sign in with ZAPT through Supabase authentication.
   - Users can sign in using email (magic link) or social providers like Google, Facebook, or Apple.

2. **Entering Preferences**
   - After signing in, users fill out a form with the following fields:
     - **Hair Length**: Select from Short, Medium, or Long.
     - **Hair Type**: Choose between Straight, Wavy, or Curly.
     - **Desired Style**: Input any specific styles (e.g., Bob, Layers).
     - **Color Preference**: Specify any color preferences (e.g., Natural, Highlights).
   - After entering preferences, users click the "Get Suggestions" button.

3. **Receiving Suggestions**
   - The app provides a list of 5 hairstyle suggestions based on the entered preferences.
   - Each suggestion includes:
     - **Name**: The name of the hairstyle.
     - **Description**: A brief description of the style.
   - Users can perform the following actions for each suggestion:
     - **Show Me**: Generates and displays an image of the hairstyle.
     - **Listen**: Provides an audio description of the hairstyle.
     - **Add to Favorites**: Saves the hairstyle to the user's favorites list in the database for future reference.

4. **Viewing Generated Images**
   - When "Show Me" is clicked, the app displays an AI-generated image representing the hairstyle.

5. **Listening to Audio Descriptions**
   - Users can listen to an audio description that elaborates on the hairstyle's features.

6. **Managing Favorites**
   - Users can view all the hairstyles they've added to favorites in a dedicated section.
   - Favorites are saved to the database and associated with the user's account.
   - Each favorite includes the name and description of the hairstyle.
   - Favorites persist across sessions and devices as long as the user is signed in.

7. **Sign Out**
   - Users can sign out of their account, which will return them to the sign-in page.

## External API Services

- **ChatGPT API**: Generates hairstyle suggestions based on user preferences.
- **Image Generation API**: Generates images of the hairstyles.
- **Text-to-Speech API**: Converts hairstyle descriptions into audio format.

_Note: API keys for external services should be stored securely in environment variables._

## Environment Variables

- `VITE_PUBLIC_APP_ID`: Your ZAPT App ID.
- `VITE_PUBLIC_SENTRY_DSN`: Your Sentry DSN for error logging.
- `VITE_PUBLIC_APP_ENV`: The environment of the app (e.g., production, development).
- `NEON_DB_URL`: The connection string for your Neon database.
