import { auth } from "./firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult,
  signOut 
} from "firebase/auth";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

let isAuthenticating = false;

/**
 * Initiates Google Sign-In via a popup window.
 * Falls back to Redirect if popup is blocked or fails.
 */
export const loginWithGoogle = async () => {
  if (isAuthenticating) return;
  isAuthenticating = true;

  console.log("Starting Google Auth flow...");

  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Sign-in successful:", result.user.email);
    isAuthenticating = false;
    return result.user;
  } catch (error) {
    isAuthenticating = false;
    console.error("Auth Error Code:", error.code);
    console.error("Auth Error Message:", error.message);

    if (error.code === 'auth/popup-blocked') {
      console.warn("Popup blocked, falling back to redirect...");
      try {
        await signInWithRedirect(auth, provider);
      } catch (redirError) {
        console.error("Redirect Auth Failed:", redirError);
        alert("Authentication failed. Please check if your domain is authorized in Firebase console.");
      }
    } else if (error.code === 'auth/popup-closed-by-user') {
      console.log("User closed the login popup.");
    } else if (error.code === 'auth/unauthorized-domain') {
      alert(`Domain Unauthorized: Please add 'localhost' (and your production domain) to Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
    } else {
      alert(`Sign-in failed: ${error.message}`);
      throw error;
    }
  }
};

/**
 * Handles the result of a sign-in-with-redirect flow.
 */
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log("Redirect sign-in successful:", result.user.email);
      return result.user;
    }
  } catch (error) {
    console.error("Redirect Result Error:", error.code, error.message);
  }
  return null;
};

/**
 * Signs out the current user.
 */
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully.");
  } catch (error) {
    console.error("Logout failed:", error.message);
    throw error;
  }
};

