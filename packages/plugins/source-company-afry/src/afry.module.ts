import { Module } from '@nestjs/common';
import { AFRYService } from './afry.service';

@Module({ providers: [AFRYService], exports: [AFRYService] })
export class AFRYModule {}
