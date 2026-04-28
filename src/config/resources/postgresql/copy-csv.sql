-- Copyright (C) 2022 - present Juergen Zimmermann, Hochschule Karlsruhe
--
-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.

-- Aufruf:   psql --dbname=carrier --username=postgres --file=/init/carrier/sql/copy-csv.sql

SET search_path TO carrier;

-- https://www.postgresql.org/docs/current/sql-copy.html
COPY carrier FROM '/init/carrier/csv/carrier.csv' (FORMAT csv, DELIMITER ';', HEADER true);
COPY command_center FROM '/init/carrier/csv/command_center.csv' (FORMAT csv, DELIMITER ';', HEADER true);
COPY aircraft FROM '/init/carrier/csv/aircraft.csv' (FORMAT csv, DELIMITER ';', HEADER true);
