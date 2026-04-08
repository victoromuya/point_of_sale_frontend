import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { API_BASE_URL } from "../api"
import { apiFetch } from "../utils/ApiFetch"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import "./AcceptInvite.css" // Import the CSS

export default function AcceptInvite() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  // Safe JSON parser
  const safeJson = async (response) => {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  // Fetch invite details
  useEffect(() => {
    if (!token) {
      setError("Invalid invite link")
      setLoading(false)
      return
    }

    const fetchInvite = async () => {
      try {
        const response = await apiFetch(
          `${API_BASE_URL}/auth/accept-invite/${token}/details/`,
          { method: "GET" },
          false
        )

        if (!response.ok) {
          const text = await response.text()
          throw new Error(text || "Failed to load invite")
        }

        const data = await safeJson(response)
        if (!data?.email) throw new Error("Invalid invite data")

        setForm((prev) => ({ ...prev, email: data.email }))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInvite()
  }, [token])

  // Password rules
  const passwordRules = {
    length: form.password.length >= 8,
    lowercase: /[a-z]/.test(form.password),
    uppercase: /[A-Z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[@$!%*?&#^()_+=-]/.test(form.password),
  }

  const isStrong =
    passwordRules.length &&
    passwordRules.lowercase &&
    passwordRules.uppercase &&
    passwordRules.number &&
    passwordRules.special

  const passwordsMatch = form.password === form.confirmPassword

  // Password strength score
  const strengthScore = Object.values(passwordRules).filter(Boolean).length
  const strengthColor = ["#dc3545","#fd7e14","#ffc107","#20c997","#28a745"][strengthScore-1] || "#e9ecef"
  const strengthLabel = ["Very Weak","Weak","Medium","Strong","Very Strong"][strengthScore-1] || ""

  const onSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!isStrong) {
      setError("Password is not strong enough")
      return
    }

    if (!passwordsMatch) {
      setError("Passwords do not match")
      return
    }

    try {
      const response = await apiFetch(
        `${API_BASE_URL}/auth/accept-invite/${token}/`,
        {
          method: "POST",
          body: JSON.stringify({ password: form.password }),
        },
        false
      )

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Invite acceptance failed")
      }

      setMessage("✅ Account created successfully")
      setTimeout(() => navigate("/login"), 1200)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="p-6 text-center">Loading invite...</p>
  if (error && !form.email)
    return <p className="p-6 text-center text-red-600">{error}</p>

  return (
    <div className="invite-container">
      <div className="invite-card">
        <h2>Set Your Password</h2>

        <form onSubmit={onSubmit}>
          {/* Email */}
          <div className="input-group">
            <input
              type="email"
              value={form.email}
              readOnly
              style={{ background: "#f1f1f1" }}
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />

            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Password Strength Bar */}
          {form.password && (
            <>
              <div className="strength-bar">
                <div
                  className="strength-fill"
                  style={{
                    width: `${(strengthScore / 5) * 100}%`,
                    background: strengthColor,
                  }}
                ></div>
              </div>
              <small style={{ color: strengthColor }}>{strengthLabel}</small>
            </>
          )}

          {/* Password Rules Checklist */}
          {form.password && (
            <div className="password-rules mb-3">
              <small style={{ color: passwordRules.length ? "green" : "red" }}>
                {passwordRules.length ? "✔" : "❌"} At least 8 characters
              </small>
              <br />
              <small style={{ color: passwordRules.uppercase ? "green" : "red" }}>
                {passwordRules.uppercase ? "✔" : "❌"} At least one uppercase letter
              </small>
              <br />
              <small style={{ color: passwordRules.lowercase ? "green" : "red" }}>
                {passwordRules.lowercase ? "✔" : "❌"} At least one lowercase letter
              </small>
              <br />
              <small style={{ color: passwordRules.number ? "green" : "red" }}>
                {passwordRules.number ? "✔" : "❌"} At least one number
              </small>
              <br />
              <small style={{ color: passwordRules.special ? "green" : "red" }}>
                {passwordRules.special ? "✔" : "❌"} At least one special character (@$!%*?&#^()_+=-)
              </small>
            </div>
          )}

          {/* Confirm Password */}
          <div className="input-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
            />

            <span
              className="eye-icon"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Match indicator */}
          {form.confirmPassword && (
            <small style={{ color: passwordsMatch ? "green" : "red" }}>
              {passwordsMatch ? "Passwords match ✅" : "Passwords do not match"}
            </small>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="submit-btn"
            disabled={!isStrong || !passwordsMatch}
          >
            Create Account
          </button>
        </form>

        {message && <p className="success-text">{message}</p>}
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  )
}