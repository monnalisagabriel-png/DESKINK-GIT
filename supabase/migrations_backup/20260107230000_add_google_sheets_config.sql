ALTER TABLE studios 
ADD COLUMN IF NOT EXISTS google_sheets_config JSONB DEFAULT NULL;

COMMENT ON COLUMN studios.google_sheets_config IS 'Stores configuration for automatic Google Sheets sync: {spreadsheet_id, sheet_name, auto_sync_enabled}';
