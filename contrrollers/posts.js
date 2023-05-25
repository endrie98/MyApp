const postSchema = require('../models/post');
const { cloudinary } = require('../cloudinary');



module.exports.index = async (req, res) => {
    const posts = await postSchema.find({})
    res.render('posts/index', { posts })
}



module.exports.renderNewForm = (req, res) => {
    res.render('posts/new')
}



module.exports.createPost = async (req, res) => {
    const post = new postSchema(req.body.post);
    post.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    post.author = req.user._id;
    await post.save();
    req.flash('success', 'Successfully made a new post!');
    res.redirect(`/posts/${post._id}`)
}



module.exports.showPost = async (req, res) => {
    const post = await postSchema.findById(req.params.id).populate({
        path:'comments',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!post) {
        req.flash('error', 'Cannot find that Post!')
        return res.redirect('/posts');
    }
    res.render('posts/show', { post })
}



module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const post = await postSchema.findById(id)
    if (!post) {
        req.flash('error', 'Cannot find that Post!');
        return res.redirect('/posts');
    }
    res.render('posts/edit', { post })
}



module.exports.updatePost = async (req, res) => {
    const { id } = req.params;
    const post = await postSchema.findByIdAndUpdate(id, { ...req.body.post });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    post.images.push(...imgs);
    await post.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await post.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated Post!');
    res.redirect(`/posts/${post._id}`)
}



module.exports.deletePost = async (req, res) => {
    const { id } = req.params;
    await postSchema.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Post')
    res.redirect('/posts')
}