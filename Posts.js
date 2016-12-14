var mongoose = require('mongoose');

/*
  het model noemt Post
  het bevat alle attributen die overeenkomen met het type van data
  dat we willen opslaan
*/
var PostSchema = new mongoose.Schema({
	title: String,
	link: String,
	//upvotes is geïnitialiseerd op 0
	upvotes:{type: Number, default: 0},
	//het comments is een array voor Comment referenties
	// voordeel hiervan is dat er gebruik kan gemaakt worden van de
	//mongoose build in [populate()] mongoose populate methode zodat
	//we gemakkelijk alle comments gelinkt met een post krijgen te zien.
	comments: [{type: mongoose.Schema.Types.ObjectId, ref: 'Comment'}]
});

//laat gebruikers toe om een post te verhogen en de waarde te bewaren
PostSchema.methods.upvote = function(cb){
	this.upvotes += 1;
	this.save(cb);
}

mongoose.model('Post', PostSchema);
