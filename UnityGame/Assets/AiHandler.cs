using UnityEngine;
using System.Collections;
using System.IO; // Required for file operations
using System; // Required for DateTime, Exception
using System.Net.Http; // Required for HttpClient
using System.Net.Http.Headers; // Required for Headers
using System.Threading.Tasks;
using TMPro; // Required for Task, async/await
// Removed: using System.Text.Json;

/// <summary>
/// Records audio from the default microphone when triggered by external callbacks.
/// Attempts to use the device's minimum reported frequency for potentially better compatibility.
/// Saves the recording as a WAV file to Application.persistentDataPath.
/// **MODIFIED:** Automatically sends the saved WAV file for transcription via an external API.
/// **MODIFIED:** Uses Unity's JsonUtility for parsing and saves transcript to a separate file.
/// </summary>

public class MicrophoneRecorderCallback : MonoBehaviour
{
    // --- Whisper API Settings ---
    // WARNING: Hardcoding API keys in client code is insecure! Consider using a backend.
    [SerializeField] private TextMeshProUGUI targetTextComponent;
    private const string WHISPER_API_URL = "https://api.zukijourney.com/v1/audio/transcriptions";
    private const string WHISPER_API_KEY = "zu-8ea0fc898a68a477ea001ffff5423885";
    // HttpClient should be reused if making many calls
    private static readonly HttpClient httpClient = new HttpClient();

    // --- Helper Class for JsonUtility ---
    [System.Serializable] // Required for JsonUtility
    private class TranscriptionResponse
    {
        // Field name must exactly match the JSON key "text"
        public string text;
    }

    // --- Public Recording Settings ---
    [Header("Recording Settings")]
    [Tooltip("Target frequency (will be overridden by device minimum if reported)")]
    public int recordingFrequency = 44100;
    [Tooltip("Maximum recording length in seconds before automatic stop (if enabled)")]
    public int maxRecordingLengthSecs = 30;
    [Tooltip("Filename for the saved WAV file")]
    public string outputFileName = "MyRecording.wav";

    // --- Public Properties (Read-only) ---
    public bool IsRecording => isRecording;
    public int ActualRecordingFrequency => recordingFrequency;

    // --- Private Variables ---
    private AudioClip recordedClip;
    private string micDeviceName = null;
    private bool isRecording = false;

    void Awake()
    {
        // --- Microphone Setup ---
        // IMPORTANT: Android Permission must be set in Project Settings!

        if (Microphone.devices.Length == 0) {
            Debug.LogError("[MicRecCallback+Transcribe_JU] No microphone devices found!");
            this.enabled = false; return;
        }
        micDeviceName = Microphone.devices[0];
        Debug.Log($"[MicRecCallback+Transcribe_JU] Using microphone: {micDeviceName}");

        // --- Determine Recording Frequency ---
        int minFreq, maxFreq;
        Microphone.GetDeviceCaps(micDeviceName, out minFreq, out maxFreq);
        if (minFreq > 0) {
            recordingFrequency = minFreq;
            Debug.Log($"[MicRecCallback+Transcribe_JU] Device reports frequency range: {minFreq} Hz - {maxFreq} Hz. Using minimum: {recordingFrequency} Hz.");
        } else {
            recordingFrequency = 16000; // Fallback
            Debug.LogWarning($"[MicRecCallback+Transcribe_JU] Device did not report frequency range. Using fallback: {recordingFrequency} Hz.");
        }
        if (recordingFrequency <= 0) {
             Debug.LogError($"[MicRecCallback+Transcribe_JU] Determined recording frequency ({recordingFrequency} Hz) is invalid.");
             this.enabled = false; return;
        }

        // Setup HttpClient authorization (do this once)
        httpClient.DefaultRequestHeaders.Clear();
        httpClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", WHISPER_API_KEY);
        httpClient.Timeout = TimeSpan.FromSeconds(60); // Example: 60 second timeout
    }

