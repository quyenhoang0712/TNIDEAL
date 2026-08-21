const ref = (schema) => ({ $ref: `#/components/schemas/${schema}` });

const jsonBody = (schema, example) => ({
  required: true,
  content: {
    'application/json': {
      schema: typeof schema === 'string' ? ref(schema) : schema,
      ...(example ? { example } : {})
    }
  }
});

const jsonResponse = (description, schema) => ({
  description,
  content: {
    'application/json': {
      schema: typeof schema === 'string' ? ref(schema) : schema
    }
  }
});

const arrayOf = (schema) => ({ type: 'array', items: ref(schema) });

const authErrors = {
  401: { $ref: '#/components/responses/Unauthorized' },
  403: { $ref: '#/components/responses/Forbidden' }
};

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'TN Ideal API',
    version: '1.0.0',
    description:
      'Tài liệu và giao diện test API cho hệ thống quản lý công trình TN Ideal. Đăng nhập trước, sao chép token rồi bấm Authorize và dán token vào ô Bearer.'
  },
  servers: [
    {
      url: '/',
      description: 'Máy chủ đang mở Swagger'
    }
  ],
  tags: [
    { name: 'System', description: 'Kiểm tra trạng thái backend' },
    { name: 'Auth', description: 'Đăng ký và đăng nhập' },
    { name: 'Constructions', description: 'Quản lý công trình' },
    { name: 'Progress', description: 'Quản lý công việc tiến độ' },
    { name: 'Materials', description: 'Quản lý kho vật tư' },
    { name: 'Costs', description: 'Quản lý chi phí' },
    { name: 'Workspace', description: 'Dữ liệu làm việc của nhà thầu' },
    { name: 'Admin', description: 'API chỉ dành cho quản trị viên' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'Token',
        description: 'Dán token nhận được từ API đăng nhập. Không cần gõ chữ Bearer.'
      }
    },
    responses: {
      BadRequest: jsonResponse('Dữ liệu gửi lên không hợp lệ', 'Error'),
      Unauthorized: jsonResponse('Chưa đăng nhập hoặc token không hợp lệ', 'Error'),
      Forbidden: jsonResponse('Tài khoản không có quyền thực hiện thao tác', 'Error'),
      NotFound: jsonResponse('Không tìm thấy dữ liệu', 'Error'),
      ServerError: jsonResponse('Lỗi backend hoặc kết nối MongoDB', 'Error')
    },
    schemas: {
      Error: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string', example: 'Thông báo lỗi' }
        }
      },
      AuthUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '66a1234567890abcdef1234' },
          username: { type: 'string', example: 'nhathau01' },
          displayName: { type: 'string', example: 'Nhà thầu số 1' },
          role: { type: 'string', enum: ['admin', 'contractor'], example: 'contractor' }
        }
      },
      AuthResponse: {
        type: 'object',
        required: ['token', 'user'],
        properties: {
          token: { type: 'string', description: 'Token dùng cho nút Authorize' },
          user: ref('AuthUser')
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
          username: { type: 'string', minLength: 3, example: 'nhathau01' },
          password: { type: 'string', format: 'password', example: 'Matkhau@123' }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['username', 'displayName', 'password', 'confirmPassword'],
        properties: {
          username: { type: 'string', minLength: 3, example: 'nhathau01' },
          displayName: { type: 'string', minLength: 2, example: 'Nhà thầu số 1' },
          phone: { type: 'string', example: '0901234567' },
          email: { type: 'string', format: 'email', example: 'nhathau@example.com' },
          password: { type: 'string', format: 'password', example: 'Matkhau@123' },
          confirmPassword: { type: 'string', format: 'password', example: 'Matkhau@123' }
        }
      },
      Construction: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66a1234567890abcdef1234' },
          code: { type: 'string', example: 'CT001', readOnly: true },
          name: { type: 'string', example: 'Nhà phố Nguyễn Văn A' },
          investorName: { type: 'string', example: 'Nguyễn Văn A' },
          investorPhone: { type: 'string', example: '0901234567' },
          type: { type: 'string', example: 'house' },
          location: { type: 'string', example: 'TP. Hồ Chí Minh' },
          fullAddress: { type: 'string', example: '123 Nguyễn Huệ, TP. Hồ Chí Minh' },
          provinceCity: { type: 'string', example: 'TP. Hồ Chí Minh' },
          wardCommune: { type: 'string', example: 'Phường Sài Gòn' },
          startDate: { type: 'string', example: '21/08/2026' },
          duration: { type: 'number', example: 6 },
          landLength: { type: 'number', example: 20 },
          landWidth: { type: 'number', example: 5 },
          upperFloors: { type: 'number', example: 3 },
          hasBasement: { type: 'boolean', example: false },
          status: {
            type: 'string',
            enum: ['planning', 'active', 'paused', 'done'],
            example: 'planning'
          },
          hidden: { type: 'boolean', example: false },
          contractorId: { type: 'string', example: '66a1234567890abcdef1234' },
          contractorName: { type: 'string', example: 'Nhà thầu số 1' },
          createdAt: { type: 'string', format: 'date-time', readOnly: true },
          updatedAt: { type: 'string', format: 'date-time', readOnly: true }
        }
      },
      CreateConstructionRequest: {
        type: 'object',
        required: ['name', 'investorName'],
        properties: {
          name: { type: 'string', example: 'Nhà phố Nguyễn Văn A' },
          investorName: { type: 'string', example: 'Nguyễn Văn A' },
          investorPhone: { type: 'string', example: '0901234567' },
          type: { type: 'string', example: 'house' },
          location: { type: 'string', example: 'TP. Hồ Chí Minh' },
          fullAddress: { type: 'string', example: '123 Nguyễn Huệ, TP. Hồ Chí Minh' },
          provinceCity: { type: 'string', example: 'TP. Hồ Chí Minh' },
          wardCommune: { type: 'string', example: 'Phường Sài Gòn' },
          startDate: { type: 'string', example: '21/08/2026' },
          duration: { type: 'number', minimum: 0, example: 6 },
          landLength: { type: 'number', minimum: 0, example: 20 },
          landWidth: { type: 'number', minimum: 0, example: 5 },
          upperFloors: { type: 'number', minimum: 0, example: 3 },
          hasBasement: { type: 'boolean', example: false }
        }
      },
      ProgressTask: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '66a1234567890abcdef1234' },
          title: { type: 'string', example: 'Hoàn thiện phần móng' },
          owner: { type: 'string', example: 'Đội thi công A' },
          category: { type: 'string', example: 'Phần thô' },
          status: { type: 'string', enum: ['planning', 'active', 'done'], example: 'planning' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
          description: { type: 'string', example: 'Đổ bê tông và kiểm tra cao độ' },
          contractorId: { type: 'string' },
          constructionId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time', readOnly: true },
          updatedAt: { type: 'string', format: 'date-time', readOnly: true }
        }
      },
      CreateProgressRequest: {
        type: 'object',
        required: ['title', 'owner', 'category', 'constructionId'],
        properties: {
          title: { type: 'string', minLength: 3, example: 'Hoàn thiện phần móng' },
          owner: { type: 'string', example: 'Đội thi công A' },
          category: { type: 'string', example: 'Phần thô' },
          status: { type: 'string', enum: ['planning', 'active', 'done'], example: 'planning' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'], example: 'high' },
          description: { type: 'string', example: 'Đổ bê tông và kiểm tra cao độ' },
          constructionId: { type: 'string', example: '66a1234567890abcdef1234' }
        }
      },
      MaterialDefinition: {
        type: 'object',
        required: ['name', 'unit'],
        properties: {
          name: { type: 'string', example: 'Xi măng PCB40' },
          unit: { type: 'string', example: 'Bao' },
          minStock: { type: 'number', minimum: 0, example: 100 },
          price: { type: 'number', minimum: 0, example: 95000 }
        }
      },
      MaterialTransaction: {
        type: 'object',
        required: ['id', 'material', 'type', 'quantity'],
        properties: {
          id: { type: 'number', example: 1 },
          projectId: { type: 'string', example: 'current-project' },
          constructionId: { type: 'string', nullable: true },
          material: { type: 'string', example: 'Xi măng PCB40' },
          type: { type: 'string', enum: ['IMPORT', 'EXPORT'], example: 'IMPORT' },
          quantity: { type: 'number', minimum: 0.000001, example: 200 },
          unitPrice: { type: 'number', minimum: 0, example: 95000 },
          category: { type: 'string', example: 'Vật liệu thô' },
          supplier: { type: 'string', example: 'Nhà cung cấp A' },
          date: { type: 'string', example: '21/08/2026' },
          note: { type: 'string', example: 'Nhập kho đợt 1' }
        }
      },
      PurchaseRequest: {
        type: 'object',
        required: ['id', 'material', 'quantity', 'unit'],
        properties: {
          id: { type: 'number', example: 1 },
          projectId: { type: 'string', example: 'current-project' },
          constructionId: { type: 'string', nullable: true },
          material: { type: 'string', example: 'Thép D16' },
          quantity: { type: 'number', minimum: 0.000001, example: 500 },
          unit: { type: 'string', example: 'Kg' },
          category: { type: 'string', example: 'Thép' },
          neededDate: { type: 'string', example: '25/08/2026' },
          status: {
            type: 'string',
            enum: ['PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED'],
            example: 'PENDING'
          }
        }
      },
      MaterialWorkspace: {
        type: 'object',
        properties: {
          contractorId: { type: 'string' },
          materialDefinitions: arrayOf('MaterialDefinition'),
          materialTransactions: arrayOf('MaterialTransaction'),
          purchaseRequests: arrayOf('PurchaseRequest'),
          migratedFromWorkspaceAt: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      Expense: {
        type: 'object',
        required: ['id', 'type', 'description', 'amount'],
        properties: {
          id: { type: 'number', example: 1 },
          projectId: { type: 'string', example: 'current-project' },
          constructionId: { type: 'string', nullable: true },
          type: {
            type: 'string',
            enum: ['MACHINE', 'TRANSPORT', 'UTILITIES', 'OTHER'],
            example: 'TRANSPORT'
          },
          description: { type: 'string', example: 'Vận chuyển vật tư' },
          amount: { type: 'number', minimum: 0.000001, example: 1500000 },
          category: { type: 'string', example: 'Vận chuyển' },
          date: { type: 'string', example: '21/08/2026' },
          note: { type: 'string', example: 'Xe tải 2 chuyến' }
        }
      },
      LaborCost: {
        type: 'object',
        required: ['id', 'name', 'paymentType'],
        properties: {
          id: { type: 'number', example: 1 },
          projectId: { type: 'string', example: 'current-project' },
          constructionId: { type: 'string', nullable: true },
          name: { type: 'string', example: 'Đội xây tô' },
          category: { type: 'string', example: 'Nhân công' },
          paymentType: { type: 'string', enum: ['DAILY', 'CONTRACT'], example: 'DAILY' },
          workUnits: { type: 'number', minimum: 0, example: 10 },
          dailyRate: { type: 'number', minimum: 0, example: 500000 },
          contractAmount: { type: 'number', minimum: 0, example: 0 },
          date: { type: 'string', example: '21/08/2026' }
        }
      },
      CostWorkspace: {
        type: 'object',
        properties: {
          contractorId: { type: 'string' },
          expenses: arrayOf('Expense'),
          laborCosts: arrayOf('LaborCost'),
          migratedFromWorkspaceAt: { type: 'string', format: 'date-time', nullable: true }
        }
      },
      ProjectPdf: {
        type: 'object',
        required: ['id', 'name', 'type', 'size', 'url', 'uploadedAt'],
        properties: {
          id: { type: 'string', example: 'b7e4a468-5f6f-43f0-817b-2de5cc4acd73' },
          name: { type: 'string', example: 'Ban-ve-kien-truc.pdf' },
          type: { type: 'string', enum: ['application/pdf'] },
          size: { type: 'integer', maximum: 2097152, description: 'Dung lượng thật theo byte, tối đa 2 MB' },
          url: { type: 'string', description: 'PDF dạng data:application/pdf;base64,...' },
          uploadedAt: { type: 'string', format: 'date-time' }
        }
      },
      ProjectFileGroup: {
        type: 'object',
        required: ['group', 'files'],
        properties: {
          group: { type: 'string', enum: ['Bản vẽ', 'Hợp đồng', 'Pháp lý / tài liệu khác'] },
          files: arrayOf('ProjectPdf')
        }
      },
      Workspace: {
        type: 'object',
        properties: {
          contractorId: { type: 'string' },
          materialTransactions: { type: 'array', items: { type: 'object', additionalProperties: true } },
          purchaseRequests: { type: 'array', items: { type: 'object', additionalProperties: true } },
          expenses: { type: 'array', items: { type: 'object', additionalProperties: true } },
          diaries: { type: 'array', items: { type: 'object', additionalProperties: true } },
          constructionTeams: { type: 'array', items: { type: 'object', additionalProperties: true } },
          laborCosts: { type: 'array', items: { type: 'object', additionalProperties: true } },
          projectFiles: arrayOf('ProjectFileGroup')
        }
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          username: { type: 'string', example: 'nhathau01' },
          displayName: { type: 'string', example: 'Nhà thầu số 1' },
          phone: { type: 'string', example: '0901234567' },
          email: { type: 'string', format: 'email', example: 'nhathau@example.com' },
          role: { type: 'string', enum: ['admin', 'contractor'] },
          active: { type: 'boolean', example: true },
          lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      ActivityLog: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          actorId: { type: 'string', nullable: true },
          actorName: { type: 'string', example: 'Admin' },
          actorRole: { type: 'string', enum: ['admin', 'contractor'] },
          action: { type: 'string', example: 'Cập nhật công trình' },
          targetType: { type: 'string', example: 'construction' },
          targetName: { type: 'string', example: 'Nhà phố Nguyễn Văn A' },
          details: { type: 'string', example: 'active' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      SystemSettings: {
        type: 'object',
        properties: {
          key: { type: 'string', example: 'general' },
          companyName: { type: 'string', example: 'TN Ideal' },
          supportEmail: { type: 'string', format: 'email', example: 'admin@tnideal.vn' },
          loginAlerts: { type: 'boolean', example: true },
          logo: { type: 'string', description: 'URL hoặc chuỗi ảnh logo', example: '' }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Kiểm tra backend có đang chạy không',
        security: [],
        responses: {
          200: jsonResponse('Backend hoạt động bình thường', {
            type: 'object',
            properties: {
              ok: { type: 'boolean', example: true },
              service: { type: 'string', example: 'tnideal-api' }
            }
          })
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng nhập và nhận Bearer token',
        security: [],
        requestBody: jsonBody('LoginRequest'),
        responses: {
          200: jsonResponse('Đăng nhập thành công', 'AuthResponse'),
          401: { $ref: '#/components/responses/Unauthorized' },
          403: { $ref: '#/components/responses/Forbidden' },
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Đăng ký tài khoản nhà thầu',
        security: [],
        requestBody: jsonBody('RegisterRequest'),
        responses: {
          201: jsonResponse('Tạo tài khoản thành công', 'AuthResponse'),
          400: { $ref: '#/components/responses/BadRequest' },
          409: jsonResponse('Username đã tồn tại', 'Error'),
          500: { $ref: '#/components/responses/ServerError' }
        }
      }
    },
    '/api/constructions': {
      get: {
        tags: ['Constructions'],
        summary: 'Lấy danh sách công trình của tài khoản',
        responses: {
          200: jsonResponse('Danh sách công trình', arrayOf('Construction')),
          ...authErrors
        }
      },
      post: {
        tags: ['Constructions'],
        summary: 'Tạo công trình mới',
        description: 'Chỉ tài khoản nhà thầu được tạo công trình.',
        requestBody: jsonBody('CreateConstructionRequest'),
        responses: {
          201: jsonResponse('Tạo công trình thành công', 'Construction'),
          400: { $ref: '#/components/responses/BadRequest' },
          ...authErrors
        }
      }
    },
    '/api/progress': {
      get: {
        tags: ['Progress'],
        summary: 'Lấy danh sách công việc tiến độ',
        parameters: [
          {
            in: 'query',
            name: 'status',
            schema: { type: 'string', enum: ['all', 'planning', 'active', 'done'], default: 'all' }
          },
          {
            in: 'query',
            name: 'constructionId',
            schema: { type: 'string' },
            description: 'Lọc theo ID công trình'
          }
        ],
        responses: {
          200: jsonResponse('Danh sách công việc', arrayOf('ProgressTask')),
          ...authErrors
        }
      },
      post: {
        tags: ['Progress'],
        summary: 'Tạo công việc tiến độ',
        description: 'Chỉ nhà thầu sở hữu công trình được tạo công việc.',
        requestBody: jsonBody('CreateProgressRequest'),
        responses: {
          201: jsonResponse('Tạo công việc thành công', 'ProgressTask'),
          400: { $ref: '#/components/responses/BadRequest' },
          ...authErrors
        }
      }
    },
    '/api/progress/{id}/status': {
      patch: {
        tags: ['Progress'],
        summary: 'Cập nhật trạng thái công việc',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID công việc' }
        ],
        requestBody: jsonBody(
          {
            type: 'object',
            required: ['status'],
            properties: {
              status: { type: 'string', enum: ['planning', 'active', 'done'], example: 'active' }
            }
          }
        ),
        responses: {
          200: jsonResponse('Cập nhật thành công', 'ProgressTask'),
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          ...authErrors
        }
      }
    },
    '/api/progress/{id}': {
      delete: {
        tags: ['Progress'],
        summary: 'Xóa công việc tiến độ',
        description: 'Chỉ admin được xóa.',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID công việc' }
        ],
        responses: {
          200: jsonResponse('Đã xóa công việc', {
            type: 'object',
            properties: { message: { type: 'string', example: 'Đã xóa công việc tiến độ' } }
          }),
          404: { $ref: '#/components/responses/NotFound' },
          ...authErrors
        }
      }
    },
    '/api/materials': {
      get: {
        tags: ['Materials'],
        summary: 'Lấy dữ liệu kho vật tư',
        description: 'Chỉ dành cho tài khoản nhà thầu.',
        responses: {
          200: jsonResponse('Dữ liệu kho vật tư', 'MaterialWorkspace'),
          ...authErrors
        }
      },
      put: {
        tags: ['Materials'],
        summary: 'Lưu toàn bộ dữ liệu kho vật tư',
        description: 'Chỉ các mảng có trong body mới được cập nhật.',
        requestBody: jsonBody({
          type: 'object',
          properties: {
            materialDefinitions: arrayOf('MaterialDefinition'),
            materialTransactions: arrayOf('MaterialTransaction'),
            purchaseRequests: arrayOf('PurchaseRequest')
          }
        }),
        responses: {
          200: jsonResponse('Dữ liệu sau khi lưu', 'MaterialWorkspace'),
          400: { $ref: '#/components/responses/BadRequest' },
          ...authErrors
        }
      }
    },
    '/api/costs': {
      get: {
        tags: ['Costs'],
        summary: 'Lấy dữ liệu chi phí',
        description: 'Chỉ dành cho tài khoản nhà thầu.',
        responses: {
          200: jsonResponse('Dữ liệu chi phí', 'CostWorkspace'),
          ...authErrors
        }
      },
      put: {
        tags: ['Costs'],
        summary: 'Lưu chi phí và chi phí nhân công',
        requestBody: jsonBody({
          type: 'object',
          properties: {
            expenses: arrayOf('Expense'),
            laborCosts: arrayOf('LaborCost')
          }
        }),
        responses: {
          200: jsonResponse('Dữ liệu sau khi lưu', 'CostWorkspace'),
          400: { $ref: '#/components/responses/BadRequest' },
          ...authErrors
        }
      }
    },
    '/api/workspace': {
      get: {
        tags: ['Workspace'],
        summary: 'Lấy workspace của nhà thầu',
        responses: {
          200: jsonResponse('Dữ liệu workspace', 'Workspace'),
          ...authErrors
        }
      },
      put: {
        tags: ['Workspace'],
        summary: 'Lưu nhật ký, đội thi công và hồ sơ',
        requestBody: jsonBody({
          type: 'object',
          properties: {
            diaries: { type: 'array', items: { type: 'object', additionalProperties: true } },
            constructionTeams: { type: 'array', items: { type: 'object', additionalProperties: true } },
            projectFiles: arrayOf('ProjectFileGroup')
          }
        }),
        responses: {
          200: jsonResponse('Dữ liệu workspace sau khi lưu', 'Workspace'),
          413: jsonResponse('File hoặc tổng dung lượng hồ sơ PDF vượt giới hạn', 'Error'),
          ...authErrors
        }
      }
    },
    '/api/admin/constructions': {
      get: {
        tags: ['Admin'],
        summary: 'Admin lấy tất cả công trình',
        responses: {
          200: jsonResponse('Danh sách toàn bộ công trình', arrayOf('Construction')),
          ...authErrors
        }
      }
    },
    '/api/admin/constructions/import': {
      post: {
        tags: ['Admin'],
        summary: 'Khôi phục công trình cũ cho một nhà thầu',
        requestBody: jsonBody({
          type: 'object',
          required: ['contractorId', 'name'],
          properties: {
            contractorId: { type: 'string', example: '66a1234567890abcdef1234' },
            name: { type: 'string', example: 'Công trình cũ' },
            investorName: { type: 'string', example: 'Nguyễn Văn A' },
            investorPhone: { type: 'string', example: '0901234567' },
            type: { type: 'string', example: 'house' },
            fullAddress: { type: 'string', example: 'TP. Hồ Chí Minh' }
          }
        }),
        responses: {
          201: jsonResponse('Khôi phục thành công', 'Construction'),
          400: { $ref: '#/components/responses/BadRequest' },
          ...authErrors
        }
      }
    },
    '/api/admin/constructions/{id}': {
      patch: {
        tags: ['Admin'],
        summary: 'Admin cập nhật công trình',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID công trình' }
        ],
        requestBody: jsonBody({
          type: 'object',
          properties: {
            name: { type: 'string' },
            status: { type: 'string', enum: ['planning', 'active', 'paused', 'done'] },
            hidden: { type: 'boolean' }
          },
          additionalProperties: true
        }),
        responses: {
          200: jsonResponse('Công trình sau khi cập nhật', 'Construction'),
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          ...authErrors
        }
      },
      delete: {
        tags: ['Admin'],
        summary: 'Admin xóa công trình',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID công trình' }
        ],
        responses: {
          200: jsonResponse('Đã xóa công trình', {
            type: 'object',
            properties: { message: { type: 'string', example: 'Đã xóa công trình' } }
          }),
          404: { $ref: '#/components/responses/NotFound' },
          ...authErrors
        }
      }
    },
    '/api/admin/contractors/{id}/workspace': {
      get: {
        tags: ['Admin'],
        summary: 'Admin xem dữ liệu của một nhà thầu',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID nhà thầu' },
          {
            in: 'query',
            name: 'constructionId',
            schema: { type: 'string' },
            description: 'Lọc công việc theo ID công trình'
          }
        ],
        responses: {
          200: jsonResponse('Dữ liệu nhà thầu', {
            type: 'object',
            properties: {
              contractor: ref('User'),
              workspace: ref('Workspace'),
              jobs: arrayOf('ProgressTask')
            }
          }),
          404: { $ref: '#/components/responses/NotFound' },
          ...authErrors
        }
      }
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Admin lấy danh sách tài khoản',
        responses: {
          200: jsonResponse('Danh sách tài khoản', arrayOf('User')),
          ...authErrors
        }
      },
      post: {
        tags: ['Admin'],
        summary: 'Admin tạo tài khoản',
        requestBody: jsonBody({
          type: 'object',
          required: ['username', 'displayName', 'password'],
          properties: {
            username: { type: 'string', minLength: 3, example: 'nhathau02' },
            displayName: { type: 'string', minLength: 2, example: 'Nhà thầu số 2' },
            phone: { type: 'string', example: '0901234567' },
            email: { type: 'string', format: 'email', example: 'nhathau02@example.com' },
            password: { type: 'string', format: 'password', example: 'Matkhau@123' },
            role: { type: 'string', enum: ['admin', 'contractor'], example: 'contractor' }
          }
        }),
        responses: {
          201: jsonResponse('Tạo tài khoản thành công', 'User'),
          400: { $ref: '#/components/responses/BadRequest' },
          409: jsonResponse('Username đã tồn tại', 'Error'),
          ...authErrors
        }
      }
    },
    '/api/admin/users/{id}': {
      patch: {
        tags: ['Admin'],
        summary: 'Admin cập nhật tài khoản',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID tài khoản' }
        ],
        requestBody: jsonBody({
          type: 'object',
          properties: {
            displayName: { type: 'string', example: 'Tên mới' },
            phone: { type: 'string', example: '0901234567' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', format: 'password' },
            role: { type: 'string', enum: ['admin', 'contractor'] },
            active: { type: 'boolean' }
          }
        }),
        responses: {
          200: jsonResponse('Tài khoản sau khi cập nhật', 'User'),
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          ...authErrors
        }
      },
      delete: {
        tags: ['Admin'],
        summary: 'Admin xóa tài khoản',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' }, description: 'ID tài khoản' }
        ],
        responses: {
          200: jsonResponse('Đã xóa tài khoản', {
            type: 'object',
            properties: { message: { type: 'string', example: 'Đã xóa tài khoản' } }
          }),
          400: { $ref: '#/components/responses/BadRequest' },
          404: { $ref: '#/components/responses/NotFound' },
          ...authErrors
        }
      }
    },
    '/api/admin/activity': {
      get: {
        tags: ['Admin'],
        summary: 'Admin xem nhật ký hoạt động',
        parameters: [
          {
            in: 'query',
            name: 'actorRole',
            schema: { type: 'string', enum: ['admin', 'contractor'] },
            description: 'Lọc theo vai trò người thực hiện'
          }
        ],
        responses: {
          200: jsonResponse('Tối đa 200 bản ghi mới nhất', arrayOf('ActivityLog')),
          ...authErrors
        }
      }
    },
    '/api/admin/settings': {
      get: {
        tags: ['Admin'],
        summary: 'Admin lấy cài đặt hệ thống',
        responses: {
          200: jsonResponse('Cài đặt hiện tại', 'SystemSettings'),
          ...authErrors
        }
      },
      put: {
        tags: ['Admin'],
        summary: 'Admin cập nhật cài đặt hệ thống',
        requestBody: jsonBody('SystemSettings'),
        responses: {
          200: jsonResponse('Cài đặt sau khi cập nhật', 'SystemSettings'),
          ...authErrors
        }
      }
    },
    '/api/admin/system': {
      get: {
        tags: ['Admin'],
        summary: 'Admin kiểm tra API, database và số liệu hệ thống',
        responses: {
          200: jsonResponse('Trạng thái hệ thống', {
            type: 'object',
            properties: {
              api: { type: 'string', example: 'online' },
              database: { type: 'string', example: 'connected' },
              responseTime: { type: 'number', example: 12 },
              users: { type: 'number', example: 5 },
              projects: { type: 'number', example: 10 },
              constructions: { type: 'number', example: 3 },
              environment: { type: 'string', example: 'Local' },
              checkedAt: { type: 'string', format: 'date-time' }
            }
          }),
          ...authErrors
        }
      }
    }
  },
  security: [{ bearerAuth: [] }]
};

export default openApiDocument;
