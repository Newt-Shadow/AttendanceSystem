
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        router.push(`/${data.user.role.toLowerCase()}`);
      } else {
        setError(data.error);
      }
    } catch {
      setError("An error occurred");
    }
  };

  

  return (
    <>
      <style jsx>{`
        .container {
          font-family: 'Roboto', sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 16px;
          color: rgba(0, 0, 0, 0.87);
        }

        .box {
          margin-top: 64px;
          text-align: center;
        }

        .header {
          font-size: 2.125rem;
          font-weight: 400;
          margin-bottom: 16px;
        }

        .error {
          font-size: 1rem;
          font-weight: 400;
          color: #d32f2f;
          margin: 8px 0;
        }

        .form {
          display: flex;
          flex-direction: column;
        }

        .input-container {
          position: relative;
          width: 100%;
          margin: 16px 0;
        }

        .input-field {
          width: 100%;
          padding: 18.5px 14px;
          font-size: 16px;
          line-height: 1.5;
          border: 1px solid #c4c4c4;
          border-radius: 4px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .input-field:focus {
          border: 2px solid #1976d2;
          box-shadow: 0 0 0 1px #1976d2;
        }

        .input-field:not(:placeholder-shown) + .input-label,
        .input-field:focus + .input-label {
          top: 0;
          font-size: 12px;
          color: #1976d2;
        }

        .input-label {
          position: absolute;
          top: 50%;
          left: 14px;
          transform: translateY(-50%);
          font-size: 16px;
          color: #616161;
          pointer-events: none;
          transition: all 0.2s;
          background: white;
          padding: 0 4px;
        }

        .submit-button {
          width: 100%;
          padding: 6px 16px;
          font-size: 14px;
          font-weight: 500;
          text-transform: uppercase;
          color: white;
          background-color: #1976d2;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
          margin-top: 16px;
        }

        .submit-button:hover {
          background-color: #1565c0;
        }
      `}</style>
      <div className="container">
        <div className="box">
          <h1 className="header">GeoAttend Login</h1>
          <form onSubmit={handleLogin} className="form">
            <div className="input-container">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder=" "
              />
              <label htmlFor="email" className="input-label">
                Email
              </label>
            </div>
            <div className="input-container">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder=" "
              />
              <label htmlFor="password" className="input-label">
                Password
              </label>
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="submit-button">
              Login
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
