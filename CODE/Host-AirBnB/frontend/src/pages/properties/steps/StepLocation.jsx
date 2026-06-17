import { IconMapPin, IconAlertCircle } from "../../../components/icons";

export default function StepLocation({ data, errors, onChange }) {
  const set = (field, value) => onChange({ ...data, [field]: value });

  function handlePinDrag(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width).toFixed(3);
    const y = ((e.clientY - rect.top) / rect.height).toFixed(3);
    onChange({ ...data, lat: x, lng: y });
  }

  return (
    <div>
      <div className="builder-panel-head">
        <h2>Where's your place located?</h2>
        <p>Your exact address is only shared with guests after a confirmed booking.</p>
      </div>

      <div className="builder-field-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="street">
            Street address
          </label>
          <input
            id="street"
            type="text"
            className={`form-input form-input-no-icon ${errors.street ? "has-error" : ""}`}
            placeholder="House no., street, barangay"
            value={data.street}
            onChange={(e) => set("street", e.target.value)}
          />
          {errors.street && (
            <span className="field-error" role="alert">
              <IconAlertCircle width={14} height={14} /> {errors.street}
            </span>
          )}
        </div>

        <div className="builder-field-grid cols-3">
          <div className="form-group">
            <label className="form-label" htmlFor="city">
              City
            </label>
            <input
              id="city"
              type="text"
              className={`form-input form-input-no-icon ${errors.city ? "has-error" : ""}`}
              placeholder="e.g. Tagaytay"
              value={data.city}
              onChange={(e) => set("city", e.target.value)}
            />
            {errors.city && (
              <span className="field-error" role="alert">
                <IconAlertCircle width={14} height={14} /> {errors.city}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="province">
              Province
            </label>
            <input
              id="province"
              type="text"
              className={`form-input form-input-no-icon ${errors.province ? "has-error" : ""}`}
              placeholder="e.g. Cavite"
              value={data.province}
              onChange={(e) => set("province", e.target.value)}
            />
            {errors.province && (
              <span className="field-error" role="alert">
                <IconAlertCircle width={14} height={14} /> {errors.province}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="zip">
              ZIP code
            </label>
            <input
              id="zip"
              type="text"
              className={`form-input form-input-no-icon ${errors.zip_code ? "has-error" : ""}`}
              placeholder="e.g. 4120"
              value={data.zip_code}
              onChange={(e) => set("zip_code", e.target.value)}
            />
            {errors.zip_code && (
              <span className="field-error" role="alert">
                <IconAlertCircle width={14} height={14} /> {errors.zip_code}
              </span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="country">
            Country
          </label>
          <input id="country" type="text" className="form-input form-input-no-icon" value={data.country} readOnly />
        </div>

        <div>
          <label className="form-label">Pin your exact location</label>
          <div className="map-placeholder" style={{ marginTop: "var(--space-2)" }} onClick={handlePinDrag}>
            <div className="map-pin">
              <IconMapPin width={32} height={32} style={{ color: "var(--color-primary)" }} />
              <span className="map-pin-label">
                {data.lat ? "Pin placed — click again to adjust" : "Click anywhere to drop your pin"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
