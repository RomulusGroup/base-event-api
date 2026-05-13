import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGalleryAndCategory1778674341690 implements MigrationInterface {
    name = 'AddGalleryAndCategory1778674341690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`events\` DROP COLUMN \`flyerUrl\``);
        await queryRunner.query(`ALTER TABLE \`events\` ADD \`galleryUrls\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD \`category\` varchar(50) NOT NULL DEFAULT 'general'`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD \`isFeatured\` tinyint NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`events\` DROP COLUMN \`isFeatured\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP COLUMN \`category\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP COLUMN \`galleryUrls\``);
        await queryRunner.query(`ALTER TABLE \`events\` ADD \`flyerUrl\` varchar(500) NULL`);
    }

}
