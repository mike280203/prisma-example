// Copyright (C) 2025 - present Juergen Zimmermann, Hochschule Karlsruhe
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Aufruf:  bun i
//          bun --env-file=.env prisma generate
//
//          bun --env-file=.env src\beispiele.mts

import process from 'node:process';
import { styleText } from 'node:util';
import { PrismaPg } from '@prisma/adapter-pg';
import { prismaQueryInsights } from '@prisma/sqlcommenter-query-insights';
import {
    PrismaClient,
    type Carrier,
    type Prisma,
} from './generated/prisma/client.ts';

let message = styleText(['black', 'bgWhite'], 'Node version');
console.log(`${message}=${process.version}`);
message = styleText(['black', 'bgWhite'], 'DATABASE_URL');
console.log(`${message}=${process.env['DATABASE_URL']}`);
console.log();

const adapter = new PrismaPg({
    connectionString: process.env['DATABASE_URL'],
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

// PrismaClient passend zur Umgebungsvariable DATABASE_URL in ".env"
// d.h. mit PostgreSQL-User "carrier" und Schema "carrier"
const prisma = new PrismaClient({
    adapter,
    errorFormat: 'pretty',
    log,
    comments: [prismaQueryInsights()],
});
prisma.$on('query', (e) => {
    message = styleText('green', `Query: ${e.query}`);
    console.log(message);
    message = styleText('cyan', `Duration: ${e.duration} ms`);
    console.log(message);
});

export type CarrierMitCommandCenterUndAircraft = Prisma.CarrierGetPayload<{
    include: {
        commandCenter: true;
        aircraft: true;
    };
}>;

// Operationen mit dem Model "Carrier"
try {
    await prisma.$connect();

    // Das Resultat ist null, falls kein Datensatz gefunden wird
    const carrier: Carrier | null = await prisma.carrier.findUnique({
        where: { id: 1000 },
    });
    message = styleText(['black', 'bgWhite'], 'carrier');
    console.log(`${message} = %j`, carrier);
    console.log();

    // SELECT *
    // FROM   carrier
    // JOIN   command_center ON carrier.id = command_center.carrier_id
    // WHERE  command_center.security_level >= 3
    const carrierMitDetails: CarrierMitCommandCenterUndAircraft[] =
        await prisma.carrier.findMany({
            where: {
                commandCenter: {
                    securityLevel: {
                        gte: 3,
                    },
                },
            },
            // Fetch-Join mit CommandCenter und Aircraft
            include: {
                commandCenter: true,
                aircraft: true,
            },
        });
    message = styleText(['black', 'bgWhite'], 'carrierMitDetails');
    console.log(`${message} = %j`, carrierMitDetails);
    console.log();

    // higher-order function und arrow function
    const namen = carrierMitDetails.map((c) => c.name);
    message = styleText(['black', 'bgWhite'], 'namen');
    console.log(`${message} = %j`, namen);
    console.log();

    // union type
    const commandCenter = carrierMitDetails.map(
        (c) => c.commandCenter?.codeName,
    );
    message = styleText(['black', 'bgWhite'], 'commandCenter');
    console.log(`${message} = %j`, commandCenter);
    console.log();

    // Pagination
    const carrierPage2: Carrier[] = await prisma.carrier.findMany({
        skip: 5,
        take: 5,
    });
    message = styleText(['black', 'bgWhite'], 'carrierPage2');
    console.log(`${message} = %j`, carrierPage2);
    console.log();
} finally {
    await prisma.$disconnect();
}

// PrismaClient mit PostgreSQL-User "postgres", d.h. mit Administrationsrechten
const adapterAdmin = new PrismaPg({
    connectionString: process.env['DATABASE_URL_ADMIN'],
});
const prismaAdmin = new PrismaClient({ adapter: adapterAdmin });
try {
    const carrierAdmin: Carrier[] = await prismaAdmin.carrier.findMany({
        where: {
            name: {
                contains: 'a',
            },
        },
    });
    message = styleText(['black', 'bgWhite'], 'carrierAdmin');
    console.log(`${message} = ${JSON.stringify(carrierAdmin)}`);
} finally {
    await prismaAdmin.$disconnect();
}
