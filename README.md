# New App

## Description

**New App** helps users decide on their next hairstyle by providing personalized suggestions based on their preferences. Users can input their hair length, type, desired style, and color preferences to receive hairstyle ideas. The app also offers additional features like generating images of the suggested hairstyles, audio descriptions, and the ability to save favorites.

## User Journey

1. **Welcome Screen**
   - Users are greeted with a clean interface titled "Hairstyle Helper".

2. **Entering Preferences**
   - Users fill out a form with the following fields:
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

4. **Exploring Suggestions**
   - For each suggested hairstyle, users have the following options:
     - **Show Me**: Generates and displays an image of the hairstyle.
     - **Listen**: Provides an audio description of the hairstyle.
     - **Add to Favorites**: Saves the hairstyle to the user's favorites list for future reference.

5. **Viewing Generated Images**
   - When "Show Me" is clicked, the app displays an AI-generated image representing the hairstyle.

6. **Listening to Audio Descriptions**
   - Users can listen to an audio description that elaborates on the hairstyle's features.

7. **Managing Favorites**
   - Users can view all the hairstyles they've added to favorites in a dedicated section.
   - Each favorite includes the name and description of the hairstyle.

## External API Services

- **ChatGPT API**: Generates hairstyle suggestions based on user preferences.
- **Image Generation API**: Generates images of the hairstyles.
- **Text-to-Speech API**: Converts hairstyle descriptions into audio format.

_Note: API keys for external services should be stored securely in environment variables._

## Environment Variables

- `VITE_PUBLIC_APP_ID`: Your ZAPT App ID.
- `VITE_PUBLIC_SENTRY_DSN`: Your Sentry DSN for error logging.
- `VITE_PUBLIC_APP_ENV`: The environment of the app (e.g., production, development).