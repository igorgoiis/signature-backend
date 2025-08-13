import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDocumentAllocationTable1754871479922 implements MigrationInterface {
    name = 'AddDocumentAllocationTable1754871479922'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "document_allocation" ("id" SERIAL NOT NULL, "documentId" integer NOT NULL, "filial" character varying(255) NOT NULL, "centroCusto" character varying(255) NOT NULL, "valor" numeric(10,2) NOT NULL, "percentual" numeric(5,2) NOT NULL, CONSTRAINT "PK_80a9a73e82ef703d760d82cdcf0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "quantidadeParcelas"`);
        // Update existing null titles to empty string before setting NOT NULL
        await queryRunner.query(`UPDATE "documents" SET "title" = COALESCE("title", '') WHERE "title" IS NULL`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "title" SET NOT NULL`);
        // Update existing null tipoDocumento to 'OTHER' before setting NOT NULL
        await queryRunner.query(`UPDATE "documents" SET "tipoDocumento" = COALESCE("tipoDocumento", 'OTHER') WHERE "tipoDocumento" IS NULL`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "tipoDocumento" SET NOT NULL`);
        // Update existing null natureza to empty string before setting NOT NULL
        await queryRunner.query(`UPDATE "documents" SET "natureza" = COALESCE("natureza", '') WHERE "natureza" IS NULL`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "natureza" SET NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."documents_status_enum" RENAME TO "documents_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."documents_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'SIGNING')`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "status" TYPE "public"."documents_status_enum" USING "status"::"text"::"public"."documents_status_enum"`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."documents_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "document_allocation" ADD CONSTRAINT "FK_0c910d452d4d24716597906ef9b" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_allocation" DROP CONSTRAINT "FK_0c910d452d4d24716597906ef9b"`);
        await queryRunner.query(`CREATE TYPE "public"."documents_status_enum_old" AS ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'SIGNING')`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "status" TYPE "public"."documents_status_enum_old" USING "status"::"text"::"public"."documents_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
        await queryRunner.query(`DROP TYPE "public"."documents_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."documents_status_enum_old" RENAME TO "documents_status_enum"`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "natureza" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "tipoDocumento" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "documents" ALTER COLUMN "title" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "documents" ADD "quantidadeParcelas" integer`);
        await queryRunner.query(`DROP TABLE "document_allocation"`);
    }

}


