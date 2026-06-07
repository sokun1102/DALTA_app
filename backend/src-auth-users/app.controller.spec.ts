import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: { getHello: jest.fn(() => 'Dalta API is running!') },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('returns service health message', () => {
    expect(appController.getHello()).toBe('Dalta API is running!');
  });
});
