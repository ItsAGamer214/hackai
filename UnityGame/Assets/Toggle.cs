using System;
using Unity.VisualScripting;
using UnityEngine;

public class Toggle : MonoBehaviour
{

    public GameObject canvas;
    void Start()
    {
    }
    
    void Update()
    {
        
    }
    
    public void ToggleCanvas()
    {
        bool isOn = !canvas.gameObject.activeSelf;
        canvas.gameObject.SetActive(isOn);
    }
}
