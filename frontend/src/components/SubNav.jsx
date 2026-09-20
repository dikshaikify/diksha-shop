export default function SubNav({ categories, selected, onToggle, onClear }) {
  return (
    <div className="subnav">
      <div className="subnav-inner">
        <button className="subnav-all" onClick={onClear}>☰ All</button>
        {categories.map(cat => (
          <button key={cat} className={"subnav-link" + (selected.includes(cat) ? " active" : "")}
            onClick={() => onToggle(cat)}>{cat}</button>
        ))}
      </div>
    </div>
  );
}
