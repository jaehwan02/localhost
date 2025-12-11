-- Insert dummy media requests
-- Note: We need a valid team_id. We will use a subquery to get the first available team.
-- If no team exists, this might fail, but assuming user created 'team1' earlier or ran previous scripts.

do $$
declare
  v_team_id uuid;
begin
  select id into v_team_id from public.teams limit 1;
  
  if v_team_id is not null then
    insert into public.media_queue (type, content, team_id, status) values
    ('song', 'NewJeans - Hype Boy', v_team_id, 'pending'),
    ('tts', '다들 화이팅하세요!', v_team_id, 'pending'),
    ('song', 'Bruno Mars - Treasure', v_team_id, 'pending');
  end if;
end $$;
