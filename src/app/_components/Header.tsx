
"use client";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      <style jsx>{`
        .app-bar {
          font-family: 'Roboto', sans-serif;
          background-color: #1976d2;
          box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
          position: static;
          z-index: 1100;
        }

        .toolbar {
          min-height: 64px;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .title {
          font-size: 1.25rem;
          font-weight: 500;
          color: #ffffff;
          flex-grow: 1;
        }

        .logout-button {
          font-size: 0.875rem;
          font-weight: 500;
          color: #ffffff;
          background: none;
          border: none;
          padding: 6px 8px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .logout-button:hover {
          background-color: rgba(255, 255, 255, 0.08);
        }
      `}</style>
      <header className="app-bar">
        <div className="toolbar">
          <h1 className="title">GeoAttend</h1>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>
    </>
  );
}
