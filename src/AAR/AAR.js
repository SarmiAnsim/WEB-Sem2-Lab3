var modal1 = document.getElementById('id01');
var modal2 = document.getElementById('id02');

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal1) {
        modal1.style.display = "none";
    }
    if(event.target == modal2) {
        modal2.style.display = "none";
    }
}
function myFunction() {
    var popup = document.getElementById("myPopup");
    popup.classList.toggle("show");
}

function validateEmail(email) {
  	var pattern  = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  	return pattern.test(email);
}

function ShowError(message) {
    	$('#error').html(message);
		$('#error').stop();
		$('#error').fadeTo( 200, 1.00 );
		$('#error').fadeTo( 200, 0.50 );
		$('#error').fadeTo( 200, 1.00 );
	}

function ShowHistory() {
	$.ajax({
		type: "GET",
		url: "http://localhost:3002/history",
		success: function(data) {
			if(data != "Not found!")
			{
      			var Data = JSON.parse(data);

				$('#myUL').empty();

				if($('#searchAge').val() != "")
					for(var i=0; i<Data.length; i++) {
						var date = new Date(Data[i].activity);
						$('#myUL').append(
							'<li>' +
							Data[i].name +
							`<span class="date">${date.toLocaleDateString('en-GB')} ${date.toLocaleTimeString('en-GB')}</span>`+
							'</li>');
					}

			}
			console.log(`History: ${data}`);
    	}
	});
}

$(function() {
	ShowHistory();

	$('#entry').click(function () {
		if($('#login').val() == "" || $('#psw').val() == "")
		{
			$('#err').stop();
			$('#err').fadeTo( 200, 1.00 );
			$('#err').fadeTo( 200, 0.50 );
			$('#err').fadeTo( 200, 1.00 );
			$('#err').fadeTo( 200, 0.50 );
			$('#err').fadeTo( 200, 1.00 );
			$('#err').fadeTo( 5000, 0.00 );
		} else {
			
		var datastr = 
			`login=${$('#login').val()}&`+	
			`psw=${$('#psw').val()}`;

		$.ajax({
			type: "POST",
			url: "http://localhost:3002/login",
			data: datastr,
			success: function(data) {
				console.log(data);
				if(data.code == 0)
				{
					$('#err').stop();
					$('#err').fadeTo( 200, 1.00 );
					$('#err').fadeTo( 200, 0.50 );
					$('#err').fadeTo( 200, 1.00 );
					$('#err').fadeTo( 200, 0.50 );
					$('#err').fadeTo( 200, 1.00 );
					$('#err').fadeTo( 5000, 0.00 );
				}
				else
					document.location.href=location.href;
			}
		});
		}
	});

	$('#register').click(function () {
		var r = /[^A-Z-a-z-0-9]/g;
		if($('#nas').val() == "") {
			$('#nas').addClass("error");
			ShowError('Введите Имя и Фамилию!');
		}
		else if(!validateEmail($('#email').val())) {
			$('#email').addClass("error");
			ShowError('Введите корректный e-mail');
		} else if($('#rpsw').val() != $('#rpsw-repeat').val()) {
			$('#rpsw-repeat').addClass("error");
			ShowError('Пароли не совпадают!');
		} else if($('#rpsw').val().length < 3) {
			$('#rpsw').addClass("error");
			$('#rpsw-repeat').addClass("error");
			ShowError('Слишком короткий пароль. Минимальная длинна 3 символа!');
		} else if(r.test($('#rpsw').val())) {
			$('#rpsw').addClass("error");
			$('#rpsw-repeat').addClass("error");
			ShowError('Пароль содержит недопустимые символы. Разрешены латинские буквы и цифры!');
		} else {
			var datastr = 
			`name=${$('#nas').val()}&`+	
			`email=${$('#email').val()}&`+	
			`psw=${$('#rpsw').val()}`;

			$.ajax({
				type: "POST",
				url: "http://localhost:3002/register",
				data: datastr,
				success: function(data) {
					console.log(data);
					if(data.code == 0)
					{
						$('#rerr').stop();
						$('#rerr').fadeTo( 200, 1.00 );
						$('#rerr').fadeTo( 200, 0.50 );
						$('#rerr').fadeTo( 200, 1.00 );
						$('#rerr').fadeTo( 200, 0.50 );
						$('#rerr').fadeTo( 200, 1.00 );
						$('#rerr').fadeTo( 5000, 0.00 );
					}
					else
						document.location.href=location.href;
				}
			});
		}
		
	});

	$('#nas, #email, #rpsw, #rpsw-repeat').bind('focus', function(){
  		if(this.id == 'rpsw' || this.id == 'rpsw-repeat')
  		{
  			$('#rpsw').removeClass('error');
  			$('#rpsw-repeat').removeClass('error');
  		}
  		else
  			$(this).removeClass('error');

		$('#error').fadeTo( 200, 0.00 );
	});
});