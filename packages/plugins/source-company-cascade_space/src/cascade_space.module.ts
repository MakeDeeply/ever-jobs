import { Module } from '@nestjs/common';
import { CascadeSpaceService } from './cascade_space.service';

@Module({
  providers: [CascadeSpaceService],
  exports: [CascadeSpaceService],
})
export class CascadeSpaceModule {}
