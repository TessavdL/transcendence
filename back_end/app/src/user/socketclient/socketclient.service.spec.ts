import { Test, TestingModule } from '@nestjs/testing';
import { SocketclientService } from './socketclient.service';

describe('SocketclientService', () => {
  let service: SocketclientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SocketclientService],
    }).compile();

    service = module.get<SocketclientService>(SocketclientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
