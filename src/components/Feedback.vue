<template>
  <div class="container">
    <h3 id="email">Email</h3>
    <p><a href="mailto:colin@maudry.com?subject=[{{ ip }}@queery.link]">colin@maudry.com</a></p>
    <h3 id="twitter-chat">Twitter chat</h3>
    <p>If you have a Twitter account, you can <a href="https://twitter.com/CMaudry">chat with me (cmaudry)</a> even if you don't follow me.</p>
    <p>You can also tweet to <a href="http://twitter.com/QueeryLink">@QueeryLink</a> or with #QueeryLink tag.</p>
    <h3>Github</h3>
    <p>The issue tracket is waiting for your bug reports and feature requests!</p>
    <p>Make sure you first check the <a href="https://github.com/ColinMaudry/sparql-router/issues?q=is%3Aissue+is%3Aopen+-label%3Abug" target="_blank">upcoming features</a> and the <a href="https://github.com/ColinMaudry/sparql-router/issues?q=is%3Aissue+is%3Aopen+label%3Abug" target="_blank">known issues</a>.</p>
    <h3 id="-help-">"Help!"</h3>
    <p>If you contact me about trouble using queery.link, please give me your IP address: <span class="ip text-primary">{{ ip }}</span></p>
    <p>This way I can easily filter your activity in the server logs ;-)</p>
    <h3>Drop a comment</h3>
    <div id="disqus_thread"></div>
  </div>
</template>
<script>
export default {
  computed: {
    url: function () {
      return siteRootUrl
    },
    ip: function () {
      return userIp
    }
  },
  created () {
      var disqus_config = function () {
      this.page.url = "https://queery.link";
      this.page.identifier = "feedback"; // Replace PAGE_IDENTIFIER with your page's unique identifier variable
      };
      (function() { // DON'T EDIT BELOW THIS LINE
      var d = document, s = d.createElement('script');
      s.src = '//queery-link.disqus.com/embed.js';
      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
      })();
  }
}
</script>
<style lang="scss">
  .ip {
    font-family: monospace;
    font-weight: bold;
  }
</style>
