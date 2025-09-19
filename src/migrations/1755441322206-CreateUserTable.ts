import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateUserTable1755441322206 implements MigrationInterface {
  private readonly table = new Table({
    name: "users",
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
      },
      {
        name: "email",
        type: "varchar",
        isUnique: true,
      },
      {
        name: "password",
        type: "varchar",
      },
      {
        name: "role",
        type: "varchar",
        default: "'USER'",
      },
      {
        name: "sector_id",
        type: "int",
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
    name: "IDX_USER_EMAIL",
    columnNames: ["email"],
    isUnique: true,
  });

  private readonly foreignKey = new TableForeignKey({
    name: "FK_USER_SECTOR",
    columnNames: ["sector_id"],
    referencedTableName: this.table.name,
    referencedColumnNames: ["id"],
    onDelete: "SET NULL",
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table, true);
    await queryRunner.createIndex(this.table.name, this.tableIndex);
    await queryRunner.createForeignKey(this.table.name, this.foreignKey);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(this.table.name, this.foreignKey);
    await queryRunner.dropIndex(this.table.name, this.tableIndex.name ?? "");
    await queryRunner.dropTable(this.table.name);
  }
}