    void OnDisable()
    {
        if (isRecording) {
            Debug.LogWarning("[MicRecCallback+Transcribe_JU] Component disabled while recording. Stopping recording (no save/transcription).");
            StopRecordingInternal();
        }
    }

     void OnDestroy()
     {
         if (isRecording) { StopRecordingInternal(); }
         if (recordedClip != null) { Destroy(recordedClip); recordedClip = null; }
         // httpClient.Dispose(); // Dispose static HttpClient if needed, usually not
     }

    // --- Public Methods for External Control ---

    public void StartRecording()
    {
        if (isRecording) {
            Debug.LogWarning("[MicRecCallback+Transcribe_JU] StartRecording called but already recording."); return;
        }
         if (string.IsNullOrEmpty(micDeviceName)) {
            Debug.LogError("[MicRecCallback+Transcribe_JU] StartRecording called but no valid microphone device found."); return;
        }
        Debug.Log($"[MicRecCallback+Transcribe_JU] Starting recording at {recordingFrequency} Hz via external call...");
        if (recordedClip != null) { Destroy(recordedClip); recordedClip = null; }
        recordedClip = Microphone.Start(micDeviceName, false, maxRecordingLengthSecs, recordingFrequency);
        StartCoroutine(CheckRecordingStarted());
    }

    private IEnumerator CheckRecordingStarted()
    {
        yield return new WaitForSeconds(0.1f);
        if (recordedClip == null) {
            Debug.LogError("[MicRecCallback+Transcribe_JU] Microphone failed to start! AudioClip is null."); isRecording = false;
        } else if (!Microphone.IsRecording(micDeviceName)) {
            Debug.LogError("[MicRecCallback+Transcribe_JU] Microphone.Start called, but IsRecording is false.");
             Destroy(recordedClip); recordedClip = null; isRecording = false;
        } else {
             isRecording = true;
             Debug.Log($"[MicRecCallback+Transcribe_JU] Recording confirmed started. Max length: {maxRecordingLengthSecs} seconds.");
        }
    }

    public void StopRecordingAndSave()
    {
        if (!isRecording) {
            Debug.LogWarning("[MicRecCallback+Transcribe_JU] StopRecordingAndSave called but not recording."); return;
        }

        int finalPosition = StopRecordingInternal();

        if (recordedClip != null && finalPosition > 1) {
            Debug.Log($"[MicRecCallback+Transcribe_JU] Recording stopped. Recorded {finalPosition} samples.");
            AudioClip finalClip = AudioClip.Create("Recorded_Final", finalPosition, recordedClip.channels, recordedClip.frequency, false);
            float[] recordedData = new float[finalPosition * recordedClip.channels];
            recordedClip.GetData(recordedData, 0);
            finalClip.SetData(recordedData, 0);

            // --- Save the WAV file ---
            string savedWavFilePath = SaveAsWav(finalClip, outputFileName); // Keep WAV saving untouched

            Destroy(finalClip); // Clean up temporary clip

            // --- Trigger Transcription ---
            if (!string.IsNullOrEmpty(savedWavFilePath)) // Check if WAV saving was successful
            {
                Debug.Log($"[MicRecCallback+Transcribe_JU] WAV saved successfully. Starting transcription task for: {savedWavFilePath}");
                // Start async task - fire and forget
                 _ = TranscribeAudioAsync(savedWavFilePath);
            } else {
                Debug.LogError("[MicRecCallback+Transcribe_JU] WAV file path was null or empty after saving. Cannot transcribe.");
            }
        } else {
             Debug.LogWarning($"[MicRecCallback+Transcribe_JU] Stopping recording, but no valid data (Samples: {finalPosition}) or clip found. Nothing saved or transcribed.");
        }

        if (recordedClip != null) { Destroy(recordedClip); recordedClip = null; }
    }

    public void ToggleRecording()
    {
        if (!isRecording) { StartRecording(); } else { StopRecordingAndSave(); }
    }

    // --- Private Helper Methods ---

