// src/components/Register/Register.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";

const Register = () => {
  const { createUser, updateUserProfile, signInWithGoogle } = useAuth() || {};
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const name = form.name.value;
    const photoURL = form.photoURL.value;
    const email = form.email.value;
    const password = form.password.value;

    // basic password validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      toast.error("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(password)) {
      toast.error("Password must contain at least one lowercase letter.");
      return;
    }

    try {
      setLoading(true);
      if (!createUser) {
        throw new Error("Auth context is not configured correctly.");
      }

      const result = await createUser(email, password);

      // optional profile update (if function exists)
      if (updateUserProfile) {
        await updateUserProfile({
          displayName: name,
          photoURL: photoURL || null,
        });
      } else if (result.user && (name || photoURL)) {
        // fallback for older auth providers: try user.updateProfile
        await result.user.updateProfile({
          displayName: name,
          photoURL: photoURL || null,
        });
      }

      toast.success("Registration successful");
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      if (!signInWithGoogle) {
        toast.error("Google signup is not configured.");
        return;
      }
      await signInWithGoogle();
      toast.success("Logged in with Google");
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section auth-section">
      <div className="container narrow">
        <div className="section-header center">
          <h2>Create an account</h2>
          <p className="muted">
            Join Artify to add your artworks, build your gallery and favorites.
          </p>
        </div>

        <form className="form auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Name</label>
            <input name="name" type="text" required />
          </div>

          <div className="form-row">
            <label>Photo URL</label>
            <input
              name="photoURL"
              type="url"
              placeholder="Optional profile photo link"
            />
          </div>

          <div className="form-row">
            <label>Email</label>
            <input name="email" type="email" required />
          </div>

          <div className="form-row">
            <label>Password</label>
            <input name="password" type="password" required />
          </div>

          <button className="btn-primary full" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="auth-extra">
          <p className="muted">
            Already have an account?{" "}
            <Link to="/login" className="link">
              Login
            </Link>
          </p>

          <div className="divider">
            <span>Or</span>
          </div>

          <button
            type="button"
            className="btn-outline full"
            onClick={handleGoogle}
            disabled={loading}
          >
            Continue with Google
          </button>
        </div>
      </div>
    </section>
  );
};

export default Register;
