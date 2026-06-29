import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const TenantId = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): number | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const context = request.tenantContext || request.user;
    if (!context) return undefined;
    const tenantId = context.tenantId ?? context.sub ?? context.id;
    return tenantId ? Number(tenantId) : undefined;
  },
);
