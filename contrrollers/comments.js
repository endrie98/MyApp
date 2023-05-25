const postSchema = require('../models/post');
const commentSchema = require('../models/comments');



module.exports.createComment = async (req, res) => {
    const post = await postSchema.findById(req.params.id);
    const comment = new commentSchema(req.body.comment);
    comment.author = req.user._id
    post.comments.push(comment);
    await comment.save();
    await post.save();
    req.flash('success', 'Created new Comment!');
    res.redirect(`/posts/${post._id}`);
}



module.exports.deleteComment = async (req, res) => {
    const { id, commentId } = req.params;
    await postSchema.findByIdAndUpdate(id, { $pull: { comments: commentId } });
    await commentSchema.findByIdAndDelete(commentId);
    req.flash('success', 'Successfully deleted Comment')
    res.redirect(`/posts/${id}`)
}