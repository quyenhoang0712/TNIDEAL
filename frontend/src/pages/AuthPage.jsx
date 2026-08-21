import { Building2, Eye, EyeOff, KeyRound, Loader2, LogIn, UserPlus, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { login, register } from '../services/authApi';

const emptyForm = { username: '', displayName: '', password: '', confirmPassword: '' };
const isStrongPassword = (password) => /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!message) return undefined;
    const timeout = window.setTimeout(() => setMessage(''), 4200);
    return () => window.clearTimeout(timeout);
  }, [message]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: false }));
  }

  async function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (form.username.trim().length < 3) nextErrors.username = true;
    if (!form.password) nextErrors.password = true;
    if (mode === 'register' && form.displayName.trim().length < 2) nextErrors.displayName = true;
    if (mode === 'register' && (form.password.length < 8 || !isStrongPassword(form.password))) nextErrors.password = true;
    if (mode === 'register' && form.password !== form.confirmPassword) nextErrors.confirmPassword = true;
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setMessage(nextErrors.username ? 'Tên đăng nhập phải có ít nhất 3 ký tự.' : nextErrors.displayName ? 'Tên người dùng phải có ít nhất 2 ký tự.' : nextErrors.confirmPassword ? 'Mật khẩu nhập lại không khớp.' : 'Mật khẩu phải có ít nhất 8 ký tự, 1 chữ hoa, 1 số và 1 ký tự đặc biệt.');
      return;
    }
    setLoading(true); setMessage('');
    try {
      const session = await (mode === 'login' ? login(form) : register(form));
      setForm(emptyForm);
      onAuthenticated(session);
    } catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  }

  return <main className="auth-shell"><div className="toast-stack" aria-live="polite">{mode === 'register' && <p className="toast warning">Mật khẩu cần có ít nhất 8 ký tự, 1 chữ hoa, 1 số và 1 ký tự đặc biệt.</p>}{message && <p className="toast success">{message}</p>}</div><section className="auth-card"><div className="auth-visual" aria-hidden="true"><div className="brand-mark"><Building2 size={22} /></div><div><span className="auth-kicker">TN Ideal</span><h2>Trung tâm quản lý công trình</h2><p>Theo dõi công việc, quản lý đội thợ và nắm tiến độ thi công trong một nơi.</p></div></div><div className="auth-panel"><div className="auth-copy"><span className="eyebrow">Đăng nhập hệ thống</span><h1>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</h1></div><form className="auth-form" noValidate onSubmit={submit}><label>Tên đăng nhập<span className={`input-shell ${errors.username ? 'error' : ''}`}><UserRound size={18} /><input autoComplete="username" minLength={3} required value={form.username} onChange={(e) => updateField('username', e.target.value)} placeholder="Nhập tên đăng nhập" /></span></label>{mode === 'register' && <label>Tên người dùng<span className={`input-shell ${errors.displayName ? 'error' : ''}`}><UserRound size={18} /><input autoComplete="name" minLength={2} required value={form.displayName} onChange={(e) => updateField('displayName', e.target.value)} placeholder="Nhập tên người dùng" /></span></label>}<label>Mật khẩu<span className={`input-shell ${errors.password ? 'error' : ''}`}><KeyRound size={18} /><input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => updateField('password', e.target.value)} placeholder={mode === 'login' ? 'Nhập mật khẩu' : 'Ví dụ: Matkhau@123'} /><button aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} className="password-toggle" type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>{mode === 'register' && <label>Nhập lại mật khẩu<span className={`input-shell ${errors.confirmPassword ? 'error' : ''}`}><KeyRound size={18} /><input autoComplete="new-password" required type={showConfirmPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => updateField('confirmPassword', e.target.value)} placeholder="Nhập lại mật khẩu" /><button aria-label={showConfirmPassword ? 'Ẩn mật khẩu nhập lại' : 'Hiện mật khẩu nhập lại'} className="password-toggle" type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>}<button className="primary-button auth-submit" disabled={loading} type="submit">{loading ? <Loader2 className="spin" size={18} /> : mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</button><button className="ghost-button" type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setMessage(''); setErrors({}); }}>{mode === 'login' ? 'Tạo tài khoản' : 'Quay lại đăng nhập'}</button></form></div></section></main>;
}
