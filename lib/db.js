import { supabase } from './supabase';

/**
 * DATABASE UTILITIES
 * Centralized functions for Supabase interactions.
 */

// -- Profiles --
export const updateProfile = async (userId, updates) => {
  console.info('db:updateProfile', userId, updates);
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date() })
    .eq('id', userId);
  if (error) console.error('db:updateProfile error', error);
  return { error };
};

// -- Starred Experiments --
export const getStarredExperiments = async (userId) => {
  const { data, error } = await supabase
    .from('starred_experiments')
    .select('experiment_id')
    .eq('user_id', userId);
  if (error) console.error('db:getStarredExperiments error', error);
  return { data: data?.map(s => s.experiment_id) || [], error };
};

export const addStarredExperiment = async (userId, experimentId) => {
  console.info('db:addStarredExperiment', userId, experimentId);
  const { error } = await supabase
    .from('starred_experiments')
    .insert([{ user_id: userId, experiment_id: experimentId }]);
  if (error) console.error('db:addStarredExperiment error', error);
  return { error };
};

export const removeStarredExperiment = async (userId, experimentId) => {
  console.info('db:removeStarredExperiment', userId, experimentId);
  const { error } = await supabase
    .from('starred_experiments')
    .delete()
    .eq('user_id', userId)
    .eq('experiment_id', experimentId);
  if (error) console.error('db:removeStarredExperiment error', error);
  return { error };
};

export const clearAllBookmarks = async (userId) => {
  if (!userId) return { error: 'No user ID' };
  console.info('db:clearAllBookmarks', userId);
  const { error } = await supabase
    .from('starred_experiments')
    .delete()
    .eq('user_id', userId);
  if (error) console.error('db:clearAllBookmarks error', error);
  return { error };
};

// -- Recently Viewed --
export const getRecentlyViewed = async (userId) => {
  if (!userId) return { data: [], error: 'No user ID' };
  const { data, error } = await supabase
    .from('recently_viewed')
    .select('*')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false });
  if (error) console.error('db:getRecentlyViewed error', error);
  return { data, error };
};

export const recordVisit = async (userId, experimentId) => {
  if (!userId || !experimentId) {
    console.warn('db:recordVisit skipped - missing id', { userId, experimentId });
    return { error: 'Missing params' };
  }
  
  console.info('db:recordVisit: Attempting upsert', { userId, experimentId });
  
  // 1. Record the visit (upsert updates timestamp on conflict)
  const { error: upsertError } = await supabase
    .from('recently_viewed')
    .upsert(
      { user_id: userId, experiment_id: String(experimentId), viewed_at: new Date().toISOString() },
      { onConflict: 'user_id,experiment_id' }
    );
  
  if (upsertError) {
    console.error('db:recordVisit UPSERT error', upsertError.message, upsertError.details, upsertError);
    return { error: upsertError };
  }

  // 2. Prune old records to keep only the latest 10
  const { data: toKeep, error: fetchError } = await supabase
    .from('recently_viewed')
    .select('id')
    .eq('user_id', userId)
    .order('viewed_at', { ascending: false })
    .limit(10);

  if (!fetchError && toKeep && toKeep.length >= 10) {
    const keepIds = toKeep.map(r => r.id);
    const { error: deleteError } = await supabase
      .from('recently_viewed')
      .delete()
      .eq('user_id', userId)
      .not('id', 'in', `(${keepIds.join(',')})`);
    
    if (deleteError) console.error('db:recordVisit prune error', deleteError);
  }

  return { error: null };
};

export const clearAllHistory = async (userId) => {
  if (!userId) return { error: 'No user ID' };
  console.info('db:clearAllHistory', userId);
  const { error } = await supabase
    .from('recently_viewed')
    .delete()
    .eq('user_id', userId);
  if (error) console.error('db:clearAllHistory error', error);
  return { error };
};

export const getStarredExperimentsDetailed = async (userId) => {
  if (!userId) return { data: [], error: 'No user ID' };
  const { data, error } = await supabase
    .from('starred_experiments')
    .select('experiment_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('db:getStarredExperimentsDetailed error', error);
  return { data, error };
};

// -- Saved Observations --
export const getSavedObservations = async (userId, experimentId) => {
  if (!userId || !experimentId) return { data: [], error: 'Missing params' };
  const { data, error } = await supabase
    .from('saved_observations')
    .select('*')
    .eq('user_id', userId)
    .eq('experiment_id', String(experimentId));
  if (error) console.error('db:getSavedObservations error', error);
  return { data, error };
};

export const getAllSavedObservations = async (userId) => {
  if (!userId) return { data: [], error: 'No user ID' };
  const { data, error } = await supabase
    .from('saved_observations')
    .select('experiment_id, section_id, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) console.error('db:getAllSavedObservations error', error);
  return { data, error };
};

export const saveObservation = async (userId, experimentId, sectionId, data) => {
  if (!userId || !experimentId || !sectionId) return { error: 'Missing params' };
  
  console.info('db:saveObservation: Attempting upsert', { userId, experimentId, sectionId });
  const { error } = await supabase
    .from('saved_observations')
    .upsert({ 
      user_id: userId, 
      experiment_id: String(experimentId), 
      section_id: String(sectionId), 
      data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id,experiment_id,section_id' });
  if (error) console.error('db:saveObservation error', error.message, error.details, error);
  return { error };
};

export const clearAllObservations = async (userId) => {
  if (!userId) return { error: 'No user ID' };
  console.info('db:clearAllObservations', userId);
  const { error } = await supabase
    .from('saved_observations')
    .delete()
    .eq('user_id', userId);
  if (error) console.error('db:clearAllObservations error', error);
  return { error };
};

// -- Feedback --
export const submitFeedback = async ({ userId, experimentId, rating, comment }) => {
    if (!userId || !experimentId) return { error: 'Missing params' };
    console.info('db:submitFeedback', { userId, experimentId, rating });
    
    const { data, error } = await supabase
        .from('user_feedbacks')
        .upsert({
            user_id: userId,
            experiment_id: String(experimentId),
            rating,
            comment,
            created_at: new Date() // Treat as last updated
        }, { onConflict: 'user_id,experiment_id' })
        .select();

    if (error) console.error('db:submitFeedback error', error);
    return { data, error };
};

export const getUserFeedback = async (userId, experimentId) => {
    if (!userId || !experimentId) return { data: null, error: 'Missing params' };
    const { data, error } = await supabase
        .from('user_feedbacks')
        .select('*')
        .eq('user_id', userId)
        .eq('experiment_id', String(experimentId))
        .maybeSingle();

    if (error) console.error('db:getUserFeedback error', error);
    return { data, error };
};
