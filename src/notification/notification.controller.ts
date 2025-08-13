import { Controller } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes } from "@nestjs/swagger";

@Controller('notification')
@ApiTags('Notification')
export class NotificationController {}
