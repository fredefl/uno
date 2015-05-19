var colors = ['red','green','blue','yellow','black', "cyan"];

function makeFirework( $c ) {
	 var $b = $('<div>').appendTo($c).addClass('boom');
	 var ta, i,
			 cnt = Math.floor(150 + Math.random() * 150 - 75),
			 x = 0, y = 0, z = 0,
			 incZ = 360 / cnt * 20,
			 incY = Math.floor(360 / cnt * 10),
			 clr = colors[Math.floor((Math.random()+0.19)*4)],
			 posX = Math.floor(400 + Math.random() * 400 - 250),
			 posY = Math.floor(300 + Math.random() * 200 - 100),
			 size = 50 * Math.floor((cnt / 50 + 1));

	 $b.css({ left: posX, top: posY }).hide();

	 for ( i = 0 ; i < cnt; i++ ) {
			z += Math.floor(incZ + Math.random() * 10 - 20);
			if ( z > 360 ) {
				 y += incY;
				 z = Math.floor(Math.random() * 5 - 10);

				 if ( y > 360 )
						y = 0;
			}

			x = Math.floor(Math.random() * 20 - 40);

			$('<div class="place"><div class="spark '+clr+'"></div></div>')
				 .appendTo($b)
				 .css('transform', 'translateX('+x+'px) rotateY('+y+'deg) rotateZ('+z+'deg)')
				 .find('.spark')
						.css('transform', 'rotateY(-'+y+'deg)');
	 }

	 ta = new TimelineLite({
						 onStart: function () { $b.show(); },
						 onComplete: function () {  $b.remove();  }
				 });

	 ta.insert(
				TweenLite.to($b.find('.place'), 0.5,
										 {
												easing: Expo.easeIn,
												css: {
															top: -size/1.5,
															left: -size/(2 + Math.random() - 0.5),
															width: size,
															height: size
													 }
										 })
			);

	 ta.insert(
				TweenLite.to($b.find('.place'), 3 + Math.random() * 0.5 - 1,
										 {
												easing: Linear.easeOut,
												css: {
															top: '+=30px',
															height: '+=90px',
															opacity: 0
													 }
										 }),
				0.5
			);

	 return ta;
}

function launch_firework() {

   var cnt = Math.ceil(Math.random()*4+1 + 5);

   var tml = new TimelineLite();

   while (cnt--)
      tml.insert(makeFirework($('.container')), Math.random() * 0.8 + 0.4);


   tml.play();

}

function show_firework () {
	launch_firework();

	setTimeout(function () { 
			launch_firework();
	}, Math.random() * 1000 + 1700);
}