-- Parqo — seed demo (separato dalle migration).
-- Popola la tabella `parkings` con i parcheggi sintetici (isDemo = true).
-- I nomi sono chiaramente fittizi; prezzi e disponibilità sono indicativi.

insert into public.parkings (
  id, name, slug, description, address, city, city_query, latitude, longitude,
  price_per_hour, daily_max_price, estimated_total_price, currency,
  walking_distance_meters, walking_duration_minutes, driving_duration_minutes, total_duration_minutes,
  is_covered, is_bookable, has_ev_charging, is_accessible, is_open_24_hours, is_outside_ztl,
  opening_time, closing_time, max_vehicle_height_cm, total_spaces,
  data_confidence, data_source, tags, is_demo
) values
  ('demo-centro-uno','Parqo Centro Uno','parqo-centro-uno','Autorimessa coperta nel cuore della città.','Via del Centro 1','Città Demo','Centro città (demo)',45.4654,9.1912,3.5,28,10.5,'EUR',180,3,12,15,true,true,true,true,true,false,null,null,200,320,'high','demo','{Coperto,Prenotabile,EV,Accessibile,H24}',true),
  ('demo-stazione','Parqo Stazione','parqo-stazione','Ampio parcheggio vicino alla stazione.','Piazzale della Stazione 4','Città Demo','Centro città (demo)',45.4586,9.2062,2,16,6,'EUR',780,10,9,19,false,true,false,true,true,true,null,null,250,540,'high','demo','{"No ZTL",Prenotabile,H24,Accessibile}',true),
  ('demo-porto','Parqo Porto','parqo-porto','Parcheggio economico decentrato per soste lunghe.','Lungomare del Porto 22','Città Demo','Centro città (demo)',45.4534,9.1785,1.2,10,3.6,'EUR',1500,19,8,27,false,false,false,false,true,true,null,null,250,200,'medium','demo','{"No ZTL",Scoperto,H24}',true),
  ('demo-verde','Parqo Verde','parqo-verde','Parcheggio con ricarica e accesso facile, fuori ZTL.','Viale dei Giardini 7','Città Demo','Centro città (demo)',45.4613,9.1933,2.5,20,7.5,'EUR',420,6,10,16,false,true,true,true,false,true,'06:00','23:00',230,150,'high','demo','{"No ZTL",EV,Prenotabile,Accessibile}',true),
  ('demo-coperto','Parqo Coperto','parqo-coperto','Autosilo coperto molto vicino, tariffa più alta.','Via Coperta 3','Città Demo','Centro città (demo)',45.4650,9.1891,4.5,35,13.5,'EUR',120,2,13,15,true,true,false,true,false,false,'07:00','22:00',190,260,'high','demo','{Coperto,Prenotabile,Accessibile,"Altezza limitata"}',true),
  ('demo-express','Parqo Express','parqo-express','Parcheggio rapido a raso, dati stimati.','Via Rapida 15','Città Demo','Centro città (demo)',45.4618,9.1846,2.8,null,8.4,'EUR',560,8,7,15,false,false,false,false,true,true,null,null,null,null,'low','demo','{"No ZTL",Scoperto,"Dato stimato"}',true),
  ('demo-nord','Parqo Nord','parqo-nord','Parcheggio coperto a nord, vicino alla ZTL.','Via del Nord 8','Città Demo','Centro città (demo)',45.4689,9.1915,3,24,9,'EUR',640,8,11,19,true,false,true,true,true,false,null,null,210,300,'medium','demo','{Coperto,EV,H24,Accessibile}',true),
  ('demo-basso','Parqo Basso','parqo-basso','Autorimessa a soffitto basso: non adatta ai veicoli alti.','Vicolo Stretto 2','Città Demo','Centro città (demo)',45.4656,9.1926,2.6,22,7.8,'EUR',300,4,12,16,true,true,false,false,false,false,'08:00','20:00',180,90,'medium','demo','{Coperto,Prenotabile,"Altezza limitata"}',true),
  ('demo-est','Parqo Est','parqo-est','Parcheggio scoperto a est, buon compromesso.','Corso Est 40','Città Demo','Centro città (demo)',45.4629,9.2032,2.2,18,6.6,'EUR',520,7,9,16,false,true,false,true,true,true,null,null,250,280,'high','demo','{"No ZTL",Scoperto,Prenotabile,H24,Accessibile}',true),
  ('demo-ovest','Parqo Ovest','parqo-ovest','Piccolo parcheggio a ovest con orario limitato.','Via Ovest 12','Città Demo','Centro città (demo)',45.4662,9.1828,2,15,6,'EUR',700,9,8,17,false,false,false,false,false,true,'09:00','19:00',220,60,'low','demo','{"No ZTL",Scoperto,"Dato stimato"}',true),
  ('demo-premium','Parqo Premium','parqo-premium','Struttura coperta premium a due passi.','Galleria Centrale 1','Città Demo','Centro città (demo)',45.4648,9.1908,5,40,15,'EUR',90,2,13,15,true,true,true,true,true,false,null,null,200,180,'high','demo','{Coperto,Prenotabile,EV,Accessibile,H24}',true),
  ('demo-sud','Parqo Sud','parqo-sud','Parcheggio a raso a sud, adatto anche ai van.','Via del Sud 55','Città Demo','Centro città (demo)',45.4572,9.1859,1.8,14,5.4,'EUR',950,12,8,20,false,true,false,true,true,true,null,null,320,420,'medium','demo','{"No ZTL",Scoperto,H24,Accessibile,Prenotabile}',true)
on conflict (id) do nothing;
