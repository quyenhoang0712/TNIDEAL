function ProjectCostStep({
  form,
  setForm,
  clearError,
  landArea,
  totalFloors,
  estimatedFloorArea,
  estimatedRoughCost,
  formatCurrencyInput
}) {
  const updateForm = (patch) => {
    setForm({ ...form, ...patch });
    clearError();
  };

  return (
    <div className="cost-step">
      <div className="cost-summary">
        <div>
          <span>Diện tích đất</span>
          <strong>{landArea.toLocaleString('vi-VN')} m2</strong>
        </div>
        <div>
          <span>Số phần tầng</span>
          <strong>{totalFloors}</strong>
        </div>
        <div>
          <span>Diện tích sàn tạm tính</span>
          <strong>{estimatedFloorArea.toLocaleString('vi-VN')} m2</strong>
        </div>
      </div>

      <label>
        Đơn giá phần thô
        <div className="duration-field">
          <input
            value={form.roughUnitPrice}
            onChange={(event) => updateForm({ roughUnitPrice: formatCurrencyInput(event.target.value) })}
            inputMode="numeric"
            placeholder="3.500.000"
          />
          <span>VND/m2</span>
        </div>
      </label>

      <div className="cost-total">
        <span>Chi phí thi công phần thô tạm tính</span>
        <strong>{estimatedRoughCost.toLocaleString('vi-VN')} VND</strong>
      </div>
    </div>
  );
}

export default ProjectCostStep;
