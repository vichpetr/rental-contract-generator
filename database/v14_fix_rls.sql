-- Fix Storage RLS
-- Drop strict policy that requires auth.uid() match
DROP POLICY IF EXISTS "Users can upload their own id cards" ON storage.objects;

-- Create more permissive policy for Development (allows anyone to upload to id_cards)
-- WARN: This is for development convenience to support the VITE_DEV_USER_ID bypass. 
-- In production, strict auth checks should be restored.
CREATE POLICY "Allow uploads to id_cards"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'id_cards'
);

-- We also need to allow SELECT/UPDATE/DELETE if we want full management
DROP POLICY IF EXISTS "Users can view their own id cards" ON storage.objects;
CREATE POLICY "Allow view id_cards"
ON storage.objects FOR SELECT
USING ( bucket_id = 'id_cards' );

DROP POLICY IF EXISTS "Users can update their own id cards" ON storage.objects;
CREATE POLICY "Allow update id_cards"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'id_cards' );

DROP POLICY IF EXISTS "Users can delete their own id cards" ON storage.objects;
CREATE POLICY "Allow delete id_cards"
ON storage.objects FOR DELETE
USING ( bucket_id = 'id_cards' );


-- Create RPC for inserting documents (Bypassing Table RLS)
CREATE OR REPLACE FUNCTION public.save_tenant_document(
    p_tenant_id bigint,
    p_document_type text,
    p_file_path text,
    p_file_name text
)
RETURNS public.tenant_documents
LANGUAGE plpgsql
SECURITY DEFINER -- Bypass RLS
AS $$
DECLARE
    v_doc public.tenant_documents;
BEGIN
    INSERT INTO public.tenant_documents (tenant_id, document_type, file_path, file_name)
    VALUES (p_tenant_id, p_document_type, p_file_path, p_file_name)
    RETURNING * INTO v_doc;
    
    RETURN v_doc;
END;
$$;
