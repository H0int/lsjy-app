
import { Injectable, CanActivate, ExecutionContext, Logger, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AiGuard implements CanActivate {
  private readonly logger = new Logger(AiGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Quota check placeholder - integrate with your quota system
    // TODO: Check user AI quota before allowing request
    // const quotaRemaining = await this.quotaService.getRemaining(user.id);
    // if (quotaRemaining <= 0) throw new ForbiddenException('AI quota exceeded');

    this.logger.debug(`AI access granted for user ${user.id || user.sub}`);
    return true;
  }
}

