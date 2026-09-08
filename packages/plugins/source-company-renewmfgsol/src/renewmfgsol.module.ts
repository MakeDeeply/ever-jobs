import { Module } from '@nestjs/common';
import { RenewmfgsolService } from './renewmfgsol.service';

@Module({
  providers: [RenewmfgsolService],
  exports: [RenewmfgsolService],
})
export class RenewmfgsolModule {}
