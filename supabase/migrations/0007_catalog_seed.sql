insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-merch-drop', 'trivia', 'Merch Drop side event', 'Merch Drop side event', 'Bezoek de merch zone en beantwoord welke kleur de drop deze editie is.', 'Visit the merch zone and answer what colour the drop is this edition.', 25, 'green', '{"type":"trivia","data":{"question":{"nl":"Welke kleur staat centraal in de merch drop?","en":"What is the headline colour of the merch drop?"},"options":[{"nl":"Brand groen","en":"Brand green"},{"nl":"Brand oranje","en":"Brand orange"},{"nl":"Brand blauw","en":"Brand blue"},{"nl":"Off-white","en":"Off-white"}],"correctIndex":0}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-dj-poll', 'poll', 'Live DJ poll', 'Live DJ poll', 'Vote welk nummer de DJ als volgende moet draaien.', 'Vote which song the DJ should play next.', 20, 'green', '{"type":"poll","data":{"question":{"nl":"Welk nummer als volgende?","en":"Which track next?"},"options":[{"nl":"Hardstyle banger","en":"Hardstyle banger"},{"nl":"Afrobeats jam","en":"Afrobeats jam"},{"nl":"Throwback hiphop","en":"Throwback hiphop"},{"nl":"Amapiano vibe","en":"Amapiano vibe"}]}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-ar-prompt', 'panna_qr', 'AR / VR prompt', 'AR / VR prompt', 'Maak een prompt bij de AR/VR booth, laat de host het resultaat zien en krijg de code.', 'Create a prompt at the AR/VR booth, show the host your result and receive the code.', 50, 'blue', '{"type":"panna_qr","data":{"hint":{"nl":"Booth geeft een unieke code zodra je prompt af is.","en":"Booth hands you a unique code once your prompt is done."},"qrCode":"AR-PROMPT-01"}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-go-bald', 'panna_qr', 'Go bald 🪒', 'Go bald 🪒', 'Durf jij het kale-hoofd avontuur aan bij de barbershop booth? Krijg de code van de barber na de cut.', 'Brave enough to go bald at the barbershop booth? Get the code from the barber after the cut.', 50, 'orange', '{"type":"panna_qr","data":{"hint":{"nl":"Alleen de barber kan deze code afgeven.","en":"Only the barber can hand out this code."},"qrCode":"BALD-01"}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-panna-qr', 'panna_qr', 'Vind de verborgen codes', 'Find the hidden codes', 'Codes zijn verstopt op locatie. Vind ze en voer ze in.', 'Codes are hidden on site. Find them and enter them.', 40, 'orange', '{"type":"panna_qr","data":{"hint":{"nl":"Kijk onder de zwarte mat.","en":"Look under the black mat."},"qrCode":"PANNA-HIDDEN-01"}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-leader-trivia', 'trivia', 'Leader trivia', 'Leader trivia', 'Hoeveel 3X3 Leaders zijn er dit jaar opgeleid via 3X3 Unites Academy?', 'How many 3X3 Leaders graduated from the 3X3 Unites Academy this year?', 30, 'blue', '{"type":"trivia","data":{"question":{"nl":"Hoeveel 3X3 Leaders zijn er dit jaar opgeleid?","en":"How many 3X3 Leaders graduated this year?"},"options":[{"nl":"12","en":"12"},{"nl":"24","en":"24"},{"nl":"48","en":"48"},{"nl":"Geen idee, maar veel","en":"No idea, but a lot"}],"correctIndex":1}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-score-input', 'score_input', 'Schrijf de eindstand op', 'Note the final score', 'Bekijk een match en voer de eindstand in om punten te verdienen.', 'Watch a match and submit the final score to earn points.', 40, 'orange', '{"type":"score_input","data":{"matchLabel":{"nl":"Quarterfinal 1 — Amsterdam vs Utrecht","en":"Quarterfinal 1 — Amsterdam vs Utrecht"},"correctScore":"21-18"}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-hekken', 'trivia', 'Leader exhibition quiz', 'Leader exhibition quiz', 'Welke 3X3 Leader staat op het Leader exhibition artwork?', 'Which 3X3 Leader is on the Leader exhibition artwork?', 25, 'blue', '{"type":"trivia","data":{"question":{"nl":"Welke 3X3 Leader staat op het Leader exhibition artwork?","en":"Which 3X3 Leader is on the Leader exhibition artwork?"},"options":[{"nl":"Worthy de Jong","en":"Worthy de Jong"},{"nl":"Jessey Voorn","en":"Jessey Voorn"},{"nl":"Dimeo van der Horst","en":"Dimeo van der Horst"},{"nl":"Arvin Slagter","en":"Arvin Slagter"}],"correctIndex":2}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-merch', 'trivia', 'Vul de merch punten in', 'Fill in the merch points', 'Hoeveel punten kost de signature hoodie?', 'How many points does the signature hoodie cost?', 20, 'green', '{"type":"trivia","data":{"question":{"nl":"Punten voor de signature hoodie?","en":"Points for the signature hoodie?"},"options":[{"nl":"150","en":"150"},{"nl":"200","en":"200"},{"nl":"300","en":"300"},{"nl":"450","en":"450"}],"correctIndex":2}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-painting', 'trivia', 'Waar gaat de painting over?', 'What is the painting about?', 'Op het court staat een painting. Wat is het thema? 2 shots, 1 minuut penalty bij fout.', 'There''s a painting on the court. What''s the theme? 2 shots, 1 min penalty if wrong.', 35, 'green', '{"type":"trivia","data":{"question":{"nl":"Het thema van de painting is:","en":"The theme of the painting is:"},"options":[{"nl":"Streetlife in Rotterdam","en":"Streetlife in Rotterdam"},{"nl":"Generations of basketball","en":"Generations of basketball"},{"nl":"Unity through music","en":"Unity through music"},{"nl":"Welcome to the festival","en":"Welcome to the festival"}],"correctIndex":3}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-dome', 'trivia', 'Wat gebeurt er in de dome?', 'What happens in the dome?', 'De dome heeft een speciale activiteit voor NXT LVL deelnemers.', 'The dome has a special activity for NXT LVL participants.', 30, 'blue', '{"type":"trivia","data":{"question":{"nl":"Wat is de hoofdactiviteit in de dome?","en":"What is the main activity in the dome?"},"options":[{"nl":"NXT LVL skills clinic","en":"NXT LVL skills clinic"},{"nl":"Sneaker swap","en":"Sneaker swap"},{"nl":"VR shootout","en":"VR shootout"},{"nl":"Stilte ruimte","en":"Silent room"}],"correctIndex":0}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-shon-price', 'panna_qr', 'The Paint Wall', 'The Paint Wall', 'Draag bij aan The Paint Wall — geschilderd door Shon Price — en krijg de code van de crew.', 'Contribute to The Paint Wall — painted by Shon Price — and get the code from the crew.', 50, 'green', '{"type":"panna_qr","data":{"hint":{"nl":"Code bij het artwork.","en":"Code at the artwork."},"qrCode":"SIDE-SHON-01"}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-go-drip', 'panna_qr', 'Go Drip', 'Go Drip', 'Meld je aan voor de kledingdonatie-actie Go Drip.', 'Sign up for the Go Drip clothes donation action.', 40, 'green', '{"type":"panna_qr","data":{"hint":{"nl":"Inschrijfbalie Go Drip.","en":"Go Drip signup desk."},"qrCode":"SIDE-DRIP-01"}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-barbershop', 'panna_qr', 'Triple Threat Barbershop', 'Triple Threat Barbershop', 'Gratis knipbeurt bij Triple Threat — code van de barber.', 'Free cut at Triple Threat — code from the barber.', 50, 'orange', '{"type":"panna_qr","data":{"hint":{"nl":"Na je cut.","en":"After your cut."},"qrCode":"SIDE-BARBER-01"}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-talent-movement', 'panna_qr', 'Talent Movement bus', 'Talent Movement bus', 'Maak een beat/song bij de Talent Movement bus.', 'Create a beat/song at the Talent Movement bus.', 50, 'blue', '{"type":"panna_qr","data":{"hint":{"nl":"Code na je track.","en":"Code after your track."},"qrCode":"SIDE-TALENT-01"}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-vriendenloterij', 'trivia', 'Vriendenloterij quiz', 'Friends Lottery quiz', 'Sport-trivia bij de locker rooms — 3 juiste antwoorden.', 'Sports trivia at the locker rooms — 3 correct answers.', 40, 'blue', '{"type":"trivia","data":{"question":{"nl":"Hoeveel spelers staan er per team op het veld in 3x3?","en":"How many players per team are on court in 3x3?"},"options":[{"nl":"3","en":"3"},{"nl":"4","en":"4"},{"nl":"5","en":"5"}],"correctIndex":0}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-nxt-level', 'panna_qr', 'nxt level food station', 'nxt level food station', 'Haal een verse sportdrank bij de nxt level food station.', 'Collect a fresh sports drink at the nxt level food station.', 30, 'green', '{"type":"panna_qr","data":{"hint":{"nl":"Bij de bar.","en":"At the bar."},"qrCode":"SIDE-NXT-01"}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-skills-showdown', 'panna_qr', '3X3 Skills Showdown', '3X3 Skills Showdown', 'Doe mee en ontvang je player card.', 'Participate and receive your player card.', 50, 'orange', '{"type":"panna_qr","data":{"hint":{"nl":"Na je run.","en":"After your run."},"qrCode":"SIDE-SKILLS-01"}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-leader-hub-side', 'panna_qr', '3X3 Leader Hub storytelling', '3X3 Leader Hub storytelling', 'Meld je aan voor meer over 3X3 Unites leader storytelling.', 'Sign up to hear more about 3X3 Unites leader storytelling.', 25, 'blue', '{"type":"panna_qr","data":{"hint":{"nl":"3X3 Leader Hub desk.","en":"3X3 Leader Hub desk."},"qrCode":"SIDE-LEADER-HUB"}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-arcade', 'panna_qr', 'Retro arcade', 'Retro arcade', 'Speel een old-school arcade game bij de Dome.', 'Play an old-school arcade game near the Dome.', 30, 'green', '{"type":"panna_qr","data":{"hint":{"nl":"Na je game.","en":"After your game."},"qrCode":"SIDE-ARCADE-01"}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.challenges (slug, type, title_nl, title_en, description_nl, description_en, points, accent, payload)
values ('ch-shooting-record', 'panna_qr', 'Shooting arcade record', 'Shooting arcade record', 'Probeer het record te breken bij de basketball shooting game voor de Rabobus.', 'Try to break the record at the basketball shooting game by the Rabobus.', 40, 'orange', '{"type":"panna_qr","data":{"hint":{"nl":"Scorebord booth.","en":"Scoreboard booth."},"qrCode":"SIDE-SHOOT-01"}}'::jsonb)
on conflict (slug) do update set type = excluded.type, title_nl = excluded.title_nl, title_en = excluded.title_en, description_nl = excluded.description_nl, description_en = excluded.description_en, points = excluded.points, accent = excluded.accent, payload = excluded.payload;
insert into public.badges (code, name_nl, name_en, description_nl, description_en, emoji, accent, criterion)
values ('FIRST_STEP', 'Eerste stap', 'First step', 'Je hebt je eerste stap op de journey gezet.', 'You took your first step on the journey.', '👟', 'green', '{"kind":"steps_completed","threshold":1}'::jsonb)
on conflict (code) do update set name_nl = excluded.name_nl, name_en = excluded.name_en, description_nl = excluded.description_nl, description_en = excluded.description_en, emoji = excluded.emoji, accent = excluded.accent, criterion = excluded.criterion;
insert into public.badges (code, name_nl, name_en, description_nl, description_en, emoji, accent, criterion)
values ('HALFWAY', 'Halverwege', 'Halfway', '5 main quests voltooid.', '5 main quests completed.', '🏀', 'orange', '{"kind":"steps_completed","threshold":5}'::jsonb)
on conflict (code) do update set name_nl = excluded.name_nl, name_en = excluded.name_en, description_nl = excluded.description_nl, description_en = excluded.description_en, emoji = excluded.emoji, accent = excluded.accent, criterion = excluded.criterion;
insert into public.badges (code, name_nl, name_en, description_nl, description_en, emoji, accent, criterion)
values ('TOP', 'From the Top', 'From the Top', 'Alle main quests voltooid. Grand tour klaar!', 'All main quests completed. Grand tour done!', '👑', 'orange', '{"kind":"all_steps"}'::jsonb)
on conflict (code) do update set name_nl = excluded.name_nl, name_en = excluded.name_en, description_nl = excluded.description_nl, description_en = excluded.description_en, emoji = excluded.emoji, accent = excluded.accent, criterion = excluded.criterion;
insert into public.badges (code, name_nl, name_en, description_nl, description_en, emoji, accent, criterion)
values ('TRIVIA_MASTER', 'Trivia master', 'Trivia master', '5 challenges voltooid.', '5 challenges completed.', '🧠', 'blue', '{"kind":"challenges_completed","threshold":5}'::jsonb)
on conflict (code) do update set name_nl = excluded.name_nl, name_en = excluded.name_en, description_nl = excluded.description_nl, description_en = excluded.description_en, emoji = excluded.emoji, accent = excluded.accent, criterion = excluded.criterion;
insert into public.badges (code, name_nl, name_en, description_nl, description_en, emoji, accent, criterion)
values ('PHOTOGRAPHER', 'Photographer', 'Photographer', 'Foto geüpload naar de photo contest.', 'Uploaded a photo to the photo contest.', '📸', 'green', '{"kind":"photo_uploaded"}'::jsonb)
on conflict (code) do update set name_nl = excluded.name_nl, name_en = excluded.name_en, description_nl = excluded.description_nl, description_en = excluded.description_en, emoji = excluded.emoji, accent = excluded.accent, criterion = excluded.criterion;
insert into public.badges (code, name_nl, name_en, description_nl, description_en, emoji, accent, criterion)
values ('SCORE_SPOTTER', 'Score spotter', 'Score spotter', 'Eindstand correct ingevoerd.', 'Correctly submitted a match score.', '🎯', 'orange', '{"kind":"score_correct"}'::jsonb)
on conflict (code) do update set name_nl = excluded.name_nl, name_en = excluded.name_en, description_nl = excluded.description_nl, description_en = excluded.description_en, emoji = excluded.emoji, accent = excluded.accent, criterion = excluded.criterion;
insert into public.codes (code, target_type, target_id, active)
select 'JOURNEY-STREETS', 'step', id, true from public.journey_steps where slug = 'step-streets'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'JOURNEY-DOME', 'step', id, true from public.journey_steps where slug = 'step-odido-dome'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'JOURNEY-RABO', 'step', id, true from public.journey_steps where slug = 'step-rabobus'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'JOURNEY-FOOD', 'step', id, true from public.journey_steps where slug = 'step-food-court'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'JOURNEY-COMMUNITY', 'step', id, true from public.journey_steps where slug = 'step-community'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'JOURNEY-PANNA', 'step', id, true from public.journey_steps where slug = 'step-panna'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'JOURNEY-LEADER-CENTER', 'step', id, true from public.journey_steps where slug = 'step-leader-center'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'JOURNEY-WARMUP', 'step', id, true from public.journey_steps where slug = 'step-warmup'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'JOURNEY-HEKKEN', 'step', id, true from public.journey_steps where slug = 'step-hekken'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'AR-PROMPT-01', 'challenge', id, true from public.challenges where slug = 'ch-ar-prompt'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'BALD-01', 'challenge', id, true from public.challenges where slug = 'ch-go-bald'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'PANNA-HIDDEN-01', 'challenge', id, true from public.challenges where slug = 'ch-panna-qr'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'SIDE-SHON-01', 'challenge', id, true from public.challenges where slug = 'ch-shon-price'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'SIDE-DRIP-01', 'challenge', id, true from public.challenges where slug = 'ch-go-drip'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'SIDE-BARBER-01', 'challenge', id, true from public.challenges where slug = 'ch-barbershop'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'SIDE-TALENT-01', 'challenge', id, true from public.challenges where slug = 'ch-talent-movement'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'SIDE-NXT-01', 'challenge', id, true from public.challenges where slug = 'ch-nxt-level'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'SIDE-SKILLS-01', 'challenge', id, true from public.challenges where slug = 'ch-skills-showdown'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'SIDE-LEADER-HUB', 'challenge', id, true from public.challenges where slug = 'ch-leader-hub-side'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'SIDE-ARCADE-01', 'challenge', id, true from public.challenges where slug = 'ch-arcade'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
insert into public.codes (code, target_type, target_id, active)
select 'SIDE-SHOOT-01', 'challenge', id, true from public.challenges where slug = 'ch-shooting-record'
on conflict (code) do update set target_type = excluded.target_type, target_id = excluded.target_id, active = excluded.active;
