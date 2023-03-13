import { Test, TestingModule } from '@nestjs/testing';
import { UserClientController } from './client.controller';

describe('UserClientController', () => {
  let controller: UserClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserClientController],
    }).compile();

    controller = module.get<UserClientController>(UserClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
