import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateDocumentAllocationTable1755444825739
  implements MigrationInterface
{
  private readonly table = new Table({
    name: "document_allocation",
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
        name: "filial",
        type: "varchar",
        length: "255",
      },
      {
        name: "centro_custo",
        type: "varchar",
        length: "255",
      },
      {
        name: "valor",
        type: "decimal",
        precision: 10,
        scale: 2,
      },
      {
        name: "percentual",
        type: "decimal",
        precision: 5,
        scale: 2,
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

  private readonly allocationDocumentIndex = new TableIndex({
    name: "IDX_ALLOCATION_DOCUMENT",
    columnNames: ["document_id"],
  });

  private readonly allocationDocumentForeignKey = new TableForeignKey({
    name: "FK_ALLOCATION_DOCUMENT",
    columnNames: ["document_id"],
    referencedTableName: "documents",
    referencedColumnNames: ["id"],
    onDelete: "CASCADE",
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table, true);
    await queryRunner.createIndex(
      this.table.name,
      this.allocationDocumentIndex,
    );
    await queryRunner.createForeignKey(
      this.table.name,
      this.allocationDocumentForeignKey,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      this.table.name,
      this.allocationDocumentForeignKey,
    );
    await queryRunner.dropIndex(this.table.name, this.allocationDocumentIndex);
    await queryRunner.dropTable(this.table);
  }
}
