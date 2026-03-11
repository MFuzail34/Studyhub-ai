
-- Allow users to delete their own payment submissions (for account deletion)
CREATE POLICY "Users can delete own submissions" ON public.payment_submissions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to delete their own subscription (for account deletion)
CREATE POLICY "Users can delete own subscription" ON public.user_subscriptions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to delete subscriptions
CREATE POLICY "Admins can delete subscriptions" ON public.user_subscriptions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
