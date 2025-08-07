const Tab = ({ name, onClose }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "lavender",
        padding: "5px 15px",
        border: "1px solid black",
        borderRadius: "2px",
        minWidth: "120px",
        gap: "10px",
      }}
    >
      <p style={{ margin: 0, flexGrow: 1 }}>{name}</p>
      <span
        onClick={onClose}
        style={{
          cursor: "pointer",
          fontWeight: "bold",
          marginLeft: "10px",
        }}
      >
        ×
      </span>
    </div>
  );
};

export default Tab;
