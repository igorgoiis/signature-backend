
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignDocumentEntity1722456000000 implements MigrationInterface {
    name = 'AlignDocumentEntity1722456000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Rename columns to match the entity
        await queryRunner.query(`ALTER TABLE "documents" RENAME COLUMN "storagePath" TO "filePath"`);
        await queryRunner.query(`ALTER TABLE "documents" RENAME COLUMN "originalFilename" TO "fileName"`);
        await queryRunner.query(`ALTER TABLE "documents" RENAME COLUMN "size" TO "fileSize"`);
        
        // Add missing columns
        await queryRunner.query(`ALTER TABLE "documents" ADD "fileHash" character varying(64)`);
        await queryRunner.query(`ALTER TABLE "documents" ADD "dataVencimento" date`);
        
        // Update column types and constraints to match entity
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "title" TYPE character varying(255)`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "description" TYPE text`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "filePath" TYPE character varying(500)`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "fileName" TYPE character varying(255)`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "fileSize" TYPE bigint`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "mimeType" TYPE character varying(100)`);
        
        // Make ownerId nullable to match entity
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "ownerId" DROP NOT NULL`);
        
        // Remove columns that don't exist in entity
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "natureza"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "quantidadeParcelas"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN IF EXISTS "datasVencimento"`);
        
        // Update valor column to match entity precision
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "valor" TYPE numeric(10,2)`);
        
        // Generate fileHash for existing records (using a simple hash based on id and fileName)
        await queryRunner.query(`
            UPDATE "documents" 
            SET "fileHash" = md5(CONCAT(id::text, "fileName", EXTRACT(epoch FROM "createdAt")::text))
            WHERE "fileHash" IS NULL
        `);
        
        // Make fileHash unique and not null
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "fileHash" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "documents" ADD CONSTRAINT "UQ_documents_fileHash" UNIQUE ("fileHash")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove unique constraint and fileHash column
        await queryRunner.query(`ALTER TABLE "documents" DROP CONSTRAINT IF EXISTS "UQ_documents_fileHash"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "fileHash"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "dataVencimento"`);
        
        // Revert column renames
        await queryRunner.query(`ALTER TABLE "documents" RENAME COLUMN "filePath" TO "storagePath"`);
        await queryRunner.query(`ALTER TABLE "documents" RENAME COLUMN "fileName" TO "originalFilename"`);
        await queryRunner.query(`ALTER TABLE "documents" RENAME COLUMN "fileSize" TO "size"`);
        
        // Revert column types
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "fileSize" TYPE integer`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "valor" TYPE numeric(15,2)`);
        
        // Make ownerId not null again
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "ownerId" SET NOT NULL`);
        
        // Add back removed columns
        await queryRunner.query(`ALTER TABLE "documents" ADD "natureza" documents_natureza_enum`);
        await queryRunner.query(`ALTER TABLE "documents" ADD "quantidadeParcelas" integer DEFAULT 1`);
        await queryRunner.query(`ALTER TABLE "documents" ADD "datasVencimento" text`);
    }
}
