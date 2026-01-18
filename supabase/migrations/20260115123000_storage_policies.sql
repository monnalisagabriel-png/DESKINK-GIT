DELETE FROM supabase_migrations.schema_migrations WHERE version = '20260115123000';

DROP POLICY IF EXISTS "Allow public read from consents" ON "storage"."objects";
CREATE POLICY "Allow public read from consents" ON "storage"."objects" FOR SELECT USING (("bucket_id" = 'consents'::"text"));

DROP POLICY IF EXISTS "Allow public upload to consents" ON "storage"."objects";
CREATE POLICY "Allow public upload to consents" ON "storage"."objects" FOR INSERT WITH CHECK (("bucket_id" = 'consents'::"text"));

DROP POLICY IF EXISTS "Authenticated users can delete academy files" ON "storage"."objects";
CREATE POLICY "Authenticated users can delete academy files" ON "storage"."objects" FOR DELETE TO "authenticated" USING (("bucket_id" = 'academy'::"text"));

DROP POLICY IF EXISTS "Authenticated users can delete attachments" ON "storage"."objects";
CREATE POLICY "Authenticated users can delete attachments" ON "storage"."objects" FOR DELETE TO "authenticated" USING (("bucket_id" = 'attachments'::"text"));

DROP POLICY IF EXISTS "Authenticated users can delete clients files" ON "storage"."objects";
CREATE POLICY "Authenticated users can delete clients files" ON "storage"."objects" FOR DELETE TO "authenticated" USING (("bucket_id" = 'clients'::"text"));

DROP POLICY IF EXISTS "Authenticated users can update academy files" ON "storage"."objects";
CREATE POLICY "Authenticated users can update academy files" ON "storage"."objects" FOR UPDATE TO "authenticated" USING (("bucket_id" = 'academy'::"text"));

DROP POLICY IF EXISTS "Authenticated users can update attachments" ON "storage"."objects";
CREATE POLICY "Authenticated users can update attachments" ON "storage"."objects" FOR UPDATE TO "authenticated" USING (("bucket_id" = 'attachments'::"text"));

DROP POLICY IF EXISTS "Authenticated users can upload academy files" ON "storage"."objects";
CREATE POLICY "Authenticated users can upload academy files" ON "storage"."objects" FOR INSERT TO "authenticated" WITH CHECK (("bucket_id" = 'academy'::"text"));

DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON "storage"."objects";
CREATE POLICY "Authenticated users can upload attachments" ON "storage"."objects" FOR INSERT TO "authenticated" WITH CHECK (("bucket_id" = 'attachments'::"text"));

DROP POLICY IF EXISTS "Authenticated users can upload client images." ON "storage"."objects";
CREATE POLICY "Authenticated users can upload client images." ON "storage"."objects" FOR INSERT WITH CHECK ((("bucket_id" = 'clients'::"text") AND ("auth"."role"() = 'authenticated'::"text")));

DROP POLICY IF EXISTS "Authenticated users can upload clients files" ON "storage"."objects";
CREATE POLICY "Authenticated users can upload clients files" ON "storage"."objects" FOR INSERT TO "authenticated" WITH CHECK (("bucket_id" = 'clients'::"text"));

DROP POLICY IF EXISTS "Authenticated users can upload studio images." ON "storage"."objects";
CREATE POLICY "Authenticated users can upload studio images." ON "storage"."objects" FOR INSERT WITH CHECK ((("bucket_id" = 'studios'::"text") AND ("auth"."role"() = 'authenticated'::"text")));

DROP POLICY IF EXISTS "Authenticated users can view academy files" ON "storage"."objects";
CREATE POLICY "Authenticated users can view academy files" ON "storage"."objects" FOR SELECT TO "authenticated" USING (("bucket_id" = 'academy'::"text"));

DROP POLICY IF EXISTS "Authenticated users can view attachments" ON "storage"."objects";
CREATE POLICY "Authenticated users can view attachments" ON "storage"."objects" FOR SELECT TO "authenticated" USING (("bucket_id" = 'attachments'::"text"));

DROP POLICY IF EXISTS "Authenticated users can view clients files" ON "storage"."objects";
CREATE POLICY "Authenticated users can view clients files" ON "storage"."objects" FOR SELECT TO "authenticated" USING (("bucket_id" = 'clients'::"text"));

DROP POLICY IF EXISTS "Avatar insert" ON "storage"."objects";
CREATE POLICY "Avatar insert" ON "storage"."objects" FOR INSERT WITH CHECK (("bucket_id" = 'avatars'::"text"));

DROP POLICY IF EXISTS "Avatar select" ON "storage"."objects";
CREATE POLICY "Avatar select" ON "storage"."objects" FOR SELECT USING (("bucket_id" = 'avatars'::"text"));

DROP POLICY IF EXISTS "Avatar update" ON "storage"."objects";
CREATE POLICY "Avatar update" ON "storage"."objects" FOR UPDATE WITH CHECK (("bucket_id" = 'avatars'::"text"));

DROP POLICY IF EXISTS "Client images are publicly accessible." ON "storage"."objects";
CREATE POLICY "Client images are publicly accessible." ON "storage"."objects" FOR SELECT USING (("bucket_id" = 'clients'::"text"));

DROP POLICY IF EXISTS "Client insert" ON "storage"."objects";
CREATE POLICY "Client insert" ON "storage"."objects" FOR INSERT WITH CHECK ((("bucket_id" = 'clients'::"text") AND ("auth"."role"() = 'authenticated'::"text")));

DROP POLICY IF EXISTS "Client select" ON "storage"."objects";
CREATE POLICY "Client select" ON "storage"."objects" FOR SELECT USING (("bucket_id" = 'clients'::"text"));

DROP POLICY IF EXISTS "Public Read Signatures" ON "storage"."objects";
CREATE POLICY "Public Read Signatures" ON "storage"."objects" FOR SELECT USING (("bucket_id" = 'consents'::"text"));

DROP POLICY IF EXISTS "Public Upload Signatures" ON "storage"."objects";
CREATE POLICY "Public Upload Signatures" ON "storage"."objects" FOR INSERT WITH CHECK (("bucket_id" = 'consents'::"text"));

DROP POLICY IF EXISTS "Studio images are publicly accessible." ON "storage"."objects";
CREATE POLICY "Studio images are publicly accessible." ON "storage"."objects" FOR SELECT USING (("bucket_id" = 'studios'::"text"));

DROP POLICY IF EXISTS "Studio insert" ON "storage"."objects";
CREATE POLICY "Studio insert" ON "storage"."objects" FOR INSERT WITH CHECK ((("bucket_id" = 'studios'::"text") AND ("auth"."role"() = 'authenticated'::"text")));

DROP POLICY IF EXISTS "Studio select" ON "storage"."objects";
CREATE POLICY "Studio select" ON "storage"."objects" FOR SELECT USING (("bucket_id" = 'studios'::"text"));
