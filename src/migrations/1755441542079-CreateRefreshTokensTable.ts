import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateRefreshTokensTable1755441542079
  implements MigrationInterface
{
  private readonly table = new Table({
    name: "refresh_tokens",
    columns: [
      {
        name: "id",
        type: "uuid",
        isPrimary: true,
        default: "uuid_generate_v4()",
      },
      {
        name: "user_id",
        type: "int",
      },
      {
        name: "hashed_token",
        type: "varchar",
      },
      {
        name: "expires_at",
        type: "timestamp with time zone",
      },
      {
        name: "is_revoked",
        type: "boolean",
        default: false,
      },
    ],
  });

  private readonly tableIndex = new TableIndex({
    name: "IDX_REFRESH_TOKEN_USER",
    columnNames: ["user_id"],
  });

  private readonly foreignKey = new TableForeignKey({
    name: "FK_REFRESH_TOKEN_USER",
    columnNames: ["user_id"],
    referencedTableName: "users",
    referencedColumnNames: ["id"],
    onDelete: "CASCADE",
  });
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table, true);
    await queryRunner.createIndex(this.table.name, this.tableIndex);
    await queryRunner.createForeignKey(this.table.name, this.foreignKey);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(this.table.name, this.foreignKey);
    await queryRunner.dropIndex(this.table.name, this.tableIndex);
    await queryRunner.dropTable(this.table);
  }
}
