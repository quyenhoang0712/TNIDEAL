import { MapPin, Search } from 'lucide-react';

function ProjectLocationStep({
  form,
  setForm,
  clearError,
  cleanMapUrl,
  mapPinPosition,
  searchProjectLocation,
  useCurrentLocation,
  handleMapPinPointerDown,
  moveMapPin
}) {
  const updateForm = (patch) => {
    setForm({ ...form, ...patch });
    clearError();
  };

  return (
    <div className="location-step">
      <label>
        Tìm địa điểm
        <div className="map-search-field">
          <Search size={18} />
          <input
            autoFocus
            value={form.location}
            onChange={(event) => updateForm({ location: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                searchProjectLocation();
              }
            }}
            placeholder="Nhập địa chỉ, quận/huyện hoặc thành phố"
          />
          <button aria-label="Tìm địa điểm" className="map-search-button" type="button" onClick={searchProjectLocation}>
            <Search size={18} />
          </button>
        </div>
      </label>

      <button className="current-location-button" type="button" onClick={useCurrentLocation}>
        <MapPin size={18} />
        Dùng vị trí hiện tại
      </button>

      <div className="map-preview">
        <iframe loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={cleanMapUrl} title="Google Maps địa điểm công trình" />
        <button
          aria-label="Kéo ghim vị trí công trình"
          className="map-draggable-pin"
          style={{ left: `${mapPinPosition.x}%`, top: `${mapPinPosition.y}%` }}
          type="button"
          onPointerDown={handleMapPinPointerDown}
          onPointerMove={(event) => {
            if (event.buttons === 1) {
              moveMapPin(event);
            }
          }}
        >
          <MapPin size={34} />
        </button>
        <span className="map-address-badge">
          <MapPin size={16} />
          {form.location || 'Bản đồ công trình'}
        </span>
      </div>

      <label>
        Địa chỉ đầy đủ
        <input value={form.fullAddress} onChange={(event) => updateForm({ fullAddress: event.target.value })} placeholder="Số nhà, tên đường, khu vực" />
      </label>

      <div className="setup-grid">
        <label>
          Tỉnh/thành
          <input value={form.provinceCity} onChange={(event) => updateForm({ provinceCity: event.target.value })} placeholder="TP. Hồ Chí Minh" />
        </label>

        <label>
          Phường/xã
          <input value={form.wardCommune} onChange={(event) => updateForm({ wardCommune: event.target.value })} placeholder="Phường/xã" />
        </label>
      </div>
    </div>
  );
}

export default ProjectLocationStep;
