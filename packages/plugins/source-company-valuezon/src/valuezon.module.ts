import { Module } from '@nestjs/common';
import { VALUEZONService } from './valuezon.service';

@Module({ providers: [VALUEZONService], exports: [VALUEZONService] })
export class VALUEZONModule {}
