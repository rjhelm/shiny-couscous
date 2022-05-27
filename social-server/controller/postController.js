import Post from '../models/posts';
import Comments from '../models/comments';
import asyncHandler from 'express-async-handler';
import _ from 'lodash';
import fs from 'fs';
import path from 'path';

// @desc    Get all posts
const fetchAllPost = asyncHandler(async (req, res) => {
    const posts = await Post.find({}).sort({ createdAt: '-1' }).populate('user');
    if (posts) {
        res.status(200);
        res.json(posts);
    } else {
        res.status(404);
        throw new Error('No posts found');
    }
});

// @desc   Create a post by user
const postCreate = asyncHandler(async (req, res) => {
    const { caption, images } = req.body;
    const createPost = await Post.create({ caption, images, user: req.user });
    if (createPost) {
        res.status(201);
        res.json(createPost);
    } else {
        res.status(404);
        throw new Error()
    }
});

// @desc   Get specific user post
const getUserPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({})
        .sort({ createdAt: '-1' })
        .populate('user')
        .find({ user: req.params.userId });

    if (posts) {
        res.status(200);
        res.json(posts);
    } else {
        res.status(404);
        throw new Error('No posts found');
    }
});

// @desc   Get specific post
const getPostById = asyncHandler(async (req, res) => {
    const post = await (await Post.findById(req.params.postId)).populated('user');
    if (post) {
        res.status(200);
        res.json(post);
    } else {
        res.status(404);
        throw new Error('No post found');
    }
});

// @desc   Delete specific post 
const userPostDelete = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);
    if (post) {
        const __dirname = path.resolve();
        if (post.user.equals(req.user_id)) {
            post.images.map((el) => {
                fs.unlink(path.join(__dirname + `${el.image}`), (err) => {
                    console.log(path.join(__dirname + `${el.image}`));
                    if (err) {
                        console.log(err);
                    } else {
                        console.log('image deleted');
                    }
                });
            });
            await Post.findByIdAndRemove(req.params.postId);
            res.status(200);
            res.json(post)
        } else {
            res.status(401);
            throw new Error('You are not authorized to delete this post');
        }
    } else {
        res.status(404);
        throw new Error('No post found');
    }
});

// @desc   Edit Post
const userPostEdit = asyncHandler(async (req, res) => {
    const { caption, image } = req.body;
    const post = await Post.findById(req.params.postId);
    if (post) {
        if (post.user.equals(req.user_id)) {
            post.caption = caption;
            post.image = image;
            const updatedPost = await post.save();
            res.status(201).json(updatedPost);
        } else {
            res.status(401);
            throw new Error('You are not authorized to edit this post');
        }
    } else {
        res.status(404);
        throw new Error('No post found');
    }
});

// @desc   Like a post
const likePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);
    if (post) {
        const newLike = {
            user: req.user_id,
        };
        post.like.push(newLike);
        const updatedPost = await post.save();
        if (updatedPost) {
            res.json({
                status: 'ok',
                post: updatedPost,
            });
        } else {
            res.status(403);
            throw new Error('Like failed');
        }
    } else {
        res.status(404);
        throw new Error('No post found');
    }
});

// @desc   Unlike a post
const unlikePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);
    if (post) {
        const userIdx = _.findIndex(post.like, function (o) {
            return o.user === req.user_id;
        });
        post.like.splice(userIdx, 1);

        const updatedPost = await post.save();
        if (updatedPost) {
            res.json({
                status: 'ok',
                post: updatedPost,
            });
        } else {
            res.status(403);
            throw new Error('Unlike failed');
        }
    } else {
        res.status(404);
        throw new Error('No post found');
    }
});

// @desc   Get post comments
const getPostComments = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);
    if (post) {
        const comments = await Comments.find({ post: post._id })
            .sort({ createdAt: '-1' })
            .populate('user');
        if (comments) {
            res.json(comments);
        } else {
            res.status(404);
            throw new Error('No comments');
        }
    } else {
        res.status(404);
        throw new Error('Post not found!');
    }
});

// @desc  Comment on post
const commentOnPost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);
    if (post) {
        const { comment } = req.body;
        const newComment = await Comments.create({
            post: post._id,
            user: req.user._id,
            comment,
        });
        if (newComment) {
            res.json(newComment);
        } else {
            res.status(403);
            throw new Error('Comment failed!');
        }
    } else {
        res.status(404);
        throw new Error('Post not found!');
    }
});

// @desc  Delete comment
const deleteComment = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);
    if (post) {
        const comment = await Comments.findById(req.params.commentId).populate(
            'user'
        );
        if (comment) {
            if (comment.user._id.equals(req.user._id)) {
                const delComment = await comment.remove();
                if (delComment) {
                    res.json({
                        status: 'comment deleted!',
                    });
                } else {
                    res.status(403);
                    throw new Error('Comment delete error!');
                }
            } else {
                res.status(400);
                throw new Error('You are not authorized to delete this comment!');
            }
        } else {
            res.status(403);
            throw new Error('Comment not found!');
        }
    } else {
        res.status(404);
        throw new Error('Post not found!');
    }
});

// @desc  Edit comment
const editComment = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);
    if (post) {
        const comment = await Comments.findById(req.params.commentId).populate(
            'user'
        );
        if (comment) {
            if (comment.user._id.equals(req.user._id)) {
                comment.comment = req.body.comment;
                const updatedComment = await comment.save();
                if (updatedComment) {
                    res.json(updatedComment);
                } else {
                    res.status(403);
                    throw new Error('Comment edit error!');
                }
            } else {
                res.status(400);
                throw new Error('You are not authorized to delete this comment!');
            }
        } else {
            res.status(403);
            throw new Error('Comment not found!');
        }
    } else {
        res.status(404);
        throw new Error('Post not found!');
    }
});

export {
    getUserPosts,
    fetchAllPost,
    postCreate,
    userPostDelete,
    userPostEdit,
    likePost,
    unlikePost,
    getPostComments,
    commentOnPost,
    deleteComment,
    editComment,
};