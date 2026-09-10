import { useEffect, useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { getSessionId } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export function useFavorites(propertyId?: string) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const sessionId = getSessionId();
  const { user } = useAuth();

  const loadFavorites = useCallback(async () => {
    if (user) {
      const { data } = await supabase
        .from('user_favorites')
        .select('property_id')
        .eq('user_id', user.id);
      if (data) {
        setFavorites(data.map((favorite) => favorite.property_id));
      }
      return;
    }

    const { data } = await supabase
      .from('favorites')
      .select('property_id')
      .eq('session_id', sessionId);
    if (data) {
      setFavorites(data.map((favorite) => favorite.property_id));
    }
  }, [sessionId, user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = propertyId ? favorites.includes(propertyId) : false;

  const toggleFavorite = useCallback(async () => {
    if (!propertyId) return;

    if (user) {
      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('property_id', propertyId)
          .eq('user_id', user.id);
        if (!error) {
          setFavorites((previous) => previous.filter((id) => id !== propertyId));
        }
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({ property_id: propertyId, user_id: user.id });
        if (!error) {
          setFavorites((previous) => [...previous, propertyId]);
        }
      }
      return;
    }

    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('property_id', propertyId)
        .eq('session_id', sessionId);
      if (!error) {
        setFavorites((previous) => previous.filter((id) => id !== propertyId));
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ property_id: propertyId, session_id: sessionId });
      if (!error) {
        setFavorites((previous) => [...previous, propertyId]);
      }
    }
  }, [isFavorite, propertyId, sessionId, user]);

  return { favorites, isFavorite, toggleFavorite, refreshFavorites: loadFavorites };
}
