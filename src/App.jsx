import { createSignal, onMount, createEffect, For, Show } from 'solid-js';
import { createEvent, supabase } from './supabaseClient';
// import { Auth } from '@supabase/auth-ui-solid';
// import { ThemeSupa } from '@supabase/auth-ui-shared';
import { SolidMarkdown } from 'solid-markdown';

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
  const [currentPage, setCurrentPage] = createSignal('homePage');

  // Only add authentication if required
  // Example authentication logic commented out

  // const checkUserSignedIn = async () => {
  //   const { data: { user } } = await supabase.auth.getUser();
  //   if (user) {
  //     setUser(user);
  //     setCurrentPage('homePage');
  //   }
  // };

  // onMount(checkUserSignedIn);

  // createEffect(() => {
  //   const authListener = supabase.auth.onAuthStateChange((_, session) => {
  //     if (session?.user) {
  //       setUser(session.user);
  //       setCurrentPage('homePage');
  //     } else {
  //       setUser(null);
  //       setCurrentPage('login');
  //     }
  //   });

  //   return () => {
  //     authListener.data.unsubscribe();
  //   };
  // });

  const handleInputChange = (field, value) => {
    setPreferences({ ...preferences(), [field]: value });
  };

  const getSuggestions = async () => {
    setLoadingSuggestions(true);
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
      setSuggestions(result);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const generateImage = async (style) => {
    setLoadingImage(true);
    try {
      const prompt = `Generate an image of a person with ${preferences().hairLength} ${preferences().hairType} hair styled as ${style.name} with ${preferences().colorPreference} color.`;
      const imageUrl = await createEvent('generate_image', {
        prompt,
      });
      setGeneratedImage(imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoadingImage(false);
    }
  };

  const generateAudio = async (style) => {
    setLoadingAudio(true);
    try {
      const text = `The ${style.name} is a ${preferences().desiredStyle} hairstyle that ${style.description}`;
      const audio = await createEvent('text_to_speech', {
        text,
      });
      setAudioUrl(audio);
    } catch (error) {
      console.error('Error generating audio:', error);
    } finally {
      setLoadingAudio(false);
    }
  };

  const addToFavorites = (style) => {
    if (!favorites().some((fav) => fav.name === style.name)) {
      setFavorites([...favorites(), style]);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-pink-100 to-yellow-100 p-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-4xl font-bold text-pink-600 mb-6 text-center">Hairstyle Helper</h1>

        {/* Preferences Form */}
        <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 class="text-2xl font-bold text-pink-600 mb-4">Enter Your Preferences</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 mb-2">Hair Length</label>
              <select
                value={preferences().hairLength}
                onChange={(e) => handleInputChange('hairLength', e.target.value)}
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent box-border cursor-pointer"
              >
                <option value="">Select Length</option>
                <option value="Short">Short</option>
                <option value="Medium">Medium</option>
                <option value="Long">Long</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 mb-2">Hair Type</label>
              <select
                value={preferences().hairType}
                onChange={(e) => handleInputChange('hairType', e.target.value)}
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent box-border cursor-pointer"
              >
                <option value="">Select Type</option>
                <option value="Straight">Straight</option>
                <option value="Wavy">Wavy</option>
                <option value="Curly">Curly</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 mb-2">Desired Style</label>
              <input
                type="text"
                value={preferences().desiredStyle}
                onInput={(e) => handleInputChange('desiredStyle', e.target.value)}
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent box-border"
                placeholder="e.g., Bob, Layers"
              />
            </div>
            <div>
              <label class="block text-gray-700 mb-2">Color Preference</label>
              <input
                type="text"
                value={preferences().colorPreference}
                onInput={(e) => handleInputChange('colorPreference', e.target.value)}
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent box-border"
                placeholder="e.g., Natural, Highlights"
              />
            </div>
          </div>
          <button
            onClick={getSuggestions}
            class={`mt-6 w-full px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition duration-300 ease-in-out transform hover:scale-105 ${
              loadingSuggestions() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            disabled={loadingSuggestions()}
          >
            {loadingSuggestions() ? 'Getting Suggestions...' : 'Get Suggestions'}
          </button>
        </div>

        {/* Suggestions List */}
        <Show when={suggestions().length > 0}>
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-pink-600 mb-4">Hairstyle Suggestions</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <For each={suggestions()}>
                {(style) => (
                  <div class="bg-white p-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105">
                    <h3 class="text-xl font-semibold text-pink-600 mb-2">{style.name}</h3>
                    <p class="text-gray-700 mb-4">{style.description}</p>
                    <div class="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedStyle(style);
                          generateImage(style);
                        }}
                        class={`flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                          loadingImage() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={loadingImage()}
                      >
                        {loadingImage() && selectedStyle()?.name === style.name ? 'Generating Image...' : 'Show Me'}
                      </button>
                      <button
                        onClick={() => {
                          generateAudio(style);
                        }}
                        class={`flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                          loadingAudio() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={loadingAudio()}
                      >
                        {loadingAudio() ? 'Generating Audio...' : 'Listen'}
                      </button>
                      <button
                        onClick={() => addToFavorites(style)}
                        class="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
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
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-pink-600 mb-4">Generated Image for {selectedStyle()?.name}</h2>
            <img src={generatedImage()} alt="Hairstyle Image" class="w-full rounded-lg shadow-md" />
          </div>
        </Show>

        {/* Audio Description */}
        <Show when={audioUrl()}>
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-pink-600 mb-4">Audio Description</h2>
            <audio controls src={audioUrl()} class="w-full" />
          </div>
        </Show>

        {/* Favorites */}
        <Show when={favorites().length > 0}>
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-pink-600 mb-4">Your Favorites</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <For each={favorites()}>
                {(style) => (
                  <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-xl font-semibold text-pink-600 mb-2">{style.name}</h3>
                    <p class="text-gray-700">{style.description}</p>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}

export default App;