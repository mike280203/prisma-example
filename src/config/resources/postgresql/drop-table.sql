-- Copyright (C) 2023 - present Juergen Zimmermann, Hochschule Karlsruhe
--
-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.

-- Aufruf:
-- docker compose exec db bash
-- psql --dbname=carrier --username=carrier --file=/sql/drop-table.sql

SET search_path TO 'carrier';

-- https://www.postgresql.org/docs/current/sql-droptable.html
DROP TABLE IF EXISTS aircraft CASCADE;
DROP TABLE IF EXISTS command_center CASCADE;
DROP TABLE IF EXISTS carrier CASCADE;

-- https://www.postgresql.org/docs/current/sql-droptype.html
DROP TYPE IF EXISTS carrier_type;
