import { Module } from '@nestjs/common';
import { NBCUniversalService } from './nbcuniversal.service';

@Module({ providers: [NBCUniversalService], exports: [NBCUniversalService] })
export class NBCUniversalModule {}
