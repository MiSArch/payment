import { Test, TestingModule } from '@nestjs/testing';
import { PaymentProviderConnectionService } from './payment-provider-connection.service';

describe('PaymentProviderConnectionService', () => {
  let service: PaymentProviderConnectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentProviderConnectionService],
    }).compile();

    service = module.get<PaymentProviderConnectionService>(PaymentProviderConnectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
