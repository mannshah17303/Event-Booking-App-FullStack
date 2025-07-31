import { RequestHandler, Router } from "express";
import { authController } from "../controllers/auth.controller";
import { userController } from "../controllers/user.controller";
import { checkIfAuthenticatedUser, checkToken } from "../middlewares/token.middleware";

const router = Router();


router.post("/insertUser", checkIfAuthenticatedUser, userController.registerUser);
router.get("/", userController.getAll);
router.get("/getDataOfLoggedInUser",checkToken, userController.getDataOfLoggedInUser)
router.post("/login", userController.loginUser as RequestHandler)
router.put(`/update/:id`, checkToken, userController.updateUser);
router.delete("/delete/:id", checkToken, userController.deleteUser)
router.post("/logout", checkToken, userController.logout)
router.get("/current-user", authController.getCurrentUser as RequestHandler)
router.post("/forget-password", userController.forgetPassword)
router.post("/reset-password", userController.resetPassword as RequestHandler)

export default router;