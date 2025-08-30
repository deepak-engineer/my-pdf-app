// src/hooks/useCloudPickers.js
"use client"; // This hook will be used in client components

import { useState, useEffect, useCallback } from 'react';

// Define global types for gapi and Dropbox if not already defined in a global declaration file
// This helps with TypeScript, but for plain JavaScript, it's optional.
// declare global {
//   interface Window {
//     gapi: any;
//     google: any;
//     Dropbox: any;
//     onGoogleScriptLoad: () => void;
//   }
// }

export function useCloudPickers() {
  const [isPickerLoading, setIsPickerLoading] = useState(false);
  const [pickedCloudFiles, setPickedCloudFiles] = useState([]); // <-- Ye state hai
  const [error, setError] = useState(null);

  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const DROPBOX_APP_KEY = process.env.NEXT_PUBLIC_DROPBOX_APP_KEY;

  // --- SDK Loading and Initialization ---
  useEffect(() => {
    // Load Google API client and Picker
    const loadGoogleApi = () => {
      if (typeof window === 'undefined') return; // Ensure window is defined

      if (window.gapi && window.google) {
        window.gapi.load('client:picker', () => {
          window.gapi.client.setApiKey(GOOGLE_API_KEY);
          window.gapi.client.load('drive', 'v3', () => { // Use v3 for Drive API
            console.log("Google Drive API v3 loaded.");
          });
          console.log("Google Picker API loaded.");
        });
      } else {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
          if (window.gapi) { // Check again if gapi is available after script load
            window.gapi.load('client:picker', () => {
              window.gapi.client.setApiKey(GOOGLE_API_KEY);
              window.gapi.client.load('drive', 'v3', () => {
                console.log("Google Drive API v3 loaded.");
              });
              console.log("Google Picker API loaded.");
            });
          }
        };
        document.body.appendChild(script);

        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.onload = () => console.log("Google Identity Services loaded.");
        document.body.appendChild(gisScript);
      }
    };

    // Load Dropbox Chooser SDK
    const loadDropboxSdk = () => {
      if (typeof window === 'undefined') return; // Ensure window is defined

      if (!window.Dropbox && DROPBOX_APP_KEY) {
        const script = document.createElement('script');
        script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
        script.id = 'dropboxjs';
        script.setAttribute('data-app-key', DROPBOX_APP_KEY);
        script.onload = () => console.log("Dropbox Chooser SDK loaded.");
        document.body.appendChild(script);
      }
    };

    if (GOOGLE_API_KEY && GOOGLE_CLIENT_ID) loadGoogleApi();
    else console.warn("Google API keys not found. Google Drive upload disabled.");

    if (DROPBOX_APP_KEY) loadDropboxSdk();
    else console.warn("Dropbox App Key not found. Dropbox upload disabled.");

  }, [GOOGLE_API_KEY, GOOGLE_CLIENT_ID, DROPBOX_APP_KEY]);


  // --- Google Drive Integration ---
  const createGooglePicker = useCallback((accessToken) => {
    if (!window.google || !window.google.picker) {
      setError("Google Picker API is not loaded.");
      setIsPickerLoading(false);
      return;
    }

    const view = new window.google.picker.View(window.google.picker.ViewId.DOCS);
    view.setMimeTypes('application/pdf'); // Only allow PDF files

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .setOAuthToken(accessToken)
      .setDeveloperKey(GOOGLE_API_KEY)
      .setCallback((data) => pickerCallback(data, accessToken))
      .build();
    picker.setVisible(true);
  }, [GOOGLE_API_KEY]); // Dependencies for useCallback

  const pickerCallback = async (data, accessToken) => {
    if (data.action === window.google.picker.Action.PICKED) {
      const docs = data.docs;
      const newFiles = [];
      for (const doc of docs) {
        if (doc.mimeType === 'application/pdf') {
          try {
            const response = await fetch(
              `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`,
              {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to download Google Drive file: ${response.statusText}`);
            }

            const blob = await response.blob();
            // Create a File-like object for consistency
            const file = new File([blob], doc.name, { type: doc.mimeType });
            newFiles.push(file);

          } catch (err) {
            console.error("Error downloading Google Drive file:", err);
            setError(`Failed to download file "${doc.name}": ${err.message}`);
          }
        }
      }
      setPickedCloudFiles(prev => [...prev, ...newFiles]);
    }
    setIsPickerLoading(false);
  };

  const openGoogleDrivePicker = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY) {
      setError("Google API Key or Client ID is missing. Google Drive upload disabled.");
      return;
    }
    setIsPickerLoading(true);
    setError(null);

    // Using new Google Identity Services (GSI) for token
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.readonly',
      callback: (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          createGooglePicker(tokenResponse.access_token);
        } else {
          console.error('Failed to get Google Access Token:', tokenResponse);
          setError('Could not authenticate with Google Drive.');
          setIsPickerLoading(false);
        }
      },
      error_callback: (err) => {
        console.error('Google OAuth Error:', err);
        setError('Failed to authenticate with Google Drive.');
        setIsPickerLoading(false);
      }
    });

    tokenClient.requestAccessToken();

  }, [GOOGLE_API_KEY, GOOGLE_CLIENT_ID, createGooglePicker]);


  // --- Dropbox Integration ---
  const openDropboxChooser = useCallback(() => {
    if (!DROPBOX_APP_KEY) {
      setError("Dropbox App Key is missing. Dropbox upload disabled.");
      return;
    }
    setIsPickerLoading(true);
    setError(null);

    if (window.Dropbox && window.Dropbox.choose) {
      window.Dropbox.choose({
        success: async (files) => {
          const newFiles = [];
          for (const file of files) {
            if (file.link && file.name.toLowerCase().endsWith('.pdf')) {
              try {
                const response = await fetch(file.link);
                if (!response.ok) {
                  throw new Error(`Failed to download Dropbox file: ${response.statusText}`);
                }
                const blob = await response.blob();
                const newFile = new File([blob], file.name, { type: 'application/pdf' });
                newFiles.push(newFile);
              } catch (err) {
                console.error("Error downloading Dropbox file:", err);
                setError(`Failed to download file "${file.name}": ${err.message}`);
              }
            }
          }
          setPickedCloudFiles(prev => [...prev, ...newFiles]);
          setIsPickerLoading(false);
        },
        cancel: () => {
          console.log("Dropbox Chooser cancelled.");
          setIsPickerLoading(false);
        },
        linkType: "direct", // or "preview" if you just need a link to view
        multiselect: true,
        extensions: ['.pdf'],
      });
    } else {
      console.error("Dropbox Chooser SDK is not loaded.");
      setError("Dropbox Chooser SDK is not loaded. Please try again.");
      setIsPickerLoading(false);
    }
  }, [DROPBOX_APP_KEY]);

  // Function to clear files picked from cloud (e.g., after merging)
  const clearPickedCloudFiles = useCallback(() => {
    setPickedCloudFiles([]);
    setError(null);
  }, []);

  return {
    isPickerLoading,
    pickedCloudFiles,
    error,
    openGoogleDrivePicker,
    openDropboxChooser,
    clearPickedCloudFiles,
    setPickedCloudFiles, // <-- Yahan maine setPickedCloudFiles ko bhi return kar diya hai.
  };
}