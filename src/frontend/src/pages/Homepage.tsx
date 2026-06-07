import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Esci
        </button>
      </header>

      <main style={styles.mainContent}>
        <h1 style={styles.curvedTitle}>
          Left-or-Right
        </h1>
      </main>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: "#f4f9f9",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  },
  header: {
    width: "100%",
    padding: "20px",
    display: "flex",
    justifyContent: "flex-end",
    boxSizing: "border-box",
  },
  logoutButton: {
    backgroundColor: "#ff4d4d",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "10px 20px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: "100px",
  },
  curvedTitle: {
    fontSize: "4rem",
    fontWeight: "800",
    color: "#009999",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "2px",
    transform: "perspective(500px) rotateX(25deg)",
    textShadow: "2px 4px 6px rgba(0, 153, 153, 0.15)",
    textAlign: "center",
  }
};