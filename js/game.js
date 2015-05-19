// The card object
var Card = function (colour, rank) {
	// The colour of the card (red, blue, yellow, green)
    this.colour = colour;

    // The rank of the card (ex. 2, 4, wild, draw_four, draw_two, reverse)
    this.rank = rank;

    // The unique GUID of the card generated at object creation
    this.id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    	var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    	return v.toString(16);
	});

	// The width of a card
    this.width = 242;

    // The height of a card
    this.height = 362;

    // Card style offset
    this.offset = -140;

    // Wrapper function for card visualisation
    this.visualise = function (options) {
    	return visualise.visualise([this], options);
    };
}; 

// The visualisation object
var visualise = {
	// Location of card SVG file
	deck_file_location: 'img/cards.svg',

	// Default options
	default_options: {
		// Default scale is 1:1
		scale: 1.0,
	},

	// Gets source href for img tags
	get_source: function (card) {
			return visualise.deck_file_location + '#' + card.colour + '-' + card.rank;
	},

	// Visualises card
	visualise: function (cards, options) {
		// Set options from argument
		options = options || {};

		// Use default options if none are passed
		options = $.extend(this.default_options, options);

		// Run a function on each card in the list (map)
		return cards.map( function (card) {
			// Create a new image
			var visualization = $(document.createElement('img'));

			// Set the source attribute
			visualization.attr('src', visualise.get_source(card));
			
			// Set the card class
			visualization.attr('class', 'card');

			// Set the ID as a data attribute
			visualization.attr('data-id', card.id);

			// Set card height from initial height and scale
			visualization.attr('height', card.height * options.scale);

			// Set card width from initial width and scale
			visualization.attr('width', card.width * options.scale);

			// Set offset as margin
			visualization.attr('style', "margin-left:" + (card.offset * options.scale) + "px;");

			// Return HTML object
			return visualization;
		});
	},

	// Visualises a list with the visualise function
	visualise_list: function (cards, options) {
		// Run visualise on each card and put each in a li
		return cards.map( function (card) {
			// Create li object and append visualised card
			return $(document.createElement('li')).append(visualise.visualise([card], options));
		});
	}
}

// The player hand object
var Hand = function (cards) {
	// Make hand empy by default unless cards are passed
	this.cards = cards || [];

	// Make empty staging array for to-be played cards
	this.staging = [];

	// Gets the hand size (number of cards)
	this.size = function () {
		return this.cards.length;
	}

	// Adds a list of cards
	this.add_cards = function (cards) {
		this.cards = this.cards + cards;
	};

	// Find card from card ID
	this.find_card = function (card_id, where, remove) {
		// Determine where to find the card
		//  find it in the cards array unless otherwise specified
		var here = (where == 'staging' ? this.staging : this.cards);

		// Iterate over each card in given array
		for (var i = here.length - 1; i >= 0; i--) {
			// If the ID of it matches the one to be found
			if (here[i].id == card_id) {
				// If remove is specified
				if (remove === true) {
					// Remove it from the source array and return the card
					return here.splice(i, 1)[0];
				} else {
					// Return the card
					return here[i];
				}
				
			}
		}

		// Return null if no card is found
		return null;
	};
}

