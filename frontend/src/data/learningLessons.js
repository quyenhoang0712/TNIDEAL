export const projectStructure = `TNIDEAL/
├── .env                              Biến môi trường thật, không đưa lên Git
├── .env.example                      Mẫu tên biến môi trường để chia sẻ
├── .gitignore                        Danh sách file Git bỏ qua
├── README.md                         Hướng dẫn chung toàn dự án
├── package.json                      Lệnh chạy chung và npm workspaces
├── package-lock.json                 Khóa phiên bản dependency chính xác
├── eslint.config.js                  Quy tắc kiểm tra code frontend/backend
├── vercel.json                       Build và rewrite khi deploy Vercel
├── api/
│   └── index.js                      Cổng Express dành cho Vercel
├── frontend/
│   ├── README.md                     Hướng dẫn riêng phần giao diện
│   ├── package.json                  React, Vite và lệnh của frontend
│   ├── index.html                    HTML gốc chứa div#root
│   ├── vite.config.js                Dev server và proxy /api → :4000
│   └── src/
│       ├── main.jsx                  Điểm khởi động và chọn /hocthuat hoặc App
│       ├── App.jsx                   Phiên đăng nhập, điều hướng và state chung
│       ├── styles.css                CSS của ứng dụng quản lý
│       ├── learning.css              CSS riêng của trang học thuật
│       ├── data/
│       │   ├── learningLessons.js    13 bài học nền tảng
│       │   ├── technologyLessons.js  Công nghệ, tích hợp và luồng tính năng
│       │   └── fileLessons.js        Phân tích riêng từng file
│       ├── pages/
│       │   ├── AuthPage.jsx          Đăng nhập và đăng ký
│       │   ├── AdminPage.jsx         Màn hình quản trị
│       │   ├── UserPage.jsx          Cổng vào giao diện nhà thầu
│       │   ├── DashboardPage.jsx     Dashboard và điều phối tính năng nhà thầu
│       │   ├── MaterialManagement.jsx Quản lý nhập, xuất và tồn kho
│       │   ├── ProjectCostPage.jsx   Quản lý chi phí và nhân công
│       │   ├── DiaryPage.jsx         Nhật ký công trình
│       │   └── LearningPage.jsx      Giao diện /hocthuat
│       ├── components/
│       │   ├── progress/
│       │   │   └── ConstructionProgressUpdate.jsx Cập nhật tiến độ
│       │   └── project-setup/
│       │       ├── ProjectSetupModal.jsx    Điều phối modal tạo dự án
│       │       ├── ProjectDetailsStep.jsx   Bước thông tin chung
│       │       ├── ProjectLocationStep.jsx  Bước vị trí
│       │       ├── ProjectAccessStep.jsx    Bước đường tiếp cận
│       │       ├── ProjectLandStep.jsx      Bước kích thước đất
│       │       └── ProjectCostStep.jsx      Bước đơn giá và hoàn tất
│       └── services/
│           ├── authApi.js            Gọi API đăng nhập/đăng ký
│           ├── constructionApi.js    Gọi API công trình
│           ├── progressApi.js        Gọi API tiến độ
│           ├── materialApi.js        Gọi API vật tư
│           └── costApi.js            Gọi API chi phí
└── backend/
    ├── README.md                     Hướng dẫn riêng phần máy chủ
    ├── package.json                  Express, Mongoose và lệnh backend
    └── src/
        ├── server.js                 Mở cổng 4000 khi chạy local
        ├── app.js                    Tạo Express app và gắn toàn bộ route
        ├── config/
        │   ├── env.js                Đọc PORT và AUTH_SECRET
        │   ├── database.js           Kết nối MongoDB và tạo admin ban đầu
        │   └── permissions.js        Quyền theo vai trò tài khoản
        ├── docs/
        │   ├── swagger.js            Gắn Swagger UI vào Express
        │   └── openapi.js            Mô tả toàn bộ API theo OpenAPI
        ├── middleware/
        │   ├── auth.js               Kiểm tra token và quyền admin
        │   └── errors.js             Xử lý 404 và lỗi tập trung
        ├── models/
        │   ├── User.js               Tài khoản admin/nhà thầu
        │   ├── Construction.js       Công trình
        │   ├── ProgressTask.js       Công việc tiến độ
        │   ├── MaterialWorkspace.js  Kho vật tư của nhà thầu
        │   ├── CostWorkspace.js      Chi phí của nhà thầu
        │   ├── Workspace.js          Dữ liệu workspace cũ/tổng hợp
        │   ├── ActivityLog.js        Nhật ký thao tác
        │   └── SystemSettings.js     Cấu hình hệ thống
        ├── routes/
        │   ├── auth.js               /api/auth
        │   ├── constructions.js      /api/constructions
        │   ├── progress.js           /api/progress
        │   ├── materials.js          /api/materials
        │   ├── costs.js              /api/costs
        │   ├── workspace.js          /api/workspace
        │   └── admin.js              /api/admin
        ├── services/
        │   └── activityService.js    Ghi nhật ký hoạt động dùng chung
        └── utils/
            ├── asyncHandler.js       Chuyển lỗi async đến error middleware
            ├── password.js           Băm và kiểm tra mật khẩu
            └── token.js              Tạo và xác minh token đăng nhập`;

