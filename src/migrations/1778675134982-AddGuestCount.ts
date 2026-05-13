import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGuestCount1778675134982 implements MigrationInterface {
    name = 'AddGuestCount1778675134982'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`attendees\` ADD \`guestCount\` int NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`attendees\` DROP COLUMN \`guestCount\``);
    }

}
