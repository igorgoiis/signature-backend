import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateSignaturesTable1755445016530 implements MigrationInterface {
  private readonly table = new Table({
    name: "signatures",
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
        name: "signature_data",
        type: "text",
      },
      {
        name: "position_data",
        type: "jsonb",
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

  private readonly signatureDocUserIndex = new TableIndex({
    name: "IDX_SIGNATURE_DOC_USER",
    columnNames: ["document_id", "user_id"],
  });

  private readonly signatureDocumentForeignKey = new TableForeignKey({
    name: "FK_SIGNATURE_DOCUMENT",
    columnNames: ["document_id"],
    referencedTableName: "documents",
    referencedColumnNames: ["id"],
    onDelete: "CASCADE",
  });

  private readonly signatureUserForeignKey = new TableForeignKey({
    name: "FK_SIGNATURE_USER",
    columnNames: ["user_id"],
    referencedTableName: "users",
    referencedColumnNames: ["id"],
    onDelete: "CASCADE",
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table, true);
    await queryRunner.createIndex(this.table, this.signatureDocUserIndex);
    await queryRunner.createForeignKey(
      this.table,
      this.signatureDocumentForeignKey,
    );
    await queryRunner.createForeignKey(
      this.table,
      this.signatureUserForeignKey,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      this.table,
      this.signatureDocumentForeignKey,
    );
    await queryRunner.dropForeignKey(this.table, this.signatureUserForeignKey);
    await queryRunner.dropIndex(this.table, this.signatureDocUserIndex);
    await queryRunner.dropTable(this.table);
  }
}
