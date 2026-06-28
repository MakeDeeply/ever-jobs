import { Module } from '@nestjs/common';
import { RazorpayService } from './razorpaysoftwareprivatelimited.service';

@Module({ providers: [RazorpayService], exports: [RazorpayService] })
export class RazorpayModule {}
