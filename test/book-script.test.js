describe('the computeDiscount function', function () {
    it('should compute the senior discount correctly', function() {
        $('#room-initial-cost').val('1800.00');
        $('#room-senior').val('1');
        $('#room-pwd').val('0');
        $('#room-discount-php').val('0.00');
        $('#room-discount-percent').val('0');
        $('#room-pax').val('2');

        computeDiscount();
        assert.equal($('#room-subtract').val(),'180.00');
    });

    it('should compute the pwd discount correctly', function() {
        $('#room-initial-cost').val('1800.00');
        $('#room-senior').val('0');
        $('#room-pwd').val('2');
        $('#room-discount-php').val('0.00');
        $('#room-discount-percent').val('0');
        $('#room-pax').val('2');

        computeDiscount();
        assert.equal($('#room-subtract').val(),'360.00');
    });

    it('should compute the addtl percent discount correctly', function() {
        $('#room-initial-cost').val('1800.00');
        $('#room-senior').val('0');
        $('#room-pwd').val('0');
        $('#room-discount-php').val('0.00');
        $('#room-discount-percent').val('10');
        $('#room-pax').val('2');

        computeDiscount();
        assert.equal($('#room-subtract').val(),'180.00');
    });

    it('should compute the addtl flat discount correctly', function() {
        $('#room-initial-cost').val('1800.00');
        $('#room-senior').val('0');
        $('#room-pwd').val('0');
        $('#room-discount-php').val('10.00');
        $('#room-discount-percent').val('0');
        $('#room-pax').val('2');

        computeDiscount();
        assert.equal($('#room-subtract').val(),'10.00');
    });

    it('should select the largest discount correctly', function() {
        $('#room-initial-cost').val('1800.00');
        $('#room-senior').val('1');
        $('#room-pwd').val('2');
        $('#room-discount-php').val('10.00');
        $('#room-discount-percent').val('10');
        $('#room-pax').val('2');

        computeDiscount();
        assert.equal($('#room-subtract').val(),'360.00');
    });
});

describe('the computeTotal function', function() {
    it('should compute the total correctly', function() {
        $('#room-initial-cost').val('4000.00');
        $('#room-subtract').val('500.00');

        computeTotal();
        assert.equal($('#room-net-cost').val(), '3500.00');
    });
});

describe('the computeBalance function', function() {
    it('should compute the balance correctly', function() {
        $('#room-net-cost').val('4000.00');
        $('#room-payment').val('5000.00');

        computeBalance();
        assert.equal($('#room-balance').val(), '-1000.00');
    });
});

// NOTE: unable to go to /room path because server is not started
// describe('the computeInitialCost function', function() {
//     it('should compute the rate based on dates correctly', function(){
//         // room 407
//         $('#room-id').val('611a2b62687236173c223ae2');
//         $('#room-pax').val('2');
//         $('#start-date').val('2021-08-01');
//         $('#end-date').val('2021-08-03');
//         $('#room-extra').val('');
//         computeInitialCost();

//         assert
//         .equal($('#duration').val(), '2')
//         .and.equal($('#room-initial-cost').val(), '3600.00')
//         .and.equal($('#room-rate').val(), '1800.00');
//     });

//     it('should set fields to 0 when room-id is invalid', function(){
//         $('#room-id').val('611a2b62687237273c223ae2');
//         $('#room-pax').val('2');
//         $('#start-date').val('2021-08-01');
//         $('#end-date').val('2021-08-03');
//         $('#room-extra').val('');
//         computeInitialCost();

//         assert
//         .equal($('#duration').val(), '0')
//         .and.equal($('#room-initial-cost').val(), '0.00')
//         .and.equal($('#room-rate').val(), '0.00');
//     });
// });