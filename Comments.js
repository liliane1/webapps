var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
	body: String,
	author: String,
	upvotes: {type: Number, default: 0},
//ObjectId type wordt gebruikt om een relatie tussen verschillende data models
//te creeren.
//ObjectId data type refereerd naar 12 byte MongoDB ObjectId, dit is
//opgeslagen in de database
//ref: ref eigenschap geeft het type van objectId aan zodat mongoose beide
//items gelijktijdig kan ophalen uit de database.
	post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'}

});

mongoose.model('Comment', CommentSchema);
