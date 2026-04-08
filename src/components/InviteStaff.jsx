import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../api';
import { apiFetch } from '../utils/ApiFetch';
import { showSuccess, showError, showInfo } from '../utils/toastify';
import "./InviteStaff.css";

export default function InviteStaff() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    setInviteLink("");

    try {
      const response = await apiFetch(`${API_BASE_URL}/auth/invite/`, {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      // Handle special case if email already exists
      if (response.status === 400 && data.error) {
        showError(data.error); // e.g., "User with this email already exists"
        return;
      }

      // Custom status for partial success (link fallback)
      if (response.status === 207) {
        showInfo(data.message);
        setInviteLink(data.invite_link);
      } else if (!response.ok) {
        throw new Error(data.error || "Failed to send invite");
      } else {
        setLoading(false); 
        showInfo(data.message);
        setInviteLink(""); // clear old link
        setEmail("")
      }
    } catch (err) {
      console.error(err);
      showError("Something went wrong. Please try again later.");
    }finally {
    // This runs AFTER the try or catch, stopping the loading state
    setLoading(false); 
    }
  };

  return (
    <div className="invite-container">
      <div className="invite-card">
        <h2>Invite Staff</h2>
        <p className="subtitle">Enter an email to send an invite link.</p>

        <form onSubmit={onSubmit} className="invite-form">
          <input
            type="email"
            placeholder="staff@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="invite-input"
          />

          <button type="submit" className="invite-button" disabled={loading}>
            {loading ? "Sending..." : "Send Invite"}
          </button>
        </form>

        {inviteLink && (
          <div className="fallback-container">
            <p>Email failed to send. Please share this link manually:</p>
            <a href={inviteLink} className="fallback-link" target="_blank" rel="noreferrer">
              {inviteLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}