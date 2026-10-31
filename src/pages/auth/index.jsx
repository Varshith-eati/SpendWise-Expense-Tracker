import { useState } from "react";
import { auth, provider } from "../../config/firebase-config";
import { signInWithPopup } from "firebase/auth";
import { useNavigate, Navigate } from "react-router-dom";
import { useGetUserInfo } from "../../hooks/useGetUserInfo";
import {
  GoogleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  PieChartIcon,
  CoffeeIcon,
} from "../../components/Icons";
import "./styles.css";

export const Auth = () => {
  const navigate = useNavigate();
  const { isAuth } = useGetUserInfo();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const signInWithGoogle = async () => {
    setLoading(true);
    setAuthError("");
    try {
      const results = await signInWithPopup(auth, provider);
      const authInfo = {
        userID: results.user.uid,
        name: results.user.displayName || "Friend",
        profilePhoto: results.user.photoURL,
        isAuth: true,
        isGuest: false,
      };
      localStorage.setItem("auth", JSON.stringify(authInfo));
      navigate("/expense-tracker");
    } catch (err) {
      console.error("Sign-in error: ", err);
      setAuthError(
        err.message?.includes("popup-closed-by-user")
          ? "The sign-in popup was closed before completing."
          : "Could not sign in with Google right now. You can try our Instant Demo Mode!"
      );
    } finally {
      setLoading(false);
    }
  };

  const startDemoMode = () => {
    const demoUser = {
      userID: "demo-guest-user",
      name: "Alex Morgan",
      profilePhoto:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
      isAuth: true,
      isGuest: true,
    };
    localStorage.setItem("auth", JSON.stringify(demoUser));
    navigate("/expense-tracker");
  };

  if (isAuth) {
    return <Navigate to="/expense-tracker" />;
  }

  return (
    <div className="auth-container">
      {/* Background ambient lighting blur orbs */}
      <div className="ambient-orb orb-1" />
      <div className="ambient-orb orb-2" />

      <div className="auth-card animate-fade-in">
        {/* Brand Header */}
        <div className="brand-header">
          <div className="brand-badge">
            <span className="brand-icon">
              <SparklesIcon size={18} />
            </span>
            <span>SpendWise</span>
          </div>
          <span className="human-pill">Mindful Finance</span>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className="hero-title">
          Master your money with <span className="gradient-text">clarity and joy</span>.
        </h1>
        <p className="hero-subtitle">
          An intuitive, human-centered tracker designed to help you understand your spending habits, celebrate savings, and reach your goals stress-free.
        </p>

        {/* Highlights Pills */}
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon icon-emerald">
              <PieChartIcon size={16} />
            </div>
            <div>
              <strong>Visual Insights</strong>
              <span>Interactive breakdown & categories</span>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon icon-amber">
              <CoffeeIcon size={16} />
            </div>
            <div>
              <strong>Mood Tracking</strong>
              <span>Track how your spending feels</span>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon icon-indigo">
              <ShieldCheckIcon size={16} />
            </div>
            <div>
              <strong>Private & Secure</strong>
              <span>Protected with Google Cloud</span>
            </div>
          </div>
        </div>

        {/* Error notification if any */}
        {authError && (
          <div className="auth-error-banner">
            <p>{authError}</p>
          </div>
        )}

        {/* Actions Area */}
        <div className="auth-actions">
          <button
            className="google-signin-btn"
            onClick={signInWithGoogle}
            disabled={loading}
          >
            <GoogleIcon size={20} />
            <span>{loading ? "Connecting..." : "Continue with Google"}</span>
          </button>

          <div className="divider-row">
            <span>or explore immediately</span>
          </div>

          <button className="demo-btn" onClick={startDemoMode}>
            <span>Try Interactive Demo Mode</span>
            <ArrowRightIcon size={16} />
          </button>
        </div>

        {/* Human Quote / Testimonial Footer */}
        <div className="testimonial-footer">
          <div className="avatar-group">
            <span className="avatar-letter">P</span>
          </div>
          <div className="testimonial-text">
            <p>
              "Finally an expense tracker that doesn't feel like doing taxes. Beautiful, simple, and encouraging."
            </p>
            <span className="testimonial-author">Priya S. • Product Designer</span>
          </div>
        </div>
      </div>
    </div>
  );
};
