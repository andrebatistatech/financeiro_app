import { JWTUser } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: JWTUser;
    }
  }
}