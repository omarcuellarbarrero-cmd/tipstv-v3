export default function BackButton() {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 9999,
        background: "#123A63",
        padding: "12px 20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      }}
    >
      <a
        href="https://omarcuellar.co/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 20px",
          background: "#D9DDE3",
          color: "#123A63",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 700,
          fontSize: "1rem",
          textDecoration: "none",
          borderRadius: "8px",
          minHeight: "48px",
        }}
      >
        <span style={{ fontSize: "1.3rem" }}>←</span>
        <span>Volver a omarcuellar.co</span>
      </a>
    </div>
  );
}