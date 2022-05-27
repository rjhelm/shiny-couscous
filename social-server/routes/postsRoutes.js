import express from 'express';
import { verifyUser } from '../auth';
import { cors, corsWithOptions } from './cors';
import {
    fetchAllPost,
    postCreate,
    getUserPosts,
    userPostDelete,
    userPostEdit,
    getPostById,
    likePost,
    unlikePost,
    commentOnPost,
    getPostComments,
    deleteComment,
    editComment,
} from '../controllers/postController';

const router = express.Router();

router.route("/").get(verifyUser, fetchAllPost).post(verifyUser, postCreate);
router.route("/user/:userId").get(verifyUser, getUserPosts);
router
    .route("/:postId")
    .get(verifyUser, getPostById)
    .delete(verifyUser, userPostDelete)
    .put(verifyUser, userPostEdit);
router.route("/:postId/like").put(verifyUser, likePost);
router.route("/:postId/unlike").put(verifyUser, unlikePost);
router
    .route("/:postId/comment")
    .get(verifyUser, getPostComments)
    .post(verifyUser, commentOnPost);
router
    .route("/:postId/comment/:commentId")
    .delete(verifyUser, deleteComment)
    .put(verifyUser, editComment);

export default router;