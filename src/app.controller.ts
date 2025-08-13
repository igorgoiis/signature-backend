import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery, ApiConsumes } from "@nestjs/swagger";

@Controller()
@ApiTags('Sistema')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
    @ApiOperation({
            summary: 'GET getHello',
            description: 'Endpoint GET para getHello'
          })
    @ApiBearerAuth()
    @ApiResponse({
              status: 200,
              description: 'Operação realizada com sucesso',
              
              example: {
      "message": "Operação realizada com sucesso"
    }
            })
    @ApiResponse({
              status: 400,
              description: 'Dados inválidos na requisição',
              
              example: {
      "statusCode": 400,
      "message": [
        "Dados inválidos"
      ],
      "error": "Bad Request"
    }
            })
    @ApiResponse({
              status: 401,
              description: 'Não autorizado',
              
              example: {
      "statusCode": 401,
      "message": "Unauthorized",
      "error": "Unauthorized"
    }
            })
    @ApiResponse({
              status: 404,
              description: 'Recurso não encontrado',
              
              example: {
      "statusCode": 404,
      "message": "Recurso não encontrado",
      "error": "Not Found"
    }
            })
    @ApiResponse({
              status: 500,
              description: 'Erro interno do servidor',
              
              example: {
      "statusCode": 500,
      "message": "Internal server error",
      "error": "Internal Server Error"
    }
            })
  getHello(): string {
    return this.appService.getHello();
  }
}
