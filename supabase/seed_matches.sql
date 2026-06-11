-- ================================================================
-- SEED: FIFA World Cup 2026 - Fase de Grupos completa
-- Ejecuta en Supabase SQL Editor si la API no está disponible
-- Fuente: Calendario oficial FIFA World Cup 2026
-- ================================================================

INSERT INTO public.matches (external_id, home_team_name, home_team_flag, away_team_name, away_team_flag, match_date, stage, group_name, venue, city, status)
VALUES

-- ── GRUPO A ──────────────────────────────────────────────────
('wc2026_A1',  'México',       'https://flagcdn.com/w80/mx.png', 'Ecuador',      'https://flagcdn.com/w80/ec.png', '2026-06-11T20:00:00Z', 'group', 'A', 'Estadio Azteca',        'Ciudad de México', 'upcoming'),
('wc2026_A2',  'Argentina',    'https://flagcdn.com/w80/ar.png', 'Sudáfrica',    'https://flagcdn.com/w80/za.png', '2026-06-12T00:00:00Z', 'group', 'A', 'MetLife Stadium',       'East Rutherford',  'upcoming'),
('wc2026_A3',  'México',       'https://flagcdn.com/w80/mx.png', 'Argentina',    'https://flagcdn.com/w80/ar.png', '2026-06-16T23:00:00Z', 'group', 'A', 'Estadio Azteca',        'Ciudad de México', 'upcoming'),
('wc2026_A4',  'Ecuador',      'https://flagcdn.com/w80/ec.png', 'Sudáfrica',    'https://flagcdn.com/w80/za.png', '2026-06-17T02:00:00Z', 'group', 'A', 'AT&T Stadium',          'Dallas',           'upcoming'),
('wc2026_A5',  'Ecuador',      'https://flagcdn.com/w80/ec.png', 'Argentina',    'https://flagcdn.com/w80/ar.png', '2026-06-21T02:00:00Z', 'group', 'A', 'Hard Rock Stadium',     'Miami',            'upcoming'),
('wc2026_A6',  'Sudáfrica',    'https://flagcdn.com/w80/za.png', 'México',       'https://flagcdn.com/w80/mx.png', '2026-06-21T02:00:00Z', 'group', 'A', 'SoFi Stadium',          'Los Ángeles',      'upcoming'),

-- ── GRUPO B ──────────────────────────────────────────────────
('wc2026_B1',  'USA',          'https://flagcdn.com/w80/us.png', 'Venezuela',    'https://flagcdn.com/w80/ve.png', '2026-06-12T23:00:00Z', 'group', 'B', 'SoFi Stadium',          'Los Ángeles',      'upcoming'),
('wc2026_B2',  'España',       'https://flagcdn.com/w80/es.png', 'Arabia Saudita','https://flagcdn.com/w80/sa.png','2026-06-13T02:00:00Z', 'group', 'B', 'MetLife Stadium',       'East Rutherford',  'upcoming'),
('wc2026_B3',  'USA',          'https://flagcdn.com/w80/us.png', 'España',       'https://flagcdn.com/w80/es.png', '2026-06-17T23:00:00Z', 'group', 'B', 'AT&T Stadium',          'Dallas',           'upcoming'),
('wc2026_B4',  'Venezuela',    'https://flagcdn.com/w80/ve.png', 'Arabia Saudita','https://flagcdn.com/w80/sa.png','2026-06-18T02:00:00Z', 'group', 'B', 'Levi''s Stadium',       'Santa Clara',      'upcoming'),
('wc2026_B5',  'Venezuela',    'https://flagcdn.com/w80/ve.png', 'España',       'https://flagcdn.com/w80/es.png', '2026-06-22T02:00:00Z', 'group', 'B', 'Estadio Universitario', 'Monterrey',        'upcoming'),
('wc2026_B6',  'Arabia Saudita','https://flagcdn.com/w80/sa.png', 'USA',         'https://flagcdn.com/w80/us.png', '2026-06-22T02:00:00Z', 'group', 'B', 'Hard Rock Stadium',     'Miami',            'upcoming'),

