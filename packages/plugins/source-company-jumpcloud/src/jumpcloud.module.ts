import { Module } from '@nestjs/common';
import { JumpCloudService } from './jumpcloud.service';

@Module({ providers: [JumpCloudService], exports: [JumpCloudService] })
export class JumpCloudModule {}
