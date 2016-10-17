module.exports = {
  'App starts' : function (browser) {
    browser
      .url('http://localhost:3000/#/')
      .waitForElementVisible('body', 1000)
      .assert.containsText('#logo', 'queery.link')
      .end();
  },
  'Type query and test (table)': function (browser) {
    browser
      .url('http://localhost:3000/#/')
      .waitForElementVisible('body', 1000)
      .setValue('input[placeholder=Name]', 'to-be-deleted')
      .click(input[id=tables]
      .setValue(textarea[id=text],"select * where {  ?s ?p ?o   } limit 7")
      .click(button[id=testQuery])
      .pause(500)
      .assert()  
      .end()
  }
};
