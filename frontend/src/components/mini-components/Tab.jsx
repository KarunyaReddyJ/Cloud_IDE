const Tab = ({ name, onClose }) => {
  return (
    <div className="tab">
      <p className="tab-name">{name}</p>
      <span className="tab-close" onClick={onClose}>
        ×
      </span>
    </div>
  );
};

export default Tab;
