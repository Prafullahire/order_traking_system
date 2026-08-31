import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'Logitech MX Master 3S', description: 'Product name' })
  @IsString()
  @IsNotEmpty({ message: 'Product name cannot be empty' })
  name: string;

  @ApiPropertyOptional({
    example: 'Ergonomic wireless performance mouse with ultra-fast scrolling',
    description: 'Product description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 99.99, description: 'Product price in USD' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a valid decimal number' })
  @IsPositive({ message: 'Price must be greater than 0' })
  price: number;

  @ApiProperty({ example: 100, description: 'Initial inventory quantity' })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Stock cannot be negative' })
  stock: number;
}
