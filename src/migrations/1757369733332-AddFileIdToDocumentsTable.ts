import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AddFileIdToDocumentsTable1757369733332
  implements MigrationInterface
{
  private readonly tableName = "documents";
  private readonly column = new TableColumn({
    name: "file_id",
    type: "int",
  });

  private readonly documentFileForeignKey = new TableForeignKey({
    name: "FK_DOCUMENT_FILE",
    columnNames: ["file_id"],
    referencedTableName: "files",
    referencedColumnNames: ["id"],
    onDelete: "SET NULL",
  });

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable(this.tableName);

    if (!hasTable) return;

    await queryRunner.addColumn(this.tableName, this.column);

    await queryRunner.createForeignKey(
      this.tableName,
      this.documentFileForeignKey,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable(this.tableName);

    if (!hasTable) return;

    await queryRunner.dropForeignKey(
      this.tableName,
      this.documentFileForeignKey,
    );

    await queryRunner.dropColumn(this.tableName, this.column);
  }
}
