-- Copyright (C) 2022 - present Juergen Zimmermann, Hochschule Karlsruhe
--
-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.

-- Aufruf:   psql --dbname=carrier --username=carrier --file=/init/carrier/sql/create-table.sql

-- TEXT statt varchar(n):
-- "There is no performance difference among these three types, apart from a few extra CPU cycles
-- to check the length when storing into a length-constrained column"
-- ggf. CHECK(char_length(nachname) <= 255)

SET default_tablespace = carrierspace;

CREATE SCHEMA IF NOT EXISTS AUTHORIZATION carrier;

ALTER ROLE carrier SET search_path = 'carrier';
SET search_path TO 'carrier';

-- https://www.postgresql.org/docs/current/sql-createtype.html
-- https://www.postgresql.org/docs/current/datatype-enum.html
CREATE TYPE carrier_type AS ENUM ('AIRCRAFT_CARRIER', 'HELICOPTER_CARRIER');

-- https://www.postgresql.org/docs/current/sql-createtable.html
-- https://www.postgresql.org/docs/current/datatype.html
CREATE TABLE IF NOT EXISTS carrier (
    id            integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY,
    version       integer NOT NULL DEFAULT 0,
    name          text NOT NULL UNIQUE,
    nation        text NOT NULL,
    carrier_type  carrier_type NOT NULL,
    erzeugt       timestamp NOT NULL,
    aktualisiert  timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS command_center (
    id              integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY,
    code_name       text NOT NULL,
    security_level  integer NOT NULL CHECK (security_level >= 1 AND security_level <= 5),
    carrier_id      integer NOT NULL UNIQUE REFERENCES carrier ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS aircraft (
    id            integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY,
    model         text NOT NULL,
    manufacturer  text NOT NULL,
    carrier_id    integer NOT NULL REFERENCES carrier ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS carrier_name_idx ON carrier(name);
CREATE INDEX IF NOT EXISTS aircraft_carrier_id_idx ON aircraft(carrier_id);
CREATE INDEX IF NOT EXISTS command_center_carrier_id_idx ON command_center(carrier_id);
