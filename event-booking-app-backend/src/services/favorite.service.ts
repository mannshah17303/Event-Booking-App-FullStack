import { Favorites } from "../models";
import { favoriteRepository } from "../repositories/favorite.repository";

export const favoriteService = {
  async addFavorite(event_id:number, currentUserId:string) {
    const favorite = await favoriteRepository.addFavorite(event_id, currentUserId);
    return favorite;
  },
  async getAllFavorites() {
    return await favoriteRepository.getAllFavorites();
  },
  async removeFavorite(event_id:number, currentUserId:string) {
    const favorite = await favoriteRepository.removeFavorite(event_id, currentUserId);
    return favorite;
  },
};
