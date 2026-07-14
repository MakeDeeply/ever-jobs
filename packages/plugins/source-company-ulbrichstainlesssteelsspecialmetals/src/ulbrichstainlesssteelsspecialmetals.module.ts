import { Module } from '@nestjs/common';
import { UlbrichStainlessSteelsSpecialMetalsService } from './ulbrichstainlesssteelsspecialmetals.service';

@Module({ providers: [UlbrichStainlessSteelsSpecialMetalsService], exports: [UlbrichStainlessSteelsSpecialMetalsService] })
export class UlbrichStainlessSteelsSpecialMetalsModule {}
