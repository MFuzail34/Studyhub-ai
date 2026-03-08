CREATE TABLE public.saved_lectures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  video_id text NOT NULL,
  title text NOT NULL,
  channel_name text NOT NULL,
  thumbnail_url text NOT NULL,
  duration text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, video_id)
);

ALTER TABLE public.saved_lectures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved lectures"
  ON public.saved_lectures FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save lectures"
  ON public.saved_lectures FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove saved lectures"
  ON public.saved_lectures FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);