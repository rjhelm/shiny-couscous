import express from 'express';
const router = express.Router();

// Get Home Page
router.get('/', (req, res, next) => {
    res.render('index', { title: "Express" });
});

export default router;