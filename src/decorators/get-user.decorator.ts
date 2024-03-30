import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from 'src/modules/auth/enum/roles.enum';

export interface IUserRequest {
  role: Role;
  uuid: string;
  email: string;
  name: string;
  provider: string
}

export const GetUser = createParamDecorator((_data, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest();
  return user as IUserRequest;
});
