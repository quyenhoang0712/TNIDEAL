import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

function ProjectDetailsStep({
  form,
  setForm,
  clearError,
  projectTypeLabels,
  showDatePicker,
  setShowDatePicker,
  calendarMonth,
  setCalendarMonth,
  calendarDays,
  selectedStartDate,
  monthNames,
  formatVietnamDate
}) {
  const updateForm = (patch) => {
    setForm({ ...form, ...patch });
    clearError();
  };

  return (
    <>
      <label>
        Tên dự án
        <input value={form.name} onChange={(event) => updateForm({ name: event.target.value })} placeholder="Nhà phố Quận 7" />
      </label>

      <div className="setup-grid">
        <label>
          Tên chủ đầu tư
          <input
            value={form.investorName}
            onChange={(event) => updateForm({ investorName: event.target.value })}
            placeholder="Nguyễn Văn A"
          />
        </label>

        <label>
          Số điện thoại
          <input
            value={form.investorPhone}
            onChange={(event) => updateForm({ investorPhone: event.target.value })}
            inputMode="tel"
            placeholder="0901234567"
          />
        </label>
      </div>

      <label>
        Chọn loại dự án
        <select value={form.type} onChange={(event) => updateForm({ type: event.target.value })}>
          {Object.entries(projectTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <div className="scope-note">
        <span>Gói thi công</span>
        <strong>Thi công phần thô</strong>
      </div>

      <label>
        Số lầu
        <input
          min="0"
          type="number"
          value={form.upperFloors}
          onChange={(event) => updateForm({ upperFloors: event.target.value })}
          placeholder="2"
        />
      </label>

      <label className="check-row single-check-row">
        <input checked={form.hasBasement} type="checkbox" onChange={(event) => updateForm({ hasBasement: event.target.checked })} />
        Có tầng hầm
      </label>

      <label>
        Ngày khởi công dự kiến
        <div className="date-picker-field">
          <button className="date-input-button" type="button" onClick={() => setShowDatePicker(!showDatePicker)}>
            <CalendarDays size={18} />
            <span>{form.startDate || 'Chọn ngày'}</span>
          </button>

          {showDatePicker && (
            <div className="custom-calendar">
              <div className="calendar-header">
                <button
                  aria-label="Tháng trước"
                  type="button"
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                >
                  <ChevronLeft size={18} />
                </button>
                <strong>
                  {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                </strong>
                <button
                  aria-label="Tháng sau"
                  type="button"
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="calendar-weekdays">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span>CN</span>
              </div>

              <div className="calendar-days">
                {calendarDays.map((date) => {
                  const dateValue = formatVietnamDate(date);
                  const isMuted = date.getMonth() !== calendarMonth.getMonth();
                  const isSelected = dateValue === selectedStartDate;

                  return (
                    <button
                      className={`${isMuted ? 'muted' : ''} ${isSelected ? 'selected' : ''}`}
                      key={date.toISOString()}
                      type="button"
                      onClick={() => {
                        updateForm({ startDate: dateValue });
                        setShowDatePicker(false);
                      }}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </label>

      <label>
        Thời gian thi công
        <div className="duration-field">
          <input min="1" type="number" value={form.duration} onChange={(event) => updateForm({ duration: event.target.value })} placeholder="6" />
          <span>tháng</span>
        </div>
      </label>

    </>
  );
}

export default ProjectDetailsStep;
