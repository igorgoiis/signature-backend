import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateDocumentInstallmentsTable1755444297167
  implements MigrationInterface
{
  private readonly table = new Table({
    name: "document_installments",
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
        name: "installment_number",
        type: "int",
      },
      {
        name: "amount",
        type: "decimal",
        precision: 10,
        scale: 2,
      },
      {
        name: "due_date",
        type: "date",
      },
      {
        name: "description",
        type: "text",
        isNullable: true,
      },
      {
        name: "is_paid",
        type: "boolean",
        default: false,
      },
      {
        name: "paid_date",
        type: "date",
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

  private readonly installmentDocumentIndex = new TableIndex({
    name: "IDX_INSTALLMENT_DOCUMENT",
    columnNames: ["document_id"],
  });

  private readonly installmentDocumentForeignKey = new TableForeignKey({
    name: "FK_INSTALLMENT_DOCUMENT",
    columnNames: ["document_id"],
    referencedTableName: "documents",
    referencedColumnNames: ["id"],
    onDelete: "CASCADE",
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table);
    await queryRunner.createIndex(
      this.table.name,
      this.installmentDocumentIndex,
    );
    await queryRunner.createForeignKey(
      this.table.name,
      this.installmentDocumentForeignKey,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      this.table.name,
      this.installmentDocumentForeignKey,
    );
    await queryRunner.dropIndex(this.table.name, this.installmentDocumentIndex);
    await queryRunner.dropTable(this.table);
  }
}
