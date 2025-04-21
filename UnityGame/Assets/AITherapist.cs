using UnityEngine;
using UnityEngine.Networking; // Required for web requests
using System.Collections;
using System.Collections.Generic; // For List used in form data
using System.IO;             // Required for file operations
using System.Text;           // Required for encoding
using System.Text.RegularExpressions; // For Regex.Unescape

// Simple classes to help with JsonUtility for API requests/responses
// NOTE: You might need more complex classes or manual parsing for nested JSON
[System.Serializable]
public class WhisperResponse
{
    public string text; // We only care about the 'text' field
}

[System.Serializable]
public class ChatMessage
{
    public string role;
    public string content;
}

[System.Serializable]
public class ChatRequestPayload
{
    public string model;
    public ChatMessage[] messages;
}

// NOTE: JsonUtility CANNOT easily parse the complex nested structure of Chat choices.
// Manual parsing or a library like SimpleJSON is highly recommended for this.
[System.Serializable]
public class ChatResponseChoice // Simplified - real structure is nested deeper
{
    // Needs structure like: choices[0].message.content
    public ChatMessage message; // Attempt to match structure slightly better
}

[System.Serializable]
public class ChatResponse // Simplified
{
     public ChatResponseChoice[] choices;
     public string error; // Example error field
}


[System.Serializable]
public class ElevenLabsRequestPayload
{
    public string text;
    public string model_id = "eleven_monolingual_v1";
    public string output_format = "mp3_44100_128";
    // voice_settings could be added here if needed
}


/// <summary>
/// Records audio, saves as WAV, sends to Whisper, gets LLM response, converts to speech via ElevenLabs, and plays it.
/// </summary>
[RequireComponent(typeof(AudioSource))] // Require an AudioSource for playback
public class AITherapist : MonoBehaviour
{
    // --- Public Settings ---
    [Header("Recording Settings")]
    [Tooltip("Target frequency (will be overridden by device minimum if reported)")]
    public int recordingFrequency = 44100;
    [Tooltip("Maximum recording length in seconds")]
    public int maxRecordingLengthSecs = 30;
    [Tooltip("Filename for the saved WAV file")]
    public string outputFileName = "MyRecording.wav";
    [Tooltip("Filename for the received MP3 response")]
    public string responseAudioFileName = "TherapistResponse.mp3";


    [Header("API Configuration")]
    // Zuki Journey API Credentials and URLs (from AITherapist.cs)
    [SerializeField] private string zukiApiKey = "zu-8ea0fc898a68a477ea001ffff5423885";
    [SerializeField] private string whisperApiUrl = "https://api.zukijourney.com/v1/audio/transcriptions";
    [SerializeField] private string chatApiUrl = "https://api.zukijourney.com/v1/chat/completions";
    [SerializeField] private string chatModel = "gpt-3.5-turbo";
    [SerializeField] private string therapistPromptPrefix = "Hey GPT, give me a short response to this like you are a human therapist: ";

    // ElevenLabs API Credentials and URLs (from AITherapist.cs)
    [SerializeField] private string elevenLabsApiKey = "sk_03c1cadf80b68a0eb9a5b32ee43f1b39806deb9a12aa079c";
    [SerializeField] private string elevenLabsVoiceId = "56AoDkrOh6qfVPDXZ7Pt";
    private string ElevenLabsTtsUrl => $"https://api.elevenlabs.io/v1/text-to-speech/{elevenLabsVoiceId}";


    [Header("Components")]
    [SerializeField, Tooltip("AudioSource to play the final ElevenLabs response")]
    private AudioSource responseAudioSource;

    // --- Public Properties (Read-only) ---
    public bool IsRecording => isRecording;
    public int ActualRecordingFrequency => recordingFrequency;
    public bool IsProcessing { get; private set; } = false; // Flag for API processing state


    // --- Private Variables ---
    private AudioClip recordedClip;
    private string micDeviceName = null;
    private bool isRecording = false;
    private string lastSavedFilePath = null; // Store path for the pipeline