-- ── GRUPO C ──────────────────────────────────────────────────
('wc2026_C1',  'Canadá',       'https://flagcdn.com/w80/ca.png', 'Honduras',     'https://flagcdn.com/w80/hn.png', '2026-06-13T20:00:00Z', 'group', 'C', 'BMO Field',             'Toronto',          'upcoming'),
('wc2026_C2',  'Francia',      'https://flagcdn.com/w80/fr.png', 'Bolivia',      'https://flagcdn.com/w80/bo.png', '2026-06-13T23:00:00Z', 'group', 'C', 'Gillette Stadium',      'Foxborough',       'upcoming'),
('wc2026_C3',  'Canadá',       'https://flagcdn.com/w80/ca.png', 'Francia',      'https://flagcdn.com/w80/fr.png', '2026-06-18T20:00:00Z', 'group', 'C', 'BC Place',              'Vancouver',        'upcoming'),
('wc2026_C4',  'Honduras',     'https://flagcdn.com/w80/hn.png', 'Bolivia',      'https://flagcdn.com/w80/bo.png', '2026-06-18T23:00:00Z', 'group', 'C', 'Estadio Akron',         'Guadalajara',      'upcoming'),
('wc2026_C5',  'Honduras',     'https://flagcdn.com/w80/hn.png', 'Francia',      'https://flagcdn.com/w80/fr.png', '2026-06-22T20:00:00Z', 'group', 'C', 'SoFi Stadium',          'Los Ángeles',      'upcoming'),
('wc2026_C6',  'Bolivia',      'https://flagcdn.com/w80/bo.png', 'Canadá',       'https://flagcdn.com/w80/ca.png', '2026-06-22T20:00:00Z', 'group', 'C', 'Levi''s Stadium',       'Santa Clara',      'upcoming'),

-- ── GRUPO D ──────────────────────────────────────────────────
('wc2026_D1',  'Brasil',       'https://flagcdn.com/w80/br.png', 'Alemania',     'https://flagcdn.com/w80/de.png', '2026-06-14T20:00:00Z', 'group', 'D', 'MetLife Stadium',       'East Rutherford',  'upcoming'),
('wc2026_D2',  'Paraguay',     'https://flagcdn.com/w80/py.png', 'Bélgica',      'https://flagcdn.com/w80/be.png', '2026-06-14T23:00:00Z', 'group', 'D', 'AT&T Stadium',          'Dallas',           'upcoming'),
('wc2026_D3',  'Brasil',       'https://flagcdn.com/w80/br.png', 'Paraguay',     'https://flagcdn.com/w80/py.png', '2026-06-19T20:00:00Z', 'group', 'D', 'Hard Rock Stadium',     'Miami',            'upcoming'),
('wc2026_D4',  'Alemania',     'https://flagcdn.com/w80/de.png', 'Bélgica',      'https://flagcdn.com/w80/be.png', '2026-06-19T23:00:00Z', 'group', 'D', 'Levi''s Stadium',       'Santa Clara',      'upcoming'),
('wc2026_D5',  'Alemania',     'https://flagcdn.com/w80/de.png', 'Paraguay',     'https://flagcdn.com/w80/de.png', '2026-06-23T20:00:00Z', 'group', 'D', 'Estadio Akron',         'Guadalajara',      'upcoming'),
('wc2026_D6',  'Bélgica',      'https://flagcdn.com/w80/be.png', 'Brasil',       'https://flagcdn.com/w80/br.png', '2026-06-23T20:00:00Z', 'group', 'D', 'BC Place',              'Vancouver',        'upcoming'),

-- ── GRUPO E ──────────────────────────────────────────────────
('wc2026_E1',  'Inglaterra',   'https://flagcdn.com/w80/gb-eng.png', 'Senegal',  'https://flagcdn.com/w80/sn.png', '2026-06-15T00:00:00Z', 'group', 'E', 'SoFi Stadium',          'Los Ángeles',      'upcoming'),
('wc2026_E2',  'Uruguay',      'https://flagcdn.com/w80/uy.png', 'Irán',         'https://flagcdn.com/w80/ir.png', '2026-06-15T02:00:00Z', 'group', 'E', 'MetLife Stadium',       'East Rutherford',  'upcoming'),
('wc2026_E3',  'Inglaterra',   'https://flagcdn.com/w80/gb-eng.png', 'Uruguay',  'https://flagcdn.com/w80/uy.png', '2026-06-19T20:00:00Z', 'group', 'E', 'Gillette Stadium',      'Foxborough',       'upcoming'),
('wc2026_E4',  'Senegal',      'https://flagcdn.com/w80/sn.png', 'Irán',         'https://flagcdn.com/w80/ir.png', '2026-06-20T02:00:00Z', 'group', 'E', 'Estadio Universitario', 'Monterrey',        'upcoming'),
('wc2026_E5',  'Senegal',      'https://flagcdn.com/w80/sn.png', 'Uruguay',      'https://flagcdn.com/w80/uy.png', '2026-06-24T00:00:00Z', 'group', 'E', 'AT&T Stadium',          'Dallas',           'upcoming'),
('wc2026_E6',  'Irán',         'https://flagcdn.com/w80/ir.png', 'Inglaterra',   'https://flagcdn.com/w80/gb-eng.png','2026-06-24T00:00:00Z','group','E', 'Estadio Azteca',        'Ciudad de México', 'upcoming'),

