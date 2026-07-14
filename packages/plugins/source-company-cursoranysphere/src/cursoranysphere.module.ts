import { Module } from '@nestjs/common';
import { CursorAnysphereService } from './cursoranysphere.service';

@Module({ providers: [CursorAnysphereService], exports: [CursorAnysphereService] })
export class CursorAnysphereModule {}
