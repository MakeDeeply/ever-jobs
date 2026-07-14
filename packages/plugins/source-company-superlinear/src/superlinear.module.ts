import { Module } from '@nestjs/common';
import { SuperlinearService } from './superlinear.service';

@Module({ providers: [SuperlinearService], exports: [SuperlinearService] })
export class SuperlinearModule {}
