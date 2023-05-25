const Joi = require('joi');


module.exports.postSchema = Joi.object({
    post: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        lucky: Joi.number().required().min(0)
    }).required(),
    deleteImages: Joi.array()
});




module.exports.commentSchema = Joi.object({
    comment: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
});