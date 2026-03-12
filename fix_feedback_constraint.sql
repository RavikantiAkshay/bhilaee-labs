-- FIX FOR FEEDBACK PERSISTENCE
-- Run this if you already created the table but data is not saving/updating.
-- This adds the necessary UNIQUE constraint for the upsert logic to work.

ALTER TABLE public.user_feedbacks 
ADD CONSTRAINT user_feedbacks_user_id_experiment_id_key UNIQUE (user_id, experiment_id);
