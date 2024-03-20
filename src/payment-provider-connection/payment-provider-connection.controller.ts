import { Body, Controller, Logger, Post } from '@nestjs/common';
import { PaymentProviderConnectionService } from './payment-provider-connection.service';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';

/**
 * Controller for handling payment provider connections.
 */
@Controller('payment-provider-connection')
export class PaymentProviderConnectionController {
  constructor(
    private readonly logger: Logger,
    private readonly paymentProviderConnectionService: PaymentProviderConnectionService,
  ) {}

  @Post('update-payment-status')
  async updatePaymentStatus(
    @Body() updatePaymentStatusDto: UpdatePaymentStatusDto,
  ): Promise<any> {
    this.logger.log(
      `{updatePaymentStatus} Updating payment status with dto: ${JSON.stringify(updatePaymentStatusDto)}`,
    );

    return this.paymentProviderConnectionService.updatePaymentStatus(
      updatePaymentStatusDto.paymentId,
      updatePaymentStatusDto.status,
    );
  }
}
