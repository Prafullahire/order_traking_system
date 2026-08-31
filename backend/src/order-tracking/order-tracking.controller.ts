import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrderTrackingService } from './order-tracking.service';
import { CreateOrderTrackingDto } from './dto/create-order-tracking.dto';
import { OrderTracking } from './entities/order-tracking.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role.enum';

@ApiTags('Order Tracking')
@Controller('orders/:orderId/tracking')
export class OrderTrackingController {
  constructor(private readonly trackingService: OrderTrackingService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new tracking event checkpoint to an order (Admin only)' })
  @ApiResponse({ status: 201, description: 'Tracking event recorded', type: OrderTracking })
  @ApiResponse({ status: 404, description: 'Order not found' })
  create(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() dto: CreateOrderTrackingDto,
  ): Promise<OrderTracking> {
    return this.trackingService.create(orderId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tracking milestone events for an order' })
  @ApiResponse({ status: 200, description: 'List of tracking milestones', type: [OrderTracking] })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findByOrderId(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<OrderTracking[]> {
    return this.trackingService.findByOrderId(orderId);
  }
}
