using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace WhisperUploadExample
{
    class AITherapist
    {
        // Zuki Journey (Whisper + chat) endpoints & key
        private const string AUDIO_URL        = "https://api.zukijourney.com/v1/audio/transcriptions";
        private const string TEXT_TO_TEXT_URL = "https://api.zukijourney.com/v1/chat/completions";
        private const string ZUKI_API_KEY     = "X";

        // Eleven Labs TTS endpoint & key
        private const string ELEVENLABS_KEY   = "X";
        private const string ELEVEN_VOICE_ID  = "X"; 
        private static readonly string ELEVEN_TTS_URL = 
            $"https://api.elevenlabs.io/v1/text-to-speech/{ELEVEN_VOICE_ID}";

        // Local file + model settings
        private const string AUDIO_FILE_PATH  = @"/Users/342tanmay/Downloads/testFile.mp3";
        private const string CHAT_MODEL       = "gpt-3.5-turbo";

        static async Task Main(string[] args)
        {
            if (!File.Exists(AUDIO_FILE_PATH))
            {
                Console.Error.WriteLine($"Error: File not found at '{AUDIO_FILE_PATH}'.");
                return;
            }

            // One HttpClient for Zuki Journey calls
            using var zukiClient = new HttpClient();
            zukiClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", ZUKI_API_KEY);

            try
            {
                Console.WriteLine("Uploading file and requesting transcription...");
                string finalOutput = await GetTranscriptionAsync(zukiClient);

                Console.WriteLine("Sending prompt to LLM...");
                string advice = await GetTherapistAdviceAsync(zukiClient, finalOutput);

                Console.WriteLine(advice);

                // Your Eleven Labs TTS call
                await ConvertTextToSpeechAsync(advice, "advice.mp3");
            }
            catch (HttpRequestException e)
            {
                Console.Error.WriteLine($"Request error: {e.Message}");
            }
        }

        private static async Task<string> GetTranscriptionAsync(HttpClient httpClient)
        {
            using var form = new MultipartFormDataContent();
            form.Add(new StringContent("whisper-1"), "model");

            using var fs = File.OpenRead(AUDIO_FILE_PATH);
            var fileContent = new StreamContent(fs);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("audio/mpeg");
            form.Add(fileContent, "file", Path.GetFileName(AUDIO_FILE_PATH));

            var resp = await httpClient.PostAsync(AUDIO_URL, form);
            resp.EnsureSuccessStatusCode();

            var json = await resp.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            var text = doc.RootElement.GetProperty("text").GetString();

            string intro = "Hey GPT, give me a short response to this like you are a human therapist: ";
            return intro + text;
        }

        private static async Task<string> GetTherapistAdviceAsync(HttpClient httpClient, string prompt)
        {
            var payload = new
            {
                model    = CHAT_MODEL,
                messages = new[] { new { role = "user", content = prompt } }
            };

            var chatJson = JsonSerializer.Serialize(payload);
            using var content = new StringContent(chatJson, Encoding.UTF8, "application/json");

            var resp = await httpClient.PostAsync(TEXT_TO_TEXT_URL, content);
            resp.EnsureSuccessStatusCode();

            var raw = await resp.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(raw);

            return doc.RootElement
                      .GetProperty("choices")[0]
                      .GetProperty("message")
                      .GetProperty("content")
                      .GetString();
        }

        private static async Task ConvertTextToSpeechAsync(string text, string outputFilePath)
        {
            // New HttpClient for Eleven Labs only
            using var eleven = new HttpClient();
            eleven.DefaultRequestHeaders.Clear();
            eleven.DefaultRequestHeaders.Add("xi-api-key", ELEVENLABS_KEY);
            eleven.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));

            var payload = new
            {
                text          = text,
                model_id      = "eleven_monolingual_v1",
                output_format = "mp3_44100_128"
            };
            var body = JsonSerializer.Serialize(payload);
            using var content = new StringContent(body, Encoding.UTF8, "application/json");

            var resp = await eleven.PostAsync(ELEVEN_TTS_URL, content);
            if (!resp.IsSuccessStatusCode)
            {
                var errText = await resp.Content.ReadAsStringAsync();
                Console.Error.WriteLine(
                    $"ElevenLabs TTS failed {(int)resp.StatusCode} {resp.ReasonPhrase}:\n{errText}");
                return;
            }

            var audio = await resp.Content.ReadAsByteArrayAsync();
            await File.WriteAllBytesAsync(outputFilePath, audio);
            Console.WriteLine($"Audio saved to {outputFilePath}");
        }
    }
}
