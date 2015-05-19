
function generate_guid () {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
	});
}

var Card = function (colour, rank) {
    this.colour = colour;
    this.rank = rank;
    this.id = generate_guid();
    this.width = 242;
    this.height = 362;
    this.offset = -140;

    this.visualize = function (options) {
    	return Visualize.visualize([this], options);
    };
}; 

var Visualize = {
	deck_file_location: 'img/cards.svg',

	default_options: {
		scale: 1.0,
	},

	get_source: function (card) {
			return Visualize.deck_file_location + '#' + card.colour + '-' + card.rank;
	},

	visualize: function (cards, options) {
		options = options || {};

		options = $.extend(this.default_options, options);

		return cards.map( function (card) {
			var visualization = $(document.createElement('img'));
			visualization.attr('src', Visualize.get_source(card));
			
			visualization.attr('class', 'card');
			visualization.attr('data-id', card.id);
			visualization.attr('height', card.height * options.scale);
			visualization.attr('width', card.width * options.scale);
			visualization.attr('style', "margin-left:" + (card.offset * options.scale) + "px;");

			return visualization;
		});
	},

	visualize_list: function (cards, options) {
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

	this.add_cards = function (cards) {
		this.cards = this.cards + cards;
	};

	this.find_card = function (card_id) {
		var found = null;
		this.cards.forEach( function (card) {
			if (card.id == card_id) {
				found = card;
			}
		});
	};
}

var Deck = function () {
	// The pro's do it, as do we
	var that = this;

	// Contains all cards in the deck at present time
	this.cards = [];

	// Hand size
	this.hand_size = 7;

	// Contains colours present in the game
	// - please do not add other colours, do ONLY exclude colours
	this.colours = ['red', 'green', 'blue', 'yellow'];

	// Contains all cards with colours
	this.coloured_ranks = {
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
	this.wild_ranks = {
		'wild': 4,
		'draw_four': 4
	}

	this.size = function () {
		return this.cards.length;
	}
	
	// Adds multiple cards
	this.add_cards = function (cards) {
		cards.every(this.add_card);
	};

	this.add_card = function (card) {
		this.cards.push(card);
	};

	this.build = function (multiplier) {
		// Default to 1
		multiplier = multiplier || 1;

		// Discard all cards
		this.cards = [];

		// Add all colour cards
		this.colours.forEach( function (colour) {

			Object.keys(that.coloured_ranks).forEach( function (rank) {
				amount = that.coloured_ranks[rank];
				for (var i = 1; i <= amount * multiplier; i++) {
					that.add_card(new Card(colour, rank));
				};
			});
		});

		// Add all wild cards
		Object.keys(that.wild_ranks).forEach( function (rank) {
			amount = that.wild_ranks[rank];
			for (var i = 1; i <= amount * multiplier; i++) {
				that.add_card(new Card('wild', rank));
			};
		});
	}

	// Fisher-Yates shuffle
	this.shuffle = function () {
		var current_index = this.cards.length, temporary_value, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== current_index) {
			// Pick a remaining element...
			random_index = Math.floor(Math.random() * current_index);
			current_index -= 1;

			// And swap it with the current element.
			temporary_value = this.cards[current_index];
			this.cards[current_index] = this.cards[random_index];
			this.cards[random_index] = temporary_value;
		}
	}

	this.draw = function (amount) {
		// 1 card will be drawn by default
		amount = amount || 1;
		
		// Check card supply
		if (this.cards.length >= amount) {
			var drawn_cards = [];

			// Return x amount of cards
			for (var i = 1; i <= amount; i++) {
				// Pop cards off the stack and push them to the new pile
				drawn_cards.push(this.cards.pop());
			}

			// Return drawn cards
			return drawn_cards;
		}

		// We are out of cards, please refill
		return false;
	}

	this.deal = function (amount) {
		// 1 hand will be drawn by default
		amount = amount || 1;

		// Check card supply
		if (this.cards.length >= amount * this.hand_size) {
			var hands = []

			// Return x amount of hands
			for (var i = 1; i <= amount; i++) {
				hands.push( new Hand(this.draw(this.hand_size)) );
			}

			return hands;
		}

		return false;
	}
}

var Game = function (options) {
	
	this.default_options = {}

	this.options = $.extend(this.default_options, options || {});

	this.start = function () {
		this.deck = new Deck();
		this.deck.build();
		this.deck.shuffle();

		this.hand = this.deck.deal(1)[0];

		var initial_card = this.deck.draw()[0];
		$('#discard-pile-top').attr('src', Visualize.get_source(initial_card));
		$('#hand-cards').append(Visualize.visualize_list(this.hand.cards, {scale: 0.5}));

		$('#hand-cards, #discard-pile-drop').sortable({
			connectWith: 'ul',
			tolerance: "pointer"
		});

		$('#discard-pile-drop').on('sortover sortreceive', function (event, ui) {
				if (this.check_eligibility($(card_element).attr('data-id'))) {
					$(event.toElement).height(362).width(242);
				}
		});
		$('#hand-cards').on('sortover sortreceive', function (event, ui) {
			$(event.toElement).height(181).width(121);
		});
	};

	this.check_eligibility = function (card_id) {
		this.hand.find_card(card_id);
	};
}

var game = new Game();
	game.start();

$(function() {
	
});
