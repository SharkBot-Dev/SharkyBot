import { Router } from "express";

const router = Router();

router.get("/github", (req, res) => {
    res.redirect("https://github.com/SharkBot-Dev/SharkyBot");
});

export default router;