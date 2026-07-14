import { Module } from '@nestjs/common';
import { AnagramService } from './anagram.service';

@Module({ providers: [AnagramService], exports: [AnagramService] })
export class AnagramModule {}
