import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * A guard that checks if the user has the required roles to access a route.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determines if the user has the required roles to access the route.
   * @param context - The execution context of the route.
   * @returns A boolean indicating if the user has the required roles.
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // query is not protected
    if (!requiredRoles) {
      return true;
    }

    // get graphql context
    const ctx = GqlExecutionContext.create(context);
    const { headers } = ctx.getContext().request;

    // check if user is authorized by gateway
    if (!headers['authorized-user']) {
      return false;
    }

    // extract information from headers
    const authorizedUser = JSON.parse(headers['authorized-user']);

    console.log(authorizedUser);

    // add user to request
    ctx.getContext().req.user = authorizedUser.id;

    // check if user has required roles
    const roles = authorizedUser.roles;
    return requiredRoles.some((role) => roles.includes(role));
  }
}
