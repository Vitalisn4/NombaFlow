import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiErrorCode } from '../../../common/errors/api-error-code';
import { ApiException } from '../../../common/errors/api.exception';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(err: Error | null, user: TUser): TUser {
    if (err instanceof ApiException) {
      throw err;
    }

    if (err instanceof UnauthorizedException) {
      throw new ApiException(
        ApiErrorCode.UNAUTHORIZED,
        'Missing or invalid access token.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (err || !user) {
      throw new ApiException(
        ApiErrorCode.UNAUTHORIZED,
        'Missing or invalid access token.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }
}
