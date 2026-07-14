import { Module } from '@nestjs/common';
import { LVMHPerfumesCosmeticsService } from './lvmhperfumescosmetics.service';

@Module({ providers: [LVMHPerfumesCosmeticsService], exports: [LVMHPerfumesCosmeticsService] })
export class LVMHPerfumesCosmeticsModule {}
