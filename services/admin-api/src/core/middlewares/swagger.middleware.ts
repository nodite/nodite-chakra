import consts from '@config/consts';
import AppError from '@core/utils/appError';
import logger from '@core/utils/logger';
import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import swaggerUi from 'swagger-ui-express';

import swaggerDocument from '../../swagger.json';

const swaggerForbidden = () => {
  logger.error('Trying to access swagger docs on production');
  throw new AppError(
    httpStatus.FORBIDDEN,
    'API docs are not available on production',
  );
};

const swaggerBasePath = (req: Request, res: Response, next: NextFunction) => {
  const basePath: string = req.originalUrl.replace(consts.API_DOCS_PATH, '');
  swaggerDocument.basePath = basePath;
  swaggerUi.setup(swaggerDocument)(req, res, () => {
    next();
  });
};

export { swaggerBasePath, swaggerForbidden };