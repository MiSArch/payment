import { Test, TestingModule } from '@nestjs/testing';
import { PaymentInformationResolver } from './payment-information.resolver';
import { PaymentInformationService } from './payment-information.service';

describe('PaymentInformationResolver', () => {
  let resolver: PaymentInformationResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentInformationResolver, PaymentInformationService],
    }).compile();

    resolver = module.get<PaymentInformationResolver>(
      PaymentInformationResolver,
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
