import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetCurrenciesResponseDto } from 'schemas-nest';

import { Currency } from '../prisma/generated/prisma/client';

@ApiTags('Currencies')
@Controller('currencies')
export class CurrenciesController {
  @Get()
  @ApiOperation({ summary: 'Get supported currencies' })
  @ApiOkResponse({ type: GetCurrenciesResponseDto })
  getCurrencies(): GetCurrenciesResponseDto {
    return {
      currencies: Object.values(Currency).map((code) => ({
        code,
      })),
    };
  }
}