    private int StopRecordingInternal()
    {
         // Same logic as before
         if (!isRecording) return 0;
         int currentPosition = 0;
         if(!string.IsNullOrEmpty(micDeviceName) && Microphone.IsRecording(micDeviceName)) {
             currentPosition = Microphone.GetPosition(micDeviceName);
             Microphone.End(micDeviceName);
             Debug.Log("[MicRecCallback+Transcribe_JU] Microphone hardware stopped.");
         } else if (!string.IsNullOrEmpty(micDeviceName)) {
             Debug.LogWarning("[MicRecCallback+Transcribe_JU] StopRecordingInternal called, but IsRecording() was false.");
             currentPosition = Microphone.GetPosition(micDeviceName); Microphone.End(micDeviceName);
         } else { Debug.LogWarning("[MicRecCallback+Transcribe_JU] Cannot stop microphone, device name is invalid."); }
         isRecording = false;
         if (currentPosition <= 0) { Debug.LogWarning("[MicRecCallback+Transcribe_JU] Microphone stopped, position is 0."); }
         return currentPosition;
    }

    // --- WAV Saving Function (Unchanged, except log prefix) ---
    /// <summary> Saves AudioClip to WAV and returns the full path if successful, null otherwise. </summary>
    private string SaveAsWav(AudioClip clip, string filename)
    {
        if (clip == null || clip.samples == 0 || clip.channels == 0) {
            Debug.LogError($"[MicRecCallback+Transcribe_JU] SaveAsWav: Invalid AudioClip provided."); return null;
        }
        string filePath = Path.Combine(Application.persistentDataPath, filename);
        Debug.Log($"[MicRecCallback+Transcribe_JU] Attempting to save WAV file to: {filePath}");
        Directory.CreateDirectory(Path.GetDirectoryName(filePath));
        try {
            using (FileStream fileStream = new FileStream(filePath, FileMode.Create))
            using (BinaryWriter writer = new BinaryWriter(fileStream)) {
                int riff = 0x46464952; int wave = 0x45564157; int fmt = 0x20746d66; int data = 0x61746164;
                int channels = clip.channels; int frequency = clip.frequency; int samples = clip.samples; short bitDepth = 16;
                int subChunk1Size = 16; short audioFormat = 1; short blockAlign = (short)(channels * (bitDepth / 8));
                int byteRate = frequency * blockAlign; int subChunk2Size = samples * blockAlign; int chunkSize = 36 + subChunk2Size;
                writer.Write(riff); writer.Write(chunkSize); writer.Write(wave); writer.Write(fmt);
                writer.Write(subChunk1Size); writer.Write(audioFormat); writer.Write((short)channels); writer.Write(frequency);
                writer.Write(byteRate); writer.Write(blockAlign); writer.Write(bitDepth); writer.Write(data); writer.Write(subChunk2Size);
                float[] clipData = new float[samples * channels];
                clip.GetData(clipData, 0);
                for (int i = 0; i < clipData.Length; i++) {
                    short sample16 = (short)(Mathf.Clamp(clipData[i], -1.0f, 1.0f) * short.MaxValue);
                    writer.Write(sample16);
                }
                Debug.Log($"[MicRecCallback+Transcribe_JU] Successfully saved WAV file ({subChunk2Size} bytes data) to: {filePath}");
                return filePath;
            }
        } catch (System.Exception e) {
            Debug.LogError($"[MicRecCallback+Transcribe_JU] Error saving WAV file: {e.Message}\n{e.StackTrace}"); return null;
        }
    }

