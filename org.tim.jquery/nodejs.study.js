
(function(){
	var id = '22';
	
	
	function query(fn){
		console.log(Object.prototype.toString.call(fn));
		if(Object.prototype.toString.call(fn) !== '[object Function]'){
			console.log('it\'s not a function.');
			return;
		}
		fn();
	}
	
	query(function(){
		console.log('xxxxxxxxxxxxx');
	})
})()