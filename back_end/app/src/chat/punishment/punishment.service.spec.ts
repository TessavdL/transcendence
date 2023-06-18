import { Test, TestingModule } from '@nestjs/testing';
import { PunishmentService } from './punishment.service';

describe('PunishmentService', () => {
  let service: PunishmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PunishmentService],
    }).compile();

    service = module.get<PunishmentService>(PunishmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