    void Awake()
    {
        // --- Microphone Setup ---
        if (Microphone.devices.Length == 0)
        {
            Debug.LogError("[MicrophoneRecorderCallback] No microphone devices found!");
            this.enabled = false;
            return;
        }
        micDeviceName = Microphone.devices[0];
        Debug.Log($"[MicrophoneRecorderCallback] Using microphone: {micDeviceName}");

        // --- Determine Recording Frequency ---
        int minFreq, maxFreq;
        Microphone.GetDeviceCaps(micDeviceName, out minFreq, out maxFreq);
        if (minFreq > 0) {
            recordingFrequency = minFreq; // Use minimum supported frequency
            Debug.Log($"[MicrophoneRecorderCallback] Device reports frequency range: {minFreq} Hz - {maxFreq} Hz. Using minimum: {recordingFrequency} Hz.");
        } else {
            recordingFrequency = 16000; // Fallback
             Debug.LogWarning($"[MicrophoneRecorderCallback] Device did not report frequency range. Using fallback: {recordingFrequency} Hz.");
        }
        if (recordingFrequency <= 0) {
             Debug.LogError($"[MicrophoneRecorderCallback] Determined recording frequency ({recordingFrequency} Hz) is invalid.");
             this.enabled = false;
             return;
        }

        // --- Ensure AudioSource exists ---
        if (responseAudioSource == null)
        {
            responseAudioSource = GetComponent<AudioSource>();
             if (responseAudioSource == null) {
                  Debug.LogError("[MicrophoneRecorderCallback] No AudioSource component found or assigned. Cannot play response.");
                  this.enabled = false;
             }
        }
    }

    void OnDisable()
    {
        if (isRecording) {
            Debug.LogWarning("[MicrophoneRecorderCallback] Component disabled while recording. Stopping (no save).");
            StopRecordingInternal();
        }
         // Stop any running processing coroutine if disabled
        if(IsProcessing) {
             StopAllCoroutines(); // Consider more graceful stopping if needed
             IsProcessing = false;
             Debug.LogWarning("[MicrophoneRecorderCallback] Component disabled during API processing. Process halted.");
        }
    }

     void OnDestroy() {
        if (isRecording) {
            StopRecordingInternal();
        }
        if (recordedClip != null) {
            Destroy(recordedClip);
            recordedClip = null;
        }
        // Also stop processing on destroy
         if(IsProcessing) {
             // Coroutines are automatically stopped, just update flag
             IsProcessing = false;
        }
     }

    // --- Public Methods for External Control ---

    public void StartRecording()
    {
        if (isRecording) {
            Debug.LogWarning("[MicrophoneRecorderCallback] Already recording.");
            return;
        }
        if (IsProcessing) {
             Debug.LogWarning("[MicrophoneRecorderCallback] Cannot start recording while processing API response.");
            return;
        }
        if (string.IsNullOrEmpty(micDeviceName)) {
            Debug.LogError("[MicrophoneRecorderCallback] No valid microphone device found.");
            return;
        }

        Debug.Log($"[MicrophoneRecorderCallback] Starting recording at {recordingFrequency} Hz...");
        if (recordedClip != null) { Destroy(recordedClip); recordedClip = null; }

        recordedClip = Microphone.Start(micDeviceName, false, maxRecordingLengthSecs, recordingFrequency);
        StartCoroutine(CheckRecordingStarted());
    }

    private IEnumerator CheckRecordingStarted()
    {
        yield return new WaitForSeconds(0.1f); // Short delay

        if (recordedClip == null) {
            Debug.LogError("[MicrophoneRecorderCallback] Microphone failed to start! AudioClip is null.");
            isRecording = false;
        } else if (!Microphone.IsRecording(micDeviceName)) {
            Debug.LogError("[MicrophoneRecorderCallback] Microphone.Start called, but IsRecording is false.");
            Destroy(recordedClip);
            recordedClip = null;
            isRecording = false;
        } else {
            isRecording = true;
            Debug.Log($"[MicrophoneRecorderCallback] Recording started. Max length: {maxRecordingLengthSecs}s.");
        }
    }

