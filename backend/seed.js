/**
 * seed.js — Inserta los 72 partidos de la fase de grupos directamente en Supabase.
 * Ejecutar UNA sola vez: node seed.js
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const matches = [
  // GRUPO A
  { external_id:'wc26_A1', home_team_name:'México',        home_team_flag:'https://flagcdn.com/w80/mx.png',     away_team_name:'Sudáfrica',     away_team_flag:'https://flagcdn.com/w80/za.png',     match_date:'2026-06-11T20:00:00Z', stage:'group', group_name:'A', venue:'Estadio Azteca',        city:'Ciudad de México' },
  { external_id:'wc26_A2', home_team_name:'Argentina',     home_team_flag:'https://flagcdn.com/w80/ar.png',     away_team_name:'Ecuador',       away_team_flag:'https://flagcdn.com/w80/ec.png',     match_date:'2026-06-12T00:00:00Z', stage:'group', group_name:'A', venue:'MetLife Stadium',        city:'East Rutherford' },
  { external_id:'wc26_A3', home_team_name:'México',        home_team_flag:'https://flagcdn.com/w80/mx.png',     away_team_name:'Argentina',     away_team_flag:'https://flagcdn.com/w80/ar.png',     match_date:'2026-06-16T23:00:00Z', stage:'group', group_name:'A', venue:'Estadio Azteca',        city:'Ciudad de México' },
  { external_id:'wc26_A4', home_team_name:'Ecuador',       home_team_flag:'https://flagcdn.com/w80/ec.png',     away_team_name:'Sudáfrica',     away_team_flag:'https://flagcdn.com/w80/za.png',     match_date:'2026-06-17T02:00:00Z', stage:'group', group_name:'A', venue:'AT&T Stadium',           city:'Dallas' },
  { external_id:'wc26_A5', home_team_name:'Ecuador',       home_team_flag:'https://flagcdn.com/w80/ec.png',     away_team_name:'Argentina',     away_team_flag:'https://flagcdn.com/w80/ar.png',     match_date:'2026-06-21T02:00:00Z', stage:'group', group_name:'A', venue:'Hard Rock Stadium',      city:'Miami' },
  { external_id:'wc26_A6', home_team_name:'Sudáfrica',     home_team_flag:'https://flagcdn.com/w80/za.png',     away_team_name:'México',        away_team_flag:'https://flagcdn.com/w80/mx.png',     match_date:'2026-06-21T02:00:00Z', stage:'group', group_name:'A', venue:'SoFi Stadium',           city:'Los Ángeles' },
  // GRUPO B
  { external_id:'wc26_B1', home_team_name:'USA',           home_team_flag:'https://flagcdn.com/w80/us.png',     away_team_name:'Venezuela',     away_team_flag:'https://flagcdn.com/w80/ve.png',     match_date:'2026-06-12T23:00:00Z', stage:'group', group_name:'B', venue:'SoFi Stadium',           city:'Los Ángeles' },
  { external_id:'wc26_B2', home_team_name:'España',        home_team_flag:'https://flagcdn.com/w80/es.png',     away_team_name:'Arabia Saudita',away_team_flag:'https://flagcdn.com/w80/sa.png',     match_date:'2026-06-13T02:00:00Z', stage:'group', group_name:'B', venue:'MetLife Stadium',        city:'East Rutherford' },
  { external_id:'wc26_B3', home_team_name:'USA',           home_team_flag:'https://flagcdn.com/w80/us.png',     away_team_name:'España',        away_team_flag:'https://flagcdn.com/w80/es.png',     match_date:'2026-06-17T23:00:00Z', stage:'group', group_name:'B', venue:'AT&T Stadium',           city:'Dallas' },
  { external_id:'wc26_B4', home_team_name:'Venezuela',     home_team_flag:'https://flagcdn.com/w80/ve.png',     away_team_name:'Arabia Saudita',away_team_flag:'https://flagcdn.com/w80/sa.png',     match_date:'2026-06-18T02:00:00Z', stage:'group', group_name:'B', venue:"Levi's Stadium",         city:'Santa Clara' },
  { external_id:'wc26_B5', home_team_name:'Venezuela',     home_team_flag:'https://flagcdn.com/w80/ve.png',     away_team_name:'España',        away_team_flag:'https://flagcdn.com/w80/es.png',     match_date:'2026-06-22T02:00:00Z', stage:'group', group_name:'B', venue:'Estadio Universitario',  city:'Monterrey' },
  { external_id:'wc26_B6', home_team_name:'Arabia Saudita',home_team_flag:'https://flagcdn.com/w80/sa.png',    away_team_name:'USA',           away_team_flag:'https://flagcdn.com/w80/us.png',     match_date:'2026-06-22T02:00:00Z', stage:'group', group_name:'B', venue:'Hard Rock Stadium',      city:'Miami' },
  // GRUPO C
  { external_id:'wc26_C1', home_team_name:'Canadá',        home_team_flag:'https://flagcdn.com/w80/ca.png',     away_team_name:'Honduras',      away_team_flag:'https://flagcdn.com/w80/hn.png',     match_date:'2026-06-13T20:00:00Z', stage:'group', group_name:'C', venue:'BMO Field',              city:'Toronto' },
  { external_id:'wc26_C2', home_team_name:'Francia',       home_team_flag:'https://flagcdn.com/w80/fr.png',     away_team_name:'Bolivia',       away_team_flag:'https://flagcdn.com/w80/bo.png',     match_date:'2026-06-13T23:00:00Z', stage:'group', group_name:'C', venue:'Gillette Stadium',       city:'Foxborough' },
  { external_id:'wc26_C3', home_team_name:'Canadá',        home_team_flag:'https://flagcdn.com/w80/ca.png',     away_team_name:'Francia',       away_team_flag:'https://flagcdn.com/w80/fr.png',     match_date:'2026-06-18T20:00:00Z', stage:'group', group_name:'C', venue:'BC Place',               city:'Vancouver' },
  { external_id:'wc26_C4', home_team_name:'Honduras',      home_team_flag:'https://flagcdn.com/w80/hn.png',     away_team_name:'Bolivia',       away_team_flag:'https://flagcdn.com/w80/bo.png',     match_date:'2026-06-18T23:00:00Z', stage:'group', group_name:'C', venue:'Estadio Akron',          city:'Guadalajara' },
  { external_id:'wc26_C5', home_team_name:'Honduras',      home_team_flag:'https://flagcdn.com/w80/hn.png',     away_team_name:'Francia',       away_team_flag:'https://flagcdn.com/w80/fr.png',     match_date:'2026-06-22T20:00:00Z', stage:'group', group_name:'C', venue:'SoFi Stadium',           city:'Los Ángeles' },
  { external_id:'wc26_C6', home_team_name:'Bolivia',       home_team_flag:'https://flagcdn.com/w80/bo.png',     away_team_name:'Canadá',        away_team_flag:'https://flagcdn.com/w80/ca.png',     match_date:'2026-06-22T20:00:00Z', stage:'group', group_name:'C', venue:"Levi's Stadium",         city:'Santa Clara' },
  // GRUPO D
  { external_id:'wc26_D1', home_team_name:'Brasil',        home_team_flag:'https://flagcdn.com/w80/br.png',     away_team_name:'Alemania',      away_team_flag:'https://flagcdn.com/w80/de.png',     match_date:'2026-06-14T20:00:00Z', stage:'group', group_name:'D', venue:'MetLife Stadium',        city:'East Rutherford' },
  { external_id:'wc26_D2', home_team_name:'Paraguay',      home_team_flag:'https://flagcdn.com/w80/py.png',     away_team_name:'Bélgica',       away_team_flag:'https://flagcdn.com/w80/be.png',     match_date:'2026-06-14T23:00:00Z', stage:'group', group_name:'D', venue:'AT&T Stadium',           city:'Dallas' },
  { external_id:'wc26_D3', home_team_name:'Brasil',        home_team_flag:'https://flagcdn.com/w80/br.png',     away_team_name:'Paraguay',      away_team_flag:'https://flagcdn.com/w80/py.png',     match_date:'2026-06-19T20:00:00Z', stage:'group', group_name:'D', venue:'Hard Rock Stadium',      city:'Miami' },
  { external_id:'wc26_D4', home_team_name:'Alemania',      home_team_flag:'https://flagcdn.com/w80/de.png',     away_team_name:'Bélgica',       away_team_flag:'https://flagcdn.com/w80/be.png',     match_date:'2026-06-19T23:00:00Z', stage:'group', group_name:'D', venue:"Levi's Stadium",         city:'Santa Clara' },
  { external_id:'wc26_D5', home_team_name:'Alemania',      home_team_flag:'https://flagcdn.com/w80/de.png',     away_team_name:'Paraguay',      away_team_flag:'https://flagcdn.com/w80/py.png',     match_date:'2026-06-23T20:00:00Z', stage:'group', group_name:'D', venue:'Estadio Akron',          city:'Guadalajara' },
  { external_id:'wc26_D6', home_team_name:'Bélgica',       home_team_flag:'https://flagcdn.com/w80/be.png',     away_team_name:'Brasil',        away_team_flag:'https://flagcdn.com/w80/br.png',     match_date:'2026-06-23T20:00:00Z', stage:'group', group_name:'D', venue:'BC Place',               city:'Vancouver' },
  // GRUPO E
  { external_id:'wc26_E1', home_team_name:'Inglaterra',    home_team_flag:'https://flagcdn.com/w80/gb-eng.png', away_team_name:'Senegal',       away_team_flag:'https://flagcdn.com/w80/sn.png',     match_date:'2026-06-15T00:00:00Z', stage:'group', group_name:'E', venue:'SoFi Stadium',           city:'Los Ángeles' },
  { external_id:'wc26_E2', home_team_name:'Uruguay',       home_team_flag:'https://flagcdn.com/w80/uy.png',     away_team_name:'Irán',          away_team_flag:'https://flagcdn.com/w80/ir.png',     match_date:'2026-06-15T02:00:00Z', stage:'group', group_name:'E', venue:'MetLife Stadium',        city:'East Rutherford' },
  { external_id:'wc26_E3', home_team_name:'Inglaterra',    home_team_flag:'https://flagcdn.com/w80/gb-eng.png', away_team_name:'Uruguay',       away_team_flag:'https://flagcdn.com/w80/uy.png',     match_date:'2026-06-19T20:00:00Z', stage:'group', group_name:'E', venue:'Gillette Stadium',       city:'Foxborough' },
  { external_id:'wc26_E4', home_team_name:'Senegal',       home_team_flag:'https://flagcdn.com/w80/sn.png',     away_team_name:'Irán',          away_team_flag:'https://flagcdn.com/w80/ir.png',     match_date:'2026-06-20T02:00:00Z', stage:'group', group_name:'E', venue:'Estadio Universitario',  city:'Monterrey' },
  { external_id:'wc26_E5', home_team_name:'Senegal',       home_team_flag:'https://flagcdn.com/w80/sn.png',     away_team_name:'Uruguay',       away_team_flag:'https://flagcdn.com/w80/uy.png',     match_date:'2026-06-24T00:00:00Z', stage:'group', group_name:'E', venue:'AT&T Stadium',           city:'Dallas' },
  { external_id:'wc26_E6', home_team_name:'Irán',          home_team_flag:'https://flagcdn.com/w80/ir.png',     away_team_name:'Inglaterra',    away_team_flag:'https://flagcdn.com/w80/gb-eng.png', match_date:'2026-06-24T00:00:00Z', stage:'group', group_name:'E', venue:'Estadio Azteca',         city:'Ciudad de México' },
  // GRUPO F
  { external_id:'wc26_F1', home_team_name:'Portugal',      home_team_flag:'https://flagcdn.com/w80/pt.png',     away_team_name:'Colombia',      away_team_flag:'https://flagcdn.com/w80/co.png',     match_date:'2026-06-15T20:00:00Z', stage:'group', group_name:'F', venue:'Hard Rock Stadium',      city:'Miami' },
  { external_id:'wc26_F2', home_team_name:'Marruecos',     home_team_flag:'https://flagcdn.com/w80/ma.png',     away_team_name:'Uzbekistán',    away_team_flag:'https://flagcdn.com/w80/uz.png',     match_date:'2026-06-15T23:00:00Z', stage:'group', group_name:'F', venue:'BC Place',               city:'Vancouver' },
  { external_id:'wc26_F3', home_team_name:'Portugal',      home_team_flag:'https://flagcdn.com/w80/pt.png',     away_team_name:'Marruecos',     away_team_flag:'https://flagcdn.com/w80/ma.png',     match_date:'2026-06-20T20:00:00Z', stage:'group', group_name:'F', venue:'MetLife Stadium',        city:'East Rutherford' },
  { external_id:'wc26_F4', home_team_name:'Colombia',      home_team_flag:'https://flagcdn.com/w80/co.png',     away_team_name:'Uzbekistán',    away_team_flag:'https://flagcdn.com/w80/uz.png',     match_date:'2026-06-20T23:00:00Z', stage:'group', group_name:'F', venue:'SoFi Stadium',           city:'Los Ángeles' },
  { external_id:'wc26_F5', home_team_name:'Colombia',      home_team_flag:'https://flagcdn.com/w80/co.png',     away_team_name:'Marruecos',     away_team_flag:'https://flagcdn.com/w80/ma.png',     match_date:'2026-06-24T20:00:00Z', stage:'group', group_name:'F', venue:'Estadio Universitario',  city:'Monterrey' },
  { external_id:'wc26_F6', home_team_name:'Uzbekistán',    home_team_flag:'https://flagcdn.com/w80/uz.png',     away_team_name:'Portugal',      away_team_flag:'https://flagcdn.com/w80/pt.png',     match_date:'2026-06-24T20:00:00Z', stage:'group', group_name:'F', venue:'Gillette Stadium',       city:'Foxborough' },
  // GRUPO G
  { external_id:'wc26_G1', home_team_name:'Países Bajos',  home_team_flag:'https://flagcdn.com/w80/nl.png',     away_team_name:'Chile',         away_team_flag:'https://flagcdn.com/w80/cl.png',     match_date:'2026-06-16T00:00:00Z', stage:'group', group_name:'G', venue:'AT&T Stadium',           city:'Dallas' },
  { external_id:'wc26_G2', home_team_name:'Croacia',       home_team_flag:'https://flagcdn.com/w80/hr.png',     away_team_name:'Australia',     away_team_flag:'https://flagcdn.com/w80/au.png',     match_date:'2026-06-16T02:00:00Z', stage:'group', group_name:'G', venue:'Estadio Azteca',         city:'Ciudad de México' },
  { external_id:'wc26_G3', home_team_name:'Países Bajos',  home_team_flag:'https://flagcdn.com/w80/nl.png',     away_team_name:'Croacia',       away_team_flag:'https://flagcdn.com/w80/hr.png',     match_date:'2026-06-21T20:00:00Z', stage:'group', group_name:'G', venue:"Levi's Stadium",         city:'Santa Clara' },
  { external_id:'wc26_G4', home_team_name:'Chile',         home_team_flag:'https://flagcdn.com/w80/cl.png',     away_team_name:'Australia',     away_team_flag:'https://flagcdn.com/w80/au.png',     match_date:'2026-06-21T23:00:00Z', stage:'group', group_name:'G', venue:'BMO Field',              city:'Toronto' },
  { external_id:'wc26_G5', home_team_name:'Chile',         home_team_flag:'https://flagcdn.com/w80/cl.png',     away_team_name:'Croacia',       away_team_flag:'https://flagcdn.com/w80/hr.png',     match_date:'2026-06-25T00:00:00Z', stage:'group', group_name:'G', venue:'Hard Rock Stadium',      city:'Miami' },
  { external_id:'wc26_G6', home_team_name:'Australia',     home_team_flag:'https://flagcdn.com/w80/au.png',     away_team_name:'Países Bajos',  away_team_flag:'https://flagcdn.com/w80/nl.png',     match_date:'2026-06-25T00:00:00Z', stage:'group', group_name:'G', venue:'Estadio Akron',          city:'Guadalajara' },
  // GRUPO H
  { external_id:'wc26_H1', home_team_name:'Italia',        home_team_flag:'https://flagcdn.com/w80/it.png',     away_team_name:'Perú',          away_team_flag:'https://flagcdn.com/w80/pe.png',     match_date:'2026-06-16T20:00:00Z', stage:'group', group_name:'H', venue:'Gillette Stadium',       city:'Foxborough' },
  { external_id:'wc26_H2', home_team_name:'Camerún',       home_team_flag:'https://flagcdn.com/w80/cm.png',     away_team_name:'Nueva Zelanda', away_team_flag:'https://flagcdn.com/w80/nz.png',     match_date:'2026-06-16T23:00:00Z', stage:'group', group_name:'H', venue:'BC Place',               city:'Vancouver' },
  { external_id:'wc26_H3', home_team_name:'Italia',        home_team_flag:'https://flagcdn.com/w80/it.png',     away_team_name:'Camerún',       away_team_flag:'https://flagcdn.com/w80/cm.png',     match_date:'2026-06-22T20:00:00Z', stage:'group', group_name:'H', venue:'MetLife Stadium',        city:'East Rutherford' },
  { external_id:'wc26_H4', home_team_name:'Perú',          home_team_flag:'https://flagcdn.com/w80/pe.png',     away_team_name:'Nueva Zelanda', away_team_flag:'https://flagcdn.com/w80/nz.png',     match_date:'2026-06-22T23:00:00Z', stage:'group', group_name:'H', venue:'SoFi Stadium',           city:'Los Ángeles' },
  { external_id:'wc26_H5', home_team_name:'Perú',          home_team_flag:'https://flagcdn.com/w80/pe.png',     away_team_name:'Camerún',       away_team_flag:'https://flagcdn.com/w80/cm.png',     match_date:'2026-06-26T00:00:00Z', stage:'group', group_name:'H', venue:'AT&T Stadium',           city:'Dallas' },
  { external_id:'wc26_H6', home_team_name:'Nueva Zelanda', home_team_flag:'https://flagcdn.com/w80/nz.png',     away_team_name:'Italia',        away_team_flag:'https://flagcdn.com/w80/it.png',     match_date:'2026-06-26T00:00:00Z', stage:'group', group_name:'H', venue:'Estadio Universitario',  city:'Monterrey' },
  // GRUPO I
  { external_id:'wc26_I1', home_team_name:'Alemania',      home_team_flag:'https://flagcdn.com/w80/de.png',     away_team_name:'Escocia',       away_team_flag:'https://flagcdn.com/w80/gb-sct.png', match_date:'2026-06-17T20:00:00Z', stage:'group', group_name:'I', venue:'Estadio Azteca',         city:'Ciudad de México' },
  { external_id:'wc26_I2', home_team_name:'Egipto',        home_team_flag:'https://flagcdn.com/w80/eg.png',     away_team_name:'Costa de Marfil',away_team_flag:'https://flagcdn.com/w80/ci.png',    match_date:'2026-06-17T23:00:00Z', stage:'group', group_name:'I', venue:'Estadio Akron',          city:'Guadalajara' },
  { external_id:'wc26_I3', home_team_name:'Alemania',      home_team_flag:'https://flagcdn.com/w80/de.png',     away_team_name:'Egipto',        away_team_flag:'https://flagcdn.com/w80/eg.png',     match_date:'2026-06-23T00:00:00Z', stage:'group', group_name:'I', venue:'BMO Field',              city:'Toronto' },
  { external_id:'wc26_I4', home_team_name:'Escocia',       home_team_flag:'https://flagcdn.com/w80/gb-sct.png', away_team_name:'Costa de Marfil',away_team_flag:'https://flagcdn.com/w80/ci.png',    match_date:'2026-06-23T02:00:00Z', stage:'group', group_name:'I', venue:'Gillette Stadium',       city:'Foxborough' },
  { external_id:'wc26_I5', home_team_name:'Escocia',       home_team_flag:'https://flagcdn.com/w80/gb-sct.png', away_team_name:'Egipto',        away_team_flag:'https://flagcdn.com/w80/eg.png',     match_date:'2026-06-27T00:00:00Z', stage:'group', group_name:'I', venue:"Levi's Stadium",         city:'Santa Clara' },
  { external_id:'wc26_I6', home_team_name:'Costa de Marfil',home_team_flag:'https://flagcdn.com/w80/ci.png',   away_team_name:'Alemania',      away_team_flag:'https://flagcdn.com/w80/de.png',     match_date:'2026-06-27T00:00:00Z', stage:'group', group_name:'I', venue:'Hard Rock Stadium',      city:'Miami' },
  // GRUPO J
  { external_id:'wc26_J1', home_team_name:'Serbia',        home_team_flag:'https://flagcdn.com/w80/rs.png',     away_team_name:'Suiza',         away_team_flag:'https://flagcdn.com/w80/ch.png',     match_date:'2026-06-18T00:00:00Z', stage:'group', group_name:'J', venue:'SoFi Stadium',           city:'Los Ángeles' },
  { external_id:'wc26_J2', home_team_name:'México',        home_team_flag:'https://flagcdn.com/w80/mx.png',     away_team_name:'Kenia',         away_team_flag:'https://flagcdn.com/w80/ke.png',     match_date:'2026-06-18T02:00:00Z', stage:'group', group_name:'J', venue:'AT&T Stadium',           city:'Dallas' },
  { external_id:'wc26_J3', home_team_name:'Serbia',        home_team_flag:'https://flagcdn.com/w80/rs.png',     away_team_name:'México',        away_team_flag:'https://flagcdn.com/w80/mx.png',     match_date:'2026-06-23T20:00:00Z', stage:'group', group_name:'J', venue:'MetLife Stadium',        city:'East Rutherford' },
  { external_id:'wc26_J4', home_team_name:'Suiza',         home_team_flag:'https://flagcdn.com/w80/ch.png',     away_team_name:'Kenia',         away_team_flag:'https://flagcdn.com/w80/ke.png',     match_date:'2026-06-23T23:00:00Z', stage:'group', group_name:'J', venue:'Estadio Universitario',  city:'Monterrey' },
  { external_id:'wc26_J5', home_team_name:'Suiza',         home_team_flag:'https://flagcdn.com/w80/ch.png',     away_team_name:'México',        away_team_flag:'https://flagcdn.com/w80/mx.png',     match_date:'2026-06-27T20:00:00Z', stage:'group', group_name:'J', venue:'BC Place',               city:'Vancouver' },
  { external_id:'wc26_J6', home_team_name:'Kenia',         home_team_flag:'https://flagcdn.com/w80/ke.png',     away_team_name:'Serbia',        away_team_flag:'https://flagcdn.com/w80/rs.png',     match_date:'2026-06-27T20:00:00Z', stage:'group', group_name:'J', venue:'Estadio Akron',          city:'Guadalajara' },
  // GRUPO K
  { external_id:'wc26_K1', home_team_name:'Japón',         home_team_flag:'https://flagcdn.com/w80/jp.png',     away_team_name:'Chile',         away_team_flag:'https://flagcdn.com/w80/cl.png',     match_date:'2026-06-19T00:00:00Z', stage:'group', group_name:'K', venue:'Hard Rock Stadium',      city:'Miami' },
  { external_id:'wc26_K2', home_team_name:'Corea del Sur', home_team_flag:'https://flagcdn.com/w80/kr.png',     away_team_name:'Ghana',         away_team_flag:'https://flagcdn.com/w80/gh.png',     match_date:'2026-06-19T02:00:00Z', stage:'group', group_name:'K', venue:'Gillette Stadium',       city:'Foxborough' },
  { external_id:'wc26_K3', home_team_name:'Japón',         home_team_flag:'https://flagcdn.com/w80/jp.png',     away_team_name:'Corea del Sur', away_team_flag:'https://flagcdn.com/w80/kr.png',     match_date:'2026-06-24T00:00:00Z', stage:'group', group_name:'K', venue:'BMO Field',              city:'Toronto' },
  { external_id:'wc26_K4', home_team_name:'Chile',         home_team_flag:'https://flagcdn.com/w80/cl.png',     away_team_name:'Ghana',         away_team_flag:'https://flagcdn.com/w80/gh.png',     match_date:'2026-06-24T02:00:00Z', stage:'group', group_name:'K', venue:'AT&T Stadium',           city:'Dallas' },
  { external_id:'wc26_K5', home_team_name:'Chile',         home_team_flag:'https://flagcdn.com/w80/cl.png',     away_team_name:'Corea del Sur', away_team_flag:'https://flagcdn.com/w80/kr.png',     match_date:'2026-06-28T00:00:00Z', stage:'group', group_name:'K', venue:'MetLife Stadium',        city:'East Rutherford' },
  { external_id:'wc26_K6', home_team_name:'Ghana',         home_team_flag:'https://flagcdn.com/w80/gh.png',     away_team_name:'Japón',         away_team_flag:'https://flagcdn.com/w80/jp.png',     match_date:'2026-06-28T00:00:00Z', stage:'group', group_name:'K', venue:'SoFi Stadium',           city:'Los Ángeles' },
  // GRUPO L
  { external_id:'wc26_L1', home_team_name:'Arabia Saudita',home_team_flag:'https://flagcdn.com/w80/sa.png',    away_team_name:'Nigeria',       away_team_flag:'https://flagcdn.com/w80/ng.png',     match_date:'2026-06-20T00:00:00Z', stage:'group', group_name:'L', venue:'Estadio Akron',          city:'Guadalajara' },
  { external_id:'wc26_L2', home_team_name:'Dinamarca',     home_team_flag:'https://flagcdn.com/w80/dk.png',     away_team_name:'China',         away_team_flag:'https://flagcdn.com/w80/cn.png',     match_date:'2026-06-20T02:00:00Z', stage:'group', group_name:'L', venue:'BC Place',               city:'Vancouver' },
  { external_id:'wc26_L3', home_team_name:'Arabia Saudita',home_team_flag:'https://flagcdn.com/w80/sa.png',    away_team_name:'Dinamarca',     away_team_flag:'https://flagcdn.com/w80/dk.png',     match_date:'2026-06-25T20:00:00Z', stage:'group', group_name:'L', venue:'Estadio Universitario',  city:'Monterrey' },
  { external_id:'wc26_L4', home_team_name:'Nigeria',       home_team_flag:'https://flagcdn.com/w80/ng.png',     away_team_name:'China',         away_team_flag:'https://flagcdn.com/w80/cn.png',     match_date:'2026-06-25T23:00:00Z', stage:'group', group_name:'L', venue:'Gillette Stadium',       city:'Foxborough' },
  { external_id:'wc26_L5', home_team_name:'Nigeria',       home_team_flag:'https://flagcdn.com/w80/ng.png',     away_team_name:'Dinamarca',     away_team_flag:'https://flagcdn.com/w80/dk.png',     match_date:'2026-06-29T00:00:00Z', stage:'group', group_name:'L', venue:'Hard Rock Stadium',      city:'Miami' },
  { external_id:'wc26_L6', home_team_name:'China',         home_team_flag:'https://flagcdn.com/w80/cn.png',     away_team_name:'Arabia Saudita',away_team_flag:'https://flagcdn.com/w80/sa.png',     match_date:'2026-06-29T00:00:00Z', stage:'group', group_name:'L', venue:'BMO Field',              city:'Toronto' },
];

// Add common fields to every match
var payload = matches.map(function(m) {
  return Object.assign({ status: 'upcoming', home_score: null, away_score: null }, m);
});

async function run() {
  console.log('Insertando ' + payload.length + ' partidos en Supabase...');

  var BATCH = 20;
  var total = 0;
  for (var i = 0; i < payload.length; i += BATCH) {
    var batch = payload.slice(i, i + BATCH);
    var result = await supabase
      .from('matches')
      .upsert(batch, { onConflict: 'external_id', ignoreDuplicates: false });

    if (result.error) {
      console.error('Error en batch:', result.error.message);
      console.error('Detalle:', JSON.stringify(result.error, null, 2));
      process.exit(1);
    }
    total += batch.length;
    console.log('  ' + total + '/' + payload.length + ' insertados');
  }

  console.log('\n✓ Listo! ' + total + ' partidos insertados correctamente.');
  console.log('Recarga http://localhost:5173/matches');
  process.exit(0);
}

run().catch(function(e) {
  console.error('Error fatal:', e.message);
  process.exit(1);
});
