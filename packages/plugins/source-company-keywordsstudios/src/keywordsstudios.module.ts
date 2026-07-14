import { Module } from '@nestjs/common';
import { KeywordsStudiosService } from './keywordsstudios.service';

@Module({ providers: [KeywordsStudiosService], exports: [KeywordsStudiosService] })
export class KeywordsStudiosModule {}
