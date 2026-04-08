import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/ApiFetch";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../api";
import 'bootstrap-icons/font/bootstrap-icons.css'; // Make sure this is installed

export default function Login() {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [remainingAttempts, setRemainingAttempts] = useState(null);
  const [accountLocked, setAccountLocked] = useState(false);

  const { setUser } = useAuth();
  const navigate = useNavigate();

  // Step 1: Login credentials
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    if (accountLocked) {
      setError("Your account is locked. Contact admin.");
      return;
    }

    try {
      const response = await apiFetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.remaining_attempts !== undefined) {
          setRemainingAttempts(data.remaining_attempts);
          if (data.remaining_attempts <= 0) setAccountLocked(true);
        }
        throw new Error(data.error || "Login failed");
      }

      setUserId(data.user_id);
      setStep(2); // Move to 2FA
    } catch (err) {
      setError(err.message);
    }
  };

  // Step 2: 2FA
  const handle2FA = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await apiFetch(`${API_BASE_URL}/auth/verify-2fa/`, {
        method: "POST",
        body: JSON.stringify({ user_id: userId, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid 2FA code");
      }

      setUser(data.user);
      navigate("/sales");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="bg-primary"
      style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "20px" }}
    >
      <div
        className="card shadow-lg"
        style={{ maxWidth: "400px", width: "100%", padding: "30px", borderRadius: "15px" }}
      >
        <h2 className="text-center mb-4">{step === 1 ? "Login" : "Enter 2FA Code"}</h2>

        {error && <div className="text-danger mb-3 text-center">{error}</div>}
        {remainingAttempts !== null && !accountLocked && (
          <div className="text-warning mb-3 text-center">Remaining attempts: {remainingAttempts}</div>
        )}
        {accountLocked && (
          <div className="text-danger mb-3 text-center">Your account is locked. Contact admin.</div>
        )}

        {step === 1 ? (
          <form onSubmit={handleLogin}>
            <div className="form-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={accountLocked}
              />
            </div>

            <div className="form-group mb-3 position-relative">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={accountLocked}
              />
              <i
                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#6c757d",
                  fontSize: "1.2rem"
                }}
              ></i>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={accountLocked}>
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handle2FA}>
            <div className="form-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter 4-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={4}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Verify Code
            </button>
          </form>
        )}
      </div>
    </div>
  );
}