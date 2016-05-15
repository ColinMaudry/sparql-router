<template>
  <div class="col-md-7 col-md-offset-1">
    <form class="form-horizontal">
      <fieldset>
        <div class="form-group">
          <label for="queryText" class="control-label">Query</label>
          <textarea class="form-control input-sm" rows="20" id="text">
# These values may be used later to make proper metadata. No line break, please.
# author:
# description:

</textarea>
        </div>
        <div class="form-group">
          <button type="submit" class="btn btn-primary navbar-right">Create</button>
          <button type="submit" class="btn btn-default navbar-right">Test</button>
        </div>
      </fieldset>
    </form>
  </div>
</template>

<style>
  #text {
    font-family: monospace;
  }
</style>
