import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.CONFIRMED,
    description: 'New order status to set',
  })
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  @IsNotEmpty()
  status: OrderStatus;

  @ApiPropertyOptional({
    example: 'Distribution Hub, Chicago, IL',
    description: 'Location where the status change occurred',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    example: 'Order packaged and ready for dispatch',
    description: 'Detailed status update message for tracking',
  })
  @IsOptional()
  @IsString()
  message?: string;
}
