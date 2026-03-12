import { supabase } from './supabase';

/**
 * DATABASE UTILITIES
 * Centralized functions for Supabase interactions.
 */

// -- Profiles --
export const updateProfile = async (userId, updates) => {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date() })
    .eq('id', userId);
  return { error };
};

// -- Starred Experiments --
export const getStarredExperiments = async (userId) => {
  const { data, error } = await supabase
    .from('starred_experiments')
    .select('experiment_id')
    .eq('user_id', userId);
  return { data: data?.map(s => s.experiment_id) || [], error };
};

export const addStarredExperiment = async (userId, experimentId) => {
  const { error } = await supabase
    .from('starred_experiments')
    .insert([{ user_id: userId, experiment_id: experimentId }]);
  return { error };
};

export const removeStarredExperiment = async (userId, experimentId) => {
  const { error } = await supabase
    .from('starred_experiments')
    .delete()
    .eq('user_id', userId)
    .eq('experiment_id', experimentId);
  return { error };
};

// -- Recently Viewed --
export const getRecentlyViewed = async (userId) => {
  const { data, error } = await supabase
    .from('recently_viewed')
    .select('*')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false });
  return { data, error };
};

export const recordVisit = async (userId, experimentId) => {
  const { error } = await supabase
    .from('recently_viewed')
    .insert([{ user_id: userId, experiment_id: experimentId }]);
  return { error };
};

// -- Saved Observations --
export const getSavedObservations = async (userId, experimentId) => {
  const { data, error } = await supabase
    .from('saved_observations')
    .select('*')
    .eq('user_id', userId)
    .eq('experiment_id', experimentId);
  return { data, error };
};

export const saveObservation = async (userId, experimentId, sectionId, data) => {
  const { error } = await supabase
    .from('saved_observations')
    .upsert({ 
      user_id: userId, 
      experiment_id: experimentId, 
      section_id: sectionId, 
      data,
      updated_at: new Date()
    }, { onConflict: 'user_id,experiment_id,section_id' });
  return { error };
};
