function ProjectAccessStep({ form, setForm, clearError }) {
  const updateForm = (patch) => {
    setForm({ ...form, ...patch });
    clearError();
  };

  return (
    <div className="location-step">
      <div className="access-panel">
        <strong>Đặc điểm đường vào</strong>
        <div className="floor-options">
          <label className="check-row">
            <input
              checked={form.accessType === 'frontage'}
              name="accessType"
              type="radio"
              onChange={() => updateForm({ accessType: 'frontage', alleyWidth: '' })}
            />
            Mặt tiền đường
          </label>

          <label className="check-row">
            <input checked={form.accessType === 'alley'} name="accessType" type="radio" onChange={() => updateForm({ accessType: 'alley' })} />
            Hẻm
          </label>

          <label className="check-row">
            <input
              checked={form.truckAccess === 'yes'}
              type="checkbox"
              onChange={(event) => updateForm({ truckAccess: event.target.checked ? 'yes' : 'no' })}
            />
            Xe tải vào được
          </label>
        </div>

        {form.accessType === 'alley' && (
          <label>
            Chiều rộng hẻm
            <div className="duration-field">
              <input
                min="0.5"
                step="0.1"
                type="number"
                value={form.alleyWidth}
                onChange={(event) => updateForm({ alleyWidth: event.target.value })}
                placeholder="3.5"
              />
              <span>m</span>
            </div>
          </label>
        )}
      </div>
    </div>
  );
}

export default ProjectAccessStep;
