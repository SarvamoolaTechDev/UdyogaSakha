import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

const mockService = {
  search: jest.fn(),
};

describe('SearchController', () => {
  let controller: SearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: mockService }],
    }).compile();
    controller = module.get<SearchController>(SearchController);
    jest.clearAllMocks();
  });

  it('search() passes all params to service and returns results', async () => {
    const searchResult = {
      hits: [{ id: 'opp-1', title: 'Developer role' }],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
      source: 'postgres' as const,
    };
    mockService.search.mockResolvedValue(searchResult);

    const result = await controller.search('developer', 'EMPLOYMENT_EXCHANGE', 1, 20);

    expect(mockService.search).toHaveBeenCalledWith('developer', {
      moduleType: 'EMPLOYMENT_EXCHANGE',
      page: 1,
      limit: 20,
    });
    expect(result.hits).toHaveLength(1);
    expect(result.source).toBe('postgres');
  });

  it('search() uses empty string default when no query provided', async () => {
    mockService.search.mockResolvedValue({ hits: [], total: 0, page: 1, limit: 20, totalPages: 0, source: 'postgres' as const });
    await controller.search();
    expect(mockService.search).toHaveBeenCalledWith('', expect.objectContaining({ page: 1, limit: 20 }));
  });

  it('search() omits moduleType when not provided', async () => {
    mockService.search.mockResolvedValue({ hits: [], total: 0, page: 1, limit: 20, totalPages: 0, source: 'postgres' as const });
    await controller.search('test', undefined, 2, 10);
    expect(mockService.search).toHaveBeenCalledWith('test', {
      moduleType: undefined,
      page: 2,
      limit: 10,
    });
  });
});
