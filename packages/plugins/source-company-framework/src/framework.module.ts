import { Module } from '@nestjs/common';
import { FrameworkService } from './framework.service';

@Module({
  providers: [FrameworkService],
  exports: [FrameworkService],
})
export class FrameworkModule {}
