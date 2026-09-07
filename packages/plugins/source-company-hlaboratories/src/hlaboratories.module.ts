import { Module } from '@nestjs/common';
import { HlaboratoriesService } from './hlaboratories.service';

@Module({
  providers: [HlaboratoriesService],
  exports: [HlaboratoriesService],
})
export class HlaboratoriesModule {}
