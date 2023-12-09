import { PasswordStrategy } from './passport.strategy';
import { RefreshJwtStrategy } from './refreshJwt.strategy';

export * from './passport.strategy';
export * from './refreshJwt.strategy';

export const STRATEGIES = [PasswordStrategy, RefreshJwtStrategy];
