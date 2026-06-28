import { Module } from '@nestjs/common';
import { MrBeastBeastIndustriesService } from './mrbeastyoutube.service';

@Module({ providers: [MrBeastBeastIndustriesService], exports: [MrBeastBeastIndustriesService] })
export class MrBeastBeastIndustriesModule {}