export const learningLessons = [
  {
    id: 'tong-quan',
    shortTitle: 'Bức tranh tổng thể',
    eyebrow: 'Bài 01 · Nền tảng',
    title: 'Một ứng dụng full-stack hoạt động thế nào?',
    summary: 'Hiểu vai trò frontend, backend, API và database trước khi đọc từng file.',
    objectives: [
      'Phân biệt code chạy trong trình duyệt và code chạy trên máy chủ.',
      'Hiểu API là cây cầu, không phải database.',
      'Theo được một vòng request → response hoàn chỉnh.'
    ],
    files: ['README.md', 'frontend/', 'backend/', 'api/index.js'],
    concepts: [
      {
        title: 'Frontend',
        text: 'React chạy trong trình duyệt. Nó vẽ giao diện, giữ state tạm thời và gửi HTTP request. Frontend không được cầm MONGODB_URI hoặc đọc MongoDB trực tiếp.'
      },
      {
        title: 'Backend',
        text: 'Express chạy trên server. Nó kiểm tra dữ liệu, xác thực người dùng, áp dụng phân quyền và gọi Mongoose để đọc/ghi MongoDB.'
      },
      {
        title: 'API',
        text: 'API là hợp đồng giao tiếp. Frontend gửi method, URL, headers và body; backend trả status code cùng JSON.'
      },
      {
        title: 'Database',
        text: 'MongoDB lưu dữ liệu lâu dài. Khi tắt trình duyệt, dữ liệu trong React mất; dữ liệu đã lưu MongoDB vẫn còn.'
      }
    ],
    diagram: `Người dùng bấm nút
  ↓
React event handler
  ↓
service gọi fetch('/api/...')
  ↓
Express middleware → route
  ↓
Mongoose model → MongoDB
  ↓
JSON response → setState → React render lại`,
    code: {
      label: 'Một HTTP request tối giản',
      content: `const response = await fetch('/api/constructions', {
  headers: { Authorization: 'Bearer TOKEN' }
});

const constructions = await response.json();`
    },
    exercise: {
      title: 'Tự kiểm tra',
      steps: ['Mở DevTools → Network.', 'Đăng nhập ứng dụng.', 'Tìm request /api/auth/login và xem Request/Response.']
    },
    quiz: {
      question: 'Vì sao frontend không kết nối thẳng MongoDB?',
      answer: 'Vì mọi mã frontend đều có thể bị người dùng xem và sửa. Nếu đặt chuỗi kết nối MongoDB ở frontend, thông tin bí mật và toàn bộ database sẽ bị lộ.'
    }
  },
  {
    id: 'cau-truc',
    shortTitle: 'Cấu trúc thư mục',
    eyebrow: 'Bài 02 · Bản đồ dự án',
    title: 'Đọc cấu trúc trước khi đọc code',
    summary: 'Mỗi thư mục có một trách nhiệm. Biết vị trí cần tìm sẽ giúp anh không bị lạc trong hàng nghìn dòng code.',
    objectives: ['Nhớ được nơi chứa UI, API, model và cấu hình.', 'Theo được quan hệ giữa từng nhóm file.', 'Biết file nào nên mở đầu tiên khi sửa một tính năng.'],
    files: ['package.json', 'frontend/src/main.jsx', 'frontend/src/App.jsx', 'backend/src/server.js', 'backend/src/app.js'],
    concepts: [
      { title: 'Nhóm file gốc', text: 'package.json điều khiển cả hai workspace; .env giữ bí mật; eslint.config.js kiểm tra code; vercel.json quyết định cách build và chuyển request khi deploy.' },
      { title: 'Frontend khởi động', text: 'index.html tạo div#root. main.jsx gắn React vào đó rồi chọn LearningPage cho /hocthuat hoặc App cho ứng dụng chính.' },
      { title: 'pages và components', text: 'pages là màn hình lớn; components là khối nhỏ được page ghép lại. ProjectSetupModal là ví dụ một component điều phối nhiều bước nhỏ.' },
      { title: 'services và routes', text: 'Frontend services gửi request. Backend routes nhận request. Ví dụ constructionApi.js gọi /api/constructions và constructions.js xử lý đúng URL đó.' },
      { title: 'Backend khởi động', text: 'server.js chỉ mở cổng khi chạy local. app.js mới là lõi Express, dùng chung cho cả local và Vercel.' },
      { title: 'middleware', text: 'Middleware chạy trước hoặc sau route. auth.js chặn người chưa đăng nhập; errors.js biến lỗi thành JSON thống nhất.' },
      { title: 'models', text: 'Mỗi model là quy tắc của một nhóm dữ liệu MongoDB: field, kiểu dữ liệu, giá trị mặc định, quan hệ và validation.' },
      { title: 'File tự sinh', text: 'node_modules và frontend/dist do công cụ tạo nên không xuất hiện trong cây học tập. package-lock.json cũng do npm quản lý, nhưng cần giữ trong Git để khóa phiên bản.' }
    ],
    diagram: projectStructure,
    code: {
      label: 'Quy tắc tìm file',
      content: `Muốn sửa giao diện        → frontend/src/pages hoặc components
Muốn sửa cách gọi API     → frontend/src/services
Muốn thêm endpoint        → backend/src/routes
Muốn đổi cấu trúc dữ liệu → backend/src/models
Muốn đổi xác thực         → backend/src/middleware và utils`
    },
    exercise: {
      title: 'Bài tập cấu trúc',
      steps: ['Tìm file định nghĩa User.', 'Tìm file gọi API đăng nhập.', 'Tìm file gắn route /api/auth vào Express app.']
    },
    quiz: {
      question: 'Muốn thêm field “địa chỉ email” cho đăng ký thì thường phải nhìn những đâu?',
      answer: 'Ít nhất phải xem AuthPage, authApi, route auth và model User. Nếu tài liệu API cần chính xác thì cập nhật thêm OpenAPI.'
    }
  },
  {
    id: 'file-goc',
    shortTitle: 'Các file gốc',
    eyebrow: 'Bài 03 · Công cụ',
    title: 'package, env, ESLint và Vercel',
    summary: 'Các file gốc không vẽ giao diện nhưng quyết định cách dự án cài đặt, chạy, kiểm tra và deploy.',
    objectives: ['Hiểu npm workspace.', 'Biết vì sao không commit .env.', 'Biết đường đi của request trên Vercel.'],
    files: ['package.json', 'package-lock.json', '.env', '.env.example', '.gitignore', 'eslint.config.js', 'vercel.json', 'api/index.js'],
    concepts: [
      { title: 'package.json', text: 'Khai báo scripts và dependency. Workspace gốc điều khiển hai package frontend/backend bằng một lần npm install.' },
      { title: 'package-lock.json', text: 'Khóa chính xác phiên bản dependency để máy khác cài ra kết quả giống nhau. npm tự cập nhật file này.' },
      { title: '.env', text: 'Chứa MONGODB_URI và AUTH_SECRET thật. .env.example chỉ là mẫu an toàn để chia sẻ.' },
      { title: 'vercel.json', text: 'Build React vào frontend/dist và rewrite /api, /health, /api-docs về Serverless Function.' },
      { title: 'api/index.js', text: 'Chỉ export backend app cho Vercel. Logic nghiệp vụ thật vẫn nằm trong backend/src.' }
    ],
    diagram: `npm run dev
├── npm run dev:frontend → Vite :5173
└── npm run dev:backend  → Express :4000

Vercel
├── /api/*       → api/index.js → backend/src/app.js
├── /api-docs*   → api/index.js → Swagger
└── mọi URL khác → frontend/index.html`,
    code: {
      label: 'Scripts quan trọng',
      content: `npm run dev
npm run dev:frontend
npm run dev:backend
npm run lint
npm run build`
    },
    exercise: { title: 'Bài tập công cụ', steps: ['Chạy npm run lint.', 'Chạy npm run build.', 'Kiểm tra frontend/dist được tạo nhưng không sửa nó bằng tay.'] },
    quiz: { question: 'Tại sao có .env.example nhưng vẫn cần .env?', answer: '.env.example chỉ mô tả tên biến bằng dữ liệu giả. .env mới chứa giá trị thật trên máy của anh và bị Git bỏ qua.' }
  },
  {
    id: 'react-khoi-dong',
    shortTitle: 'React khởi động',
    eyebrow: 'Bài 04 · Frontend',
    title: 'Từ index.html đến component đầu tiên',
    summary: 'Theo luồng Vite tải HTML, main.jsx tạo React root rồi chọn ứng dụng hoặc trang học thuật.',
    objectives: ['Hiểu #root.', 'Hiểu JSX và createRoot.', 'Hiểu vì sao /hocthuat có thể là một trang độc lập.'],
    files: ['frontend/index.html', 'frontend/src/main.jsx', 'frontend/package.json', 'frontend/vite.config.js'],
    concepts: [
      { title: 'index.html', text: 'HTML khung chỉ có div#root và script main.jsx. Phần giao diện lớn do React tạo sau đó.' },
      { title: 'main.jsx', text: 'Điểm vào frontend. Nó tìm #root, chọn component theo URL và render trong React.StrictMode.' },
      { title: 'JSX', text: 'Cú pháp giống HTML nằm trong JavaScript. JSX được Vite biến đổi thành lời gọi React trước khi trình duyệt chạy.' },
      { title: 'Vite proxy', text: 'Trong development, /api được chuyển đến cổng 4000 để frontend và backend giao tiếp mà không viết URL tuyệt đối.' }
    ],
    diagram: `Trình duyệt mở URL
  ↓
Vite trả index.html
  ↓
index.html tải /src/main.jsx
  ↓
main.jsx kiểm tra pathname
  ├── /hocthuat → LearningPage
  └── URL khác  → App`,
    code: {
      label: 'React root',
      content: `createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
    },
    exercise: { title: 'Bài tập frontend đầu tiên', steps: ['Đổi tạm title trong frontend/index.html.', 'Quan sát tab trình duyệt.', 'Hoàn tác thay đổi sau khi hiểu.'] },
    quiz: { question: 'Component React được đưa vào phần tử HTML nào?', answer: 'Phần tử div có id="root" trong frontend/index.html.' }
  },
  {
    id: 'react-state',
    shortTitle: 'State và App.jsx',
    eyebrow: 'Bài 05 · React core',
    title: 'State, effect và bộ điều phối App',
    summary: 'App.jsx quyết định ai đang đăng nhập, trang nào hiện ra và dữ liệu nào cần tải.',
    objectives: ['Phân biệt biến thường và state.', 'Hiểu useEffect/useMemo/useCallback.', 'Theo được luồng đăng nhập và tạo công trình.'],
    files: ['frontend/src/App.jsx'],
    concepts: [
      { title: 'useState', text: 'Lưu dữ liệu làm thay đổi giao diện. Gọi setter khiến component render lại.' },
      { title: 'useEffect', text: 'Chạy tác vụ bên ngoài render như tải API, đồng bộ dữ liệu hoặc đăng ký timer.' },
      { title: 'useMemo', text: 'Ghi nhớ kết quả tính toán như thống kê dự án cho đến khi dependency thay đổi.' },
      { title: 'useCallback', text: 'Ghi nhớ một function để useEffect không chạy lại chỉ vì function được tạo mới.' },
      { title: 'localStorage', text: 'App lưu session để tải lại trang vẫn đăng nhập. localStorage nằm ở trình duyệt, không phải MongoDB.' }
    ],
    diagram: `App
├── session = null       → AuthPage
├── contractor chưa có CT → ProjectSetupModal
├── role = contractor    → UserPage → DashboardPage
└── role = admin         → AdminPage`,
    code: {
      label: 'Controlled state',
      content: `const [statusFilter, setStatusFilter] = useState('all');

// Gọi setter → React render lại
setStatusFilter('active');`
    },
    exercise: { title: 'Bài tập state', steps: ['Tìm state session trong App.jsx.', 'Tìm hàm handleAuthenticated.', 'Giải thích vì sao setSession làm màn hình đăng nhập biến mất.'] },
    quiz: { question: 'Vì sao không dùng biến thường thay cho session state?', answer: 'Đổi biến thường không yêu cầu React render lại. setSession thông báo cho React rằng UI phải được tính lại.' }
  },
  {
    id: 'component-props',
    shortTitle: 'Component và props',
    eyebrow: 'Bài 06 · React component',
    title: 'Chia giao diện lớn thành những khối nhỏ',
    summary: 'ProjectSetupModal và ConstructionProgressUpdate cho thấy cách truyền dữ liệu từ cha xuống con.',
    objectives: ['Hiểu component và props.', 'Hiểu controlled input.', 'Biết state nên đặt ở component nào.'],
    files: [
      'frontend/src/components/project-setup/ProjectSetupModal.jsx',
      'ProjectDetailsStep.jsx',
      'ProjectLocationStep.jsx',
      'ProjectAccessStep.jsx',
      'ProjectLandStep.jsx',
      'ProjectCostStep.jsx',
      'frontend/src/components/progress/ConstructionProgressUpdate.jsx'
    ],
    concepts: [
      { title: 'Props', text: 'Dữ liệu cha truyền xuống con. Component con không nên tự ý sửa prop; nó gọi callback như setForm để yêu cầu component cha cập nhật.' },
      { title: 'Controlled input', text: 'value lấy từ state và onChange cập nhật state. React trở thành nguồn dữ liệu duy nhất của input.' },
      { title: 'Lifting state up', text: 'Form nhiều bước đặt state ở App để khi đổi component bước, dữ liệu cũ không bị mất.' },
      { title: 'Tái sử dụng', text: 'ConstructionProgressUpdate có thể render dạng trang hoặc modal nhưng dùng chung ProgressContent.' }
    ],
    diagram: `App giữ projectSetupForm
  ↓ props
ProjectSetupModal chọn step
  ↓ props
ProjectDetailsStep / LocationStep / ...
  ↓ gọi setForm
App cập nhật state và truyền dữ liệu mới xuống`,
    code: {
      label: 'Controlled input',
      content: `<input
  value={form.name}
  onChange={(event) =>
    setForm({ ...form, name: event.target.value })
  }
/>`
    },
    exercise: { title: 'Bài tập component', steps: ['Tìm prop form đi từ App đến ProjectDetailsStep.', 'Thêm console.log trong updateForm để quan sát dữ liệu.', 'Xóa console.log sau khi học.'] },
    quiz: { question: 'Tại sao form nhiều bước không đặt state riêng ở từng step?', answer: 'Khi chuyển step, component cũ có thể unmount và state riêng mất đi. Đặt state ở App giúp mọi bước chia sẻ cùng một form.' }
  },
  {
    id: 'pages',
    shortTitle: 'Các màn hình',
    eyebrow: 'Bài 07 · Frontend pages',
    title: 'Auth, dashboard, vật tư, chi phí và nhật ký',
    summary: 'Mỗi page ghép state, component và service để tạo thành một tính năng hoàn chỉnh.',
    objectives: ['Biết trách nhiệm của từng page.', 'Nhận ra phần dữ liệu thật và dữ liệu demo.', 'Hiểu debounce khi tự động lưu.'],
    files: [
      'frontend/src/pages/AuthPage.jsx',
      'UserPage.jsx',
      'DashboardPage.jsx',
      'MaterialManagement.jsx',
      'ProjectCostPage.jsx',
      'DiaryPage.jsx',
      'AdminPage.jsx'
    ],
    concepts: [
      { title: 'AuthPage', text: 'Validate form, gọi login/register rồi đưa session về App qua onAuthenticated.' },
      { title: 'DashboardPage', text: 'Ghép sidebar và các trang contractor; tải workspace/vật tư và tự lưu sau 350ms.' },
      { title: 'MaterialManagement', text: 'Tồn kho bằng tổng IMPORT trừ EXPORT; ngăn xuất quá số lượng còn lại.' },
      { title: 'ProjectCostPage', text: 'Tổng hợp vật tư, nhân công và phát sinh; lưu dữ liệu qua cost API.' },
      { title: 'DiaryPage', text: 'Quản lý nhật ký, ảnh base64, GPS, lightbox và bản in báo cáo.' },
      { title: 'AdminPage', text: 'Tải users/activity/constructions/settings song song và cung cấp giao diện quản trị.' }
    ],
    diagram: `UserPage
└── DashboardPage
    ├── MaterialManagement
    ├── ProjectCostPage
    ├── DiaryPage
    └── ConstructionProgressUpdate

AdminPage là nhánh giao diện riêng cho role admin`,
    code: {
      label: 'Debounce tự động lưu',
      content: `useEffect(() => {
  const timeout = window.setTimeout(() => {
    saveData();
  }, 350);

  return () => window.clearTimeout(timeout);
}, [data]);`
    },
    exercise: { title: 'Bài tập pages', steps: ['Thêm một nhật ký.', 'Mở Network và quan sát PUT /api/workspace sau khoảng 350ms.', 'Tải lại trang để xác nhận MongoDB trả dữ liệu về.'] },
    quiz: { question: 'Vì sao effect trả về clearTimeout?', answer: 'Nếu state đổi tiếp trước 350ms, timer cũ bị hủy. Chỉ lần thay đổi cuối mới gửi request, tránh gọi API quá nhiều.' }
  },
  {
    id: 'frontend-api',
    shortTitle: 'Frontend gọi API',
    eyebrow: 'Bài 08 · HTTP',
    title: 'Services, fetch và Bearer token',
    summary: 'Service gom logic HTTP để page không phải lặp URL, headers và xử lý lỗi.',
    objectives: ['Hiểu fetch/JSON.', 'Phân biệt GET, POST, PUT, PATCH, DELETE.', 'Biết token nằm ở header nào.'],
    files: [
      'frontend/src/services/authApi.js',
      'constructionApi.js',
      'progressApi.js',
      'materialApi.js',
      'costApi.js'
    ],
    concepts: [
      { title: 'GET', text: 'Đọc dữ liệu. Ví dụ GET /api/constructions.' },
      { title: 'POST', text: 'Tạo dữ liệu mới hoặc thực hiện hành động. Ví dụ đăng nhập và tạo công trình.' },
      { title: 'PUT', text: 'Thay thế/cập nhật cả nhóm dữ liệu hiện tại như workspace vật tư.' },
      { title: 'PATCH', text: 'Cập nhật một phần nhỏ, ví dụ chỉ đổi status.' },
      { title: 'DELETE', text: 'Xóa resource.' },
      { title: 'response.ok', text: 'Fetch không tự throw với HTTP 400/500. Service phải kiểm tra response.ok và tự tạo Error.' }
    ],
    diagram: `Page gọi getProgressTasks(token)
  ↓
progressApi tạo URL + headers
  ↓
fetch('/api/progress?...')
  ↓
Vite proxy đến Express :4000
  ↓
JSON hoặc throw Error`,
    code: {
      label: 'Mẫu service',
      content: `const response = await fetch('/api/costs', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer TOKEN'
  },
  body: JSON.stringify(data)
});

const result = await response.json();
if (!response.ok) throw new Error(result.message);`
    },
    exercise: { title: 'Bài tập HTTP', steps: ['Mở Swagger.', 'Chạy POST /api/auth/login.', 'Dùng token để chạy GET /api/constructions.'] },
    quiz: { question: 'HTTP 404 có làm fetch tự nhảy vào catch không?', answer: 'Không. Fetch vẫn resolve response. Code phải kiểm tra response.ok rồi tự throw Error.' }
  },
  {
    id: 'backend-khoi-dong',
    shortTitle: 'Express khởi động',
    eyebrow: 'Bài 09 · Backend',
    title: 'Từ server.js đến route',
    summary: 'Hiểu Express app được tạo, gắn middleware và mở cổng như thế nào.',
    objectives: ['Phân biệt app.js và server.js.', 'Hiểu app.use.', 'Hiểu thứ tự middleware.'],
    files: ['backend/package.json', 'backend/src/server.js', 'backend/src/app.js', 'backend/src/config/env.js', 'backend/src/config/database.js', 'backend/src/config/permissions.js'],
    concepts: [
      { title: 'server.js', text: 'Chỉ gọi app.listen khi chạy local. Vercel không cần listen vì nền tảng tự gọi Express app.' },
      { title: 'app.js', text: 'Tạo app, bật CORS/JSON, gắn Swagger, health route, router rồi error handler.' },
      { title: 'Middleware order', text: 'Express chạy từ trên xuống. notFound phải nằm sau routes; errorHandler nằm cuối.' },
      { title: 'database.js', text: 'Kết nối MongoDB một lần và cache connection; đồng thời seed tài khoản admin.' },
      { title: 'permissions.js', text: 'Mô tả quyền theo role. Backend vẫn kiểm tra role trực tiếp ở những route nhạy cảm.' }
    ],
    diagram: `server.js
  ↓ import
app.js
  ├── cors()
  ├── express.json()
  ├── Swagger
  ├── /health
  ├── /api/... routers
  ├── notFound
  └── errorHandler`,
    code: {
      label: 'Gắn router',
      content: `app.use('/api/auth', authRouter);

// Trong authRouter có route '/login'
// URL cuối cùng là /api/auth/login`
    },
    exercise: { title: 'Bài tập Express', steps: ['Mở backend/src/app.js.', 'Tìm route /health.', 'Dùng Swagger hoặc trình duyệt gọi /health.'] },
    quiz: { question: 'Tại sao notFound phải đặt sau các router?', answer: 'Nếu đặt trước, nó sẽ trả 404 ngay và các router thật không bao giờ có cơ hội xử lý request.' }
  },
  {
    id: 'bao-mat',
    shortTitle: 'Xác thực và lỗi',
    eyebrow: 'Bài 10 · Backend security',
    title: 'Password hash, token và middleware',
    summary: 'Theo dõi cách backend bảo vệ mật khẩu và xác minh mỗi request.',
    objectives: ['Hiểu hash khác mã hóa.', 'Hiểu payload và signature.', 'Hiểu 401 khác 403.'],
    files: ['backend/src/utils/password.js', 'backend/src/utils/token.js', 'backend/src/utils/asyncHandler.js', 'backend/src/middleware/auth.js', 'backend/src/middleware/errors.js', 'backend/src/services/activityService.js'],
    concepts: [
      { title: 'Password hash', text: 'PBKDF2 biến password + salt thành hash một chiều. Database không lưu mật khẩu gốc.' },
      { title: 'Token', text: 'Token hiện có payload.signature. HMAC với AUTH_SECRET chứng minh payload không bị sửa, nhưng token chưa có thời gian hết hạn.' },
      { title: 'requireAuth', text: 'Đọc Bearer token, verify chữ ký, tìm lại user và chặn tài khoản bị khóa.' },
      { title: 'requireAdmin', text: 'Sau requireAuth, kiểm tra req.user.role. Sai role trả 403.' },
      { title: 'asyncHandler', text: 'Bắt lỗi Promise và chuyển cho errorHandler bằng next(error).' },
      { title: 'activityService', text: 'Ghi lại ai đã đăng nhập/tạo/sửa/xóa để admin truy vết.' }
    ],
    diagram: `Authorization: Bearer TOKEN
  ↓
requireAuth
  ├── verifyToken
  ├── User.findById
  ├── kiểm tra active
  └── req.user = user
        ↓
requireAdmin (nếu là admin route)
        ↓
route handler`,
    code: {
      label: 'Middleware chain',
      content: `router.use(requireAuth, requireAdmin);

router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json(users);
}));`
    },
    exercise: { title: 'Bài tập bảo mật', steps: ['Gọi API protected không có token và xem 401.', 'Đăng nhập contractor rồi gọi admin API và xem 403.', 'Giải thích sự khác nhau.'] },
    quiz: { question: '401 và 403 khác nhau thế nào?', answer: '401 nghĩa là chưa xác thực hoặc phiên không hợp lệ. 403 nghĩa là đã biết anh là ai nhưng tài khoản không có quyền thực hiện thao tác.' }
  },
  {
    id: 'mongodb',
    shortTitle: 'MongoDB và Models',
    eyebrow: 'Bài 11 · Dữ liệu',
    title: 'Mongoose Schema định hình dữ liệu',
    summary: 'Model giúp backend validate và truy vấn MongoDB bằng JavaScript object.',
    objectives: ['Hiểu schema/model/document.', 'Đọc được required/default/enum/ref.', 'Biết mỗi model lưu loại dữ liệu nào.'],
    files: ['backend/src/models/User.js', 'Construction.js', 'ProgressTask.js', 'MaterialWorkspace.js', 'CostWorkspace.js', 'Workspace.js', 'ActivityLog.js', 'SystemSettings.js'],
    concepts: [
      { title: 'User', text: 'Tài khoản, passwordHash, role, active và lastLoginAt.' },
      { title: 'Construction', text: 'Thông tin công trình, chủ đầu tư, địa chỉ, kích thước, trạng thái và contractor sở hữu.' },
      { title: 'ProgressTask', text: 'Công việc, người phụ trách, hạng mục, status, priority và liên kết công trình.' },
      { title: 'MaterialWorkspace', text: 'Danh mục vật tư, giao dịch IMPORT/EXPORT và yêu cầu mua.' },
      { title: 'CostWorkspace', text: 'Chi phí phát sinh và chi phí nhân công.' },
      { title: 'Workspace', text: 'Dữ liệu mềm/legacy: nhật ký, đội thi công, hồ sơ.' },
      { title: 'ActivityLog và SystemSettings', text: 'Một model ghi lịch sử thao tác; một model giữ cấu hình chung.' }
    ],
    diagram: `User 1 ─── nhiều Construction
                 │
                 └── nhiều ProgressTask

User 1 ─── 1 MaterialWorkspace
User 1 ─── 1 CostWorkspace
User 1 ─── 1 Workspace`,
    code: {
      label: 'Một schema Mongoose',
      content: `const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['admin', 'contractor']
  }
}, { timestamps: true });`
    },
    exercise: { title: 'Bài tập model', steps: ['Tìm enum status của Construction.', 'Tìm minlength của User.username.', 'Tìm ref từ ProgressTask đến Construction.'] },
    quiz: { question: 'timestamps: true tự thêm những field nào?', answer: 'Mongoose tự thêm createdAt và updatedAt, đồng thời cập nhật updatedAt khi document thay đổi.' }
  },
  {
    id: 'routes',
    shortTitle: 'Routes và CRUD',
    eyebrow: 'Bài 12 · API nghiệp vụ',
    title: 'Route nhận request và làm việc với model',
    summary: 'Mỗi router tập trung vào một miền dữ liệu và áp dụng quyền phù hợp.',
    objectives: ['Theo được một route CRUD.', 'Hiểu req.params/query/body/user.', 'Hiểu migration workspace cũ.'],
    files: ['backend/src/routes/auth.js', 'constructions.js', 'progress.js', 'materials.js', 'costs.js', 'workspace.js', 'admin.js'],
    concepts: [
      { title: 'req.body', text: 'JSON frontend gửi lên, thường dùng trong POST/PUT/PATCH.' },
      { title: 'req.params', text: 'Giá trị nằm trong URL path, ví dụ :id.' },
      { title: 'req.query', text: 'Bộ lọc sau dấu ?, ví dụ status=active.' },
      { title: 'req.user', text: 'User do requireAuth gắn vào request sau khi kiểm tra token.' },
      { title: 'Whitelist update', text: 'Workspace/material/cost chỉ lấy những field nằm trong allowed, tránh cập nhật field tùy ý.' },
      { title: 'Migration', text: 'Materials/costs đọc Workspace cũ nếu collection mới chưa có, rồi upsert dữ liệu sang model chuyên biệt.' }
    ],
    diagram: `POST /api/progress
  ↓ requireAuth
  ↓ kiểm tra role contractor
  ↓ kiểm tra construction thuộc req.user
  ↓ ProgressTask.create(...)
  ↓ writeActivity(...)
  ↓ HTTP 201 + JSON task`,
    code: {
      label: 'Params, query và body',
      content: `req.params.id              // /users/:id
req.query.constructionId  // ?constructionId=...
req.body.status           // JSON body
req.user._id              // từ requireAuth`
    },
    exercise: { title: 'Bài tập route', steps: ['Mở progress.js.', 'Theo route PATCH /:id/status.', 'Viết ra từng trường hợp trả 400, 403 và 404.'] },
    quiz: { question: 'Vì sao query cập nhật progress có cả _id và contractorId?', answer: 'Để contractor chỉ sửa task của chính mình. Biết ID task của người khác vẫn không đủ để cập nhật.' }
  },
  {
    id: 'swagger-deploy',
    shortTitle: 'Swagger và deploy',
    eyebrow: 'Bài 13 · Hoàn thiện',
    title: 'Tài liệu API, kiểm thử và đưa lên Vercel',
    summary: 'Swagger mô tả hợp đồng API; Vercel phục vụ frontend tĩnh và backend serverless.',
    objectives: ['Đọc được OpenAPI document.', 'Test Bearer API.', 'Hiểu app local và serverless dùng chung code.'],
    files: ['backend/src/docs/openapi.js', 'backend/src/docs/swagger.js', 'vercel.json', 'api/index.js'],
    concepts: [
      { title: 'OpenAPI', text: 'openapi.js mô tả schemas, paths, request bodies, responses và bearerAuth cho 28 operations.' },
      { title: 'Swagger UI', text: 'swagger.js biến OpenAPI object thành trang /api-docs và cung cấp JSON ở /api-docs.json.' },
      { title: 'Local', text: 'server.js gọi app.listen(PORT).' },
      { title: 'Vercel', text: 'api/index.js export app. Nền tảng tự gọi app cho từng serverless request.' },
      { title: 'SPA rewrite', text: 'URL frontend được trả về index.html; main.jsx quyết định render App hay LearningPage.' }
    ],
    diagram: `Local
Browser → Vite :5173 → proxy → Express :4000

Vercel
Browser → CDN frontend/dist
       → /api/* → Serverless api/index.js → Express app`,
    code: {
      label: 'Quy trình test Swagger',
      content: `1. POST /api/auth/login
2. Sao chép token từ response
3. Bấm Authorize
4. Dán token, không thêm chữ Bearer
5. Chạy các API protected`
    },
    exercise: { title: 'Bài tốt nghiệp nhỏ', steps: ['Thêm field company vào User model.', 'Thêm input ở frontend.', 'Nhận và lưu field trong route.', 'Cập nhật Swagger schema.', 'Chạy lint, build và test bằng Swagger.'] },
    quiz: { question: 'Vì sao app.js và server.js được tách riêng?', answer: 'Local cần app.listen, còn Vercel cần export Express app. Tách file giúp cùng một app chạy được ở cả hai môi trường.' }
  }
];
