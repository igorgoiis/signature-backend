import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateDocumentSignatoriesTable1755444541580
  implements MigrationInterface
{
  private readonly table = new Table({
    name: "document_signatories",
    columns: [
      {
        name: "id",
        type: "int",
        isPrimary: true,
        isGenerated: true,
        generationStrategy: "increment",
      },
      {
        name: "document_id",
        type: "int",
      },
      {
        name: "user_id",
        type: "int",
      },
      {
        name: "order",
        type: "int",
        default: 0,
      },
      {
        name: "status",
        type: "varchar",
        length: "255",
        default: "'PENDING'",
      },
      {
        name: "signed_at",
        type: "timestamp",
        isNullable: true,
      },
      {
        name: "rejection_reason",
        type: "text",
        isNullable: true,
      },
      {
        name: "created_at",
        type: "timestamp",
        default: "now()",
      },
      {
        name: "updated_at",
        type: "timestamp",
        default: "now()",
      },
      {
        name: "deleted_at",
        type: "timestamp",
        isNullable: true,
      },
    ],
  });

  private readonly signatoryDocUserIndex = new TableIndex({
    name: "IDX_SIGNATORY_DOC_USER",
    columnNames: ["document_id", "user_id"],
    isUnique: true,
  });

  private readonly signatoryDocOrderIndex = new TableIndex({
    name: "IDX_SIGNATORY_DOC_ORDER",
    columnNames: ["document_id", "order"],
  });

  private readonly signatoryDocumentForeignKey = new TableForeignKey({
    name: "FK_SIGNATORY_DOCUMENT",
    columnNames: ["document_id"],
    referencedTableName: "documents",
    referencedColumnNames: ["id"],
    onDelete: "CASCADE",
  });

  private readonly signatoryUserForeignKey = new TableForeignKey({
    name: "FK_SIGNATORY_USER",
    columnNames: ["user_id"],
    referencedTableName: "users",
    referencedColumnNames: ["id"],
    onDelete: "CASCADE",
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table, true);
    await queryRunner.createIndex(this.table, this.signatoryDocUserIndex);
    await queryRunner.createIndex(this.table, this.signatoryDocOrderIndex);
    await queryRunner.createForeignKey(
      this.table,
      this.signatoryDocumentForeignKey,
    );
    await queryRunner.createForeignKey(
      this.table,
      this.signatoryUserForeignKey,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      this.table,
      this.signatoryDocumentForeignKey,
    );
    await queryRunner.dropForeignKey(this.table, this.signatoryUserForeignKey);
    await queryRunner.dropIndex(this.table, this.signatoryDocUserIndex);
    await queryRunner.dropIndex(this.table, this.signatoryDocOrderIndex);
    await queryRunner.dropTable(this.table);
  }
}
