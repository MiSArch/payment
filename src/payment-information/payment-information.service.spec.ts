import { Test, TestingModule } from '@nestjs/testing';
import { PaymentInformationService } from './payment-information.service';

describe('PaymentInformationService', () => {
  let service: PaymentInformationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentInformationService],
    }).compile();

    service = module.get<PaymentInformationService>(PaymentInformationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
