import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class AddFilesTable1757367841730 implements MigrationInterface {
  private readonly table = new Table({
    name: "files",
    columns: [
      {
        name: "id",
        type: "int",
        isPrimary: true,
        isGenerated: true,
        generationStrategy: "increment",
      },
      {
        name: "file_path",
        type: "varchar",
        length: "500",
      },
      {
        name: "file_name",
        type: "varchar",
        length: "255",
      },
      {
        name: "file_size",
        type: "bigint",
      },
      {
        name: "mime_type",
        type: "varchar",
        length: "100",
      },
      {
        name: "file_hash",
        type: "varchar",
        length: "64",
        isUnique: true,
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

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable(this.table.name);

    if (!hasTable) {
      await queryRunner.createTable(this.table);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable(this.table.name);

    if (hasTable) {
      await queryRunner.dropTable(this.table);
    }
  }
}
