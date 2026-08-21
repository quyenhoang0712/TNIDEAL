import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clipboard,
  Code2,
  FileCode2,
  Files,
  FolderTree,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Menu,
  RotateCcw,
  Search,
  X
} from 'lucide-react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { fileLessonGroups, fileLessons } from '../data/fileLessons';
import { learningLessons } from '../data/learningLessons';
import { technologyLessons } from '../data/technologyLessons';
import '../learning.css';

const PROGRESS_KEY = 'tnideal_learning_progress';
const allLessons = [...learningLessons, ...technologyLessons, ...fileLessons];

function modeFromLessonId(id) {
  if (id.startsWith('file-')) return 'files';
  if (id.startsWith('tech-')) return 'tech';
  return 'course';
}

function readCompletedLessons() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function lessonFromHash() {
  const id = window.location.hash.replace('#', '');
  return allLessons.some((lesson) => lesson.id === id) ? id : learningLessons[0].id;
}

export default function LearningPage() {
  const [activeId, setActiveId] = useState(lessonFromHash);
  const [mode, setMode] = useState(() => modeFromLessonId(lessonFromHash()));
  const [completed, setCompleted] = useState(readCompletedLessons);
  const [showAnswer, setShowAnswer] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [fileSearch, setFileSearch] = useState('');

  const visibleLessons = mode === 'files' ? fileLessons : mode === 'tech' ? technologyLessons : learningLessons;
  const activeIndex = visibleLessons.findIndex((lesson) => lesson.id === activeId);
  const lesson = visibleLessons[activeIndex] || visibleLessons[0];
  const completedInMode = visibleLessons.filter((item) => completed.includes(item.id)).length;
  const progress = Math.round((completedInMode / visibleLessons.length) * 100);
  const isCompleted = completed.includes(lesson.id);

  const nextLesson = visibleLessons[activeIndex + 1];
  const previousLesson = visibleLessons[activeIndex - 1];
  const navigationLessons = useMemo(() => {
    if (mode !== 'files' || !fileSearch.trim()) return visibleLessons;
    const query = fileSearch.trim().toLocaleLowerCase('vi');
    return visibleLessons.filter((item) => item.filePath.toLocaleLowerCase('vi').includes(query));
  }, [fileSearch, mode, visibleLessons]);

  const statusText = useMemo(() => {
    if (completedInMode === visibleLessons.length) {
      if (mode === 'files') return 'Đã phân tích toàn bộ file';
      if (mode === 'tech') return 'Đã học toàn bộ công nghệ và luồng';
      return 'Đã hoàn thành bài nền tảng';
    }
    if (completedInMode === 0) {
      if (mode === 'files') return 'Bắt đầu phân tích từng file';
      if (mode === 'tech') return 'Bắt đầu từ thư viện đang dùng';
      return 'Bắt đầu từ bức tranh tổng thể';
    }
    return `Đã học ${completedInMode}/${visibleLessons.length} ${mode === 'files' ? 'file' : 'bài'}`;
  }, [completedInMode, mode, visibleLessons.length]);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));
  }, [completed]);

  useEffect(() => {
    function handleHashChange() {
      const nextId = lessonFromHash();
      setActiveId(nextId);
      setMode(modeFromLessonId(nextId));
      setShowAnswer(false);
      setCopied(false);
      setMobileMenuOpen(false);
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  function openLesson(id) {
    setMode(modeFromLessonId(id));
    setActiveId(id);
    setShowAnswer(false);
    setCopied(false);
    setMobileMenuOpen(false);
    window.history.replaceState(null, '', `/hocthuat#${id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function switchMode(nextMode) {
    if (nextMode === mode) return;
    setFileSearch('');
    const nextLessons = nextMode === 'files' ? fileLessons : nextMode === 'tech' ? technologyLessons : learningLessons;
    openLesson(nextLessons[0].id);
  }

  function markComplete() {
    if (!isCompleted) setCompleted((current) => [...current, lesson.id]);
    if (nextLesson) openLesson(nextLesson.id);
  }

  function resetProgress() {
    const label = mode === 'files' ? 'phân tích file' : mode === 'tech' ? 'công nghệ và luồng' : 'bài nền tảng';
    if (!window.confirm(`Xóa tiến độ ${label} và bắt đầu lại?`)) return;
    const ids = new Set(visibleLessons.map((item) => item.id));
    setCompleted((current) => current.filter((id) => !ids.has(id)));
    openLesson(visibleLessons[0].id);
  }

  async function copyCode() {
    await navigator.clipboard.writeText(lesson.code.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="learning-shell">
      <header className="learning-topbar">
        <a className="learning-brand" href="/">
          <span><GraduationCap size={22} /></span>
          <div><strong>TN Ideal Academy</strong><small>Học ngay trên dự án thật</small></div>
        </a>
        <div className="learning-top-actions">
          <a href="/"><ArrowLeft size={17} />Về ứng dụng</a>
          <button aria-label="Mở danh sách bài học" type="button" onClick={() => setMobileMenuOpen(true)}><Menu size={21} /></button>
        </div>
      </header>

      <div className="learning-layout">
        <aside className={`learning-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="learning-sidebar-mobile">
            <strong>Nội dung khóa học</strong>
            <button aria-label="Đóng danh sách bài học" type="button" onClick={() => setMobileMenuOpen(false)}><X /></button>
          </div>

          <div className="learning-mode-tabs" aria-label="Chọn nội dung học">
            <button className={mode === 'course' ? 'active' : ''} type="button" onClick={() => switchMode('course')}><BookOpen size={16} /><span>13 bài nền tảng</span></button>
            <button className={mode === 'tech' ? 'active' : ''} type="button" onClick={() => switchMode('tech')}><GraduationCap size={16} /><span>Công nghệ & luồng</span></button>
            <button className={mode === 'files' ? 'active' : ''} type="button" onClick={() => switchMode('files')}><Files size={16} /><span>{fileLessons.length} file</span></button>
          </div>

          <section className="learning-progress-card">
            <div><BookOpen size={20} /><span>{statusText}</span></div>
            <strong>{progress}%</strong>
            <span className="learning-progress-track"><span style={{ width: `${progress}%` }} /></span>
          </section>

          {mode === 'files' && <label className="learning-file-search"><Search size={16} /><input value={fileSearch} onChange={(event) => setFileSearch(event.target.value)} placeholder="Tìm tên hoặc đường dẫn file..." /></label>}

          <nav className="learning-nav" aria-label={mode === 'files' ? 'Danh sách file' : mode === 'tech' ? 'Danh sách công nghệ và luồng' : 'Danh sách bài học'}>
            {navigationLessons.map((item, index) => (
              <Fragment key={item.id}>
                {mode === 'files' && (index === 0 || navigationLessons[index - 1].section !== item.section) && (
                  <div className="learning-nav-group">{fileLessonGroups[item.section]}</div>
                )}
                <button className={item.id === lesson.id ? 'active' : ''} type="button" onClick={() => openLesson(item.id)}>
                  <span className={completed.includes(item.id) ? 'completed' : ''}>
                    {completed.includes(item.id) ? <Check size={15} /> : String(visibleLessons.indexOf(item) + 1).padStart(2, '0')}
                  </span>
                  <div><small>{mode === 'files' ? 'File' : mode === 'tech' ? 'Chủ đề' : 'Bài'} {String(visibleLessons.indexOf(item) + 1).padStart(2, '0')}</small><strong>{mode === 'files' ? item.filePath : item.shortTitle}</strong></div>
                  <ChevronRight size={17} />
                </button>
              </Fragment>
            ))}
            {navigationLessons.length === 0 && <p className="learning-search-empty">Không tìm thấy file phù hợp.</p>}
          </nav>

          <button className="learning-reset" type="button" onClick={resetProgress}><RotateCcw size={16} />Học lại phần này</button>
        </aside>

        {mobileMenuOpen && <button className="learning-menu-backdrop" aria-label="Đóng menu" type="button" onClick={() => setMobileMenuOpen(false)} />}

        <article className="learning-content">
          <header className="learning-lesson-hero">
            <span>{lesson.eyebrow}</span>
            <h1>{lesson.title}</h1>
            <p>{lesson.summary}</p>
            <div className="learning-hero-meta">
              <span><BookOpen size={16} />10–20 phút</span>
              <span><FileCode2 size={16} />{mode === 'files' ? 'Phân tích 1 file' : mode === 'tech' ? 'Công nghệ trong dự án thật' : `${lesson.files.length} nhóm file`}</span>
              <span className={isCompleted ? 'done' : ''}>{isCompleted ? <CheckCircle2 size={16} /> : <Circle size={16} />}{isCompleted ? 'Đã học' : 'Chưa hoàn thành'}</span>
            </div>
          </header>

          <section className="learning-two-columns">
            <div className="learning-panel">
              <div className="learning-panel-title"><ListChecks size={19} /><h2>Sau bài này anh sẽ</h2></div>
              <ul>{lesson.objectives.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="learning-panel">
              <div className="learning-panel-title"><FolderTree size={19} /><h2>File đang học</h2></div>
              <div className="learning-file-list">{lesson.files.map((file) => <code key={file}>{file}</code>)}</div>
            </div>
          </section>

          <section className="learning-section">
            <div className="learning-section-heading"><span><Lightbulb size={20} /></span><div><small>Giải thích từng phần</small><h2>Khái niệm cần nắm</h2></div></div>
            <div className="learning-concept-grid">
              {lesson.concepts.map((concept, index) => (
                <article key={concept.title}><span>{String(index + 1).padStart(2, '0')}</span><h3>{concept.title}</h3><p>{concept.text}</p></article>
              ))}
            </div>
          </section>

          <section className="learning-section">
            <div className="learning-section-heading"><span><FolderTree size={20} /></span><div><small>Nhìn từ trên xuống</small><h2>Luồng và cấu trúc</h2></div></div>
            <pre className="learning-diagram"><code>{lesson.diagram}</code></pre>
          </section>

          <section className="learning-section">
            <div className="learning-section-heading"><span><Code2 size={20} /></span><div><small>Đọc code thật</small><h2>{lesson.code.label}</h2></div></div>
            <div className="learning-code-block">
              <div><span>Ví dụ</span><button type="button" onClick={copyCode}>{copied ? <Check size={16} /> : <Clipboard size={16} />}{copied ? 'Đã sao chép' : 'Sao chép'}</button></div>
              <pre><code>{lesson.code.content}</code></pre>
            </div>
          </section>

          <section className="learning-practice">
            <div className="learning-practice-copy"><span><GraduationCap size={20} /></span><div><small>Thực hành ngay</small><h2>{lesson.exercise.title}</h2></div></div>
            <ol>{lesson.exercise.steps.map((step) => <li key={step}>{step}</li>)}</ol>
          </section>

          <section className="learning-quiz">
            <span className="learning-quiz-kicker">Câu hỏi kiểm tra</span>
            <h2>{lesson.quiz.question}</h2>
            {showAnswer ? <div className="learning-answer"><CheckCircle2 size={20} /><p>{lesson.quiz.answer}</p></div> : <button type="button" onClick={() => setShowAnswer(true)}>Xem đáp án</button>}
          </section>

          <footer className="learning-lesson-footer">
            <button disabled={!previousLesson} type="button" onClick={() => previousLesson && openLesson(previousLesson.id)}><ArrowLeft size={18} />Bài trước</button>
            <span>{activeIndex + 1} / {visibleLessons.length}</span>
            <button className="primary" type="button" onClick={markComplete}>{nextLesson ? (isCompleted ? 'Bài tiếp theo' : 'Hoàn thành & tiếp tục') : (isCompleted ? 'Đã hoàn thành khóa học' : 'Hoàn thành khóa học')}<ArrowRight size={18} /></button>
          </footer>
        </article>
      </div>
    </main>
  );
}
