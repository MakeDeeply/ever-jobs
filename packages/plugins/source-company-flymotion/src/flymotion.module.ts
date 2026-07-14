import { Module } from '@nestjs/common';
import { FlymotionService } from './flymotion.service';

@Module({
  providers: [FlymotionService],
  exports: [FlymotionService],
})
export class FlymotionModule {}
