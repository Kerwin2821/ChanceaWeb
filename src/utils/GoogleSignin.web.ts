import { AppState } from 'react-native';

const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let isScriptLoaded = false;
let authClient: any = null;
let webClientId: string | null = null;
let currentUser: any = null;

const loadGoogleScript = () => {
    return new Promise<void>((resolve, reject) => {
        if (isScriptLoaded) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = GOOGLE_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            isScriptLoaded = true;
            resolve();
        };
        script.onerror = () => {
            reject(new Error('Failed to load Google Identity Services script'));
        };
        document.body.appendChild(script);
    });
};

const parseJwt = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

export const statusCodes = {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
};

export const GoogleSignin = {
    configure: async (options: { webClientId?: string }) => {
        if (options && options.webClientId) {
            webClientId = options.webClientId;
        }
        // We might not need the script for manual flow, but keeping it for compatibility
        // await loadGoogleScript(); 
    },

    hasPlayServices: async () => {
        return true;
    },

    signIn: async () => {
        return new Promise((resolve, reject) => {
            // CHECK 1: If we are returning from a redirect, we might already have the token in the URL
            const currentUrl = window.location.href;
            if (currentUrl.indexOf('id_token=') !== -1) {
                // We are back!
                const hashIndex = currentUrl.indexOf('#');
                const hash = currentUrl.substring(hashIndex + 1);
                const params = new URLSearchParams(hash);
                const idToken = params.get('id_token');

                // Clean URL immediately after extraction to hide it from user
                try {
                    console.log("Cleaning Google Auth URL hash...");
                    window.location.hash = '';
                    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
                } catch (e) {
                    console.log("Failed to clean URL", e);
                }

                if (idToken) {
                    const payload = parseJwt(idToken);
                    if (!payload) {
                        reject(new Error('Invalid ID Token structure'));
                        return;
                    }
                    const user = {
                        id: payload.sub,
                        name: payload.name,
                        email: payload.email,
                        photo: payload.picture,
                        familyName: payload.family_name,
                        givenName: payload.given_name,
                    };

                    currentUser = user;

                    resolve({
                        data: {
                            user,
                            idToken: idToken,
                        },
                        user,
                        idToken: idToken,
                    });
                    return;
                }
            }

            // CHECK 2: Start new flow
            if (!webClientId) {
                reject(new Error('webClientId not configured'));
                return;
            }

            // OIDC Implicit Flow Configuration
            // We use the current origin as the redirect URI.
            // IMPORTANT: This origin must be added to "Authorized redirect URIs" in Google Cloud Console.
            const REDIRECT_URI = window.location.origin;
            const SCOPE = 'openid profile email';
            const RESPONSE_TYPE = 'id_token';
            // Simple nonce
            const NONCE = Math.random().toString(36).substring(2, 15);

            // Construct Auth URL
            // prompt=select_account forces the account chooser
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${webClientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPE)}&nonce=${NONCE}&prompt=select_account`;

            console.log("--> GOOGLE AUTH URL:", authUrl);

            // REDIRECT (Full Page)
            // This will reload the page, so the Promise will technically never resolve *in this session*.
            // The app will reload, hitting the top of this script again.
            // However, `AuthProvider.tsx` calls `signIn` on button press. 
            // We need a mechanism to AUTO-LOGIN on return.
            // But `signIn` is only called on button press.
            // So we need `configure` or an init check to handle the return.

            // Wait! If I redirect, the app unmounts.
            // When it returns, `AuthProvider` mounts.
            // `AuthProvider` does NOT call `signIn` automatically.
            // So the user lands on the Login screen again?
            // So we need `AuthProvider` or `Prelogin` to check `GoogleSignin.isSignedIn()` or similar on mount?
            // Or `GoogleSignin.configure` can handle it?

            // Let's make `signIn` just do the redirect. 
            // AND we need to add a check in `configure` or a new method `checkPendingRedirect`?

            // Actually, if we redirect, the state is lost.
            // When the user comes back, they see the "Sign in with Google" button again.
            // If they click it AGAIN, `signIn` is called.
            // IF `signIn` checks the URL *first*, it will resolve immediately!
            // So the flow is:
            // 1. User clicks Button -> signIn() -> Redirects.
            // 2. User returns to App (reloads) -> URL has token.
            // 3. App shows "Sign in with Google" button (because AuthProvider defaults to null user).
            // 4. User *hopefully* doesn't need to click again? 
            //    Ah, the user wants it to "continue flow".

            // To make it automatic, `AuthProvider.tsx` needs to call something on mount.
            // I will implement a `restorePreviousSign` or similar in `GoogleSignin` object that `AuthProvider` can call?
            // OR simpler: `signIn` handles the redirect. 
            // The issue is triggering it on load.

            // Let's stick to modifying `signIn` to handle the URL check first.
            // But for the "Auto" part, I might need to instruct `AuthProvider` to check on mount.
            // I'll see if I can modify `signIn` to handle both.
            // For now, I will implement the redirect.

            // FORCE SAME WINDOW
            window.open(authUrl, '_self');
        });
    },

    signInSilently: async () => {
        // This can be used to check URL on mount!
        const currentUrl = window.location.href;
        if (currentUrl.indexOf('id_token=') !== -1) {
            const hashIndex = currentUrl.indexOf('#');
            const hash = currentUrl.substring(hashIndex + 1);
            const params = new URLSearchParams(hash);
            const idToken = params.get('id_token');

            // Clean URL immediately
            try {
                window.location.hash = '';
                window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
            } catch (e) {
                console.log("Failed to clean URL in signInSilently", e);
            }

            if (idToken) {
                const payload = parseJwt(idToken);
                if (!payload) {
                    return { user: null, idToken: null, data: null }; // Or throw error
                }
                const user = {
                    id: payload.sub,
                    name: payload.name,
                    email: payload.email,
                    photo: payload.picture,
                    familyName: payload.family_name,
                    givenName: payload.given_name,
                };

                currentUser = user;

                return {
                    data: {
                        user,
                        idToken: idToken,
                    },
                    user,
                    idToken: idToken,
                };
            }
        }
        throw new Error('No token in URL');
    },

    signOut: async () => {
        // For manual flow, we just clear local state.
        // There is no global sign out for implicit flow without redirecting to google logout.
        currentUser = null;
    },

    isSignedIn: async () => {
        return !!currentUser;
    },

    getCurrentUser: async () => {
        return currentUser;
    },

    getTokens: async () => {
        return {
            idToken: 'token', // placeholder
            accessToken: 'token'
        }
    }
};

export default {
    GoogleSignin,
    statusCodes
};
