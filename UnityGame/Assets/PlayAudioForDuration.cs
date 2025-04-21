using UnityEngine;
using System.Collections; // Required for Coroutines

// This attribute automatically adds an AudioSource if one doesn't exist
// and ensures this script has access to it.
[RequireComponent(typeof(AudioSource))]
public class PlayAudioForDuration : MonoBehaviour
{
    // --- Public Variables (visible in Inspector) ---

    // Drag your imported MP3/AudioClip asset here in the Unity Inspector
    public AudioClip audioClipToPlay;

    // How long to play the audio clip in seconds
    public float playDuration = 10.0f;

    // --- Private Variables ---
    private AudioSource audioSource;

    // Awake is called when the script instance is being loaded
    void Awake()
    {
        // Get the AudioSource component attached to this GameObject
        audioSource = GetComponent<AudioSource>();

        // Optional: Configure AudioSource settings here if needed
        // For example, prevent it from playing automatically on scene load
        // if the 'Play on Awake' checkbox is checked in the Inspector.
        // We control playback manually in Start().
        audioSource.playOnAwake = false;
        audioSource.loop = false; // Ensure it doesn't loop unless intended
    }

    // Start is called before the first frame update
    void Start()
    {
        // Check if an AudioClip has actually been assigned in the Inspector
        if (audioClipToPlay != null)
        {
            // Assign the specified clip to the AudioSource
            audioSource.clip = audioClipToPlay;

            // Play the audio
            audioSource.Play();
            Debug.Log($"Started playing audio: {audioClipToPlay.name}");

            // Start a Coroutine to stop the audio after the desired duration
            StartCoroutine(StopAudioAfterTime(playDuration));
        }
        else
        {
            // Log a warning if no clip is assigned, helps with debugging
            Debug.LogWarning("PlayAudioForDuration: No AudioClip assigned!", this.gameObject);
        }
    }

    // Coroutine to wait for a specific amount of time then stop audio
    private IEnumerator StopAudioAfterTime(float delay)
    {
        // Wait for the specified number of seconds
        yield return new WaitForSeconds(delay);

        // Check if the audio source is still playing before stopping
        // (It might have finished naturally if the clip is shorter than the delay)
        if (audioSource.isPlaying)
        {
            audioSource.Stop();
            Debug.Log($"Stopped audio: {audioClipToPlay.name} after {delay} seconds.");
        }
    }
}