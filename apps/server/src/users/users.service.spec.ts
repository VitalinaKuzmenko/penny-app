import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../prisma/prisma.service';
import { WinstonLogger } from '../utils/logger/logger';

import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const prisma = {
    user: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: WinstonLogger,
          useValue: { info: jest.fn(), warn: jest.fn(), debug: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('looks users up by email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });

    await expect(service.findByEmail('a@b.com')).resolves.toEqual({ id: 'u1' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { userEmail: 'a@b.com' },
    });
  });

  it('returns null for an unknown id', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.findById('missing')).resolves.toBeNull();
  });
});
