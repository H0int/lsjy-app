import { Controller, Post, Body, Logger, BadRequestException } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PaymentService } from "./payment.service";

@ApiTags("payment")
@Controller("payment")
export class PaymentCallbackController {
  private readonly logger = new Logger(PaymentCallbackController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post("callback/mock")
  @ApiOperation({ summary: "Mock payment callback (test only)" })
  async mockCallback(@Body() body: {
    transactionId: number;
    payChannel?: string;
    channelTradeNo?: string;
    success?: boolean;
  }) {
    if (!body.transactionId) throw new BadRequestException("transactionId is required");
    const channel = body.payChannel || "wechat";
    const tradeNo = body.channelTradeNo || "MOCK_" + Date.now();
    const success = body.success !== false;
    this.logger.warn("Mock callback: txId=" + body.transactionId + ", channel=" + channel);
    if (success) {
      await this.paymentService.confirmRecharge(body.transactionId, channel, tradeNo);
      return { data: { success: true, message: "Mock payment confirmed" } };
    }
    return { data: { success: true, message: "Mock payment failed (simulated)" } };
  }
}
