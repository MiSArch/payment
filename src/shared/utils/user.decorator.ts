import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Custom decorator that retrieves the current user from the request object.
 * @param data - Additional data (optional).
 * @param context - The execution context.
 * @returns The current user id.
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    return { id: ctx.getContext().req.user.id };
  },
);