    public void StopRecordingAndSave()
    {
        if (!isRecording) {
            Debug.LogWarning("[MicrophoneRecorderCallback] Not recording.");
            return;
        }

        int finalPosition = StopRecordingInternal();

        if (recordedClip != null && finalPosition > 1)
        {
            Debug.Log($"[MicrophoneRecorderCallback] Recording stopped. Recorded {finalPosition} samples.");

            // Create final clip and save
            AudioClip finalClip = AudioClip.Create("Recorded_Final", finalPosition, recordedClip.channels, recordedClip.frequency, false);
            float[] recordedData = new float[finalPosition * recordedClip.channels];
            recordedClip.GetData(recordedData, 0);
            finalClip.SetData(recordedData, 0);

            lastSavedFilePath = GetPathForFilename(outputFileName); // Store path before saving
            SaveAsWav(finalClip, lastSavedFilePath); // Save using the full path

            Destroy(finalClip); // Destroy temp final clip

            // --- Start the API Pipeline ---
            if (!string.IsNullOrEmpty(lastSavedFilePath) && File.Exists(lastSavedFilePath))
            {
                Debug.Log("[MicrophoneRecorderCallback] Starting API processing pipeline...");
                StartCoroutine(ProcessAudioPipeline(lastSavedFilePath));
            }
            else
            {
                 Debug.LogError($"[MicrophoneRecorderCallback] Failed to start API pipeline. Saved file path is invalid or file doesn't exist: {lastSavedFilePath}");
            }
            // -----------------------------
        }
        else {
             Debug.LogWarning($"[MicrophoneRecorderCallback] Stopping recording, but no valid data (Samples: {finalPosition}). Nothing saved or processed.");
        }

        if (recordedClip != null) {
            Destroy(recordedClip);
            recordedClip = null;
        }
    }

    public void ToggleRecording()
    {
         if (IsProcessing) {
             Debug.LogWarning("[MicrophoneRecorderCallback] Cannot toggle recording while processing API response.");
            return;
        }

        if (!isRecording) {
            StartRecording();
        } else {
            StopRecordingAndSave();
        }
    }

    // --- Private Helper Methods ---

    private int StopRecordingInternal()
    {
        if (!isRecording) return 0;

        int currentPosition = 0;
        if (!string.IsNullOrEmpty(micDeviceName) && Microphone.IsRecording(micDeviceName)) {
            currentPosition = Microphone.GetPosition(micDeviceName);
            Microphone.End(micDeviceName);
            Debug.Log("[MicrophoneRecorderCallback] Microphone hardware stopped.");
        } else if (!string.IsNullOrEmpty(micDeviceName)) {
            Debug.LogWarning("[MicrophoneRecorderCallback] StopRecordingInternal: IsRecording() was false.");
            currentPosition = Microphone.GetPosition(micDeviceName); // Try getting position anyway
            Microphone.End(micDeviceName); // Ensure ended
        } else {
            Debug.LogWarning("[MicrophoneRecorderCallback] Cannot stop microphone, device name invalid.");
        }

        isRecording = false;
        if (currentPosition <= 0) {
            Debug.LogWarning("[MicrophoneRecorderCallback] Microphone stopped, position is 0.");
        }
        return currentPosition;
    }

     private string GetPathForFilename(string filename) {
         return Path.Combine(Application.persistentDataPath, filename);
     }


    // --- WAV Saving Function ---
    private void SaveAsWav(AudioClip clip, string filePath) // Takes full path now
    {
        if (clip == null || clip.samples == 0 || clip.channels == 0) {
            Debug.LogError($"[MicrophoneRecorderCallback] SaveAsWav: Invalid AudioClip provided. Path: {filePath}");
            return;
        }

        Debug.Log($"[MicrophoneRecorderCallback] Attempting to save WAV file to: {filePath}");
        Directory.CreateDirectory(Path.GetDirectoryName(filePath)); // Ensure directory

        // Keep the try/catch for the file writing itself, which is synchronous
        try
        {
            using (FileStream fileStream = new FileStream(filePath, FileMode.Create))
            using (BinaryWriter writer = new BinaryWriter(fileStream))
            {
                int riff = 0x46464952; // "RIFF"
                int wave = 0x45564157; // "WAVE"
                int fmt = 0x20746d66;  // "fmt "
                int data = 0x61746164; // "data"

                int channels = clip.channels;
                int frequency = clip.frequency;
                int samples = clip.samples;
                short bitDepth = 16;

                int subChunk1Size = 16;
                short audioFormat = 1;
                short blockAlign = (short)(channels * (bitDepth / 8));
                int byteRate = frequency * blockAlign;
                int subChunk2Size = samples * blockAlign;
                int chunkSize = 36 + subChunk2Size;

                // Write Header
                writer.Write(riff); writer.Write(chunkSize); writer.Write(wave);
                writer.Write(fmt); writer.Write(subChunk1Size); writer.Write(audioFormat);
                writer.Write((short)channels); writer.Write(frequency); writer.Write(byteRate);
                writer.Write(blockAlign); writer.Write(bitDepth);
                writer.Write(data); writer.Write(subChunk2Size);

                // Write Data
                float[] clipData = new float[samples * channels];
                clip.GetData(clipData, 0);
                for (int i = 0; i < clipData.Length; i++) {
                    float sampleFloat = Mathf.Clamp(clipData[i], -1.0f, 1.0f);
                    short sample16 = (short)(sampleFloat * short.MaxValue);
                    writer.Write(sample16);
                }
                Debug.Log($"[MicrophoneRecorderCallback] Successfully saved WAV ({subChunk2Size} data bytes) to: {filePath}");
            }
        }
        catch (System.Exception e) {
            Debug.LogError($"[MicrophoneRecorderCallback] Error saving WAV file to {filePath}: {e.Message}\n{e.StackTrace}");
             lastSavedFilePath = null; // Invalidate path on error
        }
    }


