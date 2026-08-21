import swaggerUi from 'swagger-ui-express';
import openApiDocument from './openapi.js';

const swaggerOptions = {
  customSiteTitle: 'TN Ideal API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    tryItOutEnabled: true
  }
};

export function mountSwagger(app) {
  app.get('/api-docs.json', (_req, res) => {
    res.json(openApiDocument);
  });

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument, swaggerOptions));
}
