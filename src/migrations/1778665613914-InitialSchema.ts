import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1778665613914 implements MigrationInterface {
    name = 'InitialSchema1778665613914'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`events\` (\`id\` varchar(36) NOT NULL, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`date\` datetime NOT NULL, \`location\` varchar(255) NOT NULL, \`flyerUrl\` varchar(500) NULL, \`maxCapacity\` int NOT NULL DEFAULT '100', \`ticketPrefix\` varchar(10) NOT NULL DEFAULT 'BASE', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`attendees\` (\`id\` varchar(36) NOT NULL, \`fullName\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`phoneNumber\` varchar(50) NOT NULL, \`isAttending\` tinyint NOT NULL, \`bringingPlusOne\` tinyint NOT NULL DEFAULT 0, \`plusOneName\` varchar(255) NULL, \`ticketNumber\` varchar(100) NULL, \`checkedIn\` tinyint NOT NULL DEFAULT 0, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`eventId\` varchar(36) NULL, UNIQUE INDEX \`IDX_26867fb1383d362454919fd9af\` (\`email\`), UNIQUE INDEX \`IDX_a191fd5129493d029513901774\` (\`ticketNumber\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`attendees\` ADD CONSTRAINT \`FK_4925989ece225c9c203da5c225c\` FOREIGN KEY (\`eventId\`) REFERENCES \`events\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`attendees\` DROP FOREIGN KEY \`FK_4925989ece225c9c203da5c225c\``);
        await queryRunner.query(`DROP INDEX \`IDX_a191fd5129493d029513901774\` ON \`attendees\``);
        await queryRunner.query(`DROP INDEX \`IDX_26867fb1383d362454919fd9af\` ON \`attendees\``);
        await queryRunner.query(`DROP TABLE \`attendees\``);
        await queryRunner.query(`DROP TABLE \`events\``);
    }

}
