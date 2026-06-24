import { Module } from '@nestjs/common';
import { JsonLdService } from './jsonld.service';

@Module({
  providers: [JsonLdService],
  exports: [JsonLdService],
})
export class JsonLdModule {}
