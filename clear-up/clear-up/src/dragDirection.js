

function bindMouseDirection(dom, callback) {
	var domCt = $(dom),
		posX = 0,
		posY = 0;


	domCt.bind('mousedown', function(e) {
		posX = e.clientX;
		posY = e.clientY;
		// console.log(e);
		// console.log('start drag');
		// console.log(posX);
		// console.log(posY);

		domCt.bind('mouseout', function(e) {
			var endX = e.clientX,
				endY = e.clientY;
			// console.log('end drag');
			// console.log(endX);
			// console.log(endY);

			var dir = calc_dir({
				x: posX,
				y: posY
			}, {
				x: endX,
				y: endY
			});
			callback(dir);
			domCt.unbind('mouseout');
		});
	});


	domCt.bind('mouseup', function(e) {
		domCt.unbind('mouseout');
	})
}



function calc_dir(startPos, endPos) {
	var startX = parseFloat(startPos.x),
		startY = parseFloat(startPos.y),
		endX = parseFloat(endPos.x),
		endY = parseFloat(endPos.y),
		diffX = Math.abs(startX - endX),
		diffY = Math.abs(startY - endY),
		ret;

	if (diffX >= diffY) {
		//横向
		if (startX > endX) {
			ret = "left";
		} else {
			ret = 'right';
		}
	} else {
		//纵向
		if (startY > endY) {
			ret = 'top';
		} else {
			ret = 'bottom';
		}
	}
	return ret;
}