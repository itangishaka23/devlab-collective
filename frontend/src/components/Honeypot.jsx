/** Hidden bot trap. Real visitors never see or fill it; the API drops submissions that do. */
export default function Honeypot({ value, onChange }) {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
      <label htmlFor="hp-website">Leave this field empty</label>
      <input
        id="hp-website"
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