    // --- API Pipeline Coroutine ---

    private IEnumerator ProcessAudioPipeline(string wavFilePath)
    {
        if (IsProcessing) yield break; // Prevent concurrent processing
        IsProcessing = true;
        Debug.Log($"[API Pipeline] Starting process for: {wavFilePath}");

        // --- Stage 1: Audio-to-Text (Whisper) ---
        string transcription = null;
        yield return StartCoroutine(UploadToWhisper(wavFilePath, result => transcription = result));

        if (string.IsNullOrEmpty(transcription))
        {
            Debug.LogError("[API Pipeline] Failed to get transcription. Aborting pipeline.");
            IsProcessing = false;
            yield break;
        }
        Debug.Log($"[API Pipeline] Transcription: {transcription}");

        // --- Stage 2: Text-to-LLM (Chat) ---
        string llmResponse = null;
        string fullPrompt = therapistPromptPrefix + transcription;
        yield return StartCoroutine(GetLlmResponse(fullPrompt, result => llmResponse = result));

        if (string.IsNullOrEmpty(llmResponse))
        {
             Debug.LogError("[API Pipeline] Failed to get LLM response. Aborting pipeline.");
             IsProcessing = false;
             yield break;
        }
         Debug.Log($"[API Pipeline] LLM Response: {llmResponse}");

        // --- Stage 3: Text-to-Speech (ElevenLabs) ---
        byte[] mp3Data = null;
        yield return StartCoroutine(GetElevenLabsSpeech(llmResponse, result => mp3Data = result));

         if (mp3Data == null || mp3Data.Length == 0)
        {
             Debug.LogError("[API Pipeline] Failed to get TTS audio. Aborting pipeline.");
             IsProcessing = false;
             yield break;
        }
        Debug.Log($"[API Pipeline] Received {mp3Data.Length} bytes of MP3 data.");

        // --- Stage 4: Save and Play MP3 Response ---
        string responseAudioPath = GetPathForFilename(responseAudioFileName);
        bool saveError = false;
        // Save the MP3 data (synchronous file operation)
        try {
             File.WriteAllBytes(responseAudioPath, mp3Data);
             Debug.Log($"[API Pipeline] Saved ElevenLabs response to: {responseAudioPath}");
        } catch (System.Exception e) {
            Debug.LogError($"[API Pipeline] Error saving response audio to {responseAudioPath}: {e.Message}\n{e.StackTrace}");
            saveError = true; // Mark error and continue to finish processing state
        }

        // Proceed to load/play only if save was successful
        if (!saveError)
        {
            // Load and play using UnityWebRequestMultimedia
            // Prepare the request first
            string pathForRequest = "file://" + responseAudioPath; // Needs file:// prefix
            UnityWebRequest www = UnityWebRequestMultimedia.GetAudioClip(pathForRequest, AudioType.MPEG); // Use MPEG for MP3

            // Now yield for the request to complete
            yield return www.SendWebRequest();

            // Check result and process AFTER yield return, can be in try/catch
            try
            {
                if (www.result == UnityWebRequest.Result.Success)
                {
                    AudioClip responseClip = DownloadHandlerAudioClip.GetContent(www);
                    if (responseClip != null)
                    {
                        responseClip.name = "TherapistResponseAudio";
                        if (responseClip.loadState == AudioDataLoadState.Loaded)
                        {
                            Debug.Log("[API Pipeline] Playing therapist response.");
                            responseAudioSource.Stop();
                            responseAudioSource.clip = responseClip;
                            responseAudioSource.Play();
                            // Optionally destroy clip after playing: Destroy(responseClip, responseClip.length + 1.0f);
                        } else {
                             Debug.LogError("[API Pipeline] Failed to load downloaded audio data into AudioClip.");
                        }
                    } else {
                        Debug.LogError("[API Pipeline] GetContent returned null AudioClip.");
                    }
                } else {
                    Debug.LogError($"[API Pipeline] Error loading audio from {pathForRequest}: {www.error}");
                }
            } catch(System.Exception e) {
                 Debug.LogError($"[API Pipeline] Error processing loaded audio clip: {e.Message}");
            } finally {
                 www.Dispose(); // Dispose the UnityWebRequest
            }
        } // end if(!saveError)

        IsProcessing = false;
        Debug.Log("[API Pipeline] Processing finished.");
    }

