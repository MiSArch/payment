import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Custom decorator that retrieves the roles of the current user from the request object.
 * @param data - Additional data (optional).
 * @param context - The execution context.
 * @returns The current user roles.
 */
export const CurrentUserRoles = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.user.roles;
  },
);
