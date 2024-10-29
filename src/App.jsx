import { createSignal, onMount, createEffect, For, Show } from 'solid-js';
import { createEvent, supabase } from './supabaseClient';
import { SolidMarkdown } from 'solid-markdown';
import { Auth } from '@supabase/auth-ui-solid';
import { ThemeSupa } from '@supabase/auth-ui-shared';

function App() {
  const [preferences, setPreferences] = createSignal({
    hairLength: '',
    hairType: '',
    desiredStyle: '',
    colorPreference: '',
  });
  const [suggestions, setSuggestions] = createSignal([]);
  const [selectedStyle, setSelectedStyle] = createSignal(null);
  const [generatedImage, setGeneratedImage] = createSignal('');
  const [audioUrl, setAudioUrl] = createSignal('');
  const [loadingSuggestions, setLoadingSuggestions] = createSignal(false);
  const [loadingImage, setLoadingImage] = createSignal(false);
  const [loadingAudio, setLoadingAudio] = createSignal(false);
  const [favorites, setFavorites] = createSignal([]);
  const [user, setUser] = createSignal(null);
  const [currentPage, setCurrentPage] = createSignal('login');
  const [errorMessage, setErrorMessage] = createSignal('');

  // Authentication handling
  const checkUserSignedIn = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      setCurrentPage('homePage');
      fetchFavorites();
    }
  };

  onMount(checkUserSignedIn);

  createEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user);
        setCurrentPage('homePage');
        fetchFavorites();
      } else {
        setUser(null);
        setCurrentPage('login');
      }
    });

    return () => {
      authListener.unsubscribe();
    };
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('login');
  };

  const handleInputChange = (field, value) => {
    setPreferences({ ...preferences(), [field]: value });
  };

  const getSuggestions = async () => {
    setLoadingSuggestions(true);
    setErrorMessage('');
    try {
      const prompt = `Based on the following preferences, suggest 5 hairstyle ideas. Provide the suggestions in a JSON array with each element containing "name" and "description" fields.
Preferences:
- Hair Length: ${preferences().hairLength}
- Hair Type: ${preferences().hairType}
- Desired Style: ${preferences().desiredStyle}
- Color Preference: ${preferences().colorPreference}`;

      const result = await createEvent('chatgpt_request', {
        prompt,
        response_type: 'json',
      });
      if (Array.isArray(result)) {
        setSuggestions(result);
      } else if (Array.isArray(result.suggestions)) {
        setSuggestions(result.suggestions);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setErrorMessage('Failed to get suggestions. Please try again.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const generateImage = async (style) => {
    setLoadingImage(true);
    setErrorMessage('');
    try {
      const prompt = `Generate an image of a person with ${preferences().hairLength} ${preferences().hairType} hair styled as ${style.name} with ${preferences().colorPreference} color.`;
      const imageUrl = await createEvent('generate_image', {
        prompt,
      });
      setGeneratedImage(imageUrl.imageUrl || imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      setErrorMessage('Failed to generate image. Please try again.');
    } finally {
      setLoadingImage(false);
    }
  };

  const generateAudio = async (style) => {
    setLoadingAudio(true);
    setErrorMessage('');
    try {
      const text = `The ${style.name} is a ${preferences().desiredStyle} hairstyle that ${style.description}`;
      const audio = await createEvent('text_to_speech', {
        text,
      });
      setAudioUrl(audio.audioUrl || audio);
    } catch (error) {
      console.error('Error generating audio:', error);
      setErrorMessage('Failed to generate audio. Please try again.');
    } finally {
      setLoadingAudio(false);
    }
  };

  // Fetch favorites from API
  const fetchFavorites = async () => {
    setErrorMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/getFavorites', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else {
        console.error('Error fetching favorites:', response.statusText);
        setErrorMessage('Failed to fetch favorites. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setErrorMessage('Failed to fetch favorites. Please try again.');
    }
  };

  // Add to Favorites function
  const addToFavorites = async (style) => {
    if (favorites().some((fav) => fav.name === style.name)) {
      return; // Already in favorites
    }
    setErrorMessage('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch('/api/saveFavorite', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: style.name,
          description: style.description,
        }),
      });
      if (response.ok) {
        const savedFavorite = await response.json();
        setFavorites([...favorites(), savedFavorite]);
      } else {
        console.error('Error saving favorite:', response.statusText);
        setErrorMessage('Failed to save favorite. Please try again.');
      }
    } catch (error) {
      console.error('Error saving favorite:', error);
      setErrorMessage('Failed to save favorite. Please try again.');
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-pink-100 to-yellow-100 p-4">
      <Show
        when={currentPage() === 'homePage'}
        fallback={
          // Show login page
          <div class="flex items-center justify-center min-h-screen">
            <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
              <h2 class="text-3xl font-bold mb-6 text-center text-pink-600">Sign in with ZAPT</h2>
              <a
                href="https://www.zapt.ai"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-500 hover:underline mb-6 block text-center"
              >
                Learn more about ZAPT
              </a>
              <Auth
                supabaseClient={supabase}
                appearance={{ theme: ThemeSupa }}
                providers={['google', 'facebook', 'apple']}
                magicLink={true}
                view="magic_link"
                showLinks={false}
                authView="magic_link"
              />
            </div>
          </div>
        }
      >
        {/* Main App UI */}
        <div class="max-w-4xl mx-auto h-full">
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-4xl font-bold text-pink-600">Hairstyle Helper</h1>
            <button
              class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleSignOut}
            >
              Sign Out
            </button>
          </div>

          {/* Error Message */}
          <Show when={errorMessage()}>
            <div class="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
              {errorMessage()}
            </div>
          </Show>

          {/* Preferences Form */}
          <div class="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 class="text-2xl font-bold mb-4 text-pink-600">Enter Your Preferences</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hair Length */}
              <div>
                <label class="block text-gray-700 mb-2">Hair Length</label>
                <select
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent cursor-pointer box-border"
                  value={preferences().hairLength}
                  onChange={(e) => handleInputChange('hairLength', e.target.value)}
                >
                  <option value="">Select Length</option>
                  <option value="Short">Short</option>
                  <option value="Medium">Medium</option>
                  <option value="Long">Long</option>
                </select>
              </div>
              {/* Hair Type */}
              <div>
                <label class="block text-gray-700 mb-2">Hair Type</label>
                <select
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent cursor-pointer box-border"
                  value={preferences().hairType}
                  onChange={(e) => handleInputChange('hairType', e.target.value)}
                >
                  <option value="">Select Type</option>
                  <option value="Straight">Straight</option>
                  <option value="Wavy">Wavy</option>
                  <option value="Curly">Curly</option>
                </select>
              </div>
              {/* Desired Style */}
              <div>
                <label class="block text-gray-700 mb-2">Desired Style</label>
                <input
                  type="text"
                  placeholder="e.g., Bob, Layers"
                  value={preferences().desiredStyle}
                  onInput={(e) => handleInputChange('desiredStyle', e.target.value)}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent box-border"
                />
              </div>
              {/* Color Preference */}
              <div>
                <label class="block text-gray-700 mb-2">Color Preference</label>
                <input
                  type="text"
                  placeholder="e.g., Natural, Highlights"
                  value={preferences().colorPreference}
                  onInput={(e) => handleInputChange('colorPreference', e.target.value)}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent box-border"
                />
              </div>
            </div>
            <button
              class={`mt-4 px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                loadingSuggestions() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={getSuggestions}
              disabled={loadingSuggestions()}
            >
              <Show when={loadingSuggestions()} fallback="Get Suggestions">
                Loading...
              </Show>
            </button>
          </div>

          {/* Suggestions */}
          <Show when={suggestions().length > 0}>
            <div class="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 class="text-2xl font-bold mb-4 text-pink-600">Hairstyle Suggestions</h2>
              <div class="space-y-4">
                <For each={suggestions()}>
                  {(style) => (
                    <div class="p-4 border border-gray-200 rounded-lg">
                      <h3 class="text-xl font-semibold text-pink-600 mb-2">{style.name}</h3>
                      <p class="text-gray-700">{style.description}</p>
                      <div class="flex space-x-4 mt-4">
                        <button
                          class={`px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                            loadingImage() ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => generateImage(style)}
                          disabled={loadingImage()}
                        >
                          <Show when={loadingImage()} fallback="Show Me">
                            Loading...
                          </Show>
                        </button>
                        <button
                          class={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                            loadingAudio() ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          onClick={() => generateAudio(style)}
                          disabled={loadingAudio()}
                        >
                          <Show when={loadingAudio()} fallback="Listen">
                            Loading...
                          </Show>
                        </button>
                        <button
                          class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                          onClick={() => addToFavorites(style)}
                        >
                          Add to Favorites
                        </button>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>

          {/* Generated Image */}
          <Show when={generatedImage()}>
            <div class="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 class="text-2xl font-bold mb-4 text-pink-600">Generated Image</h2>
              <img src={generatedImage()} alt="Generated hairstyle" class="w-full rounded-lg shadow-md" />
            </div>
          </Show>

          {/* Audio Description */}
          <Show when={audioUrl()}>
            <div class="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 class="text-2xl font-bold mb-4 text-pink-600">Audio Description</h2>
              <audio controls src={audioUrl()} class="w-full" />
            </div>
          </Show>

          {/* Favorites */}
          <Show when={favorites().length > 0}>
            <div class="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 class="text-2xl font-bold mb-4 text-pink-600">My Favorites</h2>
              <div class="space-y-4">
                <For each={favorites()}>
                  {(fav) => (
                    <div class="p-4 border border-gray-200 rounded-lg">
                      <h3 class="text-xl font-semibold text-pink-600 mb-2">{fav.name}</h3>
                      <p class="text-gray-700">{fav.description}</p>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
}

export default App;