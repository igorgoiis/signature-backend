import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from "typeorm";

export class CreateAuditLogsTable1755445177501 implements MigrationInterface {
  private readonly table = new Table({
    name: "audit_logs",
    columns: [
      {
        name: "id",
        type: "int",
        isPrimary: true,
        isGenerated: true,
        generationStrategy: "increment",
      },
      {
        name: "timestamp",
        type: "timestamp with time zone",
        default: "now()",
      },
      {
        name: "user_id",
        type: "int",
        isNullable: true,
      },
      {
        name: "action",
        type: "varchar",
        length: "100",
      },
      {
        name: "entity_type",
        type: "varchar",
        length: "100",
        isNullable: true,
      },
      {
        name: "entity_id",
        type: "int",
        isNullable: true,
      },
      {
        name: "details",
        type: "jsonb",
        isNullable: true,
      },
    ],
  });

  private readonly auditEntityIndex = new TableIndex({
    name: "IDX_AUDIT_ENTITY",
    columnNames: ["entity_type", "entity_id"],
  });

  private readonly auditUserIndex = new TableIndex({
    name: "IDX_AUDIT_USER",
    columnNames: ["user_id"],
  });

  private readonly auditActionIndex = new TableIndex({
    name: "IDX_AUDIT_ACTION",
    columnNames: ["action"],
  });

  private readonly auditTimestampIndex = new TableIndex({
    name: "IDX_AUDIT_TIMESTAMP",
    columnNames: ["timestamp"],
  });

  private readonly userForeignKey = new TableForeignKey({
    name: "FK_AUDIT_USER",
    columnNames: ["user_id"],
    referencedTableName: "users",
    referencedColumnNames: ["id"],
    onDelete: "SET NULL",
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(this.table, true);
    await queryRunner.createIndex(this.table, this.auditEntityIndex);
    await queryRunner.createIndex(this.table, this.auditUserIndex);
    await queryRunner.createIndex(this.table, this.auditActionIndex);
    await queryRunner.createIndex(this.table, this.auditTimestampIndex);
    await queryRunner.createForeignKey(this.table, this.userForeignKey);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(this.table, this.userForeignKey);
    await queryRunner.dropIndex(this.table, this.auditEntityIndex);
    await queryRunner.dropIndex(this.table, this.auditUserIndex);
    await queryRunner.dropIndex(this.table, this.auditActionIndex);
    await queryRunner.dropIndex(this.table, this.auditTimestampIndex);
    await queryRunner.dropTable(this.table);
  }
}
