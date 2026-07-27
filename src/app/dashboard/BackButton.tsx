export default function BackButton() {
  return (
    <a
      href="https://omarcuellar.co/"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        padding: "14px 22px",
        background: "#D9DDE3",
        color: "#123A63",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 600,
        fontSize: "1rem",
        textDecoration: "none",
        borderRadius: "10px",
        minHeight: "52px",
        margin: "16px",
        boxShadow: "0 2px 8px rgba(11, 34, 61, 0.08)",
        transition: "background 0.2s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#c5ccd6";
        e.currentTarget.style.transform = "translateX(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#D9DDE3";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <span style={{ fontSize: "1.3rem" }}>←</span>
      <span>Volver a omarcuellar.co</span>
    </a>
  );
}