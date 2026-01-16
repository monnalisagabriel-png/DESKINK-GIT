-- Enable Full Replica Identity
-- This ensures that DELETE events contain all columns (including studio_id),
-- which allows the Realtime Filter (studio_id=eq...) to work correctly.

ALTER TABLE appointments REPLICA IDENTITY FULL;
ALTER TABLE clients REPLICA IDENTITY FULL;
