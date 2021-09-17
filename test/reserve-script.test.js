describe('the pushToArray function', function() {
    it('should push the proper values into an array', function() {
        let arr = [];
        pushToArray(arr, 'Test', 'Success');
        assert(JSON.stringify([`
		<h4>Test:</h4>
		<h5 class="ms-4 text-secondary reservation-field">Success</h5>
		`]) == JSON.stringify(arr), 'incorrect value');
    });
});

describe('the validateEntry function', function() {
    let today = new Date();
	let todayString = `${today.getFullYear().toString()}-${(today.getMonth() + 1).toString().padStart(2, 0)}-${today.getDate().toString().padStart(2, 0)}`;

    it('should display error on empty reserve type field', function(){
        $('#reserve_type_select').val('');
        validateEntry();
        assert.equal($('#reserve-type-error').text(), 'Room Type cannot be empty');
    });

    it('should not display error on selected reserve type field', function(){
        $('#reserve_type_select').val('test');
        validateEntry();
        assert.equal($('#reserve-type-error').text(), '');
        $('#reserve_type_select').val('');
    });

    it('should display error on empty start date field', function(){
        $('#start-date').val('');
        validateEntry();
        assert.equal($('#start-date-error').text(), 'Start Date cannot be empty');
    });

    it('should not display error on filled valid start date field', function(){
        $('#start-date').val(todayString);
        validateEntry();
        assert.equal($('#start-date-error').text(), '');
    });

    it('should display error on filled start date field that is earlier than today', function(){
        $('#start-date').val('2020-01-01');
        validateEntry();
        assert.equal($('#start-date-error').text(), 'Start Date cannot be earlier than Today');
    });

    it('should display error on filled start date field that is more than 5 years ago', function(){
        $('#start-date').val('2030-01-01');
        validateEntry();
        assert.equal($('#start-date-error').text(), 'Start Date may only be 5 Years from Today');
    });

    it('should display error on empty end date field', function(){
        $('#end-date').val('');
        validateEntry();
        assert.equal($('#end-date-error').text(), 'End Date cannot be empty');
    });

    it('should not display error on filled valid end date field', function(){
        $('#start-date').val(todayString);
        $('#end-date').val('206-01-01');
        validateEntry();
        assert.equal($('#end-date-error').text(), '');
    });

    it('should display error on filled end date field that is earlier than today', function(){
        $('#end-date').val('2020-01-01');
        validateEntry();
        assert.equal($('#end-date-error').text(), 'End Date cannot be earlier than Today');
    });

    it('should display error on filled end date field that is earlier than the start date', function(){
        $('#start-date').val(todayString);
        $('#end-date').val('2019-01-01');
        validateEntry();
        assert.equal($('#end-date-error').text(), 'End Date cannot be earlier than Today');
    });

    it('should display error on filled end date field that is more than 5 after today', function(){
        $('#end-date').val('2035-01-01');
        validateEntry();
        assert.equal($('#end-date-error').text(), 'End Date may only be 5 Years from Today');
        $('#end-date').val('');
    });

    it('should display error on empty first name field', function(){
        $('#firstname').val('');
        validateEntry();
        assert.equal($('#firstname-error').text(), 'First Name cannot be empty');
    });

    it('should not display error on filled first name field', function(){
        $('#firstname').val('Bob');
        validateEntry();
        assert.equal($('#firstname-error').text(), '');
    });

    it('should display error on empty last name field', function(){
        $('#lastname').val('');
        validateEntry();
        assert.equal($('#lastname-error').text(), 'Last Name cannot be empty');
    });

    it('should not display error on filled last name field', function(){
        $('#lastname').val('Bob');
        validateEntry();
        assert.equal($('#lastname-error').text(), '');
    });

    it('should display error on birthdate field later than today', function(){
        $('#birthdate').val('2030-01-01');
        validateEntry();
        assert.equal($('#birthdate-error').text(), 'Birthdate cannot be later than Today');
    });

    it('should not display error on valid birthdate field', function(){
        $('#birthdate').val('2005-01-01');
        validateEntry();
        assert.equal($('#birthdate-error').text(), '');
    });
});