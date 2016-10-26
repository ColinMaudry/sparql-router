<template>
  <div class="container">
    <h3 id="email">Email</h3>
      <p><a href="mailto:colin@maudry.com?subject=[{{ ip }}@queery.link]">colin@maudry.com</a></p>
      <h3 id="twitter-chat">Twitter chat</h3>
      <p>If you have a Twitter account, you can <a href="https://twitter.com/CMaudry">chat with me</a> even if you don't follow me.</p>
      <p>You can also tweet to <a href="http://twitter.com/QueeryLink">@QueeryLink</a> or with <strong>#QueeryLink</strong> tag.</p>
      <h3 id="-help-">"Help!"</h3>
      <p>If you contact me about trouble using <strong>queery.link</strong>, please give me your IP address: <span class="ip text-primary">{{ ip }}</span></p>
      <p>This way I can easily filter your activity in the server logs ;-)</p>
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
  }
}
</script>
<style lang="scss">
  .ip {
    font-family: monospace;
    font-weight: bold;
  }
</style>
