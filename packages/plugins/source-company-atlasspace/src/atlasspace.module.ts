import { Module } from '@nestjs/common';
import { AtlasspaceService } from './atlasspace.service';

@Module({
  providers: [AtlasspaceService],
  exports: [AtlasspaceService],
})
export class AtlasspaceModule {}
