import { Module } from '@nestjs/common';
import { GaladyneService } from './galadyne.service';

@Module({
  providers: [GaladyneService],
  exports: [GaladyneService],
})
export class GaladyneModule {}
