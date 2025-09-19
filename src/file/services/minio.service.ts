import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Minio from "minio";
import { Readable } from "stream";

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.getOrThrow<string>(
      "MINIO_BUCKET_NAME",
      "signatures",
    );

    try {
      this.minioClient = this.createMinioClient();
      this.ensureBucketExists();
    } catch (error) {
      this.logger.error("Failed to initialize MinioService", error.stack);
      throw error;
    }
  }

  private createMinioClient(): Minio.Client {
    const endpoint = this.configService.getOrThrow<string>("MINIO_ENDPOINT");
    const port = this.configService.getOrThrow<number>("MINIO_PORT");
    const accessKey = this.configService.getOrThrow<string>("MINIO_ACCESS_KEY");
    const secretKey = this.configService.getOrThrow<string>("MINIO_SECRET_KEY");
    const useSSL =
      this.configService.get<string>("MINIO_USE_SSL", "false") === "true";

    return new Minio.Client({
      endPoint: endpoint,
      port: port,
      useSSL: useSSL,
      accessKey: accessKey,
      secretKey: secretKey,
    });
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      this.logger.log(`Checking if bucket "${this.bucketName}" exists...`);
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);

      if (!bucketExists) {
        this.logger.log(`Creating bucket "${this.bucketName}"...`);
        await this.minioClient.makeBucket(this.bucketName, "us-east-1");
        this.logger.log(`Bucket "${this.bucketName}" created successfully`);
      }
    } catch (error) {
      this.logger.error(`Error ensuring bucket existence: ${error.message}`);
      throw new InternalServerErrorException(
        `Failed to ensure MinIO bucket exists: ${error.message}`,
      );
    }
  }

  async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    mimetype: string,
  ): Promise<{ etag: string; versionId?: string | null }> {
    const metaData = { "Content-Type": mimetype };

    try {
      this.logger.log(
        `Uploading file "${fileName}" (${fileBuffer.length} bytes)`,
      );
      const result = await this.minioClient.putObject(
        this.bucketName,
        fileName,
        fileBuffer,
        fileBuffer.length,
        metaData,
      );
      this.logger.log(`File "${fileName}" uploaded successfully`);
      return result;
    } catch (error) {
      this.logger.error(
        `Upload failed for file "${fileName}": ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Failed to upload file: ${error.message}`,
      );
    }
  }

  async downloadFile(fileName: string): Promise<Readable> {
    try {
      this.logger.log(`Downloading file "${fileName}"`);

      try {
        await this.minioClient.statObject(this.bucketName, fileName);
      } catch (error) {
        if (error.code === "NoSuchKey" || error.code === "NotFound") {
          throw new NotFoundException(`File "${fileName}" not found`);
        }
        throw error;
      }

      const stream = await this.minioClient.getObject(
        this.bucketName,
        fileName,
      );
      this.logger.log(`File "${fileName}" downloaded successfully`);
      return stream;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(
        `Download failed for file "${fileName}": ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Failed to download file: ${error.message}`,
      );
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      this.logger.log(`Deleting file "${fileName}"`);
      await this.minioClient.removeObject(this.bucketName, fileName);
      this.logger.log(`File "${fileName}" deleted successfully`);
    } catch (error) {
      this.logger.error(
        `Deletion failed for file "${fileName}": ${error.message}`,
      );
      throw new InternalServerErrorException(
        `Failed to delete file: ${error.message}`,
      );
    }
  }

  async fileExists(fileName: string): Promise<boolean> {
    try {
      await this.minioClient.statObject(this.bucketName, fileName);
      return true;
    } catch (error) {
      if (error.code === "NoSuchKey" || error.code === "NotFound") {
        return false;
      }
      throw new InternalServerErrorException(
        `Error checking if file exists: ${error.message}`,
      );
    }
  }
}
