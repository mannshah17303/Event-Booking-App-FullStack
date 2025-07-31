import { favoriteController } from "../controllers/favorite.controller";
import { Router } from "express";
import { checkToken } from "../middlewares/token.middleware";
const router = Router();


router.post("/addFavorite", checkToken, favoriteController.addFavorite)
router.post("/removeFavorite", checkToken, favoriteController.removeFavorite)
router.get("/", favoriteController.getAllFavorites);

router.get("/showRedColorInFavoriteEvents", favoriteController.showRedColorInFavoriteEvents);

//searching, sorting, pagination
router.get("/search-sort-pagination", favoriteController.searchedSortPaginateFavorites)

export default router;