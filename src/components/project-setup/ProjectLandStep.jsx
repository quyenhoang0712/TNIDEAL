function ProjectLandStep({ form, setForm, clearError, landLength, landWidth, landPreviewWidth, landPreviewHeight, landArea }) {
  const updateForm = (patch) => {
    setForm({ ...form, ...patch });
    clearError();
  };

  return (
    <div className="land-step">
      <div className="setup-grid">
        <label>
          Chiều dài miếng đất
          <div className="duration-field">
            <input min="1" type="number" value={form.landLength} onChange={(event) => updateForm({ landLength: event.target.value })} placeholder="20" />
            <span>m</span>
          </div>
        </label>

        <label>
          Chiều rộng miếng đất
          <div className="duration-field">
            <input min="1" type="number" value={form.landWidth} onChange={(event) => updateForm({ landWidth: event.target.value })} placeholder="5" />
            <span>m</span>
          </div>
        </label>
      </div>

      <div className="land-preview">
        <svg viewBox="0 0 360 320" role="img" aria-label="Hình mô phỏng miếng đất">
          <rect
            className="land-shape"
            x={(360 - landPreviewWidth) / 2}
            y={(320 - landPreviewHeight) / 2}
            width={landPreviewWidth}
            height={landPreviewHeight}
            rx="14"
          />
          <text x="180" y={Math.max(28, (320 - landPreviewHeight) / 2 - 12)} textAnchor="middle">
            Rộng {landWidth || 0}m
          </text>
          <text
            x={Math.min(342, (360 + landPreviewWidth) / 2 + 18)}
            y="160"
            textAnchor="middle"
            transform={`rotate(90 ${Math.min(342, (360 + landPreviewWidth) / 2 + 18)} 160)`}
          >
            Dài {landLength || 0}m
          </text>
        </svg>
        <p>
          Hình mô phỏng tự thay đổi theo tỷ lệ {landLength || 0}m x {landWidth || 0}m.
        </p>
        <div className="land-area-result">
          <span>Diện tích đất</span>
          <strong>{landArea.toLocaleString('vi-VN')} m2</strong>
        </div>
      </div>
    </div>
  );
}

export default ProjectLandStep;
