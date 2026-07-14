import { Module } from '@nestjs/common';
import { MannarinoSystemsSoftwareService } from './mannarinosystemssoftware.service';

@Module({ providers: [MannarinoSystemsSoftwareService], exports: [MannarinoSystemsSoftwareService] })
export class MannarinoSystemsSoftwareModule {}