    // --- Transcription Method (Modified for JsonUtility) ---
    /// <summary>
    /// Sends the audio file at the specified path for transcription asynchronously.
    /// Uses JsonUtility for parsing and saves transcript to a separate file.
    /// Logs the result or errors to the Unity console.
    /// </summary>
    /// <param name="audioFilePath">Full path to the WAV audio file.</param>
    private async Task TranscribeAudioAsync(string audioFilePath)
    {
        if (!File.Exists(audioFilePath)) {
            Debug.LogError($"[MicRecCallback+Transcribe_JU] Transcription Error: File not found at '{audioFilePath}'."); return;
        }

        Debug.Log($"[MicRecCallback+Transcribe_JU] Starting transcription request for {Path.GetFileName(audioFilePath)}...");

        try {
            using var form = new MultipartFormDataContent();
            form.Add(new StringContent("whisper-1"), "model"); // Assuming API needs model param

            using var fileStream = File.OpenRead(audioFilePath);
            var audioContent = new StreamContent(fileStream);
            audioContent.Headers.ContentType = new MediaTypeHeaderValue("audio/wav"); // Correct for WAV
            form.Add(audioContent, "file", Path.GetFileName(audioFilePath));

            // --- Make API Call ---
            HttpResponseMessage response = await httpClient.PostAsync(WHISPER_API_URL, form);

            // --- Process Response ---
            if (response.IsSuccessStatusCode) {
                string jsonResponse = await response.Content.ReadAsStringAsync();
                Debug.Log($"[MicRecCallback+Transcribe_JU] API Raw Response: {jsonResponse}");

                // --- Parse JSON using Unity's JsonUtility ---
                try {
                    // Use helper class TranscriptionResponse defined above
                    TranscriptionResponse parsedResponse = JsonUtility.FromJson<TranscriptionResponse>(jsonResponse);

                    if (parsedResponse != null && !string.IsNullOrEmpty(parsedResponse.text)) {
                        string transcript = parsedResponse.text;
                        targetTextComponent.text = transcript;
                        
                        Debug.Log($"[MicRecCallback+Transcribe_JU] Transcription SUCCESS (via JsonUtility):\n--------------------\n{transcript}\n--------------------");

                        // --- Save transcript to a different file ---
                        string transcriptFileName = Path.GetFileNameWithoutExtension(audioFilePath) + "_transcript.txt"; // e.g., MyRecording_transcript.txt
                        string transcriptFilePath = Path.Combine(Path.GetDirectoryName(audioFilePath), transcriptFileName);

                        Debug.Log($"[MicRecCallback+Transcribe_JU] Attempting to save transcript to: {transcriptFilePath}");
                        try {
                            File.WriteAllText(transcriptFilePath, transcript); // Use System.IO.File
                            Debug.Log($"[MicRecCallback+Transcribe_JU] Successfully saved transcript file: {transcriptFileName}");
                        } catch (Exception saveEx) {
                            Debug.LogError($"[MicRecCallback+Transcribe_JU] FAILED to save transcript file: {saveEx.Message}");
                        }
                        // --- End save transcript ---

                    } else {
                        Debug.LogError("[MicRecCallback+Transcribe_JU] Transcription Error: JsonUtility parsed response, but 'text' field was null or empty.");
                    }
                } catch (Exception parseEx) { // Catch potential exceptions from FromJson
                    Debug.LogError($"[MicRecCallback+Transcribe_JU] Transcription Error: Failed to parse JSON response using JsonUtility. Error: {parseEx.Message}\nJSON: {jsonResponse}");
                }
                // --- End JSON Parsing ---

            } else {
                string errorContent = await response.Content.ReadAsStringAsync();
                Debug.LogError($"[MicRecCallback+Transcribe_JU] Transcription Error: API request failed with status code {response.StatusCode}. Response: {errorContent}");
            }
        } catch (HttpRequestException httpEx) {
            Debug.LogError($"[MicRecCallback+Transcribe_JU] Transcription Error: Network request failed. {httpEx.Message}");
        } catch (TaskCanceledException taskEx) {
             Debug.LogError($"[MicRecCallback+Transcribe_JU] Transcription Error: Request timed out. {taskEx.Message}");
        } catch (Exception ex) {
            Debug.LogError($"[MicRecCallback+Transcribe_JU] Transcription Error: An unexpected error occurred. {ex.Message}\n{ex.StackTrace}");
        } finally {
             Debug.Log($"[MicRecCallback+Transcribe_JU] Transcription task finished for {Path.GetFileName(audioFilePath)}.");
             // Optionally delete WAV after processing
             // try { File.Delete(audioFilePath); } catch {}
        }
    }
}