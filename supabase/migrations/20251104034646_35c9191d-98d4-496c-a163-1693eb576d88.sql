-- Add INSERT policy for user_roles so users can set their role during signup
CREATE POLICY "Users can insert their own role"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id);