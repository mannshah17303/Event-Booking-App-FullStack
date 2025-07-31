import { Favorites } from "../models";

export const favoriteRepository = {
  async getAllFavorites() {
    return await Favorites.findAll();
  },

  async addFavorite(event_id: number, currentUserId: string) {
    return await Favorites.create({
      user_id: currentUserId,
      event_id: event_id,
    } as any);
  },

  async removeFavorite(event_id: number, currentUserId: string) {
    return await Favorites.destroy({
      where: {
        user_id: currentUserId,
        event_id: event_id,
      },
    });
  },
};
