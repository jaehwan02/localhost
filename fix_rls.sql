-- Add UPDATE policy for media_queue
create policy "Authenticated users can update media queue."
  on public.media_queue for update
  using ( auth.role() = 'authenticated' );
