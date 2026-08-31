import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../../orders/enums/order-status.enum';

export class CreateOrderTrackingDto {
  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.SHIPPED,
    description: 'Current status to log in tracking timeline',
  })
  @IsEnum(OrderStatus, { message: 'Invalid order status' })
  @IsNotEmpty()
  status: OrderStatus;

  @ApiProperty({
    example: 'Logistics Facility, Atlanta, GA',
    description: 'Current location of package or facility',
  })
  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string;

  @ApiProperty({
    example: 'Departed sorting facility and en route to next destination',
    description: 'Detailed checkpoint message',
  })
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  message: string;

  @ApiPropertyOptional({
    description: 'Whether to also update the master order status to this status',
    default: true,
  })
  @IsOptional()
  updateOrderStatus?: boolean = true;
}