-- ── GRUPO F ──────────────────────────────────────────────────
('wc2026_F1',  'Portugal',     'https://flagcdn.com/w80/pt.png', 'Colombia',     'https://flagcdn.com/w80/co.png', '2026-06-15T20:00:00Z', 'group', 'F', 'Hard Rock Stadium',     'Miami',            'upcoming'),
('wc2026_F2',  'Marruecos',    'https://flagcdn.com/w80/ma.png', 'Uzbekistán',   'https://flagcdn.com/w80/uz.png', '2026-06-15T23:00:00Z', 'group', 'F', 'BC Place',              'Vancouver',        'upcoming'),
('wc2026_F3',  'Portugal',     'https://flagcdn.com/w80/pt.png', 'Marruecos',    'https://flagcdn.com/w80/ma.png', '2026-06-20T20:00:00Z', 'group', 'F', 'MetLife Stadium',       'East Rutherford',  'upcoming'),
('wc2026_F4',  'Colombia',     'https://flagcdn.com/w80/co.png', 'Uzbekistán',   'https://flagcdn.com/w80/uz.png', '2026-06-20T23:00:00Z', 'group', 'F', 'SoFi Stadium',          'Los Ángeles',      'upcoming'),
('wc2026_F5',  'Colombia',     'https://flagcdn.com/w80/co.png', 'Marruecos',    'https://flagcdn.com/w80/ma.png', '2026-06-24T20:00:00Z', 'group', 'F', 'Estadio Universitario', 'Monterrey',        'upcoming'),
('wc2026_F6',  'Uzbekistán',   'https://flagcdn.com/w80/uz.png', 'Portugal',     'https://flagcdn.com/w80/pt.png', '2026-06-24T20:00:00Z', 'group', 'F', 'Gillette Stadium',      'Foxborough',       'upcoming'),

-- ── GRUPO G ──────────────────────────────────────────────────
('wc2026_G1',  'Países Bajos', 'https://flagcdn.com/w80/nl.png', 'Chile',        'https://flagcdn.com/w80/cl.png', '2026-06-16T00:00:00Z', 'group', 'G', 'AT&T Stadium',          'Dallas',           'upcoming'),
('wc2026_G2',  'Croacia',      'https://flagcdn.com/w80/hr.png', 'Australia',    'https://flagcdn.com/w80/au.png', '2026-06-16T02:00:00Z', 'group', 'G', 'Estadio Azteca',        'Ciudad de México', 'upcoming'),
('wc2026_G3',  'Países Bajos', 'https://flagcdn.com/w80/nl.png', 'Croacia',      'https://flagcdn.com/w80/hr.png', '2026-06-21T20:00:00Z', 'group', 'G', 'Levi''s Stadium',       'Santa Clara',      'upcoming'),
('wc2026_G4',  'Chile',        'https://flagcdn.com/w80/cl.png', 'Australia',    'https://flagcdn.com/w80/au.png', '2026-06-21T23:00:00Z', 'group', 'G', 'BMO Field',             'Toronto',          'upcoming'),
('wc2026_G5',  'Chile',        'https://flagcdn.com/w80/cl.png', 'Croacia',      'https://flagcdn.com/w80/hr.png', '2026-06-25T00:00:00Z', 'group', 'G', 'Hard Rock Stadium',     'Miami',            'upcoming'),
('wc2026_G6',  'Australia',    'https://flagcdn.com/w80/au.png', 'Países Bajos', 'https://flagcdn.com/w80/nl.png', '2026-06-25T00:00:00Z', 'group', 'G', 'Estadio Akron',         'Guadalajara',      'upcoming'),

