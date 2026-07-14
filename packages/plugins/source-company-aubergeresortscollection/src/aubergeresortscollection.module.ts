import { Module } from '@nestjs/common';
import { AubergeResortsCollectionService } from './aubergeresortscollection.service';

@Module({ providers: [AubergeResortsCollectionService], exports: [AubergeResortsCollectionService] })
export class AubergeResortsCollectionModule {}