    // --- Whisper API Call ---
    private IEnumerator UploadToWhisper(string filePath, System.Action<string> callback)
    {
        Debug.Log("[API Call] Uploading to Whisper...");
        byte[] fileData;
        try {
            fileData = File.ReadAllBytes(filePath);
        } catch (System.Exception e) {
             Debug.LogError($"[API Call] Error reading WAV file {filePath}: {e.Message}");
             callback?.Invoke(null);
             yield break; // Exit coroutine on file read error
        }

        var form = new WWWForm();
        form.AddField("model", "whisper-1");
        form.AddBinaryData("file", fileData, Path.GetFileName(filePath), "audio/wav");

        UnityWebRequest www = UnityWebRequest.Post(whisperApiUrl, form);
        www.SetRequestHeader("Authorization", $"Bearer {zukiApiKey}");

        // Yield outside the try block
        yield return www.SendWebRequest();

        // Process response after yield, can be in try/catch
        string result = null;
        try
        {
            if (www.result == UnityWebRequest.Result.Success)
            {
                string jsonResponse = www.downloadHandler.text;
                Debug.Log($"[API Call] Whisper Raw Response: {jsonResponse}");
                WhisperResponse response = JsonUtility.FromJson<WhisperResponse>(jsonResponse);
                if (response != null && !string.IsNullOrEmpty(response.text)) {
                    Debug.Log("[API Call] Whisper Success.");
                    result = response.text;
                } else {
                    Debug.LogError($"[API Call] Whisper response parsing failed or text is empty. JSON: {jsonResponse}");
                    // result remains null
                }
            } else {
                Debug.LogError($"[API Call] Whisper Error: {www.responseCode} - {www.error}\n{www.downloadHandler.text}");
                 // result remains null
            }
        } catch (System.Exception e) {
             Debug.LogError($"[API Call] Exception processing Whisper response: {e.Message}\nResponse Text: {www.downloadHandler?.text}");
             // result remains null
        } finally {
            www.Dispose(); // Ensure disposal
            callback?.Invoke(result); // Call callback with result (or null on error)
        }
    }


    // --- Chat API Call ---
    private IEnumerator GetLlmResponse(string prompt, System.Action<string> callback)
    {
        Debug.Log("[API Call] Sending prompt to Chat API...");
        ChatRequestPayload payload = new ChatRequestPayload {
            model = chatModel,
            messages = new ChatMessage[] {
                new ChatMessage { role = "user", content = prompt }
            }
        };
        string jsonPayload = JsonUtility.ToJson(payload);
        byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonPayload);

        UnityWebRequest www = new UnityWebRequest(chatApiUrl, "POST");
        www.uploadHandler = new UploadHandlerRaw(bodyRaw);
        www.downloadHandler = new DownloadHandlerBuffer();
        www.SetRequestHeader("Content-Type", "application/json");
        www.SetRequestHeader("Authorization", $"Bearer {zukiApiKey}");

        // Yield outside the try block
        yield return www.SendWebRequest();

