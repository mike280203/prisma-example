// Copyright (C) 2025 - present Juergen Zimmermann, Hochschule Karlsruhe
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Aufruf:   bun i
//           bun --env-file=.env prisma generate
//
//           bun --env-file=.env src\beispiele-write.mts

import { PrismaPg } from '@prisma/adapter-pg';
import process from 'node:process';
import { styleText } from 'node:util';
import { PrismaClient, type Prisma } from './generated/prisma/client.ts';

let message = styleText(
    'yellow',
    `process.env['DATABASE_URL']=${process.env['DATABASE_URL']}`,
);
console.log(message);
console.log();

const adapter = new PrismaPg({
    connectionString: process.env['DATABASE_URL_ADMIN'],
});

const log: (Prisma.LogLevel | Prisma.LogDefinition)[] = [
    {
        emit: 'event',
        level: 'query',
    },
    'info',
    'warn',
    'error',
];

// PrismaClient fuer DB "carrier" (siehe Umgebungsvariable DATABASE_URL in ".env")
// d.h. mit PostgreSQL-User "carrier" und Schema "carrier"
const prisma = new PrismaClient({
    adapter,
    errorFormat: 'pretty',
    log,
});
prisma.$on('query', (e) => {
    message = styleText('green', `Query: ${e.query}`);
    console.log(message);
    message = styleText('cyan', `Duration: ${e.duration} ms`);
    console.log(message);
});

const jetzt = new Date();

const neuerCarrier: Prisma.CarrierCreateInput = {
    name: 'USS Example',
    nation: 'USA',
    carrierType: 'AIRCRAFT_CARRIER',
    erzeugt: jetzt,
    aktualisiert: jetzt,
    // 1:1-Beziehung
    commandCenter: {
        create: {
            codeName: 'Bridge Alpha',
            securityLevel: 4,
        },
    },
    // 1:N-Beziehung
    aircraft: {
        create: [
            {
                model: 'F/A-18E Super Hornet',
                manufacturer: 'Boeing',
            },
            {
                model: 'E-2D Advanced Hawkeye',
                manufacturer: 'Northrop Grumman',
            },
        ],
    },
};
type CarrierCreated = Prisma.CarrierGetPayload<{
    include: {
        commandCenter: true;
        aircraft: true;
    };
}>;

const geaenderterCarrier: Prisma.CarrierUpdateInput = {
    version: { increment: 1 },
    nation: 'USA',
    carrierType: 'AIRCRAFT_CARRIER',
    aktualisiert: new Date(),
};
type CarrierUpdated = Prisma.CarrierGetPayload<{}>; // eslint-disable-line @typescript-eslint/no-empty-object-type

// Schreib-Operationen mit dem Model "Carrier"
try {
    await prisma.$connect();
    await prisma.$transaction(async (tx) => {
        // Neuer Datensatz mit generierter ID
        const carrierDb: CarrierCreated = await tx.carrier.create({
            data: neuerCarrier,
            include: { commandCenter: true, aircraft: true },
        });
        message = styleText(['black', 'bgWhite'], 'Generierte ID:');
        console.log(`${message} ${carrierDb.id}`);
        console.log();

        // Version +1 wegen "Optimistic Locking" bzw. Vermeidung von "Lost Updates"
        const carrierUpdated: CarrierUpdated = await tx.carrier.update({
            data: geaenderterCarrier,
            where: { id: 1000 },
        });
        // eslint-disable-next-line require-atomic-updates
        message = styleText(['black', 'bgWhite'], 'Aktualisierte Version:');
        console.log(`${message} ${carrierUpdated.version}`);
        console.log();

        // Cascading Delete loescht den Testdatensatz mit CommandCenter und Aircraft
        const geloescht = await tx.carrier.delete({
            where: { id: carrierDb.id },
        });
        // eslint-disable-next-line require-atomic-updates
        message = styleText(['black', 'bgWhite'], 'Geloescht:');
        console.log(`${message} ${geloescht.id}`);
    });
} finally {
    await prisma.$disconnect();
}
