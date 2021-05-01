
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

$(function() {
	DataTableUpdate();

	$('#exit').click(function () {
		//var datastr = document.location.search.split('?').join('');
		$.ajax({
			type: "POST",
			url: "http://localhost:3002/newId",
			//data: datastr,
			success: function(data) {
				document.location.href=location.href;
			}
		});
	});

	$('#me').click(function () {
		//var datastr = `${document.location.search.split('?').join('')}`;

		$.ajax({
			type: "POST",
			url: "http://localhost:3002/mydata",
			//data: datastr,
			success: function(data) {
				var Data = JSON.parse(data);

				$('#nas').val(Data.name);
				$('#email').val(Data.login);
			}
		});
	});

	$('#save').click(function () {
		var r = /[^A-Z-a-z-0-9]/g;
		if($('#nas').val() == "") {
			$('#nas').addClass("error");
			ShowError('Введите Имя и Фамилию!');
		}
		else if(!validateEmail($('#email').val())) {
			$('#email').addClass("error");
			ShowError('Введите корректный e-mail');
		} else if($('#psw').val() != $('#psw-repeat').val()) {
			$('#psw-repeat').addClass("error");
			ShowError('Пароли не совпадают!');
		} else if($('#psw').val().length < 3 && $('#psw').val() !="") {
			$('#psw').addClass("error");
			$('#psw-repeat').addClass("error");
			ShowError('Слишком короткий пароль. Минимальная длинна 3 символа!');
		} else if(r.test($('#psw').val())) {
			$('#psw').addClass("error");
			$('#psw-repeat').addClass("error");
			ShowError('Пароль содержит недопустимые символы. Разрешены латинские буквы и цифры!');
		} else {
			var datastr = //`${document.location.search.split('?').join('')}&`+
				`name=${$('#nas').val()}&`+	
				`email=${$('#email').val()}&`+	
				`oldpsw=${$('#oldpsw').val()}&`+
				`psw=${$('#psw').val()}`;

			$.ajax({
				type: "POST",
				url: "http://localhost:3002/changeUser",
				data: datastr,
				success: function(data) {
					if(data.code == 1)
					{
						console.log("Успех!");

						$('#oldpsw').val("");
						$('#psw').val("");
						$('#psw-repeat').val("");
					}
					else
					{
						$('#err').stop();
						$('#err').fadeTo( 200, 1.00 );
						$('#err').fadeTo( 200, 0.50 );
						$('#err').fadeTo( 200, 1.00 );
						$('#err').fadeTo( 200, 0.50 );
						$('#err').fadeTo( 200, 1.00 );
						$('#err').fadeTo( 5000, 0.00 );
					}
				}
			});
		}
	});

	$('#nas, #email, #psw, #psw-repeat').bind('focus', function(){
  		if(this.id == 'psw' || this.id == 'psw-repeat')
  		{
  			$('#psw').removeClass('error');
  			$('#psw-repeat').removeClass('error');
  		}
  		else
  			$(this).removeClass('error');

		$('#error').fadeTo( 200, 0.00 );
	});


	$('#search').click(function () {
		console.log(`http://localhost:3002/:age=${$('#searchAge').val()}`);
		
		FindTableUpdate();
	});

	$('#update').click(function () {
		DataTableUpdate();
	});

	$('#change').click(function () {
		var tr = $('#Data tbody:last tr');

		var neded = [];
		for(var i = 0; i < tr.length; ++i)
			if(tr[i].childNodes[4].childNodes[0].checked)
				neded.push(tr[i]);

		for(var i = 0; i < neded.length; ++i)
		{
			var datastr = "";

			//datastr += `${document.location.search.split('?').join('')}&`;
			datastr += `id=${neded[i].childNodes[0].innerText}&`;	
			datastr += `name=${neded[i].childNodes[1].innerText}&`;
			datastr += `age=${Number(neded[i].childNodes[2].innerText)}&`;
			datastr += `email=${neded[i].childNodes[3].innerText}`;

			console.log(datastr);

			$.ajax({
				type: "PUT",
				url: "http://localhost:3002/change",
				data: datastr
			});
		}
		
		DataTableUpdate();
		$('#search').click();
	});

	$('#newadd').click(function () {
		var newid = 0;
		if($('#Data tbody:last tr:last')[0] != null)
			newid = Number($('#Data tbody:last tr:last')[0].childNodes[0].innerText);

		var datastr = 
			//`${document.location.search.split('?').join('')}&`+
			`id=${newid + 1}&`+	
			`name=&`+
			`age=&`+
			`email=`;

		$.ajax({
			type: "POST",
			url: "http://localhost:3002/add",
			data: datastr,
			success: function(data) {
				console.log(data);

				DataTableUpdate();
				$('#search').click();
			}
		});
	});

	$('#delete').click(function () {
		//var datastr = `${document.location.search.split('?').join('')}&`;
		var datastr = ``;
		var tr = $('#Data tbody:last tr');

		var neded = [];
		for(var i = 0; i < tr.length; ++i)
			if(tr[i].childNodes[4].childNodes[0].checked)
				neded.push(tr[i].childNodes[0].innerText)

		for(var i = 0; i < neded.length; ++i)
			datastr += `id=${neded[i]}${(i+1 == neded.length?"":"&")}`;	

		$.ajax({
			type: "DELETE",
			url: "http://localhost:3002/delete",
			data: `${datastr}`,
			success: function(data) {
				console.log(data);

				DataTableUpdate();
				$('#search').click();
			}
		});
	});
});



