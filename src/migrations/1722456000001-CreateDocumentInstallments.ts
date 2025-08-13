import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDocumentInstallments1722456000001 implements MigrationInterface {
    name = 'CreateDocumentInstallments1722456000001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create document_installments table
        await queryRunner.query(`
            CREATE TABLE "document_installments" (
                "id" SERIAL NOT NULL,
                "installmentNumber" integer NOT NULL,
                "amount" numeric(10,2) NOT NULL,
                "dueDate" date NOT NULL,
                "description" text,
                "isPaid" boolean NOT NULL DEFAULT false,
                "paidDate" date,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "documentId" integer NOT NULL,
                CONSTRAINT "PK_document_installments" PRIMARY KEY ("id")
            )
        `);

        // Add foreign key constraint
        await queryRunner.query(`
            ALTER TABLE "document_installments" 
            ADD CONSTRAINT "FK_document_installments_documentId" 
            FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE
        `);

        // Add index for better performance
        await queryRunner.query(`
            CREATE INDEX "IDX_document_installments_documentId" 
            ON "document_installments" ("documentId")
        `);

        // Add unique constraint to prevent duplicate installment numbers for the same document
        await queryRunner.query(`
            ALTER TABLE "document_installments" 
            ADD CONSTRAINT "UQ_document_installments_documentId_installmentNumber" 
            UNIQUE ("documentId", "installmentNumber")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop constraints and indexes
        await queryRunner.query(`ALTER TABLE "document_installments" DROP CONSTRAINT "UQ_document_installments_documentId_installmentNumber"`);
        await queryRunner.query(`DROP INDEX "IDX_document_installments_documentId"`);
        await queryRunner.query(`ALTER TABLE "document_installments" DROP CONSTRAINT "FK_document_installments_documentId"`);
        
        // Drop table
        await queryRunner.query(`DROP TABLE "document_installments"`);
    }
}
