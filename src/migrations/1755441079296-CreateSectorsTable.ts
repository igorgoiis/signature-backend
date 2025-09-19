import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateSectorsTable1755441079296 implements MigrationInterface {
  private readonly table = new Table({
    name: "sectors",
    columns: [
      {
        name: "id",
        type: "int",
        isPrimary: true,
        isGenerated: true,
        generationStrategy: "increment",
      },
      {
        name: "name",
        type: "varchar",
        isUnique: true,
      },
      {
        name: "description",
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

  private readonly tableIndex = new TableIndex({
    name: "IDX_SECTOR_NAME",
    columnNames: ["name"],
    isUnique: true,
  });
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table, true);
    await queryRunner.createIndex(this.table.name, this.tableIndex);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(this.table.name, this.tableIndex.name ?? "");
    await queryRunner.dropTable(this.table.name);
  }
}
