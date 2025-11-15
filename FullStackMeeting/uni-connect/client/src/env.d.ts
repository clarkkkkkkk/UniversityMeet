/// <reference types="vite/client" />

/**
 * Extend Vite's ImportMetaEnv interface with all your custom environment variables.
 * All variables must start with VITE_ to be exposed in client code.
 */
interface ImportMetaEnv {
    readonly VITE_SIGNALING: string;        // WebSocket / Socket.io signaling server URL
    readonly VITE_API_URL?: string;         // REST API endpoint for future backend features
    readonly VITE_ENV?: 'development' | 'production'; // current environment
    readonly VITE_GOOGLE_OAUTH_CLIENT_ID?: string; // future Google OAuth login
    readonly VITE_TURN_SERVER_URL?: string; // future TURN server for WebRTC
    readonly VITE_FEATURE_FLAGS?: string;   // comma-separated feature flags for experimentation
  }
  
  /**
   * The ImportMeta interface exposes `env` in Vite projects.
   */
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  