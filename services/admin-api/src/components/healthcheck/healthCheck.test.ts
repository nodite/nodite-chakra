import app from '@app';
import httpStatus from 'http-status';
import { agent as request } from 'supertest';

describe('Helathcheck API', () => {
  describe('GET /api/health', () => {
    test('should return 200 status if all OK', async () => {
      await request(app).get('/api/health').send().expect(httpStatus.OK);
    });
  });
});
