-- Festival branding copy updates (3X3 Unites vs 3x3 sport naming)

update public.journey_steps set
  title_nl = 'Interactive Dome — powered by Odido',
  title_en = 'Interactive Dome — powered by Odido',
  location_nl = 'Interactive Dome',
  location_en = 'Interactive Dome',
  description_nl = 'Bezoek een talk of de AI-ervaring in de Interactive Dome en voer de code in.',
  description_en = 'Visit a talk or the AI experience in the Interactive Dome and enter the code.'
where slug = 'step-odido-dome';

update public.journey_steps set
  title_nl = 'RaboBank Court',
  title_en = 'RaboBank Court',
  location_nl = 'RaboBank Court',
  location_en = 'RaboBank Court',
  description_nl = 'Stap de bus in bij RaboBank Court en voer de code in die je daar vindt.',
  description_en = 'Step inside the bus at RaboBank Court and enter the code you find there.'
where slug = 'step-rabobus';

update public.journey_steps set
  title_nl = 'Warm-up Court',
  title_en = 'Warm-up Court',
  location_nl = 'Warm-up Court',
  location_en = 'Warm-up Court',
  description_nl = 'Bekijk de pros warm-uppen op het Warm-up Court en voer de code in.',
  description_en = 'Watch the pros warm up on the Warm-up Court and enter the code.'
where slug = 'step-warmup';

update public.journey_steps set
  title_nl = '3X3 Leader exhibition',
  title_en = '3X3 Leader exhibition',
  location_nl = '3X3 Leader exhibition (3 structuren)',
  location_en = '3X3 Leader exhibition (3 structures)',
  description_nl = 'Spot de 3X3 Leader op de 3X3 Leader exhibition — 10 jaar 3X3 Unites storytelling.',
  description_en = 'Spot the 3X3 Leader at the 3X3 Leader exhibition — 10 years of 3X3 Unites storytelling.'
where slug = 'step-hekken';

update public.challenges set
  title_nl = '3X3 Leader exhibition quiz',
  title_en = '3X3 Leader exhibition quiz',
  description_nl = 'Welke 3X3 Leader staat op het 3X3 Leader exhibition artwork?',
  description_en = 'Which 3X3 Leader is on the 3X3 Leader exhibition artwork?',
  payload = jsonb_set(
    jsonb_set(payload, '{data,question,nl}', '"Welke 3X3 Leader staat op het 3X3 Leader exhibition artwork?"'),
    '{data,question,en}', '"Which 3X3 Leader is on the 3X3 Leader exhibition artwork?"'
  )
where slug = 'ch-hekken';

update public.challenges set
  description_nl = 'Speel een old-school arcade game in de dome.',
  description_en = 'Play an old-school arcade game in the dome.'
where slug = 'ch-arcade';

update public.challenges set
  description_nl = 'Probeer het record te breken bij de basketball shooting game bij RaboBank Court.',
  description_en = 'Try to break the record at the basketball shooting game at RaboBank Court.'
where slug = 'ch-shooting-record';

update public.challenges set
  payload = jsonb_set(
    jsonb_set(payload, '{data,hint,nl}', '"Bij de food station."'),
    '{data,hint,en}', '"At the food station."'
  )
where slug = 'ch-nxt-level';

update public.badges set
  description_nl = 'Foto geüpload naar de Worthy de Jong selfie contest.',
  description_en = 'Uploaded a photo to the Worthy de Jong selfie contest.'
where code = 'PHOTOGRAPHER';
