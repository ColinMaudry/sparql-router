module.exports = {
  'App starts' : function (browser) {
    browser
      .url('http://localhost:3000/#/')
      .waitForElementVisible('body', 1000)
      .assert.containsText('#logo', 'queery.link')
      .end();
  }
};
