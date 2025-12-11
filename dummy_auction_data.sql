-- Insert dummy active auction
insert into public.auctions (item_name, start_price, start_time, end_time, status)
values (
  '전설의 기계식 키보드', 
  100, 
  now(), 
  now() + interval '10 minutes', 
  'active'
);