        // Process response after yield
        string result = null;
        try
        {
             if (www.result == UnityWebRequest.Result.Success)
            {
                 string jsonResponse = www.downloadHandler.text;
                 Debug.Log($"[API Call] Chat Raw Response: {jsonResponse}");

                 // !!! IMPORTANT: JsonUtility limitation reminder !!!
                 // Attempting manual parse as JsonUtility likely fails here.

                 // More robust manual parsing using Regex (still imperfect but better)
                 // Looks for "content": "..." within the 'message' object structure
                 Match match = Regex.Match(jsonResponse, @"""message""\s*:\s*{\s*""role""\s*:\s*""assistant""\s*,\s*""content""\s*:\s*""(.*?)""\s*}", RegexOptions.Singleline);

                 if (match.Success && match.Groups.Count > 1)
                 {
                     result = Regex.Unescape(match.Groups[1].Value); // Extract and unescape content
                     Debug.Log("[API Call] Chat Success (Regex parse).");
                 }
                 else
                 {
                      // Fallback: Try the simpler string search if Regex fails
                      string contentMarker = "\"content\": \"";
                      int contentStartIndex = jsonResponse.IndexOf(contentMarker); // Find first occurrence
                      int messageBlockIndex = jsonResponse.IndexOf("\"message\""); // Ensure it's likely within a message block
                      if (messageBlockIndex != -1 && contentStartIndex > messageBlockIndex) // Basic check: content appears after message
                      {
                          contentStartIndex = jsonResponse.IndexOf(contentMarker, messageBlockIndex); // Find first after "message"
                          if(contentStartIndex != -1)
                          {
                                contentStartIndex += contentMarker.Length;
                                int contentEndIndex = jsonResponse.IndexOf("\"", contentStartIndex);
                                if (contentEndIndex != -1)
                                {
                                    result = Regex.Unescape(jsonResponse.Substring(contentStartIndex, contentEndIndex - contentStartIndex));
                                    Debug.Log("[API Call] Chat Success (basic string parse).");
                                } else {
                                    Debug.LogError("[API Call] Chat response parsing failed (string parse - end quote not found). JSON: " + jsonResponse);
                                }
                          } else {
                               Debug.LogError("[API Call] Chat response parsing failed (string parse - content marker not found after message). JSON: " + jsonResponse);
                          }
                      } else {
                           Debug.LogError("[API Call] Chat response parsing failed (Regex and basic string). Need better JSON handling. JSON: " + jsonResponse);
                      }
                 }
            } else {
                Debug.LogError($"[API Call] Chat Error: {www.responseCode} - {www.error}\n{www.downloadHandler.text}");
            }
        } catch (System.Exception e) {
             Debug.LogError($"[API Call] Exception processing Chat response: {e.Message}\nResponse Text: {www.downloadHandler?.text}");
        } finally {
            www.Dispose();
            callback?.Invoke(result);
        }
    }

    // --- ElevenLabs API Call ---
    private IEnumerator GetElevenLabsSpeech(string textToSpeak, System.Action<byte[]> callback)
    {
        Debug.Log("[API Call] Requesting speech from ElevenLabs...");
        ElevenLabsRequestPayload payload = new ElevenLabsRequestPayload {
            text = textToSpeak
        };
        string jsonPayload = JsonUtility.ToJson(payload);
        byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonPayload);

        UnityWebRequest www = new UnityWebRequest(ElevenLabsTtsUrl, "POST");
        www.uploadHandler = new UploadHandlerRaw(bodyRaw);
        www.downloadHandler = new DownloadHandlerBuffer();
        www.SetRequestHeader("Content-Type", "application/json");
        www.SetRequestHeader("xi-api-key", elevenLabsApiKey);
        www.SetRequestHeader("Accept", "audio/mpeg"); // Explicitly accept MP3

        // Yield outside the try block
        yield return www.SendWebRequest();

        // Process response after yield
        byte[] result = null;
        try
        {
             if (www.result == UnityWebRequest.Result.Success)
            {
                result = www.downloadHandler.data;
                Debug.Log($"[API Call] ElevenLabs Success ({result?.Length ?? 0} bytes received).");
            } else {
                Debug.LogError($"[API Call] ElevenLabs Error: {www.responseCode} - {www.error}\n{www.downloadHandler.text}");
            }
        } catch (System.Exception e) {
             Debug.LogError($"[API Call] Exception processing ElevenLabs response: {e.Message}\nResponse Text: {www.downloadHandler?.text}");
        } finally {
            www.Dispose();
            callback?.Invoke(result);
        }
    }
}