// The deck object that generates cards and deals them
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

	// Gets the size of the deck
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

	// Builds a deck
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
	var that = this;

	this.options = $.extend(this.default_options, options || {});

	this.visualise_top_card = function () {
		$('#discard-pile-top').attr('src', visualise.get_source(this.pile[this.pile.length - 1]));
	}

	this.start = function () {
		this.deck = new Deck();
		this.deck.build();
		this.deck.shuffle();
		this.currently_drawn_cards = 0;
		this.wild_new_colour = null;

		this.hand = this.deck.deal(1)[0];
		this.pile = [];

		this.pile.push(this.deck.draw()[0]);
		this.visualise_top_card();	
		
		$('#hand-cards').append(visualise.visualise_list(this.hand.cards, {scale: 0.5}));

		$('#hand-cards, #discard-pile-drop').sortable({
			connectWith: 'ul',
			tolerance: "pointer"
		});

		$('#discard-pile-drop').on('sortover sortreceive', function (event, ui) {
			var card_id = $(event.toElement).attr('data-id');

			if (card_id === null) {
				card_id = $(event.toElement.firstChild).attr('data-id');
			}

			if (that.check_eligibility(card_id, event)) {
				console.info("You may put this card down");
				$(event.toElement).height(362).width(242);
				if (event.type == 'sortreceive') {
					that.hand.staging.push(that.hand.find_card(card_id, null, true));
				}
			} else {
				console.warn("You may NOT put this card down");
				if (event.type == 'sortreceive') {
					ui.sender.sortable("cancel");
				}
			}
		});

		$('#hand-cards').on('sortover sortreceive', function (event, ui) {
			var card_id = $(event.toElement).attr('data-id');

			if (card_id === null) {
				card_id = $(event.toElement.firstChild).attr('data-id');
			}

			$(event.toElement).height(181).width(121);

			if (event.type == 'sortreceive') {
				if (that.hand.find_card(card_id) === null) {
					that.hand.cards.push(that.hand.find_card(card_id, 'staging', true));
				}
			}
		});

		$('#play').on('click', function (event) {
			if (that.hand.staging.length == 0 && that.currently_drawn_cards < 3) {
				return false;
			}

			if (that.hand.staging[that.hand.staging.length - 1].colour == 'wild') {
				if (that.wild_new_colour == null) {
					$('#chooseColour').modal('show');
					return false;
				} else {
					that.hand.staging[that.hand.staging.length - 1].colour = that.wild_new_colour;
					that.wild_new_colour = null;
				}
			}

			while (that.hand.staging.length > 0) {
				that.pile.push(that.hand.staging.shift());
			};
			that.visualise_top_card();
			$('#discard-pile-drop').empty();
			$('#draw').removeClass('disabled');
			that.currently_drawn_cards = 0;

			if (that.hand.size() == 0) {
				// Show firework
				show_firework();
			} else {
				$("body").stop().animate({backgroundColor:'#afa'},500,function(){
					$(this).animate({backgroundColor:'#fff'},500);
				});
			}
		});

		$(document).bind('keydown', 'p', function (event) {
			$('#play').click();
		});

		$(document).bind('keydown', 'd', function (event) {
			$('#draw').click();
		});

		$(document).bind('keydown', 'u', function (event) {
			$('#uno').click();
		});

		$('.select-colour span').on('click', function (event) {
			var colour = $(this).attr('data-colour');
			that.wild_new_colour = colour;
			$('#chooseColour').modal('hide');
			$('#play').click();
		})

		$('#uno').on('click', function (event) {
			// Let's check if the person is right...
		});

		$('#draw').on('click', function (event) {
			if (that.currently_drawn_cards >= 3) {
				return null;
			}
			var drawn_card = that.deck.draw();

			if (drawn_card !== false) {
				that.hand.cards.push(drawn_card[0]);
				$('#hand-cards').append(visualise.visualise_list(drawn_card, {scale: 0.5}));
				that.currently_drawn_cards++;
				if (that.currently_drawn_cards >= 3) {
					$('#draw').addClass('disabled');
				}
			} else {
				alert("We're running dry, need ammo. Over.");
			}

		});
	};

	this.check_eligibility = function (card_id, event) {
		var card = this.hand.find_card(card_id);
		var top_card = this.pile[this.pile.length - 1];

		console.log("Checking eligibility...", card, top_card, card_id, event);

		if (this.hand.staging.length == 0) { // This will be the first card in staging
			if (card.colour == top_card.colour || card.rank == top_card.rank || card.colour == 'wild') {
				return true;
			}
		} else { // This is a subsequent card in the staging
			var top_staging = this.hand.staging[0];
			if (card.rank == top_staging.rank || (top_staging.rank == 'draw_four' && card.rank == 'draw_two') || (top_staging.rank == 'draw_two' && card.rank == 'draw_four')){
				return true;
			}
		}
		return false;
	};
}

var game = new Game();
	game.start();

$(function() {
	
});
