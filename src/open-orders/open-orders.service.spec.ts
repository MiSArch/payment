import { Test, TestingModule } from '@nestjs/testing';
import { OpenOrdersService } from './open-orders.service';

describe('OpenOrdersService', () => {
  let service: OpenOrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpenOrdersService],
    }).compile();

    service = module.get<OpenOrdersService>(OpenOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