function DataTableUpdate() {
	const settings = {
		//"url": `http://localhost:3002/:${document.location.search.split('?').join('')}`,
		"url": `http://localhost:3002/user`,
		"method": "GET",
		"headers": {
			"content-type": "utf8"
		}
	};
	$.ajax(settings).done(function (response) {
		console.log(response);
		console.log(document.location.search);
		var Dt = JSON.parse(response);
		var Data = Dt.data;

		$('#Data > tbody:last').empty();

		for(var i=0; i<Data.length; ++i) {
			$('#Data > tbody:last').append(
				'<tr tabindex="1">' +
				`<td>${Data[i].id}</td>` +
				`<td contenteditable='true'>${Data[i].name}</td>` + 
				`<td contenteditable='true'>${Data[i].age}</td>` + 
				`<td contenteditable='true'>${Data[i].email}</td>` +
				`<td class="checkbox">`+
				`<input type="checkbox" class="custom-checkbox" id="${i}">`+
				`<label for="${i}"></label>`+
				`</td>` +
				'</tr>');
		}

		var neded = $('#Data tbody:last tr');

		for(var i=0; i < neded.length; ++i) {
			if(neded[i].childNodes[2].innerText == $('#searchAge').val() && $('#searchAge').val() != "")
				neded[i].classList.add('finded');
			else
				neded[i].classList.remove('finded');
		}
	});
}

function FindTableUpdate() {
	//var datastr = `${document.location.search.split('?').join('')}&age=${$('#searchAge').val()}`;
	var datastr = `age=${$('#searchAge').val()}`;
	$.ajax({
		type: "POST",
		url: "http://localhost:3002/find",
		data: datastr,
		success: function(data) {
			if(data != "Not found!")
			{
      			var Data = JSON.parse(data);

      			$('#FindData > tbody:last').empty();

      			if(Data.length > 0 && $('#searchAge').val() != "")
      			{
					for(var i=0; i<Data.length; i++) {
						$('#FindData > tbody:last').append(
							'<tr>' +
							`<td>${Data[i].id}</td>` +
							`<td>${Data[i].name}</td>` + 
							`<td>${Data[i].age}</td>` + 
							`<td>${Data[i].email}</td>` +
							'</tr>');
					}
						
					$('#FindDataDiv').stop();
					$('#FindDataDiv').fadeTo( 200, 1.00 );

      			} else {
					$('#FindDataDiv').stop();
					$('#FindDataDiv').fadeTo( 200, 0.00 );
      			}

				var neded = $('#Data tbody:last tr');

				for(var i=0; i < neded.length; ++i) {
					if(neded[i].childNodes[2].innerText == $('#searchAge').val())
						neded[i].classList.add('finded');
					else
						neded[i].classList.remove('finded');
				}

			}
			console.log(`Found: ${data}`);
    	}
	});
}