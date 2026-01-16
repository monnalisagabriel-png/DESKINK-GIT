ALTER TABLE studios
ADD COLUMN IF NOT EXISTS ai_settings JSONB DEFAULT NULL;

COMMENT ON COLUMN studios.ai_settings IS 'Stores AI configuration: {gemini_api_key}';
