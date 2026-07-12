import { Module } from '@nestjs/common';
import { ContactEnergyService } from './contactenergy.service';

@Module({ providers: [ContactEnergyService], exports: [ContactEnergyService] })
export class ContactEnergyModule {}
