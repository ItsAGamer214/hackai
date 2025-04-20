using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;

namespace WhisperJournalEntry
{
    class VoiceJournaling
    {
        // Whisper transcription endpoint & key
        private const string AUDIO_URL       = "https://api.zukijourney.com/v1/audio/transcriptions";
        private const string API_KEY         = "X";

        // Path to your MP3 and the output journal file
        private const string AUDIO_FILE_PATH = @"/Users/342tanmay/Downloads/testFile.mp3";
        private const string OUTPUT_PATH     = "journalEntry.txt";

        static async Task Main(string[] args)
        {
            if (!File.Exists(AUDIO_FILE_PATH))
            {
                Console.Error.WriteLine($"Error: File not found at '{AUDIO_FILE_PATH}'.");
                return;
            }

            using var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", API_KEY);

            try
            {
                Console.WriteLine("Uploading file and requesting transcription...");
                string transcript = await TranscribeAsync(client, AUDIO_FILE_PATH);

                await File.WriteAllTextAsync(OUTPUT_PATH, transcript);
                Console.WriteLine($"Transcription saved to {OUTPUT_PATH}");
            }
            catch (HttpRequestException e)
            {
                Console.Error.WriteLine($"Request error: {e.Message}");
            }
        }

        private static async Task<string> TranscribeAsync(HttpClient client, string filePath)
        {
            using var form = new MultipartFormDataContent();
            form.Add(new StringContent("whisper-1"), "model");

            using var fs = File.OpenRead(filePath);
            var fileContent = new StreamContent(fs);
            fileContent.Headers.ContentType = new MediaTypeHeaderValue("audio/mpeg");
            form.Add(fileContent, "file", Path.GetFileName(filePath));

            var resp = await client.PostAsync(AUDIO_URL, form);
            resp.EnsureSuccessStatusCode();

            var json = await resp.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            return doc.RootElement.GetProperty("text").GetString();
        }
    }
}
