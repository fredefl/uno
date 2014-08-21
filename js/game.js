
/**

-20 deg 	right -90px
-10 deg 	right -80px
0 	deg 	right -80px
10	deg		-
20 	deg		left -80px, bottom -20px
30 deg		left -90px, bottom -40px
40 deg		left -100ox, bottom -60px




*/



var Card = function (colour, rank) {
    this.colour = colour;
    this.rank = rank;
    this.width = 242;
    this.height = 362;
    this.offset = -140;

    this.visualize = function (options) {
    	return Visualize.visualize([this], options);
    };
}; 

var Visualize = {
	deckFileLocation: 'img/cards.svg',

	defaultOptions: {
		scale: 1.0,
	},

	getSource: function (card) {
			return Visualize.deckFileLocation + '#' + card.colour + '-' + card.rank;
	},

	visualize: function (cards, options) {
		options = options || {};

		options = $.extend(this.defaultOptions, options);

		return cards.map( function (card) {
			var visualization = $(document.createElement('img'));
			visualization.attr('src', Visualize.getSource(card));
			
			visualization.attr('class', 'card');
			visualization.attr('height', card.height * options.scale);
			visualization.attr('width', card.width * options.scale);
			visualization.attr('style', "margin-left:" + (card.offset * options.scale) + "px;");

			return visualization;
		});
	},

	visualizeList: function (cards, options) {
		return cards.map( function (card) {
			return $(document.createElement('li')).append(Visualize.visualize([card], options));
		});
	}
}

var Hand = function (cards) {
	this.cards = cards || [];

	this.size = function () {
		return this.cards.length;
	}

	this.addCards = function (cards) {
		this.cards = this.cards + cards;
	};
}

var Deck = function () {
	// The pro's do it, as do we
	var that = this;

	// Contains all cards in the deck at present time
	this.cards = [];

	// Hand size
	this.handSize = 7;

	// Contains colours present in the game
	// - please do not add other colours, do ONLY exclude colours
	this.colours = ['red', 'green', 'blue', 'yellow'];

	// Contains all cards with colours
	this.colouredRanks = {
		'0': 1,
		'1': 2,
		'2': 2,
		'3': 2,
		'4': 2,
		'5': 2,
		'6': 2,
		'7': 2,
		'8': 2,
		'9': 2,
		'skip': 2,
		'reverse': 2,
		'draw_two': 2
	};

	// Contains all cards without colours (wild) 
	this.wildRanks = {
		'wild': 4,
		'draw_four': 4
	}

	this.size = function () {
		return this.cards.length;
	}
	
	// Adds multiple cards
	this.addCards = function (cards) {
		cards.every(this.addCard);
	};

	this.addCard = function (card) {
		this.cards.push(card);
	};

	this.build = function (multiplier) {
		// Default to 1
		multiplier = multiplier || 1;

		// Discard all cards
		this.cards = [];

		// Add all colour cards
		this.colours.forEach( function (colour) {

			Object.keys(that.colouredRanks).forEach( function (rank) {
				amount = that.colouredRanks[rank];
				for (var i = 1; i <= amount * multiplier; i++) {
					that.addCard(new Card(colour, rank));
				};
			});
		});

		// Add all wild cards
		Object.keys(that.wildRanks).forEach( function (rank) {
			amount = that.wildRanks[rank];
			for (var i = 1; i <= amount * multiplier; i++) {
				that.addCard(new Card('wild', rank));
			};
		});
	}

	// Fisher-Yates shuffle
	this.shuffle = function () {
		var currentIndex = this.cards.length, temporaryValue, randomIndex ;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = this.cards[currentIndex];
			this.cards[currentIndex] = this.cards[randomIndex];
			this.cards[randomIndex] = temporaryValue;
		}
	}

	this.draw = function (amount) {
		// 1 card will be drawn by default
		amount = amount || 1;
		
		// Check card supply
		if (this.cards.length >= amount) {
			var drawnCards = [];

			// Return x amount of cards
			for (var i = 1; i <= amount; i++) {
				// Pop cards off the stack and push them to the new pile
				drawnCards.push(this.cards.pop());
			}

			// Return drawn cards
			return drawnCards;
		}

		// We are out of cards, please refill
		return false;
	}

	this.deal = function (amount) {
		// 1 hand will be drawn by default
		amount = amount || 1;

		// Check card supply
		if (this.cards.length >= amount * this.handSize) {
			var hands = []

			// Return x amount of hands
			for (var i = 1; i <= amount; i++) {
				hands.push( new Hand(this.draw(this.handSize)) );
			}

			return hands;
		}

		return false;
	}
}

var Game = function (options) {
	
	this.defaultOptions = {}

	this.options = $.extend(this.defaultOptions, options || {});

	this.start = function () {
		this.deck = new Deck();
		this.deck.build();
		this.deck.shuffle();

		this.hand = this.deck.deal(1)[0];

		var initialCard = this.deck.draw()[0];
		$('#discard-pile-top').attr('src', Visualize.getSource(initialCard));
		$('#hand-cards').append(Visualize.visualizeList(this.hand.cards, {scale: 0.5}));

		$('#hand-cards, #discard-pile-drop').sortable({
			connectWith: 'ul',
			tolerance: "pointer"
		});

		$('#discard-pile-drop').on('sortover sortreceive', function (event, ui) {
				$(event.toElement).height(362).width(242);
		});
		$('#hand-cards').on('sortover sortreceive', function (event, ui) {
			$(event.toElement).height(181).width(121);
		});
	}
}


$(function() {
	var game = new Game();
	game.start();
});