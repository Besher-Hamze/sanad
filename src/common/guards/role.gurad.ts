import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../enums/index.js';
import { ROLES_KEY } from '../decorator/role.decorator.js';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(), // الـ method
      context.getClass(), // الـ controller
    ]);
    if (!roles) return true; 
    const req= context.switchToHttp().getRequest();
    const user=req.user;
    if(user.role==UserRole.ADMIN){
      return true;
    }
    
    return roles.includes(user?.role);
  }
}
