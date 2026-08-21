import ProjectAccessStep from './ProjectAccessStep';
import ProjectCostStep from './ProjectCostStep';
import ProjectDetailsStep from './ProjectDetailsStep';
import ProjectLandStep from './ProjectLandStep';
import ProjectLocationStep from './ProjectLocationStep';

export default function ProjectSetupModal(props) {
  const { step, setStep, form, setForm, error, setError, close, submitHandlers } = props;
  const titles = { details: ['Công trình phần thô', 'Tạo công trình phần thô'], location: ['Địa điểm công trình', 'Dự án này ở đâu?'], access: ['Đường vào công trình', 'Vật tư vào công trình thế nào?'], land: ['Kích thước đất', 'Miếng đất rộng bao nhiêu?'], cost: ['Tính chi phí', 'Chi phí phần thô khoảng bao nhiêu?'] };
  const previous = { location: 'details', access: 'location', land: 'access', cost: 'land' };
  const clearError = () => setError('');

  return <section className="project-setup-modal" aria-label="Tạo công trình phần thô"><form className={`project-setup-card ${step === 'location' ? 'location-card' : ''}`} onSubmit={submitHandlers[step]}><div><span className="eyebrow">{titles[step][0]}</span><h2>{titles[step][1]}</h2></div>
    {step === 'details' && <ProjectDetailsStep form={form} setForm={setForm} clearError={clearError} projectTypeLabels={props.projectTypeLabels} showDatePicker={props.showDatePicker} setShowDatePicker={props.setShowDatePicker} calendarMonth={props.calendarMonth} setCalendarMonth={props.setCalendarMonth} calendarDays={props.calendarDays} selectedStartDate={props.selectedStartDate} monthNames={props.monthNames} formatVietnamDate={props.formatVietnamDate} />}
    {step === 'location' && <ProjectLocationStep form={form} setForm={setForm} clearError={clearError} cleanMapUrl={props.cleanMapUrl} mapPinPosition={props.mapPinPosition} searchProjectLocation={props.searchProjectLocation} useCurrentLocation={props.useCurrentLocation} handleMapPinPointerDown={props.handleMapPinPointerDown} moveMapPin={props.moveMapPin} />}
    {step === 'access' && <ProjectAccessStep form={form} setForm={setForm} clearError={clearError} />}
    {step === 'land' && <ProjectLandStep form={form} setForm={setForm} clearError={clearError} landLength={props.landLength} landWidth={props.landWidth} landPreviewWidth={props.landPreviewWidth} landPreviewHeight={props.landPreviewHeight} landArea={props.landArea} />}
    {step === 'cost' && <ProjectCostStep form={form} setForm={setForm} clearError={clearError} landArea={props.landArea} totalFloors={props.totalFloors} estimatedFloorArea={props.estimatedFloorArea} estimatedRoughCost={props.estimatedRoughCost} formatCurrencyInput={props.formatCurrencyInput} />}
    {error && <p className="setup-error">{error}</p>}<div className="modal-actions"><button className="ghost-button" type="button" onClick={() => { if (previous[step]) { setStep(previous[step]); clearError(); } else close(); }}>{step === 'details' ? 'Hủy' : 'Quay lại'}</button><button className="primary-button" type="submit">{step === 'cost' ? 'Tạo dự án' : 'Tiếp tục'}</button></div>
  </form></section>;
}
