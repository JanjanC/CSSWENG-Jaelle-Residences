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

describe('the enableSenior function', function() {
    it('should enable the field when intially disabled', function() {
        $('#is-senior').prop('checked', true);
        enableSenior();
        assert.equal($('#room-senior').is('[readonly]'), false);
    });

    it('should disable the field when intially enabled', function() {
        $('#is-senior').prop('checked', false);
        enableSenior();
        assert.equal($('#room-senior').is('[readonly]'), true);
    });
});

describe('the enablePWD function', function() {
    it('should enable the field when intially disabled', function() {
        $('#is-pwd').prop('checked', true);
        enablePWD();
        assert.equal($('#room-pwd').is('[readonly]'), false);
    });

    it('should disable the field when intially enabled', function() {
        $('#is-pwd').prop('checked', false);
        enablePWD();
        assert.equal($('#room-pwd').is('[readonly]'), true);
    });
});

describe('the enableDiscountPercent function', function() {
    it('should enable the fields when intially disabled', function() {
        $('#is-discount-percent').prop('checked', true);
        enableDiscountPercent();
        expect($('#room-discount-reason-percent').is('[readonly]')).to.equal($('#room-discount-percent').is('[readonly]')).and
        .equal(false);
    });

    it('should disable the fields when intially enabled', function() {
        $('#is-discount-percent').prop('checked', false);
        enableDiscountPercent();
        expect($('#room-discount-reason-percent').is('[readonly]')).to.equal($('#room-discount-percent').is('[readonly]')).and
        .equal(true);
    });
});