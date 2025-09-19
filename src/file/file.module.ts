import { Module } from "@nestjs/common";
import { FileService } from "./services/file.service";
import { FileController } from "./file.controller";
import { MinioService } from "./services/minio.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { File } from "./entities/file.entity";

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [FileService, MinioService],
  controllers: [FileController],
  exports: [FileService],
})
export class FileModule {}
