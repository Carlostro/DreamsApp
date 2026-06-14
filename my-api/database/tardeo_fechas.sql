-- Migración: añadir campos de fecha/hora de inicio y fin al producto Tardeo
ALTER TABLE Tardeo
  ADD COLUMN FechaInicio DATE NULL COMMENT 'Fecha de inicio de la promoción tardeo',
  ADD COLUMN HoraInicio TIME NULL COMMENT 'Hora de inicio de la promoción tardeo',
  ADD COLUMN FechaFin DATE NULL COMMENT 'Fecha de fin de la promoción tardeo',
  ADD COLUMN HoraFin TIME NULL COMMENT 'Hora de fin de la promoción tardeo';
