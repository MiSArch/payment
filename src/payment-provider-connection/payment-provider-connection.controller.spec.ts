import { Test, TestingModule } from '@nestjs/testing';
import { PaymentProviderConnectionController } from './payment-provider-connection.controller';

describe('PaymentProviderConnectionController', () => {
  let controller: PaymentProviderConnectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentProviderConnectionController],
    }).compile();

    controller = module.get<PaymentProviderConnectionController>(PaymentProviderConnectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