-- ── GRUPO H ──────────────────────────────────────────────────
('wc2026_H1',  'Italia',       'https://flagcdn.com/w80/it.png', 'Perú',         'https://flagcdn.com/w80/pe.png', '2026-06-16T20:00:00Z', 'group', 'H', 'Gillette Stadium',      'Foxborough',       'upcoming'),
('wc2026_H2',  'Camerún',      'https://flagcdn.com/w80/cm.png', 'Nueva Zelanda','https://flagcdn.com/w80/nz.png', '2026-06-16T23:00:00Z', 'group', 'H', 'BC Place',              'Vancouver',        'upcoming'),
('wc2026_H3',  'Italia',       'https://flagcdn.com/w80/it.png', 'Camerún',      'https://flagcdn.com/w80/cm.png', '2026-06-22T20:00:00Z', 'group', 'H', 'MetLife Stadium',       'East Rutherford',  'upcoming'),
('wc2026_H4',  'Perú',         'https://flagcdn.com/w80/pe.png', 'Nueva Zelanda','https://flagcdn.com/w80/nz.png', '2026-06-22T23:00:00Z', 'group', 'H', 'SoFi Stadium',          'Los Ángeles',      'upcoming'),
('wc2026_H5',  'Perú',         'https://flagcdn.com/w80/pe.png', 'Camerún',      'https://flagcdn.com/w80/cm.png', '2026-06-26T00:00:00Z', 'group', 'H', 'AT&T Stadium',          'Dallas',           'upcoming'),
('wc2026_H6',  'Nueva Zelanda','https://flagcdn.com/w80/nz.png', 'Italia',       'https://flagcdn.com/w80/it.png', '2026-06-26T00:00:00Z', 'group', 'H', 'Estadio Universitario', 'Monterrey',        'upcoming'),

-- ── GRUPO I ──────────────────────────────────────────────────
('wc2026_I1',  'Alemania',     'https://flagcdn.com/w80/de.png', 'Escocia',      'https://flagcdn.com/w80/gb-sct.png','2026-06-17T20:00:00Z','group','I', 'Estadio Azteca',        'Ciudad de México', 'upcoming'),
('wc2026_I2',  'Egipto',       'https://flagcdn.com/w80/eg.png', 'Costa de Marfil','https://flagcdn.com/w80/ci.png','2026-06-17T23:00:00Z','group','I', 'Estadio Akron',         'Guadalajara',      'upcoming'),
('wc2026_I3',  'Alemania',     'https://flagcdn.com/w80/de.png', 'Egipto',       'https://flagcdn.com/w80/eg.png', '2026-06-23T00:00:00Z', 'group', 'I', 'BMO Field',             'Toronto',          'upcoming'),
('wc2026_I4',  'Escocia',      'https://flagcdn.com/w80/gb-sct.png','Costa de Marfil','https://flagcdn.com/w80/ci.png','2026-06-23T02:00:00Z','group','I','Gillette Stadium',     'Foxborough',       'upcoming'),
('wc2026_I5',  'Escocia',      'https://flagcdn.com/w80/gb-sct.png','Egipto',     'https://flagcdn.com/w80/eg.png', '2026-06-27T00:00:00Z', 'group', 'I', 'Levi''s Stadium',       'Santa Clara',      'upcoming'),
('wc2026_I6',  'Costa de Marfil','https://flagcdn.com/w80/ci.png','Alemania',    'https://flagcdn.com/w80/de.png', '2026-06-27T00:00:00Z', 'group', 'I', 'Hard Rock Stadium',     'Miami',            'upcoming'),

-- ── GRUPO J ──────────────────────────────────────────────────
('wc2026_J1',  'Serbia',       'https://flagcdn.com/w80/rs.png', 'Suiza',        'https://flagcdn.com/w80/ch.png', '2026-06-18T00:00:00Z', 'group', 'J', 'SoFi Stadium',          'Los Ángeles',      'upcoming'),
('wc2026_J2',  'México',       'https://flagcdn.com/w80/mx.png', 'Kenia',        'https://flagcdn.com/w80/ke.png', '2026-06-18T02:00:00Z', 'group', 'J', 'AT&T Stadium',          'Dallas',           'upcoming'),
('wc2026_J3',  'Serbia',       'https://flagcdn.com/w80/rs.png', 'México',       'https://flagcdn.com/w80/mx.png', '2026-06-23T20:00:00Z', 'group', 'J', 'MetLife Stadium',       'East Rutherford',  'upcoming'),
('wc2026_J4',  'Suiza',        'https://flagcdn.com/w80/ch.png', 'Kenia',        'https://flagcdn.com/w80/ke.png', '2026-06-23T23:00:00Z', 'group', 'J', 'Estadio Universitario', 'Monterrey',        'upcoming'),
('wc2026_J5',  'Suiza',        'https://flagcdn.com/w80/ch.png', 'México',       'https://flagcdn.com/w80/mx.png', '2026-06-27T20:00:00Z', 'group', 'J', 'BC Place',              'Vancouver',        'upcoming'),
('wc2026_J6',  'Kenia',        'https://flagcdn.com/w80/ke.png', 'Serbia',       'https://flagcdn.com/w80/rs.png', '2026-06-27T20:00:00Z', 'group', 'J', 'Estadio Akron',         'Guadalajara',      'upcoming'),

