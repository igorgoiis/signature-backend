import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class RemoveFileColumnsDocumentTable1757371428073
  implements MigrationInterface
{
  private readonly tableName = "documents";
  private readonly columnsToRemove = [
    new TableColumn({
      name: "file_path",
      type: "varchar",
      length: "500",
    }),
    new TableColumn({
      name: "file_name",
      type: "varchar",
      length: "255",
    }),
    new TableColumn({
      name: "file_size",
      type: "bigint",
    }),
    new TableColumn({
      name: "mime_type",
      type: "varchar",
      length: "100",
    }),
    new TableColumn({
      name: "file_hash",
      type: "varchar",
      length: "64",
      isUnique: true,
    }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable(this.tableName);

    if (!hasTable) return;

    let hasColumnsToRemove = true;

    for (const column of this.columnsToRemove) {
      const hasColum = await queryRunner.hasColumn(this.tableName, column.name);

      if (!hasColum) {
        hasColumnsToRemove = false;
      }
    }

    if (hasColumnsToRemove) {
      await queryRunner.dropColumns(this.tableName, this.columnsToRemove);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable(this.tableName);

    if (!hasTable) return;

    let hasColumnsToRemove = false;

    for (const column of this.columnsToRemove) {
      const hasColum = await queryRunner.hasColumn(this.tableName, column.name);

      if (hasColum) {
        hasColumnsToRemove = true;
      }
    }

    if (!hasColumnsToRemove) {
      await queryRunner.addColumns(this.tableName, this.columnsToRemove);
    }
  }
}
