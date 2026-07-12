import { Module } from '@nestjs/common';
import { EhrenkindService } from './ehrenkind.service';

@Module({ providers: [EhrenkindService], exports: [EhrenkindService] })
export class EhrenkindModule {}