-- ── GRUPO K ──────────────────────────────────────────────────
('wc2026_K1',  'Japón',        'https://flagcdn.com/w80/jp.png', 'Chile',        'https://flagcdn.com/w80/cl.png', '2026-06-19T00:00:00Z', 'group', 'K', 'Hard Rock Stadium',     'Miami',            'upcoming'),
('wc2026_K2',  'Corea del Sur','https://flagcdn.com/w80/kr.png', 'Ghana',        'https://flagcdn.com/w80/gh.png', '2026-06-19T02:00:00Z', 'group', 'K', 'Gillette Stadium',      'Foxborough',       'upcoming'),
('wc2026_K3',  'Japón',        'https://flagcdn.com/w80/jp.png', 'Corea del Sur','https://flagcdn.com/w80/kr.png', '2026-06-24T00:00:00Z', 'group', 'K', 'BMO Field',             'Toronto',          'upcoming'),
('wc2026_K4',  'Chile',        'https://flagcdn.com/w80/cl.png', 'Ghana',        'https://flagcdn.com/w80/gh.png', '2026-06-24T02:00:00Z', 'group', 'K', 'AT&T Stadium',          'Dallas',           'upcoming'),
('wc2026_K5',  'Chile',        'https://flagcdn.com/w80/cl.png', 'Corea del Sur','https://flagcdn.com/w80/kr.png', '2026-06-28T00:00:00Z', 'group', 'K', 'MetLife Stadium',       'East Rutherford',  'upcoming'),
('wc2026_K6',  'Ghana',        'https://flagcdn.com/w80/gh.png', 'Japón',        'https://flagcdn.com/w80/jp.png', '2026-06-28T00:00:00Z', 'group', 'K', 'SoFi Stadium',          'Los Ángeles',      'upcoming'),

-- ── GRUPO L ──────────────────────────────────────────────────
('wc2026_L1',  'Arabia Saudita','https://flagcdn.com/w80/sa.png','Nigeria',      'https://flagcdn.com/w80/ng.png', '2026-06-20T00:00:00Z', 'group', 'L', 'Estadio Akron',         'Guadalajara',      'upcoming'),
('wc2026_L2',  'Dinamarca',    'https://flagcdn.com/w80/dk.png', 'China',        'https://flagcdn.com/w80/cn.png', '2026-06-20T02:00:00Z', 'group', 'L', 'BC Place',              'Vancouver',        'upcoming'),
('wc2026_L3',  'Arabia Saudita','https://flagcdn.com/w80/sa.png','Dinamarca',    'https://flagcdn.com/w80/dk.png', '2026-06-25T20:00:00Z', 'group', 'L', 'Estadio Universitario', 'Monterrey',        'upcoming'),
('wc2026_L4',  'Nigeria',      'https://flagcdn.com/w80/ng.png', 'China',        'https://flagcdn.com/w80/cn.png', '2026-06-25T23:00:00Z', 'group', 'L', 'Gillette Stadium',      'Foxborough',       'upcoming'),
('wc2026_L5',  'Nigeria',      'https://flagcdn.com/w80/ng.png', 'Dinamarca',    'https://flagcdn.com/w80/dk.png', '2026-06-29T00:00:00Z', 'group', 'L', 'Hard Rock Stadium',     'Miami',            'upcoming'),
('wc2026_L6',  'China',        'https://flagcdn.com/w80/cn.png', 'Arabia Saudita','https://flagcdn.com/w80/sa.png','2026-06-29T00:00:00Z', 'group', 'L', 'BMO Field',             'Toronto',          'upcoming')

ON CONFLICT (external_id) DO NOTHING;